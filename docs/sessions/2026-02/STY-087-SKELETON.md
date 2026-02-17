# STY-087: ActivityFeed Skeleton Documentation

**Date:** 2026-02-16
**Commit:** f78f19f
**Status:** 🏗️ Skeleton Complete - Ready for Implementation

---

## Overview

Skeleton/template for **STY-087: Pipeline Feed (Realtime)** - First task in EPIC-002 Sprint 6.

All files created with:
- ✅ Complete TODO documentation
- ✅ Architecture comments
- ✅ Import/export structure
- ✅ Type definitions in place
- ✅ Build passes (typecheck, lint, build)

---

## Files Created

### 1. Service Layer

#### `src/services/corporateActivityService.ts`
**Responsibilities:**
- Realtime subscriptions (Supabase Channel)
- Polling fallback (every 5s)
- CRUD operations (create, update, approve, reject, delete)
- Error recovery wrapper
- Filtering helper

**TODOs:**
```typescript
✅ subscribeToActivities()     // Realtime subscription
✅ fetchActivities()           // One-time fetch
✅ startPollingActivities()    // Fallback polling
✅ createActivity()            // Demo/test creation
✅ updateActivity()            // Generic update
✅ approveActivity()           // Approval workflow
✅ rejectActivity()            // Rejection workflow
✅ deleteActivity()            // Soft delete
✅ filterActivitiesByDepartment() // Filter helper
```

### 2. State Management

#### `src/stores/corporateStore.ts`
**Zustand store for:**
- Activities array (max 100)
- Real-time connection status
- Department filter
- Pending approvals tracking
- Error and loading states

**TODOs:**
```typescript
✅ addActivity()              // Add with auto-trim to 100
✅ updateActivity()           // Find and update by ID
✅ removeActivity()           // Filter out activity
✅ setActivities()            // Replace entire array
✅ clearActivities()          // Reset to []
✅ setRealtimeConnected()     // Connection status
✅ setDepartmentFilter()      // Filter state
✅ addPendingApproval()       // Approval tracking
✅ removePendingApproval()    // Clear approval pending
✅ isPendingApproval()        // Check if pending
✅ setError()                 // Error state
✅ setLoading()               // Loading state
```

### 3. Components

#### `src/components/corporate/ActivityStatus.tsx`
**Animated status badge**

Status mapping:
- 🔵 running (pulse) → Blue
- ⚪ idle → Gray
- 🟡 waiting → Yellow
- 🟢 completed → Green
- 🔴 error (pulse) → Red

**TODOs:**
```typescript
✅ statusConfig mapping
✅ Emoji selection
✅ Color coding
✅ Animation logic
✅ Size variants (sm, md, lg)
```

---

#### `src/components/corporate/ActivityCard.tsx`
**Individual activity in feed**

Shows:
- Agent name + role
- Status badge
- Department info
- Description (truncated)
- Timestamps (relative: "2 min ago")
- Approval buttons (if requires_approval)

**TODOs:**
```typescript
✅ Card container with dept accent border
✅ Header with agent info
✅ Status badge rendering
✅ Description display
✅ Timestamp formatting
✅ ApprovalGate rendering (conditional)
✅ Approval status display
✅ Click handler for details modal
```

---

#### `src/components/corporate/ApprovalGate.tsx`
**Approve/Reject buttons**

Features:
- Two buttons: ✓ Approve, ✗ Reject
- Loading state during API call
- Disabled after action
- Error handling toast

**TODOs:**
```typescript
✅ Approve button logic
✅ Reject button logic
✅ Loading state management
✅ Error handling
✅ Disabled state
```

---

#### `src/components/corporate/ActivityDetailModal.tsx`
**Expanded activity details**

Shows:
- Full activity info
- Agent details
- Full description (not truncated)
- Timestamps (created, updated, approved/rejected)
- Metadata JSONB (pretty-printed)
- Approval history

**TODOs:**
```typescript
✅ Modal overlay
✅ Header with close button
✅ Agent section
✅ Status section
✅ Description section (full)
✅ Timestamps section
✅ Metadata section (JSON pretty-print)
✅ Footer with close button
```

---

#### `src/components/corporate/ActivityFeed.tsx`
**Main feed container** (glues everything together)

Responsibilities:
- Setup Realtime subscription on mount
- Manage subscription lifecycle + cleanup
- Fallback to polling on error
- Department filtering
- Connection status indicator
- Approval workflow
- Detail modal

**TODOs:**
```typescript
✅ useEffect for subscription setup
✅ Subscription lifecycle management
✅ Error handling → polling fallback
✅ Activity list rendering
✅ Filtering logic
✅ Approve handler
✅ Reject handler
✅ Detail modal open/close
✅ Connection status UI
✅ Department filter UI
```

---

## Architecture Decisions (✅ Approved by @architect)

