---
task-id: deploy-telegram
name: Deploy Clone on Telegram via Bot API
agent: telegram-specialist
version: 1.0.0
purpose: Deploy a mind clone bot on Telegram using the official Bot API

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Mind ingested into Supabase (ingest-mind task completed)
  - Clone built and tested (build-clone task completed)
  - Telegram account for creating bot via BotFather
  - Docker and deployment platform access

inputs:
  - name: mind_slug
    type: string
    description: The slug of the mind to deploy (e.g., "naval_ravikant")
    required: true

  - name: bot_token
    type: string
    description: Telegram Bot Token from BotFather
    required: true

  - name: deploy_target
    type: enum
    description: Deployment platform
    required: false
    options: ["easypanel", "docker-local", "docker-compose"]
    default: "easypanel"

  - name: webhook_url
    type: string
    description: Public URL for Telegram webhook
    required: false
    example: "https://telegram-bot.academialendaria.ai"

  - name: allowed_users
    type: list
    description: Telegram user IDs allowed to interact (empty = open to all)
    required: false
    default: []

outputs:
  - path: "outputs/mind-clone-bot/telegram_bot.py"
    description: Telegram bot implementation file
    format: python

  - path: "Telegram bot"
    description: Running bot accessible via Telegram
    format: service

  - path: "stdout"
    description: Deployment summary with bot link
    format: text

dependencies:
  agents:
    - telegram-specialist
    - deploy-engineer
  tools:
    - telegram bot api
    - docker
    - easypanel
  files:
    - outputs/mind-clone-bot/clone_engine.py
    - outputs/mind-clone-bot/telegram_bot.py (created by this task)

validation:
  success-criteria:
    - "Bot created via BotFather with name and description"
    - "telegram_bot.py created with webhook handler"
    - "Container deployed and running"
    - "Webhook set and verified by Telegram API"
    - "E2E test: send /start, receive welcome message"

  warning-conditions:
    - "Webhook SSL certificate warnings"
    - "Response latency > 3 seconds"

  failure-conditions:
    - "Invalid bot token"
    - "Webhook URL unreachable from Telegram servers"
    - "Container crashes on startup"
    - "Bot does not respond to /start command"

estimated-duration: "10-20 minutes"
---

# Deploy Telegram Task

## Purpose

Deploy a mind clone as a Telegram bot using the official Bot API. This task guides through
bot creation via BotFather, creates the telegram_bot.py implementation, deploys the
container, configures the webhook, and runs end-to-end tests.

**Pipeline position:** After build-clone, alternative to deploy-whatsapp.
**Gateway pattern:** Thin Telegram adapter calling the shared clone_engine.py.

## When to Use This Task

**Use this task when:**
- Deploying a mind clone to Telegram channel
- Adding Telegram as a second channel alongside WhatsApp
- User invokes `/CloneDeploy:tasks:deploy-telegram`

**Do NOT use this task when:**
- Mind is not yet ingested (run ingest-mind first)
- Clone is not yet built (run build-clone first)
- Deploying to WhatsApp (use deploy-whatsapp)

## Architecture

```
[Telegram User]
      |
      v
[Telegram Cloud]
      |
      | POST /webhook (Update JSON)
      v
[EasyPanel / Docker]
      |
      | Flask app (telegram_bot.py)
      v
[clone_engine.py]  <-- Same engine as WhatsApp
      |
      +-- Supabase (mind + chunks)
      +-- OpenAI (embeddings)
      +-- Anthropic (Claude LLM)
      |
      v
[Telegram Cloud]
      |
      | POST sendMessage API
      v
[Telegram User]
```

## Key Activities & Instructions

### Step 1: Create Bot via BotFather

