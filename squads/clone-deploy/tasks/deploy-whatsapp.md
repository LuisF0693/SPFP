---
task-id: deploy-whatsapp
name: Deploy Clone on WhatsApp via UazAPI
agent: whatsapp-specialist
version: 1.0.0
purpose: Deploy a mind clone bot on WhatsApp using UazAPI for messaging integration

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Mind ingested into Supabase (ingest-mind task completed)
  - Clone built and tested (build-clone task completed)
  - UazAPI account configured with active WhatsApp session
  - Docker and EasyPanel access for deployment
  - GitHub repository for CI/CD

inputs:
  - name: mind_slug
    type: string
    description: The slug of the mind to deploy (e.g., "naval_ravikant")
    required: true

  - name: deploy_target
    type: enum
    description: Deployment platform
    required: false
    options: ["easypanel", "docker-local", "docker-compose"]
    default: "easypanel"

  - name: port
    type: integer
    description: Port for the webhook server
    required: false
    default: 8080

  - name: uazapi_instance
    type: string
    description: UazAPI instance base URL
    required: false
    default: "https://jcarlosamorimppt.uazapi.com"

  - name: domain
    type: string
    description: Custom domain for the webhook endpoint
    required: false
    example: "clone-bot.academialendaria.ai"

outputs:
  - path: "GitHub repository"
    description: Repository with bot code, Dockerfile, and CI/CD config
    format: git

  - path: "EasyPanel service"
    description: Running Docker container on EasyPanel
    format: service

  - path: "UazAPI webhook"
    description: Configured webhook pointing to deployed bot
    format: configuration

  - path: "stdout"
    description: Deployment summary with URLs and status
    format: text

dependencies:
  agents:
    - whatsapp-specialist
    - deploy-engineer
  tools:
    - github (repository, actions)
    - docker (build, deploy)
    - easypanel (service management)
    - uazapi (webhook, messaging)
    - cloudflare (DNS, optional)
  files:
    - outputs/mind-clone-bot/whatsapp_bot.py
    - outputs/mind-clone-bot/clone_engine.py
    - outputs/mind-clone-bot/Dockerfile
    - outputs/mind-clone-bot/.dockerignore
    - outputs/mind-clone-bot/requirements.txt

validation:
  success-criteria:
    - "Docker image built successfully"
    - "Container deployed and running on EasyPanel"
    - "/health endpoint returns 200 OK"
    - "UazAPI webhook configured and verified"
    - "E2E test: send message via WhatsApp, receive response"

  warning-conditions:
    - "Domain DNS not yet propagated (using IP temporarily)"
    - "Health check latency > 2 seconds"
    - "UazAPI webhook test returned warning"

  failure-conditions:
    - "Docker build failed"
    - "Container crashes on startup"
    - "/health endpoint unreachable"
    - "UazAPI webhook configuration failed"
    - "E2E test: no response received within 30 seconds"

estimated-duration: "10-30 minutes"
---

# Deploy WhatsApp Task

## Purpose

Deploy a mind clone as a WhatsApp bot using UazAPI as the messaging gateway. This task
handles the full deployment pipeline: GitHub repository setup, Docker containerization,
EasyPanel deployment, domain configuration, UazAPI webhook setup, and end-to-end testing.

**Pipeline position:** After build-clone, final step for WhatsApp channel.
**Implementation:** `outputs/mind-clone-bot/whatsapp_bot.py`

## When to Use This Task

**Use this task when:**
- First time deploying a mind clone to WhatsApp
- Redeploying after code or configuration changes
- Setting up a new WhatsApp instance for a different mind
- User invokes `/CloneDeploy:tasks:deploy-whatsapp`

**Do NOT use this task when:**
- Mind is not yet ingested (run ingest-mind first)
- Clone is not yet built/tested (run build-clone first)
- Deploying to Telegram or Web App (use respective deploy tasks)

## Architecture Overview

```
[WhatsApp User]
      |
      v
[UazAPI Cloud]
      |
      | POST /webhook (JSON payload)
      v
[EasyPanel / Docker]
      |
      | Flask app (whatsapp_bot.py)
      v
[clone_engine.py]
      |
      +-- Supabase (mind + chunks)
      +-- OpenAI (embeddings)
      +-- Anthropic (Claude LLM)
      |
      v
[UazAPI Cloud]
      |
      | POST /send/text
      v
[WhatsApp User]
```

## Key Activities & Instructions

### Step 1: Prepare GitHub Repository