### Realtime Strategy: Option A
```
Primary: Supabase Channel with postgres_changes
- Event: INSERT, UPDATE, DELETE
- Filter: user_id=eq.${userId}
- Max items in memory: 100 (auto-trimmed)

Fallback: Polling (5 seconds)
- Triggered on Realtime disconnect
- Fetches last 100 activities
- Auto-recovers when Realtime reconnects

Error Recovery: exponential backoff
- Uses errorRecovery.ts (already in codebase)
- Retry with increasing delays
- User-friendly error messages
```

### State Management: Zustand
```
Why: Already used in project
- activities: [] (max 100, auto-trimmed)
- isRealtimeConnected: boolean
- pendingApprovals: Set<string> (activity IDs)
- error: string | null
- isLoading: boolean
```

### RLS Policies
```sql
-- Users can only see their own activities
CREATE POLICY "Users see own activities"
  ON corporate_activities FOR SELECT
  USING (auth.uid() = user_id);

-- Insert handled via backend (agents)
-- Update/Delete also restricted by user_id
```

---

## Integration Points

### Already Exists ✅
- `supabase` client initialized
- `AuthContext` with useAuth()
- `errorRecovery.ts` service
- `CorporateContext` for state
- `CorporateHQ` component

### To Create 🚀
- ActivityFeed integration in CorporateHQ
- Combine with OfficeMap in layout
- 3-column layout:
  - Col 1: OfficeMap (2/3)
  - Col 2: ActivityFeed (1/3)
  - Sidebar stays on left

---

## Implementation Checklist

### Phase 1: Services (High Priority)
- [ ] Implement `subscribeToActivities()` - Realtime subscription
- [ ] Implement `fetchActivities()` - Initial load + polling
- [ ] Implement `startPollingActivities()` - Fallback logic
- [ ] Test subscription lifecycle

### Phase 2: Store (Medium Priority)
- [ ] Implement all Zustand actions
- [ ] Test state mutations
- [ ] Verify max 100 item trimming

### Phase 3: Components (Medium Priority)
- [ ] ActivityStatus - Status badge
- [ ] ActivityCard - Individual card
- [ ] ApprovalGate - Buttons
- [ ] ActivityDetailModal - Modal

### Phase 4: Container (High Priority)
- [ ] ActivityFeed - Main component
- [ ] Subscription setup/cleanup
- [ ] Error handling → fallback
- [ ] Filtering logic

### Phase 5: Integration (High Priority)
- [ ] Integrate ActivityFeed in CorporateHQ
- [ ] Layout with OfficeMap
- [ ] Navigation + styling

### Phase 6: Testing (High Priority)
- [ ] Unit tests (vitest + RTL)
- [ ] Integration tests
- [ ] Manual Realtime testing
- [ ] Polling fallback testing

---

## Next Steps for @dev

**Order of Implementation:**

1. **Implement `corporateActivityService.ts`**
   - Start with `subscribeToActivities()`
   - Then `fetchActivities()`
   - Then polling fallback
   - Test with Supabase Realtime

2. **Implement `corporateStore.ts`**
   - Fill in all action methods
   - Test state mutations

3. **Implement Components (in order)**
   - ActivityStatus (simplest)
   - ApprovalGate (no dependencies)
   - ActivityCard (uses Status + ApprovalGate)
   - ActivityDetailModal (standalone)
   - ActivityFeed (ties everything together)

4. **Integration**
   - Integrate ActivityFeed in CorporateHQ
   - Layout styling
   - Navigation

5. **Testing**
   - Unit tests
   - Manual Realtime tests
   - Polling fallback tests

---

## Build Status

```
✅ TypeScript Compilation: PASSED
✅ ESLint: PASSED
✅ Production Build: PASSED
```

---

## Commit History

```
f78f19f feat(epic-002): scaffold STY-087 ActivityFeed with Realtime architecture
```

**Files in this commit:**
- src/services/corporateActivityService.ts (159 lines)
- src/stores/corporateStore.ts (169 lines)
- src/components/corporate/ActivityStatus.tsx (55 lines)
- src/components/corporate/ActivityCard.tsx (122 lines)
- src/components/corporate/ApprovalGate.tsx (80 lines)
- src/components/corporate/ActivityDetailModal.tsx (148 lines)
- src/components/corporate/ActivityFeed.tsx (200 lines)

**Total: ~933 lines of scaffold with TODOs**

---

## Resources

- `docs/architecture/EPIC-002-ARCHITECTURE.md` - Full architecture
- `src/types/corporate.ts` - Type definitions
- `src/context/AuthContext.tsx` - Auth patterns
- `src/services/errorRecovery.ts` - Error handling
- `.claude/CLAUDE.md` - Project rules

---

**Status:** 🟢 Ready for Implementation
**Assigned to:** @dev (Dex)
**Priority:** P0 (blocks dashboards)

