/**
 * seed-editorial-calendar.mjs
 * Lê os 12 arquivos de conteúdo e cria tasks no ClickUp › Calendário Editorial
 * Arquiteto: Pedro Valerio (OPS)
 */

import fs from 'fs';
import path from 'path';

const TOKEN   = 'pk_284509678_BD2KU92GWEPO8O3C7X8RK0H9F40HZ5SV';
const LIST_ID = '901326289280'; // 🗓️ Calendário Editorial
const HEADERS = { 'Authorization': TOKEN, 'Content-Type': 'application/json' };
const CONTENT_DIR = path.resolve('docs/marketing/conteudo');

// ── IDs de campos customizados ────────────────────────────────────────────────
const FIELD = {
  canal:     '1a7b5321-6961-4283-8797-6ae9249f7771',
  aprovacao: '3890071e-f36c-48e9-ae6a-9c0fafc19f30',
  dataPub:   '9cc4ed26-1189-412c-972c-c7c90cc78111',
  formato:   'c0b601fb-1c02-4be3-add9-2c860a822268',
  aprovador: 'da2b5089-440e-4bed-8b20-1183cefb6b9e',
  prioridade:'fdd803ca-b3e8-4771-9dfe-e12b43138b0f',
};

// ── IDs de opções dos dropdowns ───────────────────────────────────────────────
const CANAL = {
  Instagram: '3a045341-0a8d-4cee-aa01-fc32a26f5e20',
  YouTube:   '075afb21-d6b6-43bf-a381-1ca6f33d2647',
  LinkedIn:  '5413380c-6fc1-4f26-8d31-7d471727747d',
  TikTok:    'b28860ce-cea6-4bbe-b132-b401d3cb5af0',
};
const FORMATO = {
  Carrossel: '4640f960-ca74-45ec-aeb1-b09f6ddbda3a',
  Reels:     '8a4c80c7-f3c0-4662-b26b-790840e12769',
  Story:     '8783e872-780b-4f22-8bb5-12ecf56aefbf',
  Post:      'a5b8d670-0f12-4ba2-a792-31ed48e371dd',
  Video:     '340c4069-db4c-41d8-8fe6-32f977d8e7d7',
};
const PRIORIDADE = {
  Alta:   '7693b3d4-861d-4df3-b102-fbeae8ec5dfe',
  Media:  'cffa4656-28e5-4d66-8e5b-118a690a3e93',
  Baixa:  'a1fbf1ae-cb75-40ae-b9e3-29a2c4c6007e',
};
const APROVACAO_PENDENTE = 'c6653caa-f153-4d2c-a77b-927c03030e28';

// ── Mapeamentos de data ───────────────────────────────────────────────────────
const MESES = {
  janeiro:1, fevereiro:2, março:3, marco:3, abril:4,
  maio:5, junho:6, julho:7, agosto:8, setembro:9,
  outubro:10, novembro:11, dezembro:12,
};

// Extrai {dia, mês} de textos como "Segunda, 10 de Março" ou "17 de Abril"
function extrairData(texto, anoBase = 2026) {
  const m = texto.match(/(\d{1,2})\s+de\s+(\w+)/i);
  if (!m) return null;
  const dia = parseInt(m[1]);
  const mes = MESES[m[2].toLowerCase()];
  if (!mes) return null;
  return new Date(anoBase, mes - 1, dia, 12, 0, 0);
}

// Retorna data de uma semana (Seg=1, Ter=2, Qua=3, Qui=4, Sex=5)
function dataDoWeekday(weekStart, weekdayOffset) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + weekdayOffset);
  return d;
}

// Converte Date → timestamp ms para ClickUp
function toTimestamp(date) {
  return date ? date.getTime() : null;
}

