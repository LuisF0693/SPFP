---
task-id: deploy-webapp
name: Deploy Clone as REST API with Chat Interface
agent: webapp-specialist
version: 1.0.0
purpose: Deploy a mind clone as a REST API with an embeddable chat widget

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Mind ingested into Supabase (ingest-mind task completed)
  - Clone built and tested (build-clone task completed)
  - Docker and deployment platform access

inputs:
  - name: mind_slug
    type: string
    description: The slug of the mind to deploy (e.g., "naval_ravikant")
    required: true

  - name: deploy_target
    type: enum
    description: Deployment platform
    required: false
    options: ["easypanel", "vercel", "docker-local"]
    default: "easypanel"

  - name: cors_origins
    type: list
    description: Allowed CORS origins for the API
    required: false
    default: ["*"]

  - name: api_key
    type: string
    description: Optional API key to protect the /chat endpoint
    required: false

  - name: enable_widget
    type: boolean
    description: Whether to serve the embeddable chat widget
    required: false
    default: true

outputs:
  - path: "outputs/mind-clone-bot/webapp_bot.py"
    description: FastAPI REST API implementation
    format: python

  - path: "outputs/mind-clone-bot/static/chat-widget.html"
    description: Embeddable chat widget HTML
    format: html

  - path: "REST API"
    description: Running API accessible via HTTP
    format: service

  - path: "stdout"
    description: Deployment summary with API docs URL
    format: text

dependencies:
  agents:
    - webapp-specialist
    - deploy-engineer
  tools:
    - docker
    - easypanel or vercel
  files:
    - outputs/mind-clone-bot/clone_engine.py
    - outputs/mind-clone-bot/webapp_bot.py (created by this task)

validation:
  success-criteria:
    - "FastAPI app created with /chat, /health, and /docs endpoints"
    - "CORS configured for specified origins"
    - "Container deployed and running"
    - "POST /chat returns valid clone response"
    - "Chat widget loads and connects to API"

  warning-conditions:
    - "CORS set to wildcard (*) in production"
    - "No API key protection on /chat endpoint"
    - "Response latency > 5 seconds"

  failure-conditions:
    - "FastAPI fails to start"
    - "Container crashes"
    - "/chat endpoint returns errors"
    - "Widget cannot connect to API"

estimated-duration: "10-20 minutes"
---

# Deploy Web App Task

## Purpose

Deploy a mind clone as a REST API with an embeddable chat widget. This creates a FastAPI
application with a `/chat` endpoint, automatic API documentation, CORS support, and an
optional HTML chat widget that can be embedded in any website.

**Pipeline position:** After build-clone, alternative to deploy-whatsapp/telegram.
**Gateway pattern:** FastAPI adapter calling the shared clone_engine.py.

## When to Use This Task

**Use this task when:**
- Deploying a mind clone as a REST API for integrations
- Creating an embeddable chat widget for websites
- Building a custom frontend that calls the clone API
- User invokes `/CloneDeploy:tasks:deploy-webapp`

**Do NOT use this task when:**
- Mind is not yet ingested (run ingest-mind first)
- Clone is not yet built (run build-clone first)
- Deploying to WhatsApp or Telegram (use respective deploy tasks)

## Architecture

```
[Browser / Client]
      |
      | POST /chat  { message, mind_slug, session_id }
      v
[FastAPI (webapp_bot.py)]
      |
      +-- /chat       - Main conversation endpoint
      +-- /health     - Health check
      +-- /docs       - Auto-generated API docs (Swagger)
      +-- /widget     - Embeddable chat widget HTML
      |
      v
[clone_engine.py]  <-- Same engine as WhatsApp/Telegram
      |
      +-- Supabase (mind + chunks)
      +-- OpenAI (embeddings)
      +-- Anthropic (Claude LLM)
      |
      v
JSON Response { answer, sources, mind_slug }
```

## Key Activities & Instructions

### Step 1: Create webapp_bot.py

