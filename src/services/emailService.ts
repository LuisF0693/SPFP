interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailResponse {
  id: string;
  success: boolean;
}

export const emailService = {
  async send(request: EmailRequest): Promise<EmailResponse> {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;

    if (!apiKey) {
      throw new Error('VITE_RESEND_API_KEY não configurada');
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: request.from || 'noreply@spfp.com',
          to: request.to,
          subject: request.subject,
          html: request.html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar email');
      }

      const data = await response.json();
      return {
        id: data.id,
        success: true,
      };
    } catch (error: any) {
      throw new Error(`Falha ao enviar email`);
    }
  },

  generateTemplate(content: string, name?: string): string {
    return `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px;">
          <div style="border-bottom: 2px solid #6366F1; margin-bottom: 20px; padding-bottom: 20px;">
            <h1 style="margin: 0; color: #1a1f2e;">ATA</h1>
          </div>
          <div style="margin-bottom: 30px; color: #333; line-height: 1.6;">
            ${content}
          </div>
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px; color: #666; font-size: 12px;">
            <p>Planejador Financeiro | SPFP</p>
          </div>
        </div>
      </div>
    `;
  },
};

export default emailService;