// ── Parser de um arquivo de semana ───────────────────────────────────────────
function parseSemana(filePath) {
  const raw   = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');
  const tasks = [];

  // Tema da semana
  const temaMatch = raw.match(/\*\*Tema da semana:\*\*\s*(.+)/);
  const tema = temaMatch ? temaMatch[1].trim() : 'Sem tema';

  // Semana N (do nome do arquivo)
  const semanaMatch = path.basename(filePath).match(/SEMANA-(\d+)/);
  const semanaNum = semanaMatch ? semanaMatch[1] : '?';

  // Data de início da semana — pegar do título do arquivo
  // ex: SEMANA-1-10-14MAR-2026 → 10/03/2026
  // ex: SEMANA-4-31MAR-04ABR-2026 → 31/03/2026
  const fileBase = path.basename(filePath, '.md');
  let weekStart = null;

  // Tentar extrair do título do arquivo (## Conteúdo Semana N — DD a DD de Mês de ANO)
  const tituloMatch = raw.match(/# Conteúdo Semana \d+ — (\d+) a \d+ de (\w+) de (\d+)/i);
  if (tituloMatch) {
    weekStart = new Date(
      parseInt(tituloMatch[3]),
      MESES[tituloMatch[2].toLowerCase()] - 1,
      parseInt(tituloMatch[1]),
      12, 0, 0
    );
  }

  // Parsear seções ## de conteúdo
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // ── REEL ──────────────────────────────────────────────────────────────────
    const reelMatch = line.match(/^## REEL (\d+)\s*[—-]\s*(.+)/i);
    if (reelMatch) {
      const num = reelMatch[1];
      const dataTxt = reelMatch[2]; // "Segunda, 10 de Março"
      const dataReel = extrairData(dataTxt);

      // Gancho na próxima linha **Gancho:**
      let gancho = '';
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const g = lines[j].match(/\*\*Gancho:\*\*\s*"?(.+?)"?\s*$/);
        if (g) { gancho = g[1].trim().replace(/^"(.*)"$/, '$1'); break; }
      }

      tasks.push({
        name: `📹 Reel ${num} — ${tema}`,
        description: gancho ? `**Gancho:** "${gancho}"\n\n**Semana ${semanaNum}**` : `Semana ${semanaNum}`,
        due: dataReel,
        canal: CANAL.Instagram,
        formato: FORMATO.Reels,
        prioridade: PRIORIDADE.Alta,
      });
      i++; continue;
    }

    // ── CARROSSEL ─────────────────────────────────────────────────────────────
    const carrosselMatch = line.match(/^## CARROSSEL\s*[—-]\s*(.+)/i);
    if (carrosselMatch) {
      // Título do carrossel (linha seguinte **Título:**)
      let tituloCarrossel = '';
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const t = lines[j].match(/\*\*Título:\*\*\s*"?(.+?)"?\s*$/);
        if (t) { tituloCarrossel = t[1]; break; }
      }
      // Data: Terça da semana (offset 1 do weekStart)
      const dataCarrossel = weekStart ? dataDoWeekday(weekStart, 1) : null;

      tasks.push({
        name: `📱 Carrossel — ${tituloCarrossel || tema}`,
        description: `**Semana ${semanaNum} — ${tema}**\n\n${tituloCarrossel}`,
        due: dataCarrossel,
        canal: CANAL.Instagram,
        formato: FORMATO.Carrossel,
        prioridade: PRIORIDADE.Alta,
      });
      i++; continue;
    }

    // ── YOUTUBE ───────────────────────────────────────────────────────────────
    const youtubeMatch = line.match(/^## YOUTUBE\s*[—-]\s*"?(.+?)"?\s*$/i);
    if (youtubeMatch) {
      const titulo = youtubeMatch[1].replace(/^"(.*)"$/, '$1');
      // Data: Quinta da semana (offset 3)
      const dataYT = weekStart ? dataDoWeekday(weekStart, 3) : null;

      tasks.push({
        name: `▶️ YouTube — ${titulo}`,
        description: `**Semana ${semanaNum} — ${tema}**`,
        due: dataYT,
        canal: CANAL.YouTube,
        formato: FORMATO.Video,
        prioridade: PRIORIDADE.Alta,
      });
      i++; continue;
    }

    // ── LINKEDIN ──────────────────────────────────────────────────────────────
    const linkedinMatch = line.match(/^## LINKEDIN\s*[—-]\s*(.+)/i);
    if (linkedinMatch) {
      const dataTxt = linkedinMatch[1];
      const dataLI = extrairData(dataTxt);

      // Subtítulo (linha com * repurpose *)
      let subtitulo = '';
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const s = lines[j].match(/\*Repurpose[^*]+\*(.+)/i);
        if (s) { subtitulo = s[1].trim(); break; }
        // às vezes é só *texto*
        const s2 = lines[j].match(/^\*(.+)\*$/);
        if (s2) { subtitulo = s2[1]; break; }
      }

      tasks.push({
        name: `💼 LinkedIn — ${tema}${subtitulo ? ` (${subtitulo})` : ''}`,
        description: `**Semana ${semanaNum} — ${tema}**\n\nRepurpose para LinkedIn.`,
        due: dataLI,
        canal: CANAL.LinkedIn,
        formato: FORMATO.Post,
        prioridade: PRIORIDADE.Media,
      });
      i++; continue;
    }

    // ── STORIES ───────────────────────────────────────────────────────────────
    const storiesMatch = line.match(/^## STORIES\s*[—-]/i);
    if (storiesMatch) {
      const dataSt = weekStart ? dataDoWeekday(weekStart, 4) : null; // Sexta
      tasks.push({
        name: `📖 Stories da Semana ${semanaNum} — ${tema}`,
        description: `**Semana ${semanaNum} — ${tema}**\n\nStories diários Seg–Sex + CTA Calendly na Sexta.`,
        due: dataSt,
        canal: CANAL.Instagram,
        formato: FORMATO.Story,
        prioridade: PRIORIDADE.Media,
      });
      i++; continue;
    }

    i++;
  }

  return { semanaNum, tema, tasks };
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function createTask(task) {
  const body = {
    name: task.name,
    description: task.description || '',
    ...(task.due && { due_date: toTimestamp(task.due), due_date_time: true }),
    custom_fields: [
      { id: FIELD.aprovacao, value: APROVACAO_PENDENTE },
      ...(task.canal     ? [{ id: FIELD.canal,     value: task.canal     }] : []),
      ...(task.formato   ? [{ id: FIELD.formato,   value: task.formato   }] : []),
      ...(task.prioridade? [{ id: FIELD.prioridade, value: task.prioridade}] : []),
    ],
  };

  const r = await fetch(`https://api.clickup.com/api/v2/list/${LIST_ID}/task`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`Erro ao criar "${task.name}": ${JSON.stringify(data)}`);
  return data;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📅 Importando Calendário Editorial 90 dias → ClickUp\n');

  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => path.join(CONTENT_DIR, f));

  let totalTasks = 0;
  let totalErros = 0;

  for (const file of files) {
    const { semanaNum, tema, tasks } = parseSemana(file);
    console.log(`\n📁 Semana ${semanaNum} — "${tema}" (${tasks.length} peças)`);

    for (const task of tasks) {
      try {
        await createTask(task);
        const dataStr = task.due
          ? task.due.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          : 'sem data';
        console.log(`  ✅ ${task.name} [${dataStr}]`);
        totalTasks++;
        await sleep(200);
      } catch (e) {
        console.log(`  ❌ Erro: ${e.message.slice(0, 100)}`);
        totalErros++;
      }
    }
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`✅ ${totalTasks} tasks criadas no ClickUp`);
  if (totalErros > 0) console.log(`⚠️  ${totalErros} erros`);
  console.log('Calendário Editorial operante 🚀');
}

main();
