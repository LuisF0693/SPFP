# Environment Variable Template

**Squad:** Clone Deploy
**Purpose:** Reference for all environment variables used by mind clone bots
**When to use:** When configuring a new deployment (EasyPanel, Docker, local dev)

---

## Usage

1. Copy the required variables section to your `.env` file or EasyPanel environment settings
2. Replace placeholder values with actual credentials
3. Add channel-specific variables based on your deployment target
4. Never commit `.env` files to git

---

## Required Variables

These variables are needed for every deployment regardless of channel.

```bash
# =============================================================================
# REQUIRED - Core Services
# =============================================================================

# Supabase - RAG database (minds + mind_chunks tables)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI - Embedding generation (text-embedding-3-small)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx

# Anthropic - LLM generation (Claude)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx

# Mind Configuration - Which mind this bot clones
DEFAULT_MIND_SLUG=jose_carlos_amorim
```

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_KEY` | Service role key (not anon key) | Supabase Dashboard > Settings > API > service_role |
| `OPENAI_API_KEY` | OpenAI API key for embeddings | platform.openai.com > API Keys |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | console.anthropic.com > API Keys |
| `DEFAULT_MIND_SLUG` | Snake_case slug of the mind to clone | Must match `slug` in Supabase `minds` table |

---

## Optional Variables

These variables have sensible defaults but can be overridden.

```bash
# =============================================================================
# OPTIONAL - LLM Configuration (defaults shown)
# =============================================================================

# Claude model to use for generation
# Options: claude-haiku-4-5-20251001, claude-sonnet-4-20250514
CLAUDE_MODEL=claude-haiku-4-5-20251001

# Maximum tokens in LLM response (default: 2048)
MAX_TOKENS=2048

# LLM temperature: 0.0 = deterministic, 1.0 = creative (default: 0.7)
TEMPERATURE=0.7

# =============================================================================
# OPTIONAL - RAG Configuration (defaults shown)
# =============================================================================

# Maximum RAG chunks to include in context (default: 5)
MAX_CONTEXT_CHUNKS=5

# Embedding model (default: text-embedding-3-small)
EMBEDDING_MODEL=text-embedding-3-small

# =============================================================================
# OPTIONAL - Application Configuration (defaults shown)
# =============================================================================

# Port for the webhook/API server (default: 8080)
PORT=8080

# Maximum conversation history messages per user (default: 20)
MAX_HISTORY_PER_USER=20

# Log level: DEBUG, INFO, WARNING, ERROR (default: INFO)
LOG_LEVEL=INFO
```

---

## Channel-Specific Variables

### WhatsApp (UazAPI)

```bash
# =============================================================================
# WHATSAPP - UazAPI Integration
# =============================================================================

# UazAPI instance base URL
UAZAPI_BASE_URL=https://your-instance.uazapi.com

# UazAPI authentication token
UAZAPI_TOKEN=your-uazapi-token-here

# Phone number of the WhatsApp account owner (digits only, no +)
# Used for self-chat mode filtering
OWNER_PHONE=559281951096
```

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `UAZAPI_BASE_URL` | Your UazAPI instance URL | UazAPI dashboard |
| `UAZAPI_TOKEN` | Authentication token for UazAPI API calls | UazAPI dashboard > Settings > API Token |
| `OWNER_PHONE` | WhatsApp owner phone number (country code + number, no +) | Your WhatsApp number |

### Telegram (Bot API)

```bash
# =============================================================================
# TELEGRAM - Bot API Integration
# =============================================================================

# Telegram Bot Token from @BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklmNOPqrstUVwxyz

# Telegram Bot username (without @)
TELEGRAM_BOT_USERNAME=my_mind_clone_bot

# Webhook URL for Telegram to send updates
# Must be HTTPS and publicly accessible
TELEGRAM_WEBHOOK_URL=https://clone-bot.yourdomain.com/telegram/webhook
```

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `TELEGRAM_BOT_TOKEN` | Bot authentication token | Telegram > @BotFather > /newbot |
| `TELEGRAM_BOT_USERNAME` | Bot username | Set during bot creation with @BotFather |
| `TELEGRAM_WEBHOOK_URL` | Public HTTPS URL for receiving updates | Your deployed bot URL + `/telegram/webhook` |

### Web App (REST API)

```bash
# =============================================================================
# WEB APP - REST API Configuration
# =============================================================================

# Allowed CORS origins (comma-separated)
# Use * for development only; restrict in production
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# API authentication method: none, api_key, jwt
API_AUTH_METHOD=api_key

# API key for authenticating requests (if API_AUTH_METHOD=api_key)
API_KEY=your-secure-api-key-here

# JWT secret for token validation (if API_AUTH_METHOD=jwt)
JWT_SECRET=your-jwt-secret-here

# Maximum response length in characters for web responses (default: 8000)
WEB_MAX_RESPONSE_LENGTH=8000
```

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `CORS_ORIGINS` | Domains allowed to make API requests | Your frontend domain(s) |
| `API_AUTH_METHOD` | How API requests are authenticated | Choose based on your security needs |
| `API_KEY` | Static API key for simple auth | Generate a secure random string |
| `JWT_SECRET` | Secret for JWT validation | Generate a secure random string |

---

## Complete .env.example

Copy this file as `.env.example` in your repository (safe to commit):

```bash
# =============================================================================
# Mind Clone Bot - Environment Variables
# =============================================================================
# Copy this file as .env and fill in the actual values.
# NEVER commit .env to git.
# =============================================================================

# --- Core Services (REQUIRED) ---
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
DEFAULT_MIND_SLUG=your_mind_slug

# --- LLM Configuration (optional) ---
CLAUDE_MODEL=claude-haiku-4-5-20251001
# MAX_TOKENS=2048
# TEMPERATURE=0.7

# --- RAG Configuration (optional) ---
# MAX_CONTEXT_CHUNKS=5
# EMBEDDING_MODEL=text-embedding-3-small

# --- Application (optional) ---
# PORT=8080
# MAX_HISTORY_PER_USER=20
# LOG_LEVEL=INFO

# --- WhatsApp / UazAPI (if deploying to WhatsApp) ---
# UAZAPI_BASE_URL=https://your-instance.uazapi.com
# UAZAPI_TOKEN=your-uazapi-token
# OWNER_PHONE=559200000000

# --- Telegram (if deploying to Telegram) ---
# TELEGRAM_BOT_TOKEN=your-bot-token
# TELEGRAM_BOT_USERNAME=your_bot_username
# TELEGRAM_WEBHOOK_URL=https://your-domain.com/telegram/webhook

# --- Web App (if deploying as REST API) ---
# CORS_ORIGINS=https://yourdomain.com
# API_AUTH_METHOD=none
# API_KEY=your-api-key
# JWT_SECRET=your-jwt-secret
```

---

## Security Reminders

- **Never commit `.env` files** to git (ensure `.gitignore` includes `.env`)
- **Never log secrets** in application output
- **Use EasyPanel environment variables** or GitHub Secrets for production
- **Rotate keys** periodically (at least every 90 days for production)
- **Use service role key** for Supabase (not anon key) since the bot accesses mind_chunks directly
- **Restrict CORS origins** in production (never use `*` in production)

---

_Template Version: 1.0_
_Last Updated: 2026-02-14_
