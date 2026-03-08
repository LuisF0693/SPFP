import { CompanyTask } from '../types/company';
import { ContentType, Platform } from '../context/MarketingContext';

/**
 * Extrai content_type a partir das tags da task.
 */
function extractContentType(tags: string[] = []): ContentType {
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.some((t) => t.includes('reel'))) return 'reel';
  if (lower.some((t) => t.includes('carrossel') || t.includes('carousel'))) return 'carousel';
  if (lower.some((t) => t.includes('story') || t.includes('stories'))) return 'story';
  if (lower.some((t) => t.includes('email'))) return 'email';
  return 'post';
}

/**
 * Extrai plataformas a partir das tags da task.
 */
function extractPlatforms(tags: string[] = []): Platform[] {
  const lower = tags.map((t) => t.toLowerCase());
  const platforms: Platform[] = [];
  if (lower.some((t) => t.includes('instagram'))) platforms.push('instagram');
  if (lower.some((t) => t.includes('youtube'))) platforms.push('youtube');
  if (lower.some((t) => t.includes('facebook'))) platforms.push('facebook');
  if (lower.some((t) => t.includes('email'))) platforms.push('email');
  return platforms.length > 0 ? platforms : ['instagram'];
}

/**
 * Limpa o título da task removendo prefixos de semana/dia e emojis de cabeçalho.
 * Exemplo: "🎬 S1-SEG | Reel — \"Você sabe exatamente...\"" → "Você sabe exatamente..."
 */
function cleanTitle(raw: string): string {
  let title = raw;

  // Remove parte antes do " | " (ex: "🎬 S1-SEG | ")
  const pipeIdx = title.indexOf(' | ');
  if (pipeIdx !== -1) {
    title = title.substring(pipeIdx + 3);
  }

  // Remove parte antes do " — " (ex: "Reel — ")
  const dashIdx = title.indexOf(' — ');
  if (dashIdx !== -1) {
    title = title.substring(dashIdx + 3);
  }

  // Remove aspas ao redor
  title = title.replace(/^[""]|[""]$/g, '').trim();

  return title || raw;
}

/**
 * Converte due_date (YYYY-MM-DD) para scheduled_at (ISO 8601 ao meio-dia).
 */
function toScheduledAt(dueDate?: string): string | undefined {
  if (!dueDate) return undefined;
  // due_date pode ser "2026-03-10" ou "2026-03-10T..."
  const dateOnly = dueDate.substring(0, 10);
  return `${dateOnly}T12:00:00.000Z`;
}

/**
 * Transforma uma CompanyTask do Calendário 90 Dias em um Partial<MarketingContent>
 * pronto para ser passado ao addContent().
 */
export function parseCalendarTask(
  task: CompanyTask
): Omit<import('../context/MarketingContext').MarketingContent, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    title: cleanTitle(task.title),
    content_type: extractContentType(task.tags),
    platform: extractPlatforms(task.tags),
    status: 'draft',
    scheduled_at: toScheduledAt(task.due_date),
    created_by_agent: `task:${task.id}`,
    caption: task.description,
  };
}