```python
#!/usr/bin/env python3
"""
webapp_bot.py - REST API for MMOS Mind Clones.

Provides a /chat endpoint for conversational interaction with mind clones,
plus an embeddable chat widget.

Usage:
    uvicorn webapp_bot:app --host 0.0.0.0 --port 8082
    python webapp_bot.py --port 8082 --mind naval_ravikant
"""

import os
import uuid
import logging
import argparse
from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from clone_engine import chat_with_clone

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

load_dotenv()

DEFAULT_MIND_SLUG = os.getenv("DEFAULT_MIND_SLUG", "naval_ravikant")
API_KEY = os.getenv("WEBAPP_API_KEY", "")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
MAX_HISTORY_PER_SESSION = 20

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("webapp-clone-bot")

# ---------------------------------------------------------------------------
# Session store
# ---------------------------------------------------------------------------

sessions: dict[str, list[dict]] = {}


def get_session(session_id: str) -> list[dict]:
    return sessions.get(session_id, [])


def update_session(session_id: str, role: str, content: str) -> None:
    if session_id not in sessions:
        sessions[session_id] = []
    sessions[session_id].append({"role": role, "content": content})
    if len(sessions[session_id]) > MAX_HISTORY_PER_SESSION:
        sessions[session_id] = sessions[session_id][-MAX_HISTORY_PER_SESSION:]


# ---------------------------------------------------------------------------
# API models
# ---------------------------------------------------------------------------


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    mind_slug: str = Field(default=None)
    session_id: str = Field(default=None)


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    mind_slug: str
    session_id: str


class HealthResponse(BaseModel):
    status: str
    channel: str
    mind: str
    active_sessions: int
    timestamp: str


# ---------------------------------------------------------------------------
# Auth dependency
# ---------------------------------------------------------------------------


async def verify_api_key(x_api_key: str = Header(default=None)):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="MMOS Mind Clone API",
    description="REST API for conversational interaction with MMOS cognitive clones.",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        channel="webapp",
        mind=DEFAULT_MIND_SLUG,
        active_sessions=len(sessions),
        timestamp=datetime.utcnow().isoformat(),
    )


@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(verify_api_key)])
async def chat(req: ChatRequest):
    mind_slug = req.mind_slug or DEFAULT_MIND_SLUG
    session_id = req.session_id or str(uuid.uuid4())

    history = get_session(session_id)

    try:
        result = chat_with_clone(
            mind_slug=mind_slug,
            user_message=req.message,
            conversation_history=history,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Clone engine error: {e}")
        raise HTTPException(status_code=500, detail="Internal error")

    update_session(session_id, "user", req.message)
    update_session(session_id, "assistant", result["answer"])

    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        mind_slug=result["mind_slug"],
        session_id=session_id,
    )


@app.post("/chat/reset")
async def reset_session(session_id: str):
    sessions.pop(session_id, None)
    return {"status": "ok", "message": "Session cleared"}


@app.get("/widget", response_class=HTMLResponse)
async def widget():
    """Serve the embeddable chat widget."""
    widget_path = os.path.join(os.path.dirname(__file__), "static", "chat-widget.html")
    if os.path.exists(widget_path):
        with open(widget_path, "r") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>Widget not found</h1>", status_code=404)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    parser = argparse.ArgumentParser(description="MMOS Web App Clone Bot")
    parser.add_argument("--port", type=int, default=8082)
    parser.add_argument("--mind", type=str, default=None)
    args = parser.parse_args()

    if args.mind:
        DEFAULT_MIND_SLUG = args.mind

    print(f"\n{'='*60}")
    print(f"  MMOS Web App Clone Bot")
    print(f"  Mind: {DEFAULT_MIND_SLUG}")
    print(f"  Port: {args.port}")
    print(f"  Docs: http://0.0.0.0:{args.port}/docs")
    print(f"{'='*60}\n")

    uvicorn.run(app, host="0.0.0.0", port=args.port)
```

### Step 2: Create Chat Widget HTML

```html
<!-- outputs/mind-clone-bot/static/chat-widget.html -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clone Chat</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        #chat-container {
            max-width: 480px; height: 600px;
            margin: 20px auto; border: 1px solid #e0e0e0;
            border-radius: 12px; display: flex; flex-direction: column;
            overflow: hidden; background: #fff;
        }

        #chat-header {
            background: #1a1a2e; color: white; padding: 16px;
            text-align: center; font-weight: 600;
        }

        #chat-messages {
            flex: 1; overflow-y: auto; padding: 16px;
            display: flex; flex-direction: column; gap: 8px;
        }

        .message { max-width: 80%; padding: 10px 14px; border-radius: 12px; }
        .user { align-self: flex-end; background: #007bff; color: white; }
        .assistant { align-self: flex-start; background: #f0f0f0; color: #333; }

        #chat-input-area {
            display: flex; padding: 12px; border-top: 1px solid #e0e0e0;
        }

        #chat-input {
            flex: 1; padding: 10px; border: 1px solid #ddd;
            border-radius: 8px; outline: none; font-size: 14px;
        }

        #chat-send {
            margin-left: 8px; padding: 10px 20px;
            background: #007bff; color: white; border: none;
            border-radius: 8px; cursor: pointer; font-size: 14px;
        }

        #chat-send:disabled { background: #ccc; }
    </style>
</head>
<body>
    <div id="chat-container">
        <div id="chat-header">Clone Chat</div>
        <div id="chat-messages"></div>
        <div id="chat-input-area">
            <input id="chat-input" placeholder="Envie uma mensagem..." />
            <button id="chat-send" onclick="sendMessage()">Enviar</button>
        </div>
    </div>
    <script>
        const API_URL = window.CLONE_API_URL || window.location.origin;
        const API_KEY = window.CLONE_API_KEY || "";
        let sessionId = null;

        function addMessage(text, role) {
            const div = document.createElement("div");
            div.className = `message ${role}`;
            div.textContent = text;
            document.getElementById("chat-messages").appendChild(div);
            div.scrollIntoView({ behavior: "smooth" });
        }

        async function sendMessage() {
            const input = document.getElementById("chat-input");
            const text = input.value.trim();
            if (!text) return;

            input.value = "";
            addMessage(text, "user");
            document.getElementById("chat-send").disabled = true;

            try {
                const headers = { "Content-Type": "application/json" };
                if (API_KEY) headers["x-api-key"] = API_KEY;

                const resp = await fetch(`${API_URL}/chat`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        message: text,
                        session_id: sessionId,
                    }),
                });

                const data = await resp.json();
                sessionId = data.session_id;
                addMessage(data.answer, "assistant");
            } catch (e) {
                addMessage("Erro ao enviar mensagem.", "assistant");
            }

            document.getElementById("chat-send").disabled = false;
            document.getElementById("chat-input").focus();
        }

        document.getElementById("chat-input").addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendMessage();
        });
    </script>
</body>
</html>
```