```bash
# Create or use existing repository
REPO_NAME="mind-clone-bot"
GITHUB_ORG="your-org"  # or personal account

# If new repository:
gh repo create $REPO_NAME --private --clone

# Copy bot files to repo
cp outputs/mind-clone-bot/clone_engine.py $REPO_NAME/
cp outputs/mind-clone-bot/whatsapp_bot.py $REPO_NAME/
cp outputs/mind-clone-bot/ingest_mind.py $REPO_NAME/
cp outputs/mind-clone-bot/Dockerfile $REPO_NAME/
cp outputs/mind-clone-bot/.dockerignore $REPO_NAME/
cp outputs/mind-clone-bot/requirements.txt $REPO_NAME/
```

### Step 2: Configure Dockerfile

The Dockerfile (already in `outputs/mind-clone-bot/Dockerfile`):

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY clone_engine.py .
COPY whatsapp_bot.py .
COPY ingest_mind.py .

EXPOSE 8080

CMD ["python", "whatsapp_bot.py", "--port", "8080"]
```

**.dockerignore** (at `outputs/mind-clone-bot/.dockerignore`):

```
__pycache__
*.pyc
.env
.git
.gitignore
*.md
reports/
configs/
```

### Step 3: Create EasyPanel Service

**Option A: Via EasyPanel UI**

1. Log into EasyPanel dashboard
2. Create new project (or use existing)
3. Add service > Docker > from GitHub
4. Configure:
   - Repository: `github.com/{org}/mind-clone-bot`
   - Branch: `main`
   - Dockerfile path: `./Dockerfile`
   - Port: `8080`

**Option B: Via EasyPanel API / CLI**

```bash
# EasyPanel service configuration
easypanel service create \
  --name "mind-clone-bot" \
  --image "ghcr.io/{org}/mind-clone-bot:latest" \
  --port 8080 \
  --env-file .env.production
```

### Step 4: Set Environment Variables

Configure the following environment variables in EasyPanel service settings:

```bash
# Required - Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Required - OpenAI (for embeddings)
OPENAI_API_KEY=sk-...

# Required - Anthropic (for LLM generation)
ANTHROPIC_API_KEY=sk-ant-...

# Required - UazAPI
UAZAPI_BASE_URL=https://jcarlosamorimppt.uazapi.com
UAZAPI_TOKEN=your-uazapi-token

# Required - Mind configuration
DEFAULT_MIND_SLUG=naval_ravikant

# Optional - LLM model override
CLAUDE_MODEL=claude-haiku-4-5-20251001

# Optional - Owner phone for self-chat mode
OWNER_PHONE=559281951096
```

**Security:** Never commit `.env` files to Git. Use EasyPanel's environment variable
management or GitHub Secrets for CI/CD.

### Step 5: Configure Custom Domain (Optional)

If using a custom domain via Cloudflare:

```bash
# Create CNAME record pointing to EasyPanel
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records" \
  -H "Authorization: Bearer API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "clone-bot",
    "content": "your-easypanel-domain.easypanel.host",
    "ttl": 1,
    "proxied": true
  }'
```

Then configure the domain in EasyPanel service settings.

### Step 6: Deploy and Verify

```bash
# Build and deploy (via EasyPanel auto-deploy from GitHub push)
git add . && git commit -m "deploy: initial WhatsApp bot deployment" && git push

# Or manual Docker build
docker build -t mind-clone-bot .
docker run -d --name mind-clone-bot \
  --env-file .env.production \
  -p 8080:8080 \
  mind-clone-bot

# Verify health endpoint
curl -s https://clone-bot.academialendaria.ai/health | jq .
# Expected:
# {
#   "status": "ok",
#   "mind": "naval_ravikant",
#   "active_conversations": 0,
#   "timestamp": "2026-02-14T10:30:00.000000"
# }
```

### Step 7: Configure UazAPI Webhook

**UazAPI webhook configuration** to point to the deployed bot:

```bash
# Set webhook URL in UazAPI
curl -s -X PUT "https://jcarlosamorimppt.uazapi.com/config/webhook" \
  -H "token: YOUR_UAZAPI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://clone-bot.academialendaria.ai/webhook",
    "events": ["messages"],
    "enabled": true
  }'
```

**UazAPI Webhook Payload Format** (incoming messages):

```json
{
  "EventType": "messages",
  "owner": "559281951096",
  "message": {
    "chatid": "559281951096@s.whatsapp.net",
    "text": "Hello!",
    "content": "Hello!",
    "fromMe": true,
    "type": "text"
  },
  "chat": {
    "owner": "559281951096",
    "wa_chatid": "559281951096@s.whatsapp.net"
  }
}
```

**UazAPI Send Text API Format** (outgoing messages):

```bash
# Send a text message via UazAPI
curl -s -X POST "https://jcarlosamorimppt.uazapi.com/send/text" \
  -H "token: YOUR_UAZAPI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "559281951096",
    "text": "Hello from the clone bot!"
  }'
