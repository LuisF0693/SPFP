# Production Readiness Checklist

**Squad:** Clone Deploy
**Purpose:** Validate that a deployed clone meets production-grade standards
**When to use:** After successful deployment, before announcing the clone as "live" to end users

---

## 1. Security

- [ ] No hardcoded secrets in source code (API keys, tokens, passwords)
- [ ] `.env` file is in `.gitignore` and `.dockerignore`
- [ ] `.env.example` exists with placeholder values only
- [ ] HTTPS enforced on all public endpoints (webhook, health, API)
- [ ] SSL certificate is valid and auto-renewing (Cloudflare or Let's Encrypt)
- [ ] Rate limiting configured on webhook endpoint (max 60 req/min per IP)
- [ ] Input sanitization on all user-facing endpoints (no injection)
- [ ] System prompt is NOT exposed via any endpoint or error message
- [ ] Debug endpoint (`/debug`) is disabled or protected in production
- [ ] Container runs as non-root user
- [ ] API tokens rotated since initial setup (no default/test tokens in production)

**Score:** ___/11

## 2. Performance

- [ ] Average response time < 5 seconds (embedding + RAG + LLM)
- [ ] Health endpoint responds in < 200ms
- [ ] Memory usage stays below 512MB under normal load
- [ ] No memory leaks after 100+ conversations (conversation history trimming works)
- [ ] Connection pooling enabled for Supabase and HTTP clients
- [ ] LLM model selected for cost/latency balance (Haiku for high-volume, Sonnet for premium)
- [ ] `MAX_CONTEXT_CHUNKS` tuned (default 5; reduce if latency > 5s)
- [ ] Response length bounded (WhatsApp: < 4,000 chars; Telegram: < 4,096 chars)

**Score:** ___/8

## 3. Reliability

- [ ] `/health` endpoint returns 200 OK with mind slug and timestamp
- [ ] Graceful shutdown handles in-flight requests (SIGTERM signal handling)
- [ ] LLM fallback works (Claude unavailable -> OpenAI responds correctly)
- [ ] RAG fallback works (hybrid search fails -> vector search -> basic query)
- [ ] Empty RAG results handled gracefully (responds without context, does not crash)
- [ ] Invalid webhook payloads return 200 (do not crash or 500)
- [ ] Application restarts automatically on crash (Docker restart policy: `unless-stopped`)
- [ ] Conversation history limit prevents unbounded memory growth (`MAX_HISTORY_PER_USER`)
- [ ] UazAPI/Telegram connection failures are logged and retried (at least 1 retry)
- [ ] Container starts successfully after cold restart (no missing state dependencies)

**Score:** ___/10

## 4. Monitoring

- [ ] Structured logging enabled (JSON or consistent format with timestamps)
- [ ] Log level set to INFO in production (not DEBUG)
- [ ] Logs are accessible (EasyPanel logs, stdout, or external log service)
- [ ] Key events logged: incoming messages, outgoing responses, errors, latency
- [ ] Error logging includes stack traces and context (phone, mind_slug, message preview)
- [ ] Uptime monitoring configured (external ping to `/health` every 60s)
- [ ] Alerting configured for downtime (email, Slack, or webhook notification)
- [ ] Conversation metrics trackable (messages/day, unique users, avg response time)

**Score:** ___/8

## 5. Data & Privacy

- [ ] No PII (phone numbers, names) stored in logs or exported
- [ ] Conversation history is ephemeral (in-memory, cleared on restart)
- [ ] If conversation persistence is added: encrypted at rest, retention policy defined
- [ ] Supabase access uses service key (not anon key) for mind_chunks
- [ ] Database credentials are environment variables, not hardcoded
- [ ] Backup strategy documented for Supabase data (minds, mind_chunks tables)
- [ ] User data deletion mechanism exists (clear conversation on "reset" command)
- [ ] GDPR/LGPD notice: users informed they are interacting with an AI clone

**Score:** ___/8

## 6. Documentation

- [ ] API endpoints documented (webhook format, health response, debug endpoint)
- [ ] Environment variables documented with descriptions and example values
- [ ] Deployment runbook exists (step-by-step deploy/redeploy instructions)
- [ ] Rollback procedure documented (how to revert to previous version)
- [ ] Incident response plan: who to contact, how to disable the bot quickly
- [ ] Architecture diagram shows data flow (user -> channel -> bot -> RAG -> LLM -> channel)
- [ ] Known limitations documented (self-chat mode, ephemeral history, rate limits)

**Score:** ___/7

---

## Scoring Summary

| Category | Items | Score | Weight | Weighted Score |
|----------|-------|-------|--------|----------------|
| Security | /11 | | 25% | |
| Performance | /8 | | 20% | |
| Reliability | /10 | | 20% | |
| Monitoring | /8 | | 15% | |
| Data & Privacy | /8 | | 10% | |
| Documentation | /7 | | 10% | |
| **TOTAL** | **/52** | | **100%** | **/100** |

### How to Calculate

1. For each category, count checked items and divide by total items to get a percentage
2. Multiply each category percentage by its weight
3. Sum all weighted scores for the final score

**Example:** Security 9/11 = 81.8% x 25% = 20.5 weighted points

### Verdict

| Score | Verdict | Action |
|-------|---------|--------|
| >= 85% | **PRODUCTION READY** | Go live with confidence |
| 70-84% | **CONDITIONAL** | Go live with documented risks and remediation plan |
| 50-69% | **NOT READY** | Resolve critical gaps before going live |
| < 50% | **BLOCKED** | Major rework required; do not expose to users |

### Critical Blockers (any single failure = NO-GO)

These items are non-negotiable regardless of overall score:

- [ ] No hardcoded secrets in source code
- [ ] HTTPS on all public endpoints
- [ ] `/health` endpoint returns 200 OK
- [ ] Container starts successfully after cold restart
- [ ] System prompt is NOT exposed via any endpoint

If ANY critical blocker fails, the verdict is **BLOCKED** regardless of total score.

---

_Checklist Version: 1.0_
_Last Updated: 2026-02-14_
