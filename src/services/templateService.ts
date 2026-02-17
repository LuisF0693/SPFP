export interface CustomTemplate {
  id: string;
  userId: string;
  type: 'reuniao' | 'investimentos';
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_TEMPLATES = {
  reuniao: `📝 ATA DE REUNIÃO

👤 Cliente: {cliente}
📅 Data: {data}

📌 Próxima Reunião
{data_proxima} às {hora_proxima}

📝 Tópicos Discutidos
{topicos}

📌 Pontos Pendentes
{pendencias}

📚 Materiais Recomendados
{materiais}

Qualquer dúvida, estou à disposição! 👊📈`,

  investimentos: `📑 ATA DE RECOMENDAÇÃO DE INVESTIMENTOS

👤 Cliente: {cliente}
📅 Data: {data}
🎯 Objetivo: {objetivo}

📊 Alocação Recomendada

Ações: {acoes} ({acoes_pct}%)
FIIs: {fiis} ({fiis_pct}%)
Internacional: {internacional} ({internacional_pct}%)
Renda Fixa: {rf} ({rf_pct}%)
Cripto: {cripto} ({cripto_pct}%)

💰 Total: {total_geral}

📝 Próximos Passos
{notas}

Fico à disposição para tirar dúvidas! 👊📈`,
};

export const templateService = {
  getDefaults() {
    return DEFAULT_TEMPLATES;
  },

  async getCustomTemplates(userId: string, type: 'reuniao' | 'investimentos'): Promise<CustomTemplate | null> {
    const key = `template_${userId}_${type}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },

  async saveTemplate(template: CustomTemplate): Promise<void> {
    const key = `template_${template.userId}_${template.type}`;
    localStorage.setItem(key, JSON.stringify({
      ...template,
      updatedAt: new Date(),
    }));
  },

  async resetTemplate(userId: string, type: 'reuniao' | 'investimentos'): Promise<void> {
    const key = `template_${userId}_${type}`;
    localStorage.removeItem(key);
  },
};

export default templateService;
