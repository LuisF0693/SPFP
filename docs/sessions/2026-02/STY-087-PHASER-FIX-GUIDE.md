# STY-087-PHASER: Fix Guide

**Priority:** 🔴 CRITICAL - Must fix before merge
**Timeline:** ~30 minutes for experienced dev
**Complexity:** Medium (state management refactoring)

---

## Overview

The feature has excellent Phaser rendering and dashboards, but suffers from incomplete Zustand store implementation. The phaser-bridge and UI components try to use store methods that don't exist.

This guide provides exact fixes needed to unblock the feature.

---

## Root Cause

**corporateStore.ts** was created with activities/realtime features but is missing:
- `selectedDepartment` state
- `isModalOpen` state
- `setSelectedDepartment()` method
- `setIsModalOpen()` method

Components (CorporateHQ, DepartmentDashboard, phaser-bridge) try to use these missing methods → **Runtime crash**.

---

## Fix #1: Complete Zustand Store

**File:** `src/stores/corporateStore.ts`

**Change:** Add missing modal state to interface and implementation

### Current Code (Lines 15-45):
```typescript
interface CorporateState {
  // State
  activities: CorporateActivity[];
  isRealtimeConnected: boolean;
  selectedDepartmentFilter: Department | 'all';
  pendingApprovals: Set<string>;
  error: string | null;
  isLoading: boolean;

  // Activities
  addActivity: (activity: CorporateActivity) => void;
  // ... more methods
}
```

### Fixed Code:
```typescript
interface CorporateState {
  // State
  activities: CorporateActivity[];
  isRealtimeConnected: boolean;
  selectedDepartmentFilter: Department | 'all';
  selectedDepartment: string | null;  // ← ADD THIS
  isModalOpen: boolean;                // ← ADD THIS
  pendingApprovals: Set<string>;
  error: string | null;
  isLoading: boolean;

  // Activities
  addActivity: (activity: CorporateActivity) => void;
  updateActivity: (id: string, updates: Partial<CorporateActivity>) => void;
  removeActivity: (id: string) => void;
  setActivities: (activities: CorporateActivity[]) => void;
  clearActivities: () => void;

  // Real-time status
  setRealtimeConnected: (connected: boolean) => void;

  // Filters
  setDepartmentFilter: (dept: Department | 'all') => void;

  // Modal & Department Selection ← ADD THIS SECTION
  setSelectedDepartment: (dept: string | null) => void;
  setIsModalOpen: (open: boolean) => void;

  // Approvals
  addPendingApproval: (activityId: string) => void;
  removePendingApproval: (activityId: string) => void;
  isPendingApproval: (activityId: string) => boolean;

  // Error handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}
```

### Update Initial State (Lines 48-54):
```typescript
export const useCorporateStore = create<CorporateState>((set, get) => ({
  // Initial state
  activities: [],
  isRealtimeConnected: false,
  selectedDepartmentFilter: 'all',
  selectedDepartment: null,      // ← ADD THIS
  isModalOpen: false,            // ← ADD THIS
  pendingApprovals: new Set<string>(),
  error: null,
  isLoading: false,
```

### Add Methods (after line 95):
```typescript
  // Modal & Department Selection ← ADD THIS ENTIRE BLOCK
  setSelectedDepartment: (dept: string | null) => {
    set({ selectedDepartment: dept });
  },

  setIsModalOpen: (open: boolean) => {
    set({ isModalOpen: open });
  },
```

**Full Location:** Between `setDepartmentFilter()` and `addPendingApproval()` methods.

---

## Fix #2: Update CorporateHQ Component

**File:** `src/components/corporate/CorporateHQ.tsx`

### Current Code (Lines 9-16):
```typescript
export function CorporateHQ() {
  const setSelectedDepartment = useCorporateStore((state) => state.setSelectedDepartment);
  const setIsModalOpen = useCorporateStore((state) => state.setIsModalOpen);

  useEffect(() => {
    // Setup Zustand ↔ Phaser bridge
    setupPhaserBridge();
  }, []);
```

### Issue:
Lines 10-11 will work once Fix #1 is applied. No change needed here! ✅

**However**, verify setupPhaserBridge() is being called. Keep as-is.

---

## Fix #3: Update DepartmentDashboard Component

**File:** `src/components/corporate/DepartmentDashboard.tsx`

### Current Code (Line 20-23):
```typescript
export function DepartmentDashboard() {
  const selectedDepartment = useCorporateStore((state) => state.selectedDepartment);
  const isModalOpen = useCorporateStore((state) => state.isModalOpen);
  const setIsModalOpen = useCorporateStore((state) => state.setIsModalOpen);
```

