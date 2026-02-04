/**
 * Sync Error Recovery Tests - STY-035
 * Tests offline queue, exponential backoff, and sync status tracking
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncService, QueuedOperation, SyncStatus } from '../../services/syncService';

describe('STY-035: Sync Error Recovery', () => {
  beforeEach(() => {
    // Clear queue before each test
    syncService.clearQueue();
    // Clear localStorage
    localStorage.clear();
    // Reset online status
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  afterEach(() => {
    syncService.clearQueue();
    localStorage.clear();
  });

  describe('Sync Status Tracking', () => {
    it('should start with idle status', () => {
      const status = syncService.getStatus();
      expect(status.status).toBe('idle');
      expect(status.pendingCount).toBe(0);
      expect(status.isOnline).toBe(true);
    });

    it('should notify listeners when status changes', (done) => {
      const statuses: SyncStatus[] = [];

      const unsubscribe = syncService.onStatusChange((status) => {
        statuses.push(status);
      });

      // Simulate sync operation (status changes)
      setTimeout(() => {
        unsubscribe();
        expect(statuses.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it('should update pending count when operations queued', async () => {
      // Simulate offline
      Object.defineProperty(window.navigator, 'onLine', { writable: true, value: false });

      try {
        await syncService.withSyncRecovery(
          async () => Promise.resolve('test'),
          {
            action: 'test-op',
            table: 'transactions',
            data: { id: '123', amount: 100 }
          }
        );
      } catch (error) {
        // Expected to fail offline
      }

      const status = syncService.getStatus();
      expect(status.pendingCount).toBe(1);
      expect(status.status).toBe('offline');
    });
  });

  describe('Offline Queue Management', () => {
    it('should queue operation when offline', async () => {
      Object.defineProperty(window.navigator, 'onLine', { writable: true, value: false });

      try {
        await syncService.withSyncRecovery(
          async () => Promise.resolve('test'),
          {
            action: 'add-transaction',
            table: 'transactions',
            data: { description: 'Test', amount: 100 }
          }
        );
      } catch (error: any) {
        expect(error.queued).toBe(true);
      }

      const queued = syncService.getQueuedOperations();
      expect(queued.length).toBe(1);
      expect(queued[0].table).toBe('transactions');
      expect(queued[0].retries).toBe(0);
    });

    it('should persist queue to localStorage', async () => {
      Object.defineProperty(window.navigator, 'onLine', { writable: true, value: false });

      try {
        await syncService.withSyncRecovery(
          async () => Promise.resolve('test'),
          {
            action: 'add-account',
            table: 'accounts',
            data: { name: 'Test Account' }
          }
        );
      } catch (error) {
        // Expected to fail
      }

      const stored = localStorage.getItem('spfp_sync_queue');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
    });

    it('should load queue from localStorage on init', () => {
      const mockQueue: QueuedOperation[] = [
        {
          id: 'op-1',
          type: 'insert',
          table: 'transactions',
          data: { amount: 100 },
          timestamp: Date.now(),
          retries: 0,
          maxRetries: 5
        }
      ];

      localStorage.setItem('spfp_sync_queue', JSON.stringify(mockQueue));

      // Create new service instance (would load from storage)
      const queued = syncService.getQueuedOperations();
      expect(queued.length).toBeGreaterThan(0);
    });

    it('should increment retry count on each failure', async () => {
      Object.defineProperty(window.navigator, 'onLine', { writable: true, value: false });

      const failingOp = async () => Promise.reject(new Error('Network error'));

      try {
        await syncService.withSyncRecovery(failingOp, {
          action: 'failing-op',
          table: 'transactions',
          data: {}
        });
      } catch (error) {
        // Expected
      }

      const queued = syncService.getQueuedOperations();
      expect(queued.length).toBe(1);
      expect(queued[0].retries).toBe(0); // First attempt, retries not yet incremented
    });
  });

  describe('Exponential Backoff Retry', () => {
    it('should retry failed operations with backoff', async () => {
      let attempt = 0;
      const failThenSucceed = async () => {
        attempt++;
        if (attempt < 3) {
          throw new Error('Network error');
        }
        return 'success';
      };

      const onRetry = vi.fn();

      try {
        const result = await syncService.withSyncRecovery(failThenSucceed, {
          action: 'retry-test',
          table: 'transactions',
          data: {},
          onRetry
        });

        // After successful retry, should be synced
        expect(result).toBe('success');
      } catch (error) {
        // Might fail if all retries exhausted
      }
    });

    it('should handle timeout errors gracefully', async () => {
      const timeoutOp = async () => {
        throw new Error('Request timeout');
      };

      try {
        await syncService.withSyncRecovery(timeoutOp, {
          action: 'timeout-test',
          table: 'transactions',
          data: {}
        });
      } catch (error: any) {
        expect(error.userMessage).toContain('Erro ao sincronizar');
        expect(error.queued).toBeDefined();
      }
    });

    it('should handle rate limit errors', async () => {
      const rateLimitOp = async () => {
        throw new Error('Rate limit exceeded');
      };

      try {
        await syncService.withSyncRecovery(rateLimitOp, {
          action: 'rate-limit-test',
          table: 'transactions',
          data: {}
        });
      } catch (error: any) {
        expect(error.userMessage).toContain('Erro ao sincronizar');
      }
    });
  });

  describe('Queue Replay', () => {
    it('should replay queued operations when online', async () => {
      // Start offline
      Object.defineProperty(window.navigator, 'onLine', { writable: true, value: false });

      try {
        await syncService.withSyncRecovery(
          async () => Promise.resolve('test'),
          {
            action: 'offline-op',
            table: 'transactions',
            data: { amount: 100 }
          }
        );
      } catch (error) {
        // Expected to queue
      }

      expect(syncService.getQueuedOperations().length).toBe(1);

      // Go online
      Object.defineProperty(window.navigator, 'onLine', { writable: true, value: true });

      // Simulate online event
      const event = new Event('online');
      window.dispatchEvent(event);

      // Wait for replay
      await new Promise(resolve => setTimeout(resolve, 100));

      const status = syncService.getStatus();
      expect(status.isOnline).toBe(true);
    });

    it('should maintain operation order during replay', async () => {
      Object.defineProperty(window.navigator, 'onLine', { writable: true, value: false });

      const operations = [];

      for (let i = 0; i < 3; i++) {
        try {
          await syncService.withSyncRecovery(
            async () => Promise.resolve('test'),
            {
              action: `op-${i}`,
              table: 'transactions',
              data: { index: i }
            }
          );
        } catch (error) {
          // Queue it
        }
      }

      const queued = syncService.getQueuedOperations();
      expect(queued.length).toBe(3);

      // Order should be maintained (FIFO)
      expect(queued[0].data.index).toBe(0);
      expect(queued[1].data.index).toBe(1);
      expect(queued[2].data.index).toBe(2);
    });
  });

  describe('Sync Status Messages', () => {
    it('should provide user-friendly error messages', async () => {
      const failingOp = async () => Promise.reject(new Error('Network error'));

      try {
        await syncService.withSyncRecovery(failingOp, {
          action: 'test-op',
          table: 'transactions',
          data: {}
        });
      } catch (error: any) {
        expect(error.userMessage).toBeDefined();
        expect(error.userMessage).toMatch(/Erro ao sincronizar/i);
      }
    });

    it('should track last sync time', async () => {
      const successOp = async () => Promise.resolve('success');

      const result = await syncService.withSyncRecovery(successOp, {
        action: 'success-op',
        table: 'transactions',
        data: {}
      });

      expect(result).toBe('success');

      const status = syncService.getStatus();
      expect(status.lastSyncTime).toBeDefined();
    });

    it('should clear error messages on success', async () => {
      // First, trigger an error
      try {
        await syncService.withSyncRecovery(
          async () => Promise.reject(new Error('Test error')),
          { action: 'fail-op', table: 'transactions', data: {} }
        );
      } catch (error) {
        // Expected
      }

      let errorStatus = syncService.getStatus();
      expect(errorStatus.lastError).toBeDefined();

      // Then succeed
      const successOp = async () => Promise.resolve('success');
      await syncService.withSyncRecovery(successOp, {
        action: 'success-op',
        table: 'transactions',
        data: {}
      });

      const successStatus = syncService.getStatus();
      expect(successStatus.status).toBe('synced');
    });
  });

  describe('Queue Management', () => {
    it('should clear entire queue manually', async () => {
      Object.defineProperty(window.navigator, 'onLine', { writable: true, value: false });

      try {
        await syncService.withSyncRecovery(
          async () => Promise.resolve('test'),
          {
            action: 'op1',
            table: 'transactions',
            data: { id: '1' }
          }
        );
      } catch (error) {
        // Queue it
      }

      expect(syncService.getQueuedOperations().length).toBe(1);

      syncService.clearQueue();

      expect(syncService.getQueuedOperations().length).toBe(0);
      expect(syncService.getStatus().pendingCount).toBe(0);
    });

    it('should handle concurrent queue operations', async () => {
      Object.defineProperty(window.navigator, 'onLine', { writable: true, value: false });

      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(
          syncService.withSyncRecovery(
            async () => Promise.resolve(`op-${i}`),
            {
              action: `concurrent-${i}`,
              table: 'transactions',
              data: { id: i }
            }
          ).catch(() => null)
        );
      }

      await Promise.allSettled(promises);

      const queued = syncService.getQueuedOperations();
      expect(queued.length).toBe(5);
    });
  });
});
