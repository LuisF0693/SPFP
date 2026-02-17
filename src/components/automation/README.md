# Automation Module

Browser automation via MCP Playwright for SPFP.

## Features (STY-093)

- ✅ Screenshot capture
- ✅ Action history with localStorage persistence
- ✅ Error handling and user feedback
- 🔜 Navigation to URLs (STY-094)
- 🔜 Action logging with filtering (STY-095)
- 🔜 Permissions and security controls (STY-096)

## Usage

### Basic Component

```tsx
import { AutomationDashboard } from '@/components/automation';

export function MyPage() {
  return <AutomationDashboard />;
}
```

### Using the Hook

```tsx
import { useAutomationState } from '@/components/automation';

export function MyComponent() {
  const {
    latestScreenshot,
    loading,
    error,
    history,
    captureScreenshot,
    clearHistory,
  } = useAutomationState();

  return (
    <div>
      <button onClick={captureScreenshot} disabled={loading}>
        Capture
      </button>
      {error && <p>{error}</p>}
      {latestScreenshot && (
        <img src={`data:image/png;base64,${latestScreenshot.data}`} />
      )}
    </div>
  );
}
```

### Using the Service

```typescript
import { automationService } from '@/services/automationService';

// Capture screenshot
const result = await automationService.captureScreenshot();
console.log(result.id, result.data);

// Get history
const actions = automationService.getActionHistory();

// Clear history
automationService.clearHistory();
```

## Architecture

```
src/
├── services/
│   └── automationService.ts     # Core service (singleton)
└── components/automation/
    ├── AutomationDashboard.tsx  # Main container
    ├── BrowserPreview.tsx       # Screenshot display
    ├── useAutomationState.ts    # State hook
    ├── index.ts                 # Exports
    └── README.md                # This file
```

## Service API

### `automationService.captureScreenshot(): Promise<ScreenshotResult>`

Captures a screenshot of the browser.

**Returns:**
```typescript
{
  id: string;              // Unique ID
  data: string;            // Base64-encoded PNG
  timestamp: string;       // ISO timestamp
  width: number;           // Resolution width
  height: number;          // Resolution height
}
```

**Throws:** Error if capture fails

### `automationService.getActionHistory(): AutomationAction[]`

Returns the history of all actions performed.

**Returns:** Array of AutomationAction objects

### `automationService.clearHistory(): void`

Clears the action history and localStorage.

## Configuration

### MCP Playwright

The service expects MCP Playwright to be configured. Currently:

- **Development:** Uses mock data (1x1 transparent PNG)
- **Production:** Requires `mcp__playwright__browser_screenshot` tool

Contact `@devops` (Gage) for MCP configuration.

### Storage

- Action history persists to localStorage: `spfp_automation_history`
- Max 100 actions stored
- Loads on page refresh

## Error Handling

All errors are caught and returned in the `error` state:

```typescript
if (error) {
  console.error(error);
  // User sees friendly message in UI
}
```

## Next Steps

1. **STY-094:** Navigation to URLs with auto-screenshot
2. **STY-095:** Comprehensive action logging with filters
3. **STY-096:** Permission controls and security

## Testing

Run the development server and navigate to `/automation`:

```bash
npm run dev
# Visit http://localhost:3000/automation
```

Click "Capturar Tela" to capture screenshots.

## Troubleshooting

### "MCP Playwright não configurado"

This is expected in development. The service uses mock data.

In production, this error means `@devops` needs to configure MCP.

### Screenshots not saving

Check browser console for localStorage errors. Storage quota may be exceeded.

### Timeout errors

If screenshot takes > 30s, check if browser is responsive.

## References

- **Story:** `docs/stories/pendentes/story-093-capturar-screenshot.md`
- **Epic:** `docs/prd/EPIC-003-AI-Automation.md`
- **CLAUDE.md:** Project guidelines and patterns