### Issue:
Once Fix #1 is applied, these lines will work correctly! No change needed. ✅

**Verify:** These references match the new store properties added in Fix #1.

---

## Fix #4: Verify phaser-bridge.ts

**File:** `src/components/corporate/phaser-bridge.ts`

### Current Code (Lines 48-55):
```typescript
export function handlePhaserClick(departmentId: string) {
  const store = useCorporateStore.getState();

  store.setSelectedDepartment(departmentId);
  store.setIsModalOpen(true);

  console.log('[PhaserBridge] click handler:', departmentId);
}
```

### After Fix #1:
These method calls will work! No changes needed. ✅

**What it does:**
1. Gets current Zustand store state
2. Sets the clicked department as selected
3. Opens the modal
4. Logs the action

This is correct implementation, just needed the store methods to exist.

---

## Fix #5: Optional - Clean Up Duplicate Context

**File:** `src/components/corporate/CorporateContext.tsx`

**Status:** Can be kept or removed after Fix #1

Once all components use `useCorporateStore`, the Context becomes redundant:
- DepartmentModal imports `useCorporate()` from Context
- Could be updated to use `useCorporateStore` instead
- CorporateProvider could be removed

**Current Status:** Working, but duplicate state pattern.

**Recommendation:** Keep for now, refactor in next story.

---

## Testing After Fixes

### Automated Tests:
```bash
# Verify types compile
npm run typecheck

# Verify linting passes
npm run lint

# Verify build succeeds
npm run build

# Run component tests
npm run test -- CorporateHQ.test.tsx
```

### Manual Testing:
1. **As Admin User:**
   - Navigate to `/corporate`
   - Should see Phaser map with 4 departments
   - Click on each department → modal should open
   - Modal shows correct dashboard
   - Close button works

2. **Access Control:**
   - Non-admin tries `/corporate` → redirects to `/dashboard`
   - Admin sees Corporate HQ in sidebar (🏢 icon)

3. **Phaser Interactivity:**
   - Hover over department → border turns yellow, emoji bounces
   - Click department → modal opens with correct dashboard
   - Scroll dashboard content in modal
   - Close modal → returns to map

---

## Implementation Checklist

- [ ] **Fix #1:** Add selectedDepartment + isModalOpen to interface
- [ ] **Fix #1:** Add initial state values
- [ ] **Fix #1:** Add setSelectedDepartment() method
- [ ] **Fix #1:** Add setIsModalOpen() method
- [ ] Run `npm run typecheck` - should pass
- [ ] Run `npm run lint` - should pass
- [ ] Run `npm run build` - should pass
- [ ] Test Phaser click → Modal opens
- [ ] Test all 4 dashboards render
- [ ] Test modal close button
- [ ] Test admin access control
- [ ] Commit changes with message:
  ```
  fix(sty-087): complete zustand store with modal state management

  - Add selectedDepartment state to corporate store
  - Add isModalOpen state to corporate store
  - Add setSelectedDepartment() method
  - Add setIsModalOpen() method

  This fixes the runtime crashes when clicking Phaser map
  departments and properly connects UI to state management.

  ✅ TypeCheck OK
  ✅ ESLint OK
  ✅ Build OK
  ✅ Phaser click → Modal opens
  ✅ All dashboards render
  ```

---

## Expected Outcome

After applying all fixes:

✅ No runtime TypeErrors
✅ Phaser map clicks open modal
✅ Modal displays correct dashboard
✅ Modal closes properly
✅ State syncs across components
✅ Admin-only access enforced
✅ TypeCheck passes
✅ ESLint passes
✅ Build passes
✅ Component tests pass

---

## Estimated Effort

| Task | Time | Difficulty |
|------|------|------------|
| Edit corporateStore.ts | 5 min | Easy (copy-paste) |
| Verify other files | 10 min | Easy (review) |
| TypeCheck + Build | 5 min | Easy (CLI) |
| Manual testing | 10 min | Easy (UI testing) |
| **Total** | **30 min** | **Low-Medium** |

---

## Rollback Plan

If issues occur:

1. Revert to commit `7d9ccac` (before phaser-bridge added)
2. Remove phaser dependency from package.json
3. Remove CorporateHQ route from App.tsx

**Note:** This is a safe feature to revert - doesn't break other functionality.

---

## Questions?

Refer to:
- QA Report: `docs/sessions/2026-02/STY-087-PHASER-QA-REPORT.md`
- Original Story: Look for STY-087 in stories folder
- Type Definition: `src/types/corporate.ts`
- Store Definition: `src/stores/corporateStore.ts`