Open Telegram and start a chat with [@BotFather](https://t.me/BotFather):

```
/newbot

BotFather: Alright, a new bot. How are we going to call it?
You: Naval Ravikant Clone

BotFather: Good. Now let's choose a username.
You: naval_clone_bot

BotFather: Done! Your new bot is created.
Token: 7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

/setdescription
You: @naval_clone_bot
You: A cognitive clone of Naval Ravikant. Ask me anything about
     wealth, happiness, philosophy, or startups.

/setabouttext
You: @naval_clone_bot
You: AI clone powered by MMOS Mind Mapper.

/setuserpic
You: [Upload avatar image]
```

**Save the bot token** - it will be used as the `TELEGRAM_BOT_TOKEN` env var.

### Step 2: Create telegram_bot.py

```python
#!/usr/bin/env python3
"""
telegram_bot.py - Telegram bot for MMOS Mind Clones via Bot API.

Receives messages via webhook, processes through the RAG clone engine,
and sends responses back through Telegram Bot API.

Usage:
    python telegram_bot.py
    python telegram_bot.py --port 8081 --mind naval_ravikant
"""

import os
import json
import logging
import argparse
from datetime import datetime

import httpx
from flask import Flask, request, jsonify
from dotenv import load_dotenv

from clone_engine import chat_with_clone

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
DEFAULT_MIND_SLUG = os.getenv("DEFAULT_MIND_SLUG", "naval_ravikant")
ALLOWED_USERS = os.getenv("ALLOWED_USERS", "")  # Comma-separated user IDs
TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

MAX_HISTORY_PER_USER = 20
MAX_MESSAGE_LENGTH = 4096  # Telegram limit

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("telegram-clone-bot")

# ---------------------------------------------------------------------------
# In-memory conversation store
# ---------------------------------------------------------------------------

conversations: dict[int, list[dict]] = {}  # keyed by Telegram user_id


def get_history(user_id: int) -> list[dict]:
    return conversations.get(user_id, [])


def add_to_history(user_id: int, role: str, content: str) -> None:
    if user_id not in conversations:
        conversations[user_id] = []
    conversations[user_id].append({"role": role, "content": content})
    if len(conversations[user_id]) > MAX_HISTORY_PER_USER:
        conversations[user_id] = conversations[user_id][-MAX_HISTORY_PER_USER:]


def clear_history(user_id: int) -> None:
    conversations.pop(user_id, None)


# ---------------------------------------------------------------------------
# Telegram API helpers
# ---------------------------------------------------------------------------


def send_telegram_message(chat_id: int, text: str) -> bool:
    """Send a message via Telegram Bot API."""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set.")
        return False

    # Split long messages
    chunks = [text[i:i+MAX_MESSAGE_LENGTH] for i in range(0, len(text), MAX_MESSAGE_LENGTH)]

    for chunk in chunks:
        try:
            resp = httpx.post(
                f"{TELEGRAM_API}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": chunk,
                    "parse_mode": "Markdown",
                },
                timeout=30,
            )
            if resp.status_code != 200:
                # Retry without Markdown if parsing fails
                resp = httpx.post(
                    f"{TELEGRAM_API}/sendMessage",
                    json={"chat_id": chat_id, "text": chunk},
                    timeout=30,
                )
            logger.info(f"Message sent to {chat_id} ({len(chunk)} chars)")
        except Exception as e:
            logger.error(f"Failed to send to {chat_id}: {e}")
            return False

    return True


def send_typing_action(chat_id: int) -> None:
    """Send typing indicator."""
    try:
        httpx.post(
            f"{TELEGRAM_API}/sendChatAction",
            json={"chat_id": chat_id, "action": "typing"},
            timeout=5,
        )
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Message processing
# ---------------------------------------------------------------------------

COMMANDS = {
    "/start": "welcome",
    "/reset": "reset",
    "/help": "help",
    "/info": "info",
}


def process_update(update: dict, mind_slug: str) -> None:
    """Process a Telegram update (incoming message)."""
    message = update.get("message", {})
    if not message:
        return

    chat_id = message.get("chat", {}).get("id")
    user_id = message.get("from", {}).get("id")
    text = message.get("text", "").strip()
    username = message.get("from", {}).get("username", "unknown")

    if not chat_id or not text:
        return

    # Check allowed users (if configured)
    if ALLOWED_USERS:
        allowed = [int(uid.strip()) for uid in ALLOWED_USERS.split(",") if uid.strip()]
        if allowed and user_id not in allowed:
            send_telegram_message(chat_id, "Desculpe, este bot e privado.")
            return

    logger.info(f"Message from @{username} (id:{user_id}): {text[:100]}")

    # Handle commands
    if text.startswith("/"):
        cmd = text.split()[0].lower()
        if cmd == "/start":
            clear_history(user_id)
            welcome = (
                f"Ola! Eu sou um clone cognitivo alimentado por MMOS.\n\n"
                f"Mind: {mind_slug.replace('_', ' ').title()}\n\n"
                f"Me pergunte qualquer coisa! Use /reset para limpar o historico."
            )
            send_telegram_message(chat_id, welcome)
            return
        elif cmd in ("/reset", "/clear"):
            clear_history(user_id)
            send_telegram_message(chat_id, "Historico limpo. Como posso ajudar?")
            return
        elif cmd == "/help":
            help_text = (
                "Comandos disponiveis:\n"
                "/start - Iniciar conversa\n"
                "/reset - Limpar historico\n"
                "/help - Mostrar ajuda\n"
                "/info - Info do bot\n\n"
                "Ou simplesmente envie uma mensagem!"
            )
            send_telegram_message(chat_id, help_text)
            return
        elif cmd == "/info":
            info = f"Mind: {mind_slug}\nConversas ativas: {len(conversations)}"
            send_telegram_message(chat_id, info)
            return

    # Send typing indicator
    send_typing_action(chat_id)

    # Process with clone engine
    history = get_history(user_id)

    try:
        result = chat_with_clone(
            mind_slug=mind_slug,
            user_message=text,
            conversation_history=history,
        )
        answer = result["answer"]
    except ValueError as e:
        logger.error(f"Mind error: {e}")
        answer = f"Erro: Mind '{mind_slug}' nao encontrada."
    except Exception as e:
        logger.error(f"Clone engine error: {e}")
        answer = "Desculpe, ocorreu um erro. Tente novamente."

    # Update history
    add_to_history(user_id, "user", text)
    add_to_history(user_id, "assistant", answer)

    # Send response
    send_telegram_message(chat_id, answer)


# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------

app = Flask(__name__)
app.config["MIND_SLUG"] = DEFAULT_MIND_SLUG


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "channel": "telegram",
        "mind": app.config["MIND_SLUG"],
        "active_conversations": len(conversations),
        "timestamp": datetime.utcnow().isoformat(),
    })


@app.route("/webhook", methods=["POST"])
def webhook():
    try:
        update = request.get_json(force=True, silent=True)
        if not update:
            return jsonify({"status": "ignored"}), 200

        mind_slug = app.config["MIND_SLUG"]
        process_update(update, mind_slug)

        return jsonify({"status": "ok"}), 200
    except Exception as e:
        logger.error(f"Webhook error: {e}", exc_info=True)
        return jsonify({"status": "error"}), 500


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MMOS Telegram Clone Bot")
    parser.add_argument("--port", type=int, default=8081)
    parser.add_argument("--mind", type=str, default=None)
    args = parser.parse_args()

    if args.mind:
        app.config["MIND_SLUG"] = args.mind

    mind = app.config["MIND_SLUG"]

    print(f"\n{'='*60}")
    print(f"  MMOS Telegram Clone Bot")
    print(f"  Mind: {mind}")
    print(f"  Port: {args.port}")
    print(f"{'='*60}\n")

    app.run(host="0.0.0.0", port=args.port)
```

### Step 3: Set Telegram Webhook

After deploying the container, register the webhook with Telegram:

```bash
# Set webhook
WEBHOOK_URL="https://telegram-bot.academialendaria.ai/webhook"
BOT_TOKEN="7123456789:AAHxxxxxxxxx"

curl -s "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -d "url=${WEBHOOK_URL}" \
  | jq .

# Verify webhook is set
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | jq .
```

**Expected response:**
```json
{
  "ok": true,
  "result": {
    "url": "https://telegram-bot.academialendaria.ai/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

### Step 4: Configure Environment Variables

```bash
# Telegram-specific
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxx
ALLOWED_USERS=123456789,987654321  # Optional: restrict access

# Shared with other channels
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_MIND_SLUG=naval_ravikant
CLAUDE_MODEL=claude-haiku-4-5-20251001
```

### Step 5: Deploy Container

```bash
# Update Dockerfile to include telegram_bot.py
# (Modify CMD if deploying Telegram-only)

# Build
docker build -t mind-clone-telegram .

# Run
docker run -d --name mind-clone-telegram \
  --env-file .env.telegram \
  -p 8081:8081 \
  mind-clone-telegram \
  python telegram_bot.py --port 8081
```

### Step 6: End-to-End Test

```bash
# 1. Check health
curl -s https://telegram-bot.academialendaria.ai/health | jq .

# 2. Send test message via Telegram
# Open Telegram, find your bot, send /start

# 3. Check webhook info
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | jq .
# Verify: pending_update_count = 0, last_error_message = null

# 4. Send a direct test via API
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d "chat_id=YOUR_CHAT_ID" \
  -d "text=Bot is operational!" | jq .
```

### Step 7: Display Deployment Summary

```
============================================================
  TELEGRAM DEPLOYMENT COMPLETE
============================================================

Mind: {{name}} ({{slug}})
Channel: Telegram Bot API

Bot:
  Name: {{bot_name}}
  Username: @{{bot_username}}
  Link: https://t.me/{{bot_username}}

Deployment:
  Platform: EasyPanel
  Port: 8081
  Domain: telegram-bot.academialendaria.ai

Endpoints:
  Health:  https://telegram-bot.academialendaria.ai/health
  Webhook: https://telegram-bot.academialendaria.ai/webhook

Commands:
  /start - Welcome message
  /reset - Clear history
  /help  - Show commands
  /info  - Bot information

Status: DEPLOYED AND OPERATIONAL

============================================================
```

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| Webhook 401 | Invalid bot token | Verify TELEGRAM_BOT_TOKEN |
| "Not Found" on sendMessage | Bot deleted or wrong token | Re-create bot via BotFather |
| Markdown parse error | Invalid Markdown in response | Bot auto-retries without parse_mode |
| Message too long | Response > 4096 chars | Auto-split into multiple messages |
| Webhook conflicts | Multiple webhook URLs set | Use deleteWebhook then setWebhook |

## Notes

- Telegram bots can either use polling or webhooks; this task uses webhooks
- Webhook URL MUST be HTTPS with a valid SSL certificate
- Multiple bots can share the same clone_engine.py with different mind slugs
- The ALLOWED_USERS list restricts bot access to specific Telegram user IDs
- Telegram messages support Markdown formatting natively
- For inline keyboards and rich interactions, extend telegram_bot.py

---

**Task Version:** 1.0.0
**Created:** 2026-02-14
**Agent:** telegram-specialist (Telegram Integration Expert)
