# Workflow: Deploy Multi-Channel

**Workflow ID:** deploy-multi-channel
**Version:** 1.0.0
**Purpose:** Deploy an existing, validated clone to multiple communication channels simultaneously
**Duration:** 30-60 minutes
**Agents Involved:** 5 (clone-deploy-chief, deploy-engineer, whatsapp-specialist, telegram-specialist, webapp-specialist)
**Phases:** 3
**Quality Gates:** 3
**Trigger:** `/CloneDeploy:workflows:deploy-multi-channel` or `@clone-deploy-chief *multi-deploy {mind_slug}`

---

## Overview

This workflow handles deployment of an already-built clone to multiple channels. Unlike the full pipeline, it assumes the clone has already passed diagnosis (Phase 1), ingestion (Phase 2), and build (Phase 3) from the `full-pipeline` workflow. Use this when:

- Adding new channels to an existing clone
- Re-deploying after infrastructure changes
- Migrating a clone to new hosting
- Scaling an existing clone to additional channels

**Pre-requisite:** Clone engine and config must already exist. If not, use `full-pipeline` workflow instead.

---

## Flow Diagram

```
PHASE 1: CONFIGURE
━━━━━━━━━━━━━━━━━
@clone-deploy-chief
        │
        ▼
  Validate clone exists
  Select target channels
  Collect channel credentials
  Generate deploy manifest
        │
        ▼
  QG-001: Configuration Valid
        │
        │  PASS
        ▼
PHASE 2: DEPLOY (Parallel)
━━━━━━━━━━━━━━━━━━━━━━━━━
@deploy-engineer
        │
        ├──────────────────┬──────────────────┐
        ▼                  ▼                  ▼
  WhatsApp            Telegram           Web App
  @whatsapp-spec      @telegram-spec     @webapp-spec
        │                  │                  │
        ▼                  ▼                  ▼
  Deploy + Verify     Deploy + Verify    Deploy + Verify
        │                  │                  │
        └──────────────────┴──────────────────┘
        │
        ▼
  QG-002: All Channels Healthy
        │
        │  PASS
        ▼
PHASE 3: VALIDATE
━━━━━━━━━━━━━━━━━
@clone-deploy-chief
        │
        ▼
  Health check all channels
  E2E test each channel
  Cross-channel consistency check
  Generate deployment report
        │
        ▼
  QG-003: Production Ready
        │
        ▼
  ALL CHANNELS LIVE
```

---

## Phase 1: CONFIGURE

**Agent:** clone-deploy-chief
**Duration:** 10-15 minutes
**Purpose:** Validate clone readiness, select channels, prepare deployment configuration

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| `mind_slug` | User provides | Yes |
| Clone engine | `outputs/mind-clone-bot/clone_engine.py` | Yes |
| Clone config | `outputs/mind-clone-bot/clone-config.yaml` | Yes |
| System prompt | `outputs/mind-clone-bot/clone-system-prompt.md` | Yes |
| Channel selection | User selects (WhatsApp, Telegram, Web, or All) | Yes |

### Steps

1. **Validate clone exists and is built:**
   - Check `outputs/mind-clone-bot/clone_engine.py` exists
   - Check `outputs/mind-clone-bot/clone-config.yaml` exists
   - Check `outputs/mind-clone-bot/clone-system-prompt.md` exists
   - Verify Supabase table `mind_chunks_{slug}` has data
   - Run quick health check on RAG (1 test query)
   - If any check fails: STOP, redirect to `full-pipeline` workflow

2. **Present channel selection:**
   ```
   Available channels for deployment:

   1. WhatsApp (via UazAPI)
      Requirements: UazAPI instance URL, API token, connected phone number
      Status: {READY | MISSING_CREDENTIALS | ALREADY_DEPLOYED}

   2. Telegram (via Bot API)
      Requirements: Bot token from @BotFather
      Status: {READY | MISSING_CREDENTIALS | ALREADY_DEPLOYED}

   3. Web App (REST API + Chat Widget)
      Requirements: Domain name, SSL certificate
      Status: {READY | MISSING_CREDENTIALS | ALREADY_DEPLOYED}

   4. All available channels

   Select channels (comma-separated numbers): ___
   ```

