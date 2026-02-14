# Time de Marketing

Squad de Marketing Digital completo com IA para empreendedor solo.

## Propósito

Fornecer um setor de marketing profissional completo para quem não pode contratar uma equipe.
Budget alvo: R$0-2k/mês.

## Agentes

| Agente | Função | Ativação |
|--------|--------|----------|
| **CMO** | Estratégia, posicionamento, visão de marca | `@cmo` |
| **Copywriter** | Textos com seu DNA, voz, tom, estilo | `@copywriter` |
| **Designer** | Produção visual, carrosséis, thumbnails | `@designer` |
| **Analista** | Dados, performance, decisão por evidência | `@analista` |

## Uso

```bash
# Ativar agente específico
@cmo          # Estratégia e posicionamento
@copywriter   # Criar textos e copies
@designer     # Criar visuais
@analista     # Analisar métricas

# Exemplos de uso
@cmo "Defina a estratégia de lançamento do meu produto X"
@copywriter "Escreva uma copy de vendas para Instagram"
@designer "Crie um carrossel sobre os 5 benefícios do produto"
@analista "Analise os resultados da última campanha"
```

## Fluxo de Trabalho Típico

```
1. @cmo → Define estratégia e posicionamento
2. @copywriter → Cria os textos alinhados à estratégia
3. @designer → Produz os visuais
4. @analista → Mede resultados e sugere ajustes
5. Volta ao passo 1 com aprendizados
```

## Estrutura

```
time-de-marketing/
├── squad.yaml          # Manifest
├── README.md           # Esta documentação
├── config/             # Configurações do squad
├── agents/             # Definições dos agentes
│   ├── cmo.md
│   ├── copywriter.md
│   ├── designer.md
│   └── analista.md
├── tasks/              # Tasks específicas
├── workflows/          # Workflows multi-agente
├── checklists/         # Checklists de qualidade
├── templates/          # Templates de documentos
└── data/               # Dados estáticos
```

## Próximos Passos

1. Personalize cada agente com seu DNA de marca
2. Crie tasks específicas para suas necessidades
3. Defina workflows para processos recorrentes
