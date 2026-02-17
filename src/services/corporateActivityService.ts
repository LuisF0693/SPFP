/**
 * Corporate Activity Service
 * Handles real-time subscriptions and polling for corporate activities
 *
 * Architecture:
 * - Primary: Supabase Realtime (postgres_changes)
 * - Fallback: Polling every 5 seconds
 * - Error Recovery: Exponential backoff
 */

import { supabase } from '@/supabase';
import { CorporateActivity, Department } from '@/types/corporate';
import { withErrorRecovery } from './errorRecovery';

let pollingInterval: NodeJS.Timeout | null = null;

/**
 * Subscribes to real-time activity updates for a user
 * - Filters by user_id
 * - Handles INSERT, UPDATE, DELETE events
 * - Provides JOIN/LEAVE system events for connection status
 * - Returns unsubscribe function
 */
export function subscribeToActivities(
  userId: string,
  onActivity: (activity: CorporateActivity) => void,
  onError: (error: Error) => void
): () => void {
  const channel = supabase
    .channel(`corporate-activities-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'corporate_activities',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onActivity(payload.new as CorporateActivity);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'corporate_activities',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onActivity(payload.new as CorporateActivity);
      }
    )
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
    .on('system', { event: 'JOIN' }, () => {
      console.log('Realtime connected');
    })
    .on('system', { event: 'LEAVE' }, () => {
      console.log('Realtime disconnected - fallback to polling');
      onError(new Error('Realtime connection lost'));
    })
    .subscribe((status) => {
      if (status === 'CLOSED') {
        onError(new Error('Subscription closed'));
      }
    });

  return () => {
    channel.unsubscribe();
  };
}

/**
 * One-time fetch of activities with pagination
 * Used for initial load and polling fallback
 */
export async function fetchActivities(
  userId: string,
  limit: number = 100,
  offset: number = 0
): Promise<CorporateActivity[]> {
  return withErrorRecovery(
    async () => {
      const { data, error } = await supabase
        .from('corporate_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    },
    'Fetch activities',
    { maxRetries: 3, userId }
  );
}

/**
 * Starts polling for activities every 5 seconds
 * Used as fallback when Realtime connection fails
 */
export function startPollingActivities(
  userId: string,
  onActivities: (activities: CorporateActivity[]) => void
): () => void {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(async () => {
    try {
      const activities = await fetchActivities(userId, 100, 0);
      onActivities(activities);
    } catch (error) {
      console.error('Polling failed:', error);
    }
  }, 5000);

  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
}

/**
 * Creates a new activity (for testing/demo purposes)
 * In production, activities are created by backend/agents
 */
export async function createActivity(
  data: Partial<CorporateActivity>
): Promise<CorporateActivity> {
  return withErrorRecovery(
    async () => {
      const { data: created, error } = await supabase
        .from('corporate_activities')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return created as CorporateActivity;
    },
    'Create activity',
    { maxRetries: 2 }
  );
}

/**
 * Updates an activity (approval, status change, etc)
 */
export async function updateActivity(
  id: string,
  updates: Partial<CorporateActivity>
): Promise<CorporateActivity> {
  return withErrorRecovery(
    async () => {
      const { data: updated, error } = await supabase
        .from('corporate_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as CorporateActivity;
    },
    'Update activity',
    { maxRetries: 2 }
  );
}

/**
 * Approves an activity that requires approval
 */
export async function approveActivity(
  id: string,
  approvedBy: string
): Promise<CorporateActivity> {
  return withErrorRecovery(
    async () => {
      const { data: updated, error } = await supabase
        .from('corporate_activities')
        .update({
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as CorporateActivity;
    },
    'Approve activity',
    { maxRetries: 2 }
  );
}

/**
 * Rejects an activity that requires approval
 */
export async function rejectActivity(
  id: string,
  rejectedBy: string
): Promise<CorporateActivity> {
  return withErrorRecovery(
    async () => {
      const { data: updated, error } = await supabase
        .from('corporate_activities')
        .update({
          rejected_at: new Date().toISOString(),
          rejected_by: rejectedBy,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as CorporateActivity;
    },
    'Reject activity',
    { maxRetries: 2 }
  );
}

/**
 * Deletes an activity (soft delete via RLS policy)
 */
export async function deleteActivity(id: string): Promise<void> {
  return withErrorRecovery(
    async () => {
      const { error } = await supabase
        .from('corporate_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    'Delete activity',
    { maxRetries: 2 }
  );
}

/**
 * Helper to filter activities by department
 */
export function filterActivitiesByDepartment(
  activities: CorporateActivity[],
  department: Department | 'all'
): CorporateActivity[] {
  if (department === 'all') return activities;
  return activities.filter((a) => a.department === department);
}