3. **Collect and validate credentials per channel:**

   **WhatsApp credentials:**
   | Credential | Env Var | Validation |
   |-----------|---------|------------|
   | UazAPI URL | `UAZAPI_URL` | HTTP GET returns 200 |
   | UazAPI Token | `UAZAPI_TOKEN` | Auth test succeeds |
   | Phone Number | `UAZAPI_PHONE` | Phone connected check |

   **Telegram credentials:**
   | Credential | Env Var | Validation |
   |-----------|---------|------------|
   | Bot Token | `TELEGRAM_BOT_TOKEN` | `getMe` API returns bot info |
   | Webhook Secret | `TELEGRAM_WEBHOOK_SECRET` | Generated if not provided |

   **Web App credentials:**
   | Credential | Env Var | Validation |
   |-----------|---------|------------|
   | Domain | `WEBAPP_DOMAIN` | DNS resolves |
   | API Key | `WEBAPP_API_KEY` | Generated if not provided |
   | CORS Origins | `WEBAPP_CORS_ORIGINS` | Valid URL format |

4. **Check for existing deployments:**
   - Query EasyPanel for existing services matching `clone-{slug}-*`
   - If channel already deployed:
     ```
     WARNING: {channel} is already deployed for this clone.
     Options:
     1. Update existing deployment (preserves conversations)
     2. Replace deployment (clean start)
     3. Skip this channel
     ```

5. **Generate deployment manifest:**
   ```yaml
   # deploy-manifest.yaml
   deployment:
     mind_slug: "{slug}"
     timestamp: "{iso_datetime}"
     deployer: "{user}"

   channels:
     whatsapp:
       enabled: true|false
       service_name: "clone-{slug}-whatsapp"
       port: 8080
       webhook_path: "/webhook/uazapi"
       env_vars:
         UAZAPI_URL: "{value}"
         UAZAPI_TOKEN: "{value}"

     telegram:
       enabled: true|false
       service_name: "clone-{slug}-telegram"
       port: 8081
       webhook_path: "/webhook/telegram"
       env_vars:
         TELEGRAM_BOT_TOKEN: "{value}"

     webapp:
       enabled: true|false
       service_name: "clone-{slug}-webapp"
       port: 8082
       api_path: "/api"
       env_vars:
         WEBAPP_DOMAIN: "{value}"
         WEBAPP_API_KEY: "{value}"

   shared_env:
     SUPABASE_URL: "{value}"
     SUPABASE_KEY: "{value}"
     ANTHROPIC_API_KEY: "{value}"
     MIND_SLUG: "{slug}"
     LOG_LEVEL: "info"

   docker:
     image: "clone-{slug}:latest"
     restart_policy: "always"
     health_check:
       path: "/health"
       interval: 30
       timeout: 10
       retries: 3
   ```

### Quality Gate QG-001: Configuration Valid

```yaml
gate: QG-001
name: "Deployment Configuration Valid"
type: blocking
criteria:
  - clone_engine_exists: true
  - clone_config_exists: true
  - system_prompt_exists: true
  - rag_table_has_data: true
  - at_least_one_channel_selected: true
  - all_selected_credentials_valid: true
  - deploy_manifest_generated: true
pass_action: "Proceed to Phase 2 (Deploy)"
fail_action: "Report missing requirements, ask user to provide"
```

### Checkpoint

Before proceeding to Phase 2:
- [ ] Clone engine, config, and system prompt verified
- [ ] RAG pipeline confirmed operational (1 test query passed)
- [ ] At least one channel selected
- [ ] All credentials for selected channels validated
- [ ] Existing deployments checked and conflicts resolved
- [ ] Deployment manifest generated and saved

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| Deploy manifest | `outputs/mind-clone-bot/deploy-manifest.yaml` | Full deployment configuration |
| Credential validation log | Console output | Pass/fail for each credential |

---

## Phase 2: DEPLOY

**Agent:** deploy-engineer + channel specialists
**Duration:** 15-30 minutes (channels deploy in parallel)
**Purpose:** Deploy the clone to all selected channels simultaneously

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| Deploy manifest | Phase 1 output | Yes |
| Docker image | Built from clone engine | Yes |
| EasyPanel access | Infrastructure credentials | Yes |

### Step 2.0: Build Docker Image

**Agent:** deploy-engineer

1. **Build unified Docker image:**
   ```bash
   cd outputs/mind-clone-bot/
   docker build -t clone-{slug}:latest .
   ```

2. **Verify image:**
   ```bash
   docker run --rm clone-{slug}:latest python -c "import clone_engine; print('OK')"
   ```

