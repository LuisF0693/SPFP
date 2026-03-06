---
task-id: monitor-health
name: Health Check & Conversation Analytics
agent: deploy-engineer
version: 1.0.0
purpose: Monitor deployed clone bots health, response times, and conversation analytics

workflow-mode: automated
elicit: false

prerequisites:
  - At least one clone bot deployed (WhatsApp, Telegram, or Web App)
  - Health endpoint accessible (/health)

inputs:
  - name: endpoints
    type: list
    description: List of health check URLs to monitor
    required: true
    example:
      - "https://clone-bot.academialendaria.ai/health"
      - "https://telegram-bot.academialendaria.ai/health"
      - "https://clone-api.academialendaria.ai/health"

  - name: interval_seconds
    type: integer
    description: How often to run health checks
    required: false
    default: 60

  - name: alert_email
    type: string
    description: Email to send alerts to (optional)
    required: false

  - name: report_type
    type: enum
    description: Type of report to generate
    required: false
    options: ["health-only", "full", "daily-summary"]
    default: "full"

outputs:
  - path: "outputs/mind-clone-bot/reports/health-{timestamp}.yaml"
    description: Health check results and analytics
    format: yaml

  - path: "stdout"
    description: Real-time health status and alerts
    format: text

dependencies:
  agents:
    - deploy-engineer
  tools:
    - httpx (HTTP client)
  files:
    - outputs/mind-clone-bot/clone_engine.py (for conversation count)

validation:
  success-criteria:
    - "All endpoints return 200 OK"
    - "Response times within acceptable range (<2s)"
    - "No error alerts triggered"

  warning-conditions:
    - "Response time > 2 seconds"
    - "Active conversations > 100 (memory pressure)"
    - "Any endpoint returns non-200 status"

  failure-conditions:
    - "Endpoint unreachable (connection refused or timeout)"
    - "Health check returns error status"
    - "Multiple consecutive failures (>3)"

estimated-duration: "10-30 seconds per check"
---

# Monitor Health Task

## Purpose

Perform health checks on deployed clone bots, monitor response times,
track conversation metrics, and alert on errors. Can run as a one-shot
check or scheduled periodic monitoring.

**Pipeline position:** Post-deployment, ongoing operations.
**Executor:** Automated (worker process or scheduled job).

## When to Use This Task

**Use this task when:**
- Verifying deployment health after deploy tasks
- Scheduled daily health checks
- Investigating reported issues
- Generating daily operational reports
- User invokes `/CloneDeploy:tasks:monitor-health`

**Do NOT use this task when:**
- Testing clone fidelity (use test-fidelity)
- Deploying new bots (use deploy tasks)
- Diagnosing mind quality (use diagnose-mind)

## Key Activities & Instructions

### Step 1: Ping Health Endpoints

```python
import httpx
import time
from datetime import datetime

def check_health(endpoint: str) -> dict:
    """Ping a single health endpoint and return status."""
    start = time.time()

    try:
        resp = httpx.get(endpoint, timeout=10)
        elapsed = time.time() - start

        data = resp.json() if resp.status_code == 200 else {}

        return {
            "endpoint": endpoint,
            "status": "ok" if resp.status_code == 200 else "error",
            "http_status": resp.status_code,
            "response_time_ms": int(elapsed * 1000),
            "mind": data.get("mind", "unknown"),
            "channel": data.get("channel", "unknown"),
            "active_conversations": data.get("active_conversations", 0),
            "timestamp": datetime.utcnow().isoformat(),
            "error": None,
        }

    except httpx.TimeoutException:
        return {
            "endpoint": endpoint,
            "status": "timeout",
            "http_status": None,
            "response_time_ms": int((time.time() - start) * 1000),
            "error": "Connection timed out after 10s",
            "timestamp": datetime.utcnow().isoformat(),
        }

    except httpx.ConnectError as e:
        return {
            "endpoint": endpoint,
            "status": "unreachable",
            "http_status": None,
            "response_time_ms": 0,
            "error": f"Connection refused: {e}",
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        return {
            "endpoint": endpoint,
            "status": "error",
            "http_status": None,
            "response_time_ms": 0,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
        }
```

### Step 2: Check Response Times

```python
def evaluate_response_time(result: dict) -> str:
    """Evaluate if response time is acceptable."""
    ms = result.get("response_time_ms", 0)

    if ms == 0 and result["status"] != "ok":
        return "unreachable"
    elif ms < 500:
        return "excellent"
    elif ms < 1000:
        return "good"
    elif ms < 2000:
        return "acceptable"
    elif ms < 5000:
        return "slow"
    else:
        return "critical"
```

### Step 3: Count Conversations and Metrics

```python
def aggregate_metrics(health_results: list[dict]) -> dict:
    """Aggregate metrics across all endpoints."""
    total_conversations = 0
    total_endpoints = len(health_results)
    healthy = 0
    degraded = 0
    down = 0
    avg_response_time = 0

    response_times = []

    for r in health_results:
        if r["status"] == "ok":
            healthy += 1
            total_conversations += r.get("active_conversations", 0)
            response_times.append(r["response_time_ms"])
        elif r["status"] in ("timeout", "slow"):
            degraded += 1
        else:
            down += 1

    if response_times:
        avg_response_time = sum(response_times) / len(response_times)

    return {
        "total_endpoints": total_endpoints,
        "healthy": healthy,
        "degraded": degraded,
        "down": down,
        "total_conversations": total_conversations,
        "avg_response_time_ms": int(avg_response_time),
        "overall_status": (
            "healthy" if down == 0 and degraded == 0
            else "degraded" if down == 0
            else "critical" if down == total_endpoints
            else "partial_outage"
        ),
    }
```

