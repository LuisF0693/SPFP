import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Segredos injetados automaticamente pelo Supabase (nunca expostos ao cliente)
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Limites por price_id do Stripe
const PLAN_LIMITS: Record<string, number> = {
  // Essencial R$99
  "price_1T1yllIZBkfjgy2X30qaXxQo": 30,
  "price_1T1ym7IZBkfjgy2XXytc5SOt": 30,
  // Wealth Mentor R$349
  "price_1T1ymOIZBkfjgy2XPWFYJSGi": 300,
  "price_1T1ymeIZBkfjgy2XtLyCqyBE": 300,
};

const DEFAULT_LIMIT = 10; // usuários sem plano ativo (teste)

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    // ── 1. Autenticar usuário ──────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return json({ error: "Token inválido" }, 401);
    }

    // ── 2. Verificar plano e rate limit ───────────────────────────────────
    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    // Buscar assinatura ativa
    const { data: subscription } = await supabase
      .from("stripe_subscriptions")
      .select("price_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const priceId = subscription?.price_id ?? "";
    const limit = PLAN_LIMITS[priceId] ?? DEFAULT_LIMIT;

    // Uso atual do mês (resiliente: se a tabela não existir, permite o uso)
    let used = 0;
    let usageEnabled = true;
    try {
      const { data: usage, error: usageError } = await supabase
        .from("finn_usage")
        .select("message_count")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .maybeSingle();

      if (usageError && (usageError.code === "42P01" || usageError.message?.includes("does not exist"))) {
        // Tabela não existe ainda — permitir uso sem rate limit
        usageEnabled = false;
      } else {
        used = usage?.message_count ?? 0;
      }
    } catch {
      usageEnabled = false;
    }

    if (usageEnabled && used >= limit) {
      return json(
        {
          error: "rate_limit_exceeded",
          message: `Você usou ${used} de ${limit} mensagens este mês. Faça upgrade do seu plano para continuar conversando com o Finn.`,
          used,
          limit,
        },
        429
      );
    }

    // ── 3. Parsear body da requisição ──────────────────────────────────────
    const { messages, model = "gemini-1.5-flash" } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "messages inválidas" }, 400);
    }

    // ── 4. Montar payload para Gemini REST API ────────────────────────────
    const systemMsg = messages.find((m: { role: string }) => m.role === "system");
    const chatMsgs = messages.filter((m: { role: string }) => m.role !== "system");
    const lastMsg = chatMsgs[chatMsgs.length - 1];
    const prompt = systemMsg
      ? `${systemMsg.content}\n\n${lastMsg.content}`
      : lastMsg.content;

    const history = chatMsgs.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            ...history,
            { role: "user", parts: [{ text: prompt }] },
          ],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}));
      console.error("[Finn] Gemini error:", errBody);
      throw new Error(errBody.error?.message ?? `Gemini ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const responseText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // ── 5. Registrar uso (upsert atômico, somente se tabela disponível) ──
    if (usageEnabled) {
      await supabase.from("finn_usage").upsert(
        {
          user_id: user.id,
          month: currentMonth,
          message_count: used + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,month" }
      );
    }

    // ── 6. Resposta ────────────────────────────────────────────────────────
    return json({
      text: responseText,
      modelName: model,
      used: used + 1,
      limit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[Finn] Internal error:", message);
    return json(
      { error: "internal_error", message: "Algo deu errado. Tenta de novo em instantes." },
      500
    );
  }
});

// Helper
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