3. **Push to registry (if using remote EasyPanel):**
   ```bash
   docker tag clone-{slug}:latest {registry}/clone-{slug}:latest
   docker push {registry}/clone-{slug}:latest
   ```

### Step 2.1: Deploy WhatsApp (if selected)

**Agent:** whatsapp-specialist

1. **Create/update EasyPanel service:**
   - Service name: `clone-{slug}-whatsapp`
   - Image: `clone-{slug}:latest`
   - Port: 8080
   - Environment variables from manifest
   - Health check: `GET /health` every 30s

2. **Configure UazAPI webhook:**
   ```bash
   curl -X POST "{UAZAPI_URL}/webhook/set" \
     -H "Authorization: Bearer {UAZAPI_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://{domain}/webhook/uazapi",
       "events": ["messages.upsert"],
       "enabled": true
     }'
   ```

3. **Send test message:**
   - Send "ping" via UazAPI to the bot's number
   - Verify response received within 10 seconds
   - Verify response content matches expected greeting

4. **Record deployment result:**
   ```yaml
   whatsapp:
     status: "DEPLOYED" | "FAILED"
     service_url: "https://{domain}"
     webhook_url: "https://{domain}/webhook/uazapi"
     test_result: "PASS" | "FAIL"
     deploy_time: "{seconds}"
     error: "{if_failed}"
   ```

### Step 2.2: Deploy Telegram (if selected)

**Agent:** telegram-specialist

1. **Create/update EasyPanel service:**
   - Service name: `clone-{slug}-telegram`
   - Image: `clone-{slug}:latest`
   - Port: 8081
   - Command override: `python telegram_bot.py`
   - Environment variables from manifest
   - Health check: `GET /health` every 30s

2. **Set Telegram webhook:**
   ```bash
   curl -X POST "https://api.telegram.org/bot{TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://{domain}/webhook/telegram",
       "secret_token": "{WEBHOOK_SECRET}",
       "allowed_updates": ["message", "callback_query"]
     }'
   ```

3. **Verify webhook:**
   ```bash
   curl "https://api.telegram.org/bot{TOKEN}/getWebhookInfo"
   # Verify: url matches, no pending_update_count errors
   ```

4. **Send test message:**
   - Send `/start` command to bot
   - Verify greeting response received
   - Send test question, verify coherent response

5. **Record deployment result:**
   ```yaml
   telegram:
     status: "DEPLOYED" | "FAILED"
     bot_username: "@{bot_username}"
     webhook_url: "https://{domain}/webhook/telegram"
     test_result: "PASS" | "FAIL"
     deploy_time: "{seconds}"
     error: "{if_failed}"
   ```

### Step 2.3: Deploy Web App (if selected)

**Agent:** webapp-specialist

