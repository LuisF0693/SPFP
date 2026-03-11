/**
 * seed-semanas-faltantes.mjs
 * Cria tasks das Semanas 2 e 3 no Calendário Editorial do ClickUp
 * + Tasks de Email Marketing no MailerLite (lista do squad Marketing)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────
const TOKEN = process.env.CLICKUP_API_TOKEN || 'pk_284509678_FY5ZJUY0OEQ9U622R7W7V9TWR01F6UYK';
const HEADERS = { Authorization: TOKEN, 'Content-Type': 'application/json' };

const LIST_EDITORIAL = '901326289280';  // Calendário 90 Dias
const TEAM_ID        = '90133075738';

// ── Custom field IDs ──────────────────────────────────────────────────────────
const FIELD = {
  canal:     '1a7b5321-6961-4283-8797-6ae9249f7771',
  aprovacao: '3890071e-f36c-48e9-ae6a-9c0fafc19f30',
  dataPub:   '9cc4ed26-1189-412c-972c-c7c90cc78111',
  formato:   'c0b601fb-1c02-4be3-add9-2c860a822268',
  prioridade:'fdd803ca-b3e8-4771-9dfe-e12b43138b0f',
};

const CANAL     = { Instagram:'3a045341-0a8d-4cee-aa01-fc32a26f5e20', YouTube:'075afb21-d6b6-43bf-a381-1ca6f33d2647', LinkedIn:'5413380c-6fc1-4f26-8d31-7d471727747d' };
const FORMATO   = { Carrossel:'4640f960-ca74-45ec-aeb1-b09f6ddbda3a', Reels:'8a4c80c7-f3c0-4662-b26b-790840e12769', Story:'8783e872-780b-4f22-8bb5-12ecf56aefbf', Post:'a5b8d670-0f12-4ba2-a792-31ed48e371dd', Video:'340c4069-db4c-41d8-8fe6-32f977d8e7d7' };
const PRIORIDADE= { Alta:'7693b3d4-861d-4df3-b102-fbeae8ec5dfe', Media:'cffa4656-28e5-4d66-8e5b-118a690a3e93' };
const APROVACAO_PENDENTE = 'c6653caa-f153-4d2c-a77b-927c03030e28';

const MESES = { janeiro:1,fevereiro:2,março:3,marco:3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12 };

function extrairData(texto, ano=2026) {
  const m = texto.match(/(\d{1,2})\s+de\s+(\w+)/i);
  if (!m) return null;
  const dia=parseInt(m[1]), mes=MESES[m[2].toLowerCase()];
  if (!mes) return null;
  return new Date(ano, mes-1, dia, 12,0,0);
}
function dataDoWeekday(start, offset) {
  const d=new Date(start); d.setDate(d.getDate()+offset); return d;
}

// ── Parser ────────────────────────────────────────────────────────────────────
function parseSemana(filePath) {
  const raw=fs.readFileSync(filePath,'utf8'), lines=raw.split('\n'), tasks=[];
  const temaMatch=raw.match(/\*\*Tema da semana:\*\*\s*(.+)/);
  const tema=temaMatch?temaMatch[1].trim():'Sem tema';
  const semanaMatch=path.basename(filePath).match(/SEMANA-(\d+)/);
  const semanaNum=semanaMatch?semanaMatch[1]:'?';
  const tituloMatch=raw.match(/# Conteúdo Semana \d+ — (\d+) a \d+ de (\w+) de (\d+)/i);
  let weekStart=tituloMatch?new Date(parseInt(tituloMatch[3]),MESES[tituloMatch[2].toLowerCase()]-1,parseInt(tituloMatch[1]),12,0,0):null;

  let i=0;
  while(i<lines.length){
    const line=lines[i];
    const reelMatch=line.match(/^## REEL (\d+)\s*[—-]\s*(.+)/i);
    if(reelMatch){
      const num=reelMatch[1], dataTxt=reelMatch[2], dataReel=extrairData(dataTxt);
      let gancho='';
      for(let j=i+1;j<Math.min(i+5,lines.length);j++){const g=lines[j].match(/\*\*Gancho:\*\*\s*"?(.+?)"?\s*$/);if(g){gancho=g[1].trim().replace(/^"(.*)"$/,'$1');break;}}
      tasks.push({name:`📹 Reel ${num} — ${tema}`,description:gancho?`**Gancho:** "${gancho}"\n\n**Semana ${semanaNum}**\n\n_Cole aqui a URL pública da mídia (Google Drive, etc.)_`:`Semana ${semanaNum}`,due:dataReel,canal:CANAL.Instagram,formato:FORMATO.Reels,prioridade:PRIORIDADE.Alta});
      i++;continue;
    }
    const carrosselMatch=line.match(/^## CARROSSEL\s*[—-]\s*(.+)/i);
    if(carrosselMatch){
      let tituloC='';
      for(let j=i+1;j<Math.min(i+3,lines.length);j++){const t=lines[j].match(/\*\*Título:\*\*\s*"?(.+?)"?\s*$/);if(t){tituloC=t[1];break;}}
      tasks.push({name:`📱 Carrossel — ${tituloC||tema}`,description:`**Semana ${semanaNum} — ${tema}**\n\n_Cole aqui a URL pública da mídia_`,due:weekStart?dataDoWeekday(weekStart,1):null,canal:CANAL.Instagram,formato:FORMATO.Carrossel,prioridade:PRIORIDADE.Alta});
      i++;continue;
    }
    const ytMatch=line.match(/^## YOUTUBE\s*[—-]\s*"?(.+?)"?\s*$/i);
    if(ytMatch){
      tasks.push({name:`▶️ YouTube — ${ytMatch[1].replace(/^"(.*)"$/,'$1')}`,description:`**Semana ${semanaNum} — ${tema}**\n\n_Cole aqui a URL pública do vídeo_`,due:weekStart?dataDoWeekday(weekStart,3):null,canal:CANAL.YouTube,formato:FORMATO.Video,prioridade:PRIORIDADE.Alta});
      i++;continue;
    }
    const liMatch=line.match(/^## LINKEDIN\s*[—-]\s*(.+)/i);
    if(liMatch){
      tasks.push({name:`💼 LinkedIn — ${tema}`,description:`**Semana ${semanaNum} — ${tema}**\n\nRepurpose para LinkedIn.`,due:extrairData(liMatch[1]),canal:CANAL.LinkedIn,formato:FORMATO.Post,prioridade:PRIORIDADE.Media});
      i++;continue;
    }
    const stMatch=line.match(/^## STORIES\s*[—-]/i);
    if(stMatch){
      tasks.push({name:`📖 Stories da Semana ${semanaNum} — ${tema}`,description:`**Semana ${semanaNum} — ${tema}**\n\nStories diários Seg–Sex + CTA Calendly na Sexta.`,due:weekStart?dataDoWeekday(weekStart,4):null,canal:CANAL.Instagram,formato:FORMATO.Story,prioridade:PRIORIDADE.Media});
      i++;continue;
    }
    i++;
  }
  return {semanaNum,tema,tasks};
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function criarTask(listId, task) {
  const body={name:task.name,description:task.description||'',
    ...(task.due&&{due_date:task.due.getTime(),due_date_time:true}),
    custom_fields:[
      {id:FIELD.aprovacao,value:APROVACAO_PENDENTE},
      ...(task.canal?[{id:FIELD.canal,value:task.canal}]:[]),
      ...(task.formato?[{id:FIELD.formato,value:task.formato}]:[]),
      ...(task.prioridade?[{id:FIELD.prioridade,value:task.prioridade}]:[]),
    ]};
  const r=await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`,{method:'POST',headers:HEADERS,body:JSON.stringify(body)});
  const data=await r.json();
  if(!r.ok) throw new Error(`"${task.name}": ${JSON.stringify(data).slice(0,120)}`);
  return data;
}

async function getMarketingListId() {
  // Tenta encontrar a lista "Email Marketing" ou "MailerLite" no workspace
  const r=await fetch(`https://api.clickup.com/api/v2/team/${TEAM_ID}/space`,{headers:HEADERS});
  const {spaces}=await r.json();
  for(const space of spaces||[]){
    const r2=await fetch(`https://api.clickup.com/api/v2/space/${space.id}/folder`,{headers:HEADERS});
    const {folders}=await r2.json();
    for(const folder of folders||[]){
      const r3=await fetch(`https://api.clickup.com/api/v2/folder/${folder.id}/list`,{headers:HEADERS});
      const {lists}=await r3.json();
      for(const list of lists||[]){
        const nm=list.name.toLowerCase();
        if(nm.includes('email')||nm.includes('mailer')||nm.includes('nurturing')||nm.includes('marketing')){
          console.log(`  📋 Lista encontrada: "${list.name}" (${list.id})`);
          return list.id;
        }
      }
    }
    // Listas fora de folder
    const r4=await fetch(`https://api.clickup.com/api/v2/space/${space.id}/list`,{headers:HEADERS});
    const {lists}=await r4.json();
    for(const list of lists||[]){
      const nm=list.name.toLowerCase();
      if(nm.includes('email')||nm.includes('mailer')||nm.includes('marketing')){
        console.log(`  📋 Lista encontrada: "${list.name}" (${list.id})`);
        return list.id;
      }
    }
  }
  return null;
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const CONTENT_DIR=path.resolve(__dirname,'../docs/marketing/conteudo');

  // ── 1. Semanas 2 e 3 no Calendário Editorial ───────────────────────────────
  console.log('\n📅 Seeding Semanas 2 e 3 → Calendário Editorial ClickUp\n');
  const semanasFaltantes=['SEMANA-2','SEMANA-3'];
  const files=fs.readdirSync(CONTENT_DIR).filter(f=>semanasFaltantes.some(s=>f.startsWith(s))).map(f=>path.join(CONTENT_DIR,f));

  let total=0, erros=0;
  for(const file of files){
    const {semanaNum,tema,tasks}=parseSemana(file);
    console.log(`\n📁 Semana ${semanaNum} — "${tema}" (${tasks.length} peças)`);
    for(const task of tasks){
      try{
        await criarTask(LIST_EDITORIAL,task);
        const ds=task.due?task.due.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):'sem data';
        console.log(`  ✅ ${task.name} [${ds}]`);
        total++;await sleep(250);
      }catch(e){console.log(`  ❌ ${e.message}`);erros++;}
    }
  }
  console.log(`\n✅ ${total} tasks criadas (semanas 2-3)`);

  // ── 2. Tasks de Email Marketing ────────────────────────────────────────────
  console.log('\n\n📧 Criando tasks de Email Marketing no ClickUp...\n');
  console.log('🔍 Buscando lista de Email Marketing...');
  const emailListId = await getMarketingListId();

  if(!emailListId){
    console.log('⚠️  Lista de Email Marketing não encontrada. Usando lista Editorial como fallback.');
    console.log('   Crie uma lista "Email Marketing" no ClickUp e rode o script novamente.');
  }

  const listId=emailListId||LIST_EDITORIAL;

  const emailTasks=[
    // Setup
    {name:'📬 Setup MailerLite — Criar conta e verificar domínio',description:`**Passo 1 do setup de Email Marketing**\n\n1. Acessar mailerlite.com → criar conta gratuita\n2. Verificar domínio de email (ex: Luis@spfp.com.br)\n3. Configurar remetente: "Luis | SPFP"\n\n**Responsável:** Luis\n**Ferramenta:** MailerLite`,prioridade:PRIORIDADE.Alta},
    {name:'🔗 Setup MailerLite — Integrar Calendly via webhook',description:`**Passo 2 do setup**\n\n1. No MailerLite: Integrations → Webhooks → copiar URL\n2. No Calendly: Integrations → Webhooks → colar URL\n3. Evento "Invitee Created" → lista "Leads Consulta Gratuita"\n4. Evento "Invitee Canceled" → lista "Cancelamentos"\n\n**Responsável:** Luis`,prioridade:PRIORIDADE.Alta},
    {name:'⚙️ Setup MailerLite — Criar automação pós-consulta (trigger: tag CONSULTA_REALIZADA)',description:`**Passo 3 do setup**\n\nCriar automação no MailerLite:\n- Trigger: tag "CONSULTA_REALIZADA" adicionada manualmente\n- Ação: iniciar sequência de 7 emails\n\n**Responsável:** Luis`,prioridade:PRIORIDADE.Alta},

    // Sequência 1 — Pós-consulta
    {name:'✉️ Email 1 — Resumo da consulta (D+1)',description:`**Sequência Pós-Consulta | Email 1 de 7**\n\n**Assunto:** "Resumo da nossa conversa, [Nome]"\n**Objetivo:** Personalização + mostrar que Luis prestou atenção\n\nCriar template no MailerLite. Luis preenche os 3 pontos manualmente após cada consulta.\n\n> "Saí da nossa conversa com três pontos principais sobre a sua situação..."`,prioridade:PRIORIDADE.Alta},
    {name:'✉️ Email 2 — Case de cliente (D+3)',description:`**Sequência Pós-Consulta | Email 2 de 7**\n\n**Assunto:** "O que aconteceu com o [cliente] em 3 meses"\n**Objetivo:** Prova social com resultado concreto\n\n> "Rafael tem 34 anos, ganha R$7.500/mês... Em 3 meses: R$2.400 guardados."`,prioridade:PRIORIDADE.Alta},
    {name:'✉️ Email 3 — Diferencial do Finn vs apps gratuitos (D+5)',description:`**Sequência Pós-Consulta | Email 3 de 7**\n\n**Assunto:** "A diferença entre o Finn e qualquer app gratuito"\n**Objetivo:** Quebrar objeção "já usei app e não funcionou"\n\n> "O Finn é diferente por um motivo simples: ele tem contexto."`,prioridade:PRIORIDADE.Alta},
    {name:'✉️ Email 4 — Quebrar objeção de preço (D+7)',description:`**Sequência Pós-Consulta | Email 4 de 7**\n\n**Assunto:** "Sobre a questão do investimento agora..."\n**Objetivo:** Quebrar objeção "não tenho dinheiro"\n\n> "O SPFP custa R$99,90. O que ele revela vale em média R$300-600 de recuperação por mês."`,prioridade:PRIORIDADE.Alta},
    {name:'✉️ Email 5 — Urgência: vagas limitadas (D+10)',description:`**Sequência Pós-Consulta | Email 5 de 7**\n\n**Assunto:** "Tenho [X] vagas abertas esse mês"\n**Objetivo:** Urgência real — escassez de atenção do Luis\n\n> "Esse mês tenho [X] vagas abertas para novos clientes com acompanhamento pessoal."`,prioridade:PRIORIDADE.Alta},
    {name:'✉️ Email 6 — Último contato (D+14)',description:`**Sequência Pós-Consulta | Email 6 de 7**\n\n**Assunto:** "Último contato, [Nome]"\n**Objetivo:** Fechamento ou saída limpa\n\n> "Esse vai ser meu último email por enquanto. Não quero encher sua caixa de entrada se o momento não é esse."`,prioridade:PRIORIDADE.Alta},
    {name:'✉️ Email 7 — Reengajamento (D+30)',description:`**Sequência Pós-Consulta | Email 7 de 7**\n\n**Assunto:** "Uma coisa nova no SPFP que você precisa saber"\n**Objetivo:** Reengajar com novidade real — feature, conteúdo ou resultado novo\n\n> "Faz um mês desde que conversamos. Queria compartilhar algo novo: [feature nova]."`,prioridade:PRIORIDADE.Media},

    // Sequência 2 — Boas-vindas
    {name:'✉️ Email Boas-vindas — Novo cliente pagante (imediato)',description:`**Sequência Boas-vindas | Trigger: tag CLIENTE_ATIVO**\n\n**Assunto:** "Bem-vindo ao SPFP, [Nome] — por onde começar"\n\nCriar template no MailerLite. Enviado imediatamente após pagamento.\n\n> "Nos próximos 14 dias, vou acompanhar sua configuração inicial."`,prioridade:PRIORIDADE.Alta},

    // Newsletter semanal
    {name:'📰 Newsletter Semanal — Criar template e schedule',description:`**Newsletter toda segunda-feira**\n\n**Estrutura fixa:**\n- 1 insight financeiro em 3 parágrafos curtos\n- 1 pergunta reflexiva\n- 1 CTA leve (link Calendly)\n\n**Meta de abertura:** > 40%\n**Frequência:** Toda segunda-feira\n\nCriar automação recorrente no MailerLite.`,prioridade:PRIORIDADE.Media},

    // Métricas
    {name:'📊 Configurar métricas de email no MailerLite',description:`**Monitorar semanalmente:**\n\n| Métrica | Meta |\n|---------|------|\n| Taxa de abertura | > 40% |\n| Taxa de clique | > 5% |\n| Conversão lead → cliente | > 15% |\n| Taxa de descadastro | < 1% por email |\n\nSe abertura < 30%: revisar assuntos.\nSe clique < 3%: revisar CTA e oferta.`,prioridade:PRIORIDADE.Media},
  ];

  let totalEmail=0, errosEmail=0;
  for(const task of emailTasks){
    try{
      await criarTask(listId,task);
      console.log(`  ✅ ${task.name}`);
      totalEmail++;await sleep(250);
    }catch(e){console.log(`  ❌ ${e.message}`);errosEmail++;}
  }
  console.log(`\n✅ ${totalEmail} tasks de email marketing criadas`);
  if(errosEmail>0) console.log(`⚠️  ${errosEmail} erros`);
  console.log('\n🚀 Tudo pronto!');
}

main().catch(console.error);
