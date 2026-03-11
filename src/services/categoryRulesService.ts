/**
 * categoryRulesService.ts — STY-011: Auto-categorização Inteligente
 *
 * Aprende padrões de categorização a partir do comportamento do usuário.
 * Persiste regras na tabela `category_rules` do Supabase.
 * Confiança aumenta progressivamente com o uso (count / 10, máximo 1.0).
 */

import { supabase } from '../supabase';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CategoryRule {
  id: string;
  user_id: string;
  pattern: string;
  category_id: string;
  count: number;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface CategorySuggestion {
  categoryId: string;
  confidence: number;
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

/**
 * Normaliza uma string para matching:
 * - Converte para lowercase
 * - Remove dígitos (números de referência, CPF, etc.)
 * - Faz trim e remove espaços duplos
 */
export function normalizePattern(text: string): string {
  return text
    .toLowerCase()
    .replace(/\d+/g, '')
    .trim()
    .replace(/\s{2,}/g, ' ');
}

// ─── Sugestão de Categoria ────────────────────────────────────────────────────

/**
 * Busca a melhor sugestão de categoria para uma descrição de transação.
 *
 * Fluxo:
 * 1. Normaliza a descrição
 * 2. Busca todas as regras do usuário no Supabase
 * 3. Compara por correspondência exata ou por substring (pattern ⊂ description ou vice-versa)
 * 4. Retorna o match de maior count caso confidence >= 0.8, senão null
 *
 * @param userId - ID do usuário autenticado
 * @param description - Descrição bruta da transação
 * @returns Sugestão com categoryId e confidence, ou null se não encontrar correspondência confiante
 */
export async function suggestCategory(
  userId: string,
  description: string
): Promise<CategorySuggestion | null> {
  if (!userId || !description || description.trim().length < 2) return null;

  const normalizedDesc = normalizePattern(description);
  if (!normalizedDesc) return null;

  try {
    const { data: rules, error } = await supabase
      .from('category_rules')
      .select('id, pattern, category_id, count, confidence')
      .eq('user_id', userId);

    if (error) {
      console.warn('[categoryRulesService] Erro ao buscar regras:', error.message);
      return null;
    }

    if (!rules || rules.length === 0) return null;

    // Filtra regras que fazem match com a descrição normalizada
    const matches = (rules as CategoryRule[]).filter((rule) => {
      const p = rule.pattern;
      return (
        p === normalizedDesc ||
        normalizedDesc.includes(p) ||
        p.includes(normalizedDesc)
      );
    });

    if (matches.length === 0) return null;

    // Ordena por count descendente e pega o melhor
    const best = matches.sort((a, b) => b.count - a.count)[0];
    const confidence = Math.min(1.0, best.count / 10);

    if (confidence < 0.8) return null;

    return {
      categoryId: best.category_id,
      confidence,
    };
  } catch (err) {
    console.warn('[categoryRulesService] Exceção ao buscar sugestão:', err);
    return null;
  }
}

// ─── Aprendizado de Regra ─────────────────────────────────────────────────────

/**
 * Salva ou atualiza uma regra de categorização aprendida.
 *
 * - Se o padrão já existir para este usuário: incrementa count e recalcula confidence
 * - Se não existir: cria nova regra com count=1 e confidence=0.1
 *
 * @param userId - ID do usuário autenticado
 * @param description - Descrição bruta da transação (será normalizada)
 * @param categoryId - ID da categoria que o usuário confirmou para esta transação
 */
export async function learnCategoryRule(
  userId: string,
  description: string,
  categoryId: string
): Promise<void> {
  if (!userId || !description || !categoryId) return;

  const pattern = normalizePattern(description);
  if (!pattern) return;

  try {
    // Verifica se a regra já existe
    const { data: existing, error: selectError } = await supabase
      .from('category_rules')
      .select('id, count')
      .eq('user_id', userId)
      .eq('pattern', pattern)
      .maybeSingle();

    if (selectError) {
      console.warn('[categoryRulesService] Erro ao verificar regra existente:', selectError.message);
      return;
    }

    if (existing) {
      // Incrementa count e recalcula confidence
      const newCount = (existing.count as number) + 1;
      const newConfidence = parseFloat(Math.min(1.0, newCount / 10).toFixed(3));

      const { error: updateError } = await supabase
        .from('category_rules')
        .update({
          count: newCount,
          confidence: newConfidence,
          category_id: categoryId, // Atualiza categoria caso o usuário tenha corrigido
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.warn('[categoryRulesService] Erro ao atualizar regra:', updateError.message);
      }
    } else {
      // Cria nova regra
      const { error: insertError } = await supabase
        .from('category_rules')
        .insert({
          user_id: userId,
          pattern,
          category_id: categoryId,
          count: 1,
          confidence: 0.100,
        });

      if (insertError) {
        console.warn('[categoryRulesService] Erro ao criar regra:', insertError.message);
      }
    }
  } catch (err) {
    console.warn('[categoryRulesService] Exceção ao aprender regra:', err);
  }
}
