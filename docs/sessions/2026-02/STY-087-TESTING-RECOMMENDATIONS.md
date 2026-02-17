# STY-087 Testing Recommendations & Fixes

**QA Agent:** Quinn
**Date:** 2026-02-16
**Epic:** EPIC-002 Corporate HQ
**Component:** ActivityFeed Integration

---

## Quick Fix Guide

### Fix #1: Stale Closure (CRITICAL)

**File:** `src/components/corporate/ActivityFeed.tsx`
**Lines:** 42-90
**Time to fix:** 5 minutes

**Current Code:**
```typescript
useEffect(() => {
  if (!user?.id) return;

  setLoading(true);
  fetchActivities(user.id, 100, 0)
    .then((activities) => {
      setActivities(activities);
    })
    .catch((err) => {
      setError('Failed to load activities');
      console.error(err);
    });

  const unsubFn = subscribeToActivities(
    user.id,
    (activity: CorporateActivity) => {
      const existing = activities.find(a => a.id === activity.id); // ❌ STALE CLOSURE
      if (existing) {
        updateActivity(activity.id, activity);
      } else {
        addActivity(activity);
      }
    },
    (error: Error) => {
      setError(error.message);
      setRealtimeConnected(false);

      const stopPoll = startPollingActivities(user.id, (fetchedActivities) => {
        setActivities(fetchedActivities);
      });
      setStopPolling(() => stopPoll);
    }
  );

  setUnsubscribe(() => unsubFn);
  setRealtimeConnected(true);
  setLoading(false);

  return () => {
    unsubFn();
    stopPolling?.();
  };
}, [user?.id, addActivity, updateActivity, setActivities, setError, setRealtimeConnected, setLoading, activities]);
```

**Fixed Code:**
```typescript
useEffect(() => {
  if (!user?.id) return;

  setLoading(true);
  fetchActivities(user.id, 100, 0)
    .then((activities) => {
      setActivities(activities);
    })
    .catch((err) => {
      setError('Failed to load activities');
      console.error(err);
    });

  const unsubFn = subscribeToActivities(
    user.id,
    (activity: CorporateActivity) => {
      // ✅ FIX: Use store.getState() instead of closure
      const currentActivities = useCorporateStore.getState().activities;
      const existing = currentActivities.find(a => a.id === activity.id);
      if (existing) {
        updateActivity(activity.id, activity);
      } else {
        addActivity(activity);
      }
    },
    (error: Error) => {
      setError(error.message);
      setRealtimeConnected(false);

      const stopPoll = startPollingActivities(user.id, (fetchedActivities) => {
        setActivities(fetchedActivities);
      });
      setStopPolling(() => stopPoll);
    }
  );

  setUnsubscribe(() => unsubFn);
  setRealtimeConnected(true);
  setLoading(false);

  return () => {
    unsubFn();
    stopPolling?.();
  };
}, [user?.id, addActivity, updateActivity, setActivities, setError, setRealtimeConnected, setLoading]);
// ✅ Remove 'activities' from dependencies
```

---

### Fix #2: Loading State Display (IMPORTANT)

**File:** `src/components/corporate/ActivityFeed.tsx`
**Lines:** 182-203
**Time to fix:** 10 minutes

**Current Code:**
```typescript
{/* Activity list */}
<div className="flex-1 overflow-y-auto p-3">
  {filteredActivities.length === 0 ? (
    <div className="flex items-center justify-center h-full text-slate-400">
      <p>Nenhuma atividade</p>
    </div>
  ) : (
    <div className="space-y-2">
      {filteredActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onApprove={handleApprove}
          onReject={handleReject}
          onDetails={(act) => {
            setSelectedActivity(act);
            setIsModalOpen(true);
          }}
          isPending={isPendingApproval(activity.id)}
        />
      ))}
    </div>
  )}
</div>
```

