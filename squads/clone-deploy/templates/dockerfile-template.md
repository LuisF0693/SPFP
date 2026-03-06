# Dockerfile Template

**Squad:** Clone Deploy
**Purpose:** Reference Dockerfile for deploying mind clone bots as containers
**When to use:** When creating or customizing the Dockerfile for a new clone deployment

---

## Base Dockerfile

```dockerfile
# =============================================================================
# Mind Clone Bot - Dockerfile
# =============================================================================
# Deploys a RAG-powered mind clone bot as a containerized Python service.
#
# Build:  docker build -t mind-clone-bot .
# Run:    docker run -d --env-file .env -p 8080:8080 mind-clone-bot
# Health: curl http://localhost:8080/health
# =============================================================================

# --- Stage 1: Base image ---
FROM python:3.11-slim AS base

# Metadata
LABEL maintainer="Clone Deploy Squad"
LABEL description="MMOS Mind Clone Bot - RAG-powered conversational AI"
LABEL version="1.0.0"

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Default port (override with -e PORT=XXXX)
ENV PORT=8080

# --- Stage 2: Dependencies ---
FROM base AS dependencies

WORKDIR /app

# Install dependencies first (cached layer if requirements.txt unchanged)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# --- Stage 3: Application ---
FROM dependencies AS application

# Create non-root user for security
RUN groupadd --gid 1000 botuser && \
    useradd --uid 1000 --gid botuser --shell /bin/bash --create-home botuser

WORKDIR /app

# Copy application code
COPY clone_engine.py .
COPY whatsapp_bot.py .
COPY ingest_mind.py .

# Set ownership to non-root user
RUN chown -R botuser:botuser /app

# Switch to non-root user
USER botuser

# Expose the application port
EXPOSE ${PORT}

# Health check - verify the bot is responsive
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT}/health')" || exit 1

# Start the bot
CMD ["python", "whatsapp_bot.py", "--port", "8080"]
```

---

## .dockerignore

Place this file at the repository root alongside the Dockerfile:

```
# Version control
.git/
.gitignore

# Python artifacts
__pycache__/
*.pyc
*.pyo
*.egg-info/
dist/
build/
.eggs/

# Virtual environments
.venv/
venv/
env/

# Environment and secrets
.env
.env.*
!.env.example
credentials.yaml

# IDE and editor
.vscode/
.idea/
*.swp
*.swo
*~

# Documentation and non-runtime files
*.md
docs/
reports/
configs/
tests/

# OS files
.DS_Store
Thumbs.db
```

---

## Environment Variables Reference

The following environment variables are consumed by the container at runtime:

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGci...` |
| `OPENAI_API_KEY` | OpenAI API key (embeddings) | `sk-proj-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key (Claude LLM) | `sk-ant-api03-...` |
| `DEFAULT_MIND_SLUG` | Mind to clone | `jose_carlos_amorim` |

### Channel-Specific

| Variable | Channel | Description |
|----------|---------|-------------|
| `UAZAPI_BASE_URL` | WhatsApp | UazAPI instance URL |
| `UAZAPI_TOKEN` | WhatsApp | UazAPI auth token |
| `OWNER_PHONE` | WhatsApp | Owner phone number (digits only) |
| `TELEGRAM_BOT_TOKEN` | Telegram | Bot token from @BotFather |
| `TELEGRAM_WEBHOOK_URL` | Telegram | Public HTTPS webhook URL |

### Optional (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Application port |
| `CLAUDE_MODEL` | `claude-haiku-4-5-20251001` | Claude model ID |
| `MAX_CONTEXT_CHUNKS` | `5` | RAG chunks per query |
| `MAX_HISTORY_PER_USER` | `20` | Conversation history limit |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

---

## Build and Run Commands

### Local Development

```bash
# Build the image
docker build -t mind-clone-bot .

# Run with .env file
docker run -d \
    --name mind-clone-bot \
    --env-file .env \
    -p 8080:8080 \
    --restart unless-stopped \
    mind-clone-bot

# Verify health
curl http://localhost:8080/health

# View logs
docker logs -f mind-clone-bot

# Stop and remove
docker stop mind-clone-bot && docker rm mind-clone-bot
```

### Docker Compose (multi-service)

```yaml
# docker-compose.yml
version: "3.8"

services:
  mind-clone-bot:
    build: .
    container_name: mind-clone-bot
    env_file: .env
    ports:
      - "8080:8080"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
```

### EasyPanel Deployment

In EasyPanel, configure the service with:
- **Build:** Dockerfile (from GitHub repo)
- **Port:** 8080
- **Environment:** Set all required variables in the service settings
- **Domain:** Assign custom domain via EasyPanel + Cloudflare CNAME
- **Auto-deploy:** Enabled on push to `main` branch

---

## Customization Guide

### Adding a New Channel Bot

When adding a new channel (e.g., `telegram_bot.py`), update the COPY and CMD lines:

```dockerfile
# Copy all bot files
COPY clone_engine.py .
COPY whatsapp_bot.py .
COPY telegram_bot.py .
COPY ingest_mind.py .

# Change entrypoint based on channel
CMD ["python", "telegram_bot.py", "--port", "8080"]
```

### Multi-Channel Single Container

To run multiple channels in one container, create an `entrypoint.sh`:

```bash
#!/bin/bash
# entrypoint.sh - Start the appropriate bot based on CHANNEL env var

case "${CHANNEL:-whatsapp}" in
    whatsapp)
        exec python whatsapp_bot.py --port "${PORT:-8080}"
        ;;
    telegram)
        exec python telegram_bot.py --port "${PORT:-8080}"
        ;;
    webapp)
        exec python webapp_bot.py --port "${PORT:-8080}"
        ;;
    *)
        echo "Unknown channel: $CHANNEL"
        exit 1
        ;;
esac
```

Then update the Dockerfile:

```dockerfile
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
CMD ["./entrypoint.sh"]
```

### Using Python 3.12 Instead

If your dependencies require Python 3.12, change the base image:

```dockerfile
FROM python:3.12-slim AS base
```

Note: The current `outputs/mind-clone-bot/Dockerfile` uses `python:3.12-slim`. This template defaults to `python:3.11-slim` for broader compatibility. Use whichever version matches your `requirements.txt` dependencies.

---

## Security Notes

- The container runs as `botuser` (UID 1000), not root
- No secrets are baked into the image; all credentials come from environment variables
- The `.dockerignore` excludes `.env` files from the build context
- The health check uses Python stdlib only (no extra dependencies)
- Set `LOG_LEVEL=WARNING` in production to reduce log verbosity for sensitive data

---

_Template Version: 1.0_
_Last Updated: 2026-02-14_
