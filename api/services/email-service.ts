/**
 * Email Service
 * Handles sending welcome emails after successful payment
 */

import { supabaseAdmin } from '../supabase';

interface EmailOptions {
  to: string;
  userName?: string;
  planName: string;
  planAmount: number;
  planType: 'parcelado' | 'mensal';
  accessLink?: string;
}

interface ResendEmailResponse {
  id: string;
  from: string;
  to: string;
  created_at: string;
}

/**
 * Generate welcome email HTML
 */
function generateWelcomeEmailHTML(options: EmailOptions): string {
  const { userName = 'Usuário', planName, planAmount, planType } = options;
  const planTypeLabel = planType === 'parcelado' ? 'Parcelado' : 'Mensal';
  const formattedAmount = (planAmount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .plan-info { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 4px; }
        .plan-info h3 { margin: 0 0 10px 0; color: #667eea; }
        .plan-details { font-size: 14px; color: #666; }
        .plan-amount { font-size: 24px; font-weight: bold; color: #333; margin: 10px 0; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin: 20px 0; font-weight: bold; }
        .cta-button:hover { background: #764ba2; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .support { background: #e8f4f8; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bem-vindo ao SPFP!</h1>
          <p>Obrigado por confiar em nós para seu planejamento financeiro</p>
        </div>

        <div class="content">
          <p>Olá <strong>${userName}</strong>,</p>

          <p>Seu pagamento foi processado com sucesso! Estamos felizes em tê-lo como cliente.</p>

          <div class="plan-info">
            <h3>Detalhes do Plano Contratado</h3>
            <div class="plan-details">
              <p><strong>Plano:</strong> ${planName}</p>
              <p><strong>Modalidade:</strong> ${planTypeLabel}</p>
            </div>
            <div class="plan-amount">${formattedAmount}</div>
          </div>

          <p>Agora você tem acesso completo a todas as funcionalidades do SPFP:</p>
          <ul>
            <li>Rastreamento avançado de transações</li>
            <li>Análises financeiras com IA</li>
            <li>Planejamento de investimentos</li>
            <li>Metas e objetivos financeiros</li>
            <li>Relatórios personalizados</li>
          </ul>

          <div class="support">
            <strong>Precisa de ajuda?</strong>
            <p>Estamos aqui para suportá-lo. Entre em contato através do email noreply@spfp.com.br ou acesse nossa central de ajuda.</p>
          </div>

          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
              Acessar seu Dashboard
            </a>
          </p>

          <p>Aproveite o SPFP ao máximo e alcance seus objetivos financeiros!</p>

          <p>Atenciosamente,<br>Equipe SPFP</p>
        </div>

        <div class="footer">
          <p>&copy; 2024 SPFP - Sistema de Planejamento Financeiro Pessoal. Todos os direitos reservados.</p>
          <p>Este é um email automático. Por favor, não responda a esta mensagem.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send welcome email after successful payment
 * Uses Supabase email service or falls back to console
 */
export async function sendWelcomeEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { to, userName, planName, planAmount, planType } = options;

    const html = generateWelcomeEmailHTML({
      to,
      userName,
      planName,
      planAmount,
      planType,
    });

    // Try to use Supabase email service
    try {
      // Supabase Mail API (requires auth.email_templates setup)
      const result = await supabaseAdmin.auth.admin.sendEmail({
        email: to,
        subject: `Bem-vindo ao SPFP - ${planName}`,
        html,
      });

      console.log('Email sent successfully via Supabase:', result);
      return true;
    } catch (supabaseError) {
      console.warn('Supabase email failed, would fallback to Resend or custom service:', supabaseError);

      // Try Resend API if available
      if (process.env.RESEND_API_KEY) {
        return await sendWithResend(to, planName, html);
      }

      // If no email service is configured, log a warning but don't fail
      console.warn('No email service configured. Email would be sent to:', to);
      return true; // Don't fail the payment flow for email issues
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - email failures shouldn't block the payment flow
    return false;
  }
}

/**
 * Send email using Resend API
 */
async function sendWithResend(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@spfp.com.br',
        to,
        subject: `${subject}`,
        html,
      }),
    });

    if (!response.ok) {
      console.error('Resend API error:', response.statusText);
      return false;
    }

    const data = (await response.json()) as ResendEmailResponse;
    console.log('Email sent successfully via Resend:', data.id);
    return true;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return false;
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(options: EmailOptions): Promise<boolean> {
  try {
    const { to, planName, planAmount, planType } = options;

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Pagamento Confirmado</h1>
          </div>
          <div class="content">
            <div class="status">
              <strong>Seu pagamento foi processado com sucesso!</strong>
            </div>
            <p><strong>Plano:</strong> ${planName}</p>
            <p><strong>Valor:</strong> ${(planAmount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p><strong>Modalidade:</strong> ${planType === 'parcelado' ? 'Parcelado' : 'Mensal'}</p>
            <p>Você já pode acessar todas as funcionalidades do SPFP!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email (same logic as welcome)
    if (process.env.RESEND_API_KEY) {
      return await sendWithResend(to, 'Confirmação de Pagamento', html);
    }

    return true;
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    return false;
  }
}

export default {
  sendWelcomeEmail,
  sendPaymentConfirmation,
};