**Fixed Code:**
```typescript
{/* Activity list */}
<div className="flex-1 overflow-y-auto p-3">
  {isLoading && filteredActivities.length === 0 ? (
    // ✅ FIX: Show skeleton while loading
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 bg-slate-700 rounded animate-pulse" />
      ))}
    </div>
  ) : filteredActivities.length === 0 ? (
    <div className="flex items-center justify-center h-full text-slate-400">
      <p>Nenhuma atividade</p>
    </div>
  ) : (
    <div className="space-y-2">
      {filteredActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onApprove={handleApprove}
          onReject={handleReject}
          onDetails={(act) => {
            setSelectedActivity(act);
            setIsModalOpen(true);
          }}
          isPending={isPendingApproval(activity.id)}
        />
      ))}
    </div>
  )}
</div>
```

---

### Fix #3: DELETE Event Handling (HIGH PRIORITY)

**File:** `src/services/corporateActivityService.ts`
**Lines:** 55-66
**Time to fix:** 10 minutes

**Current Code:**
```typescript
.on(
  'postgres_changes',
  {
    event: 'DELETE',
    schema: 'public',
    table: 'corporate_activities',
    filter: `user_id=eq.${userId}`,
  },
  (payload) => {
    // Handle deletion by sending activity with deleted marker
    onActivity({ ...payload.old, status: 'completed' } as CorporateActivity);
  }
)
```

**Option A - Remove from list (Recommended):**

Requires refactoring callback interface:

```typescript
// Update interface to handle removals
export function subscribeToActivities(
  userId: string,
  onActivity: (activity: CorporateActivity) => void,
  onActivityDeleted?: (activityId: string) => void, // ✅ NEW
  onError?: (error: Error) => void
): () => void {
  // ...
  .on(
    'postgres_changes',
    {
      event: 'DELETE',
      schema: 'public',
      table: 'corporate_activities',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      // ✅ FIX: Call delete handler if provided
      onActivityDeleted?.(payload.old.id as string);
    }
  )
  // ...
}

// In ActivityFeed.tsx
const unsubFn = subscribeToActivities(
  user.id,
  (activity: CorporateActivity) => {
    const currentActivities = useCorporateStore.getState().activities;
    const existing = currentActivities.find(a => a.id === activity.id);
    if (existing) {
      updateActivity(activity.id, activity);
    } else {
      addActivity(activity);
    }
  },
  (activityId: string) => {
    removeActivity(activityId); // ✅ NEW - remove from list
  },
  (error: Error) => {
    // ... error handler
  }
);
```

**Option B - Add deletion marker (Simpler):**

```typescript
.on(
  'postgres_changes',
  {
    event: 'DELETE',
    schema: 'public',
    table: 'corporate_activities',
    filter: `user_id=eq.${userId}`,
  },
  (payload) => {
    // ✅ FIX: Mark as deleted instead of completed
    onActivity({
      ...payload.old,
      status: 'completed',
      isDeleted: true,
      deleted_at: new Date().toISOString()
    } as CorporateActivity);
  }
)

// Update ActivityCard to show deletion marker
{activity.isDeleted && (
  <div className="mt-2 text-xs text-gray-400">
    🗑️ Excluído
  </div>
)}
```

---

### Fix #4: Use Store Action (MINOR)

**File:** `src/components/corporate/ActivityFeed.tsx`
**Line:** 156
**Time to fix:** 2 minutes

**Current:**
```typescript
onClick={() => useCorporateStore.setState({ selectedDepartmentFilter: 'all' })}
```

**Fixed:**
```typescript
const { ..., setDepartmentFilter } = useCorporateStore();

// In JSX
onClick={() => setDepartmentFilter('all')}
```

---

### Fix #5: Responsive Gap (MINOR)

**File:** `src/components/corporate/CorporateHQ.tsx`
**Line:** 9
**Time to fix:** 1 minute

**Current:**
```typescript
<div className="w-full h-full flex flex-col md:flex-row bg-slate-900 gap-4 p-4">
```