### Step 4: Alert on Errors

```python
def check_alerts(results: list[dict]) -> list[dict]:
    """Generate alerts for problematic conditions."""
    alerts = []

    for r in results:
        if r["status"] != "ok":
            alerts.append({
                "level": "critical" if r["status"] in ("unreachable", "error") else "warning",
                "endpoint": r["endpoint"],
                "message": f"Endpoint {r['status']}: {r.get('error', 'Unknown error')}",
                "timestamp": r["timestamp"],
            })

        elif r.get("response_time_ms", 0) > 2000:
            alerts.append({
                "level": "warning",
                "endpoint": r["endpoint"],
                "message": f"Slow response: {r['response_time_ms']}ms",
                "timestamp": r["timestamp"],
            })

        elif r.get("active_conversations", 0) > 100:
            alerts.append({
                "level": "warning",
                "endpoint": r["endpoint"],
                "message": f"High conversation count: {r['active_conversations']}",
                "timestamp": r["timestamp"],
            })

    return alerts
```

### Step 5: Generate Health Report

```python
def generate_report(
    results: list[dict],
    metrics: dict,
    alerts: list[dict],
) -> None:
    """Print health monitoring report."""
    print(f"\n{'='*60}")
    print(f"  CLONE HEALTH REPORT")
    print(f"  {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"{'='*60}")

    # Overall status
    status_icon = {
        "healthy": "[OK]",
        "degraded": "[WARN]",
        "partial_outage": "[ALERT]",
        "critical": "[CRITICAL]",
    }
    icon = status_icon.get(metrics["overall_status"], "[?]")
    print(f"\n  Overall: {icon} {metrics['overall_status'].upper()}")
    print(f"  Endpoints: {metrics['healthy']}/{metrics['total_endpoints']} healthy")
    print(f"  Conversations: {metrics['total_conversations']} active")
    print(f"  Avg Response: {metrics['avg_response_time_ms']}ms")

    # Per-endpoint details
    print(f"\n  Endpoint Details:")
    for r in results:
        status = "OK" if r["status"] == "ok" else r["status"].upper()
        rt = f"{r['response_time_ms']}ms" if r.get("response_time_ms") else "N/A"
        mind = r.get("mind", "?")
        channel = r.get("channel", "?")
        convos = r.get("active_conversations", "?")
        print(f"    [{status:6s}] {r['endpoint']}")
        print(f"             Mind: {mind} | Channel: {channel} | Convos: {convos} | RT: {rt}")

    # Alerts
    if alerts:
        print(f"\n  Alerts ({len(alerts)}):")
        for a in alerts:
            level = a["level"].upper()
            print(f"    [{level}] {a['message']}")
            print(f"           Endpoint: {a['endpoint']}")
    else:
        print(f"\n  Alerts: None")

    print(f"\n{'='*60}\n")
```

### Step 6: Save Report to File

```yaml
# outputs/mind-clone-bot/reports/health-{timestamp}.yaml
health_report:
  generated_at: "{{timestamp}}"
  overall_status: "{{healthy|degraded|critical}}"

metrics:
  total_endpoints: "{{count}}"
  healthy: "{{count}}"
  degraded: "{{count}}"
  down: "{{count}}"
  total_conversations: "{{count}}"
  avg_response_time_ms: "{{ms}}"

endpoints:
  - url: "{{url}}"
    status: "{{ok|error|timeout}}"
    response_time_ms: "{{ms}}"
    mind: "{{slug}}"
    channel: "{{whatsapp|telegram|webapp}}"
    active_conversations: "{{count}}"

alerts:
  - level: "{{critical|warning}}"
    endpoint: "{{url}}"
    message: "{{description}}"
```

## Example Execution

```bash
/CloneDeploy:tasks:monitor-health

============================================================
  CLONE HEALTH REPORT
  2026-02-14 10:30:00 UTC
============================================================

  Overall: [OK] HEALTHY
  Endpoints: 3/3 healthy
  Conversations: 12 active
  Avg Response: 245ms

  Endpoint Details:
    [OK    ] https://clone-bot.academialendaria.ai/health
             Mind: naval_ravikant | Channel: whatsapp | Convos: 5 | RT: 312ms
    [OK    ] https://telegram-bot.academialendaria.ai/health
             Mind: naval_ravikant | Channel: telegram | Convos: 3 | RT: 198ms
    [OK    ] https://clone-api.academialendaria.ai/health
             Mind: naval_ravikant | Channel: webapp | Convos: 4 | RT: 225ms

  Alerts: None

============================================================
```

## Scheduling

For periodic monitoring, use cron or a scheduler:

```bash
# Run health check every 5 minutes
*/5 * * * * python /path/to/monitor_health.py --endpoints "url1,url2,url3"

# Daily summary at 8am
0 8 * * * python /path/to/monitor_health.py --report daily-summary
```

## Notes

- Health endpoints are lightweight and should respond in <500ms
- Conversation counts are in-memory and reset on container restart
- For persistent metrics, integrate with a time-series database (future)
- Alerts can be extended to send via email, Slack, or Telegram
- Monitor multiple clones by adding all their health endpoints
- Response time includes network latency to the deployment platform

---

**Task Version:** 1.0.0
**Created:** 2026-02-14
**Agent:** deploy-engineer (Multi-Channel Deployer)
