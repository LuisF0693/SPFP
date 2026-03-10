// config.mjs — IDs e configuração central do SPFP Webhook Server

export const CLICKUP = {
  API_TOKEN: process.env.CLICKUP_API_TOKEN,
  WEBHOOK_SECRET: process.env.CLICKUP_WEBHOOK_SECRET,

  // List IDs
  LISTS: {
    EDITORIAL:      '901326289280',
    PIPELINE_SDR:   '901326289260',
    PIPELINE_CLOSER:'901326289267',
    CS_ONBOARDING:  '901326289234',
    CS_SUPORTE:     '901326289240',
    CS_RETENCAO:    '901326289246',
    OPS_QA:         '901326289395',
  },

  // Custom field IDs (Calendário Editorial)
  FIELDS: {
    CANAL:      '1a7b5321-6961-4283-8797-6ae9249f7771',
    APROVACAO:  '3890071e-f36c-48e9-ae6a-9c0fafc19f30',
    DATA_PUB:   '9cc4ed26-1189-412c-972c-c7c90cc78111',
    FORMATO:    'c0b601fb-1c02-4be3-add9-2c860a822268',
    PRIORIDADE: 'fdd803ca-b3e8-4771-9dfe-e12b43138b0f',
  },

  // Dropdown option IDs (Canal)
  CANAL: {
    INSTAGRAM: '3a045341-0a8d-4cee-aa01-fc32a26f5e20',
    YOUTUBE:   '075afb21-d6b6-43bf-a381-1ca6f33d2647',
    LINKEDIN:  '5413380c-6fc1-4f26-8d31-7d471727747d',
    TIKTOK:    'b28860ce-cea6-4bbe-b132-b401d3cb5af0',
  },

  // Dropdown option IDs (Status de Aprovação)
  APROVACAO: {
    PENDENTE:  'c6653caa-f153-4d2c-a77b-927c03030e28',
    APROVADO:  'edaf0889-1df1-4bdc-a24d-b0efd8599d1f',
    REPROVADO: '2f33a870-1ea6-4ca0-914f-7b1b3baab6ec',
  },
};

export const CLAUDE = {
  API_KEY: process.env.ANTHROPIC_API_KEY,
  MODEL: 'claude-sonnet-4-6',
};

export const META = {
  ACCESS_TOKEN: process.env.META_ACCESS_TOKEN,
  INSTAGRAM_ACCOUNT_ID: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
  PAGE_ID: process.env.FACEBOOK_PAGE_ID,
};

export const YOUTUBE = {
  CLIENT_ID: process.env.YOUTUBE_CLIENT_ID,
  CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET,
  REFRESH_TOKEN: process.env.YOUTUBE_REFRESH_TOKEN,
};

export const LINKEDIN = {
  ACCESS_TOKEN: process.env.LINKEDIN_ACCESS_TOKEN,
  ORG_ID: process.env.LINKEDIN_ORGANIZATION_ID,
};
