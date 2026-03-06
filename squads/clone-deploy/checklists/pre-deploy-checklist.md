# Pre-Deploy Checklist

**Squad:** Clone Deploy
**Purpose:** Validate all prerequisites before deploying a clone to any channel
**When to use:** Before running any deploy-* task

---

## 1. Mind Quality

- [ ] Mind exists in `outputs/minds/{slug}/`
- [ ] System prompt exists in `outputs/minds/{slug}/system_prompts/`
- [ ] System prompt has identity block, voice_dna, knowledge boundaries
- [ ] Mind has been validated by MMOS pipeline (fidelity >= 70%)

## 2. RAG Pipeline

- [ ] Supabase project is accessible (SUPABASE_URL configured)
- [ ] `minds` table exists with record for this mind slug
- [ ] `mind_chunks` table has >= 50 chunks for this mind
- [ ] Embeddings are populated (embedding column not null)
- [ ] `match_mind_chunks` RPC function exists and returns results
- [ ] Test query returns relevant chunks (manual verification)

## 3. LLM Configuration

- [ ] At least one LLM API key is configured:
  - [ ] ANTHROPIC_API_KEY (preferred - Claude Haiku 4.5)
  - [ ] OPENAI_API_KEY (fallback - GPT-4o-mini)
- [ ] Model produces coherent responses in the mind's voice
- [ ] Response length is appropriate (100-500 chars for chat)

## 4. Channel-Specific Prerequisites

### WhatsApp (UazAPI)
- [ ] UAZAPI_BASE_URL configured
- [ ] UAZAPI_TOKEN configured
- [ ] WhatsApp instance connected (status: "connected")
- [ ] Webhook URL will be accessible from internet (HTTPS)
- [ ] Test number available for E2E testing

### Telegram
- [ ] Telegram Bot Token obtained from @BotFather
- [ ] Bot username set
- [ ] Webhook URL will be accessible from internet (HTTPS)

### Web App
- [ ] API domain/subdomain configured
- [ ] CORS origins defined
- [ ] Authentication method chosen (API key / JWT / none)

## 5. Infrastructure

- [ ] Docker/EasyPanel access available
- [ ] GitHub repo created and accessible
- [ ] Domain/subdomain configured in Cloudflare (if custom domain)
- [ ] SSL certificate active (via Cloudflare or Let's Encrypt)
- [ ] Port 8080 available on deployment target

## 6. Environment Variables

- [ ] `.env` file has all required variables:
  ```
  OPENAI_API_KEY=...
  SUPABASE_URL=...
  SUPABASE_SERVICE_KEY=...
  ANTHROPIC_API_KEY=...
  DEFAULT_MIND_SLUG=...
  OWNER_PHONE=... (WhatsApp only)
  ```
- [ ] No secrets committed to git
- [ ] `.env.example` exists with placeholder values

## 7. Monitoring

- [ ] `/health` endpoint returns 200 OK
- [ ] Logs are visible (EasyPanel logs or stdout)
- [ ] Error alerting configured (optional but recommended)

---

## Scoring

| Category | Weight | Pass Criteria |
|----------|--------|---------------|
| Mind Quality | 25% | All 4 items checked |
| RAG Pipeline | 25% | All 6 items checked |
| LLM Config | 15% | At least 1 API key + coherent responses |
| Channel | 15% | All items for selected channel |
| Infrastructure | 10% | All items checked |
| Env Vars | 10% | All required vars set |

**GO:** Score >= 80% with no blocking items failed
**CONDITIONAL:** Score 60-80% - proceed with noted risks
**NO-GO:** Score < 60% - resolve issues first

---

_Checklist Version: 1.0_
_Last Updated: 2026-02-14_