```

**Key UazAPI details:**
- Authentication: Via `token` header (not Bearer auth)
- Send endpoint: `POST /send/text` with `number` and `text` fields
- Webhook receives: `EventType`, `message.text`, `message.chatid`, `message.fromMe`
- Phone format: digits only, no `+` prefix (e.g., `559281951096`)
- Chat ID format: `{phone}@s.whatsapp.net` for personal chats

### Step 8: End-to-End Test

```python
import httpx
import time

def e2e_test(
    uazapi_url: str,
    uazapi_token: str,
    phone: str,
    bot_health_url: str,
) -> dict:
    """Run end-to-end WhatsApp bot test."""

    results = {
        "health_check": False,
        "message_sent": False,
        "response_received": False,
    }

    # 1. Health check
    try:
        resp = httpx.get(bot_health_url, timeout=10)
        results["health_check"] = resp.status_code == 200
        health_data = resp.json()
        print(f"  Health: {health_data['status']} (mind: {health_data['mind']})")
    except Exception as e:
        print(f"  Health check FAILED: {e}")
        return results

    # 2. Send test message
    try:
        resp = httpx.post(
            f"{uazapi_url}/send/text",
            headers={"token": uazapi_token, "Content-Type": "application/json"},
            json={"number": phone, "text": "Ola, quem e voce?"},
            timeout=30,
        )
        results["message_sent"] = resp.status_code == 200
        print(f"  Message sent: {resp.status_code}")
    except Exception as e:
        print(f"  Send message FAILED: {e}")
        return results

    # 3. Wait for processing and check conversations
    print("  Waiting 10s for bot to process...")
    time.sleep(10)

    try:
        resp = httpx.get(bot_health_url, timeout=10)
        health_data = resp.json()
        if health_data.get("active_conversations", 0) > 0:
            results["response_received"] = True
            print(f"  Active conversations: {health_data['active_conversations']}")
    except Exception:
        pass

    return results
```

### Step 9: Display Deployment Summary

```
============================================================
  WHATSAPP DEPLOYMENT COMPLETE
============================================================

Mind: {{name}} ({{slug}})
Channel: WhatsApp via UazAPI

Deployment:
  Platform: EasyPanel
  Image: ghcr.io/{{org}}/mind-clone-bot:latest
  Port: 8080
  Domain: clone-bot.academialendaria.ai

Endpoints:
  Health:  https://clone-bot.academialendaria.ai/health
  Webhook: https://clone-bot.academialendaria.ai/webhook
  Debug:   https://clone-bot.academialendaria.ai/debug

UazAPI:
  Instance: https://jcarlosamorimppt.uazapi.com
  Webhook: Configured and active
  Events: messages

E2E Test:
  Health check:     PASS
  Message sent:     PASS
  Response received: PASS

Status: DEPLOYED AND OPERATIONAL

Next Steps:
  -> Send a message on WhatsApp to test the bot
  -> Monitor health: curl https://clone-bot.academialendaria.ai/health
  -> View logs: EasyPanel dashboard > mind-clone-bot > Logs
  -> Run fidelity test: /CloneDeploy:tasks:test-fidelity

============================================================
```

## Troubleshooting

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| Container keeps restarting | Check logs in EasyPanel | Missing env vars or import errors |
| /health returns 502 | Container not ready | Wait for startup, check port mapping |
| Webhook not receiving | UazAPI misconfigured | Verify webhook URL in UazAPI settings |
| Bot not responding | fromMe filter blocking | Check OWNER_PHONE matches chat window |
| Slow responses | LLM latency or large prompts | Reduce max_context_chunks, use Haiku model |
| UazAPI 401 | Invalid token | Verify UAZAPI_TOKEN in env vars |
| Supabase connection error | Wrong credentials or network | Check SUPABASE_URL and service key |

## Rollback Procedure

If deployment fails or causes issues:

```bash
# 1. Stop the container
# Via EasyPanel: Service > Stop

# 2. Disable webhook in UazAPI
curl -s -X PUT "https://jcarlosamorimppt.uazapi.com/config/webhook" \
  -H "token: YOUR_UAZAPI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# 3. Revert to previous version
git revert HEAD && git push

# 4. Redeploy previous version
# EasyPanel auto-deploys on push
```

## Notes

- The bot currently operates in "self-chat" mode: only responds to the owner's messages
  sent in their own chat window (fromMe: true + phone == OWNER_PHONE)
- To open the bot to other users, modify the filtering logic in whatsapp_bot.py
- Conversation history is stored in-memory (resets on container restart)
- For persistent history, integrate with Supabase conversations table (future)
- Maximum WhatsApp message length is ~65,000 chars, but aim for < 4,000 for readability
- UazAPI rate limits: check your plan limits for messages/day

---

**Task Version:** 1.0.0
**Created:** 2026-02-14
**Agent:** whatsapp-specialist (WhatsApp Integration Expert)