**Fixed:**
```typescript
<div className="w-full h-full flex flex-col md:flex-row bg-slate-900 gap-2 md:gap-4 p-4">
```

---

## Testing Checklist

### Unit Tests to Add

**File:** `src/components/corporate/__tests__/ActivityFeed.test.tsx`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityFeed } from '../ActivityFeed';
import * as activityService from '@/services/corporateActivityService';
import { useCorporateStore } from '@/stores/corporateStore';

describe('ActivityFeed', () => {
  beforeEach(() => {
    useCorporateStore.setState({
      activities: [],
      isRealtimeConnected: false,
      selectedDepartmentFilter: 'all',
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('Real-time Subscription', () => {
    it('subscribes to activities on mount', () => {
      const subscribeSpy = vi.spyOn(activityService, 'subscribeToActivities');
      render(<ActivityFeed />);
      expect(subscribeSpy).toHaveBeenCalled();
    });

    it('unsubscribes on unmount', () => {
      const unsubscribeMock = vi.fn();
      vi.spyOn(activityService, 'subscribeToActivities').mockReturnValue(unsubscribeMock);

      const { unmount } = render(<ActivityFeed />);
      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('shows connection status when connected', async () => {
      useCorporateStore.setState({ isRealtimeConnected: true });
      render(<ActivityFeed />);

      expect(screen.getByText('Conectado')).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toHaveClass('bg-green-500', 'animate-pulse');
    });

    it('shows offline status when disconnected', async () => {
      useCorporateStore.setState({ isRealtimeConnected: false });
      render(<ActivityFeed />);

      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  describe('Department Filtering', () => {
    it('renders all filter tabs', () => {
      render(<ActivityFeed />);
      expect(screen.getByText('Todos')).toBeInTheDocument();
      expect(screen.getByText('💰 financeiro')).toBeInTheDocument();
      expect(screen.getByText('📣 marketing')).toBeInTheDocument();
      expect(screen.getByText('⚙️ operacional')).toBeInTheDocument();
      expect(screen.getByText('🤝 comercial')).toBeInTheDocument();
    });

    it('highlights active filter tab', () => {
      const { rerender } = render(<ActivityFeed />);

      const todoButton = screen.getByText('Todos').closest('button');
      expect(todoButton).toHaveClass('bg-blue-600');

      fireEvent.click(screen.getByText('💰 financeiro').closest('button')!);

      expect(screen.getByText('Todos').closest('button')).not.toHaveClass('bg-blue-600');
      expect(screen.getByText('💰 financeiro').closest('button')).toHaveClass('bg-blue-600');
    });

    it('filters activities by department', () => {
      const activities = [
        { id: '1', department: 'financeiro', created_at: '2026-02-16T00:00:00Z' },
        { id: '2', department: 'marketing', created_at: '2026-02-16T00:00:00Z' },
      ];

      useCorporateStore.setState({ activities: activities as any });
      render(<ActivityFeed />);

      // Initially shows both
      expect(screen.getByText('Financeiro')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();

      // Filter to financeiro
      fireEvent.click(screen.getByText('💰 financeiro').closest('button')!);

      expect(screen.getByText('Financeiro')).toBeInTheDocument();
      expect(screen.queryByText('Marketing')).not.toBeInTheDocument();
    });
  });

  describe('Approval Gate', () => {
    it('shows approval buttons for activities requiring approval', () => {
      const activity = {
        id: '1',
        requires_approval: true,
        approved_at: null,
        rejected_at: null,
        created_at: '2026-02-16T00:00:00Z',
      };

      useCorporateStore.setState({ activities: [activity as any] });
      render(<ActivityFeed />);

      expect(screen.getByText('✓ Aprovar')).toBeInTheDocument();
      expect(screen.getByText('✗ Rejeitar')).toBeInTheDocument();
    });

    it('disables buttons while approving', async () => {
      const activity = {
        id: '1',
        requires_approval: true,
        approved_at: null,
        rejected_at: null,
        created_at: '2026-02-16T00:00:00Z',
      };

      useCorporateStore.setState({ activities: [activity as any] });
      useCorporateStore.setState({ pendingApprovals: new Set(['1']) });
      render(<ActivityFeed />);

      const approveButton = screen.getByText('...').closest('button');
      expect(approveButton).toBeDisabled();
    });

    it('handles approval error gracefully', async () => {
      const activity = { id: '1', requires_approval: true };
      vi.spyOn(activityService, 'approveActivity').mockRejectedValueOnce(new Error('API Error'));

      useCorporateStore.setState({ activities: [activity as any] });
      render(<ActivityFeed />);

      fireEvent.click(screen.getByText('✓ Aprovar'));

      await waitFor(() => {
        expect(useCorporateStore.getState().error).toBe('Erro ao aprovar atividade');
      });
    });
  });

  describe('Loading State', () => {
    it('shows skeleton while loading with no activities', () => {
      useCorporateStore.setState({ isLoading: true, activities: [] });
      render(<ActivityFeed />);

      // Should show 3 skeleton loaders
      const skeletons = screen.getAllByRole('img', { hidden: true })
        .filter(el => el.classList.contains('animate-pulse'));
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows activities while loading if some exist', () => {
      const activity = { id: '1', created_at: '2026-02-16T00:00:00Z' };
      useCorporateStore.setState({ isLoading: true, activities: [activity as any] });
      render(<ActivityFeed />);

      expect(screen.getByText('Nenhuma atividade')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows "Nenhuma atividade" when no activities and not loading', () => {
      useCorporateStore.setState({ isLoading: false, activities: [] });
      render(<ActivityFeed />);

      expect(screen.getByText('Nenhuma atividade')).toBeInTheDocument();
    });
  });

  describe('Modal Details', () => {
    it('opens modal when clicking activity', () => {
      const activity = {
        id: '1',
        agent_name: 'CFO',
        created_at: '2026-02-16T00:00:00Z',
      };

      useCorporateStore.setState({ activities: [activity as any] });
      render(<ActivityFeed />);

      fireEvent.click(screen.getByText('CFO').closest('div'));

      expect(screen.getByText('DETALHES DA ATIVIDADE')).toBeInTheDocument();
    });

    it('closes modal when clicking X button', async () => {
      const activity = { id: '1', agent_name: 'CFO', created_at: '2026-02-16T00:00:00Z' };
      useCorporateStore.setState({ activities: [activity as any] });
      render(<ActivityFeed />);

      fireEvent.click(screen.getByText('CFO').closest('div'));
      expect(screen.getByText('DETALHES DA ATIVIDADE')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      await waitFor(() => {
        expect(screen.queryByText('DETALHES DA ATIVIDADE')).not.toBeInTheDocument();
      });
    });
  });
});
```

---

### Integration Tests

**File:** `src/components/corporate/__tests__/ActivityFeed.integration.test.tsx`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CorporateHQ } from '../CorporateHQ';
import * as activityService from '@/services/corporateActivityService';

describe('ActivityFeed Integration with CorporateHQ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both OfficeMap and ActivityFeed side-by-side', () => {
    render(<CorporateHQ />);

    expect(screen.getByText('CORPORATE HQ')).toBeInTheDocument();
    expect(screen.getByText('ATIVIDADES')).toBeInTheDocument();
  });

  it('maintains separate state for department modal and activity feed', () => {
    render(<CorporateHQ />);

    // Click department
    fireEvent.click(screen.getByLabelText('Financeiro Department'));
    expect(screen.getByText('FINANCEIRO DASHBOARD')).toBeInTheDocument();

    // Close department modal
    fireEvent.click(screen.getByLabelText('Close modal'));

    // ActivityFeed should still be visible
    expect(screen.getByText('ATIVIDADES')).toBeInTheDocument();
  });

  it('displays activities in feed without interfering with office map', async () => {
    render(<CorporateHQ />);

    // Both should be visible
    expect(screen.getByText('CORPORATE HQ')).toBeInTheDocument();
    expect(screen.getByText('ATIVIDADES')).toBeInTheDocument();

    // Office map should be clickable
    expect(screen.getByLabelText('Financeiro Department')).toBeInTheDocument();
  });
});
```

---

### Manual Testing Checklist

#### Desktop (1024px+)
- [ ] Load page - should see OfficeMap (left 50%) and ActivityFeed (right 50%)
- [ ] ActivityFeed shows "Nenhuma atividade" or loading skeleton
- [ ] Connection indicator shows green or red dot
- [ ] Click department filter tabs - should filter activities
- [ ] Click activity card - should open detail modal
- [ ] Close modal - should return to feed

#### Tablet (768px)
- [ ] Layout still shows 50/50 split or breaks to mobile stack?
- [ ] Filter tabs are scrollable horizontally
- [ ] Modal fits within viewport
- [ ] Touch interactions work (if on real device)

#### Mobile (<768px)
- [ ] OfficeMap and ActivityFeed stack vertically
- [ ] OfficeMap on top, ActivityFeed below
- [ ] Can scroll through activities (internal scroll)
- [ ] Modal is full-height minus padding
- [ ] Filter tabs scroll horizontally
- [ ] Connection status visible

#### Real-time Sync Test
- [ ] Open app in browser 1
- [ ] In browser 2 (admin), create new activity
- [ ] Should appear in browser 1 feed immediately (< 1 second)
- [ ] Should prepend to top of list

#### Approval Flow Test
- [ ] Create activity with requires_approval = true
- [ ] See "✓ Aprovar" and "✗ Rejeitar" buttons
- [ ] Click approve - buttons show "..." while loading
- [ ] Activity updates with "✓ Aprovado" badge
- [ ] Buttons disappear after approval

#### Error Handling Test
- [ ] Unplug network while activity feed is open
- [ ] Should see "Offline" status within 5 seconds
- [ ] Should still be able to see cached activities
- [ ] Reconnect network
- [ ] Should see "Conectado" within 5 seconds

---

## Performance Checklist

- [ ] Activities array capped at 100 (no memory leak)
- [ ] Subscriptions unsubscribed on unmount
- [ ] No infinite re-renders (check React DevTools Profiler)
- [ ] Polling stops when subscription reconnects
- [ ] Modal doesn't cause performance issues when opened

---

## Accessibility Checklist

- [ ] Connection status indicator has semantic meaning (color + text)
- [ ] Filter buttons are keyboard accessible (Tab navigation)
- [ ] Modal is dismissible with Escape key
- [ ] Activity cards have sufficient contrast
- [ ] Loading skeleton animation doesn't cause motion sickness (respects prefers-reduced-motion)

---

## Deployment Readiness Checklist

- [ ] All 3 MEDIUM issues fixed
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Manual testing on desktop, tablet, mobile complete
- [ ] Real-time sync tested with multiple users
- [ ] Error handling tested (offline, API failures)
- [ ] Performance verified (no memory leaks)
- [ ] Accessibility verified (keyboard, contrast, motion)
- [ ] PR created and reviewed
- [ ] Database migration applied (if needed)

---

## Timeline

**Estimated Work:**
- Fix #1 (Stale closure): 5 min
- Fix #2 (Loading state): 10 min
- Fix #3 (DELETE event): 10 min
- Fix #4 & #5 (Minor): 5 min
- Unit tests: 45 min
- Integration tests: 30 min
- Manual testing: 30 min

**Total: ~2.5 hours**

---

**Generated by:** Quinn (QA Agent)
**Date:** 2026-02-16
**Status:** Ready for developer implementation