### Step 3: Configure CORS

```python
# For development:
CORS_ORIGINS = ["*"]

# For production:
CORS_ORIGINS = [
    "https://academialendaria.ai",
    "https://www.academialendaria.ai",
    "https://clone.academialendaria.ai",
]
```

### Step 4: Deploy Container

```bash
# Update Dockerfile for webapp
# Add uvicorn to requirements.txt:
# fastapi>=0.100.0
# uvicorn>=0.23.0

# Build
docker build -t mind-clone-webapp .

# Run
docker run -d --name mind-clone-webapp \
  --env-file .env.webapp \
  -p 8082:8082 \
  mind-clone-webapp \
  uvicorn webapp_bot:app --host 0.0.0.0 --port 8082
```

### Step 5: Test API Endpoints

```bash
# Health check
curl -s https://clone-api.academialendaria.ai/health | jq .

# Chat (no auth)
curl -s -X POST https://clone-api.academialendaria.ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quem e voce?"}' | jq .

# Chat (with API key)
curl -s -X POST https://clone-api.academialendaria.ai/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"message": "Qual sua filosofia?", "mind_slug": "naval_ravikant"}' | jq .

# API docs (Swagger UI)
open https://clone-api.academialendaria.ai/docs

# Chat widget
open https://clone-api.academialendaria.ai/widget
```

### Step 6: Embed Widget in External Site

```html
<!-- Embed in any website -->
<iframe
  src="https://clone-api.academialendaria.ai/widget"
  width="480"
  height="600"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
></iframe>

<!-- Or use the API directly with custom UI -->
<script>
  window.CLONE_API_URL = "https://clone-api.academialendaria.ai";
  window.CLONE_API_KEY = "your-api-key";
</script>
<script src="https://clone-api.academialendaria.ai/static/chat-widget.js"></script>
```

### Step 7: Display Deployment Summary

```
============================================================
  WEB APP DEPLOYMENT COMPLETE
============================================================

Mind: {{name}} ({{slug}})
Channel: REST API + Chat Widget

Deployment:
  Platform: EasyPanel
  Port: 8082
  Domain: clone-api.academialendaria.ai

Endpoints:
  Health:  https://clone-api.academialendaria.ai/health
  Chat:    POST https://clone-api.academialendaria.ai/chat
  Docs:    https://clone-api.academialendaria.ai/docs
  Widget:  https://clone-api.academialendaria.ai/widget

API Usage:
  POST /chat
  Body: { "message": "...", "mind_slug": "...", "session_id": "..." }
  Response: { "answer": "...", "sources": [...], "session_id": "..." }

Security:
  CORS: {{origins}}
  API Key: {{configured|not configured}}

Status: DEPLOYED AND OPERATIONAL

============================================================
```

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| CORS blocked | Origin not in allowed list | Add origin to CORS_ORIGINS |
| 401 Unauthorized | Missing or invalid API key | Check x-api-key header |
| 404 Mind not found | Slug not in Supabase | Verify mind_slug, run ingest-mind |
| 422 Validation error | Missing required fields | Check request body format |
| Widget blank | Static files not served | Check file path, mount static dir |

## Notes

- FastAPI auto-generates OpenAPI docs at /docs (Swagger) and /redoc
- Sessions are in-memory; restart clears all history (use Supabase for persistence)
- The chat widget is a standalone HTML file, embeddable via iframe
- For production, add rate limiting (slowapi) and request validation
- Consider adding WebSocket support for streaming responses (future)
- The API can serve multiple minds by passing different mind_slug values

---

**Task Version:** 1.0.0
**Created:** 2026-02-14
**Agent:** webapp-specialist (Web App Integration Expert)