1. **Create/update EasyPanel service:**
   - Service name: `clone-{slug}-webapp`
   - Image: `clone-{slug}:latest`
   - Port: 8082
   - Command override: `python webapp.py`
   - Environment variables from manifest
   - Domain: `{WEBAPP_DOMAIN}`
   - SSL: Auto (Let's Encrypt)
   - Health check: `GET /health` every 30s

2. **Configure API endpoints:**
   - `POST /api/chat` - Chat endpoint
   - `GET /api/health` - Health check
   - `GET /api/info` - Clone metadata (name, description, avatar)
   - CORS configured for allowed origins

3. **Test API:**
   ```bash
   # Health check
   curl -s "https://{domain}/api/health" | jq .

   # Chat test
   curl -s -X POST "https://{domain}/api/chat" \
     -H "Content-Type: application/json" \
     -H "X-API-Key: {API_KEY}" \
     -d '{"message": "Hello, who are you?"}' | jq .
   ```

4. **Deploy chat widget (if configured):**
   - Generate embed snippet:
     ```html
     <script src="https://{domain}/widget.js"
       data-clone="{slug}"
       data-theme="light"
       data-position="bottom-right">
     </script>
     ```
   - Test widget renders correctly

5. **Record deployment result:**
   ```yaml
   webapp:
     status: "DEPLOYED" | "FAILED"
     api_url: "https://{domain}/api"
     widget_url: "https://{domain}/widget.js"
     test_result: "PASS" | "FAIL"
     deploy_time: "{seconds}"
     error: "{if_failed}"
   ```

### Step 2.4: Aggregate Results

**Agent:** deploy-engineer

1. **Collect results from all channel specialists**
2. **Determine overall deployment status:**
   - ALL channels passed: FULL SUCCESS
   - Some channels passed: PARTIAL SUCCESS (proceed with warning)
   - NO channels passed: FAILURE (block)

### Quality Gate QG-002: All Channels Healthy

```yaml
gate: QG-002
name: "Channel Deployment Health"
type: blocking
criteria:
  - at_least_one_channel_deployed: true
  - all_deployed_channels_healthy: true
  - test_messages_responded: true
  - response_time_per_channel: "< 10s"
pass_action: "Proceed to Phase 3 (Validate)"
fail_action: "Debug failing channels, retry, or proceed with healthy channels"
partial_pass: "Proceed with warning if >= 1 channel healthy"
```

### Checkpoint

Before proceeding to Phase 3:
- [ ] Docker image built and verified
- [ ] Each selected channel deployed to EasyPanel
- [ ] Health checks passing on all deployed channels
- [ ] Test messages sent and responses verified
- [ ] Response time < 10s on all channels
- [ ] Deployment results recorded for each channel

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| Docker image | EasyPanel / registry | Deployed container image |
| Channel status | Deploy manifest (updated) | Per-channel deploy status |
| Service configs | EasyPanel | Running service configurations |

---

## Phase 3: VALIDATE

**Agent:** clone-deploy-chief
**Duration:** 10-15 minutes
**Purpose:** Comprehensive validation of all deployed channels including cross-channel consistency

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| Deployed channel endpoints | Phase 2 outputs | Yes |
| Clone config | `outputs/mind-clone-bot/clone-config.yaml` | Yes |
| Identity core | `outputs/minds/{slug}/analysis/identity-core.yaml` | Yes |

### Step 3.1: Health Check All Channels

**Agent:** clone-deploy-chief

1. **Ping each deployed channel:**
   | Channel | Health Check | Expected |
   |---------|-------------|----------|
   | WhatsApp | `GET {service_url}/health` | `{"status": "ok", "channel": "whatsapp"}` |
   | Telegram | `GET {service_url}/health` | `{"status": "ok", "channel": "telegram"}` |
   | Web App | `GET {api_url}/health` | `{"status": "ok", "channel": "webapp"}` |

2. **Check response times:**
   - Run 5 pings per channel
   - Calculate average and p95 latency
   - Flag if avg > 5s or p95 > 10s

3. **Verify container logs:**
   - Check for ERROR level logs in last 5 minutes
   - Check for repeated WARNING patterns
   - Verify no unhandled exceptions

### Step 3.2: End-to-End Test Each Channel

**Agent:** clone-deploy-chief

1. **Prepare 5 E2E test messages:**
   | # | Message | Tests |
   |---|---------|-------|
   | 1 | "Hello" | Greeting response, persona voice |
   | 2 | "{domain_question}" | RAG retrieval, knowledge accuracy |
   | 3 | "{framework_question}" | Framework reference, teaching style |
   | 4 | "What's the weather like?" | Off-topic handling, boundary respect |
   | 5 | "Thanks, goodbye" | Conversation closure, warmth |

2. **Send each message to each deployed channel**

3. **Score each response:**
   - Response received: yes/no
   - Response time: seconds
   - Persona match: 1-10
   - Content quality: 1-10

4. **Calculate E2E score per channel:**
   ```
   e2e_score = avg(persona_match, content_quality)
   ```

### Step 3.3: Cross-Channel Consistency Check

**Agent:** clone-deploy-chief

1. **Compare responses across channels for the same questions:**
   - Same persona voice across channels?
   - Similar knowledge depth?
   - Consistent framework references?
   - Appropriate channel-specific adaptations? (e.g., shorter on WhatsApp)

2. **Score consistency (1-10):**
   - 10: Identical persona across all channels
   - 7-9: Minor variations, same core persona
   - 4-6: Noticeable differences in tone or knowledge
   - 1-3: Inconsistent persona (requires investigation)

3. **Flag inconsistencies:**
   - If consistency < 7: generate detailed comparison report
   - If consistency < 5: BLOCK deployment, investigate config differences

### Step 3.4: Generate Deployment Report

**Agent:** clone-deploy-chief

1. **Compile full deployment report:**
   ```markdown
   # Multi-Channel Deployment Report
   ## Clone: {mind_slug}
   ## Date: {date}

   ### Summary
   - Channels Deployed: {count}/{total_selected}
   - Overall Status: {LIVE | PARTIAL | FAILED}
   - Avg Response Time: {ms}
   - Cross-Channel Consistency: {score}/10

   ### Channel Details

   #### WhatsApp
   - Status: {LIVE | FAILED | SKIPPED}
   - Service: {service_name}
   - URL: {service_url}
   - Avg Response Time: {ms}
   - E2E Score: {score}/10
   - Test Results: {pass_count}/{total_tests}

   #### Telegram
   - Status: {LIVE | FAILED | SKIPPED}
   - Bot: @{bot_username}
   - URL: {service_url}
   - Avg Response Time: {ms}
   - E2E Score: {score}/10
   - Test Results: {pass_count}/{total_tests}

   #### Web App
   - Status: {LIVE | FAILED | SKIPPED}
   - API: {api_url}
   - Widget: {widget_url}
   - Avg Response Time: {ms}
   - E2E Score: {score}/10
   - Test Results: {pass_count}/{total_tests}

   ### Issues Found
   {list_of_issues_or_"None"}

   ### Recommendations
   {list_of_recommendations}
   ```

### Quality Gate QG-003: Production Ready

```yaml
gate: QG-003
name: "Multi-Channel Production Ready"
type: blocking
criteria:
  - all_health_checks_passing: true
  - e2e_score_per_channel: ">= 7.0"
  - cross_channel_consistency: ">= 7.0"
  - no_error_logs: true
  - deployment_report_generated: true
pass_action: "Mark all channels as LIVE"
fail_action: "Investigate failing channels, iterate or disable"
partial_pass: "Mark healthy channels as LIVE, flag failing for investigation"
```

### Checkpoint

Before marking channels as LIVE:
- [ ] Health checks passing on all deployed channels
- [ ] 5 E2E test messages sent and responses scored on each channel
- [ ] E2E score >= 7.0 on each channel
- [ ] Cross-channel consistency >= 7.0
- [ ] No ERROR level logs in container output
- [ ] Deployment report generated and saved

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| Deployment report | `outputs/minds/{slug}/docs/multi-channel-deploy-report.md` | Full deployment assessment |
| Updated manifest | `outputs/mind-clone-bot/deploy-manifest.yaml` | Updated with live status |
| E2E test results | `outputs/minds/{slug}/docs/e2e-test-results.json` | Detailed test responses |

---

## Error Handling

```yaml
clone_not_found:
  phase: 1
  action: "Redirect to full-pipeline workflow"
  message: "Clone not built yet. Run full-pipeline first."

credentials_invalid:
  phase: 1
  action: "Report which credentials failed, ask user to fix"
  retry: true

docker_build_failure:
  phase: 2
  action: "Check Dockerfile, review build logs, fix dependencies"
  retry: true
  max_retries: 2

channel_deploy_failure:
  phase: 2
  action: "Log error, continue with other channels, report at end"
  blocking: false

webhook_configuration_failure:
  phase: 2
  action: "Verify URL accessibility, check SSL, retry"
  retry: true
  max_retries: 3

low_e2e_score:
  phase: 3
  action: "Compare with calibration baseline, investigate regression"
  threshold: 7.0

low_consistency:
  phase: 3
  action: "Check config differences between channel deployments"
  threshold: 7.0

partial_deployment:
  phase: 3
  action: "Mark healthy channels LIVE, schedule retry for failed channels"
  blocking: false
```

---

## Rollback Procedures

| Scenario | Rollback Action |
|----------|----------------|
| New deploy breaks existing channel | Rollback EasyPanel service to previous version |
| All channels fail | Preserve previous deployment, investigate root cause |
| Webhook misconfigured | Revert webhook URL to previous setting |
| Docker image corrupted | Rebuild from clean state, redeploy |

---

## Workflow Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Total deployment time | < 30 min (all channels) | Timer from Phase 1 to Phase 3 |
| Per-channel deployment | < 10 min each | Individual channel timers |
| Health check pass rate | 100% | All channels healthy |
| E2E test pass rate | >= 90% | Tests passing per channel |
| Cross-channel consistency | >= 7.0/10 | Consistency score |

---

_Workflow Version: 1.0.0_
_Last Updated: 2026-02-14_
_Squad: clone-deploy_
_Pre-requisite: Clone must be built via full-pipeline Phase 1-3_
