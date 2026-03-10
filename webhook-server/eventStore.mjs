// eventStore.mjs — Circular buffer de eventos para dashboard em tempo real

const MAX_EVENTS = 200;
const events = [];

// ── Adicionar evento ao buffer ─────────────────────────────────────────────

export function logEvent({ type, taskId, listId, status, result, agent, platform, error }) {
  const event = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    type,
    taskId,
    listId,
    status,
    result,
    agent,
    platform,
    error: error || null,
  };

  events.push(event);
  if (events.length > MAX_EVENTS) events.shift();

  return event;
}

// ── Consultar eventos recentes ─────────────────────────────────────────────

export function getEvents(limit = 50) {
  return [...events].slice(-limit).reverse();
}

// ── Estatísticas do dia ────────────────────────────────────────────────────

export function getStats() {
  const today = new Date().toDateString();
  const todayEvents = events.filter(e => new Date(e.timestamp).toDateString() === today);
  const successful = todayEvents.filter(e => !e.error);

  const byType = {};
  const byAgent = {};
  const byPlatform = {};

  for (const e of todayEvents) {
    if (e.type) byType[e.type] = (byType[e.type] || 0) + 1;
    if (e.agent) byAgent[e.agent] = (byAgent[e.agent] || 0) + 1;
    if (e.platform) byPlatform[e.platform] = (byPlatform[e.platform] || 0) + 1;
  }

  return {
    totalToday: todayEvents.length,
    successRate: todayEvents.length
      ? Math.round((successful.length / todayEvents.length) * 100)
      : 100,
    byType,
    byAgent,
    byPlatform,
  };
}
