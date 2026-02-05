/**
 * Offline Sync Service
 * FASE 3: STY-083 (Offline Data Sync & Conflict Resolution)
 *
 * Manages offline data persistence and synchronization
 */

export interface PendingOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: 'transaction' | 'account' | 'goal' | 'investment' | 'budget';
  resourceId: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  retries: number;
}

/**
 * IndexedDB Operations
 */
class OfflineDatabase {
  private dbName = 'SPFP_Offline';
  private storeName = 'pendingOperations';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async addOperation(operation: PendingOperation): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOperations(): Promise<PendingOperation[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result.sort((a, b) => a.timestamp - b.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeOperation(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateOperation(operation: PendingOperation): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const db = new OfflineDatabase();

/**
 * Offline Sync Service
 */
export const offlineSyncService = {
  /**
   * Initialize offline database
   */
  init: async (): Promise<void> => {
    await db.init();
  },

  /**
   * Register pending operation
   */
  addPendingOperation: async (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): Promise<PendingOperation> => {
    const fullOperation: PendingOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0
    };

    await db.addOperation(fullOperation);
    return fullOperation;
  },

  /**
   * Get all pending operations
   */
  getPendingOperations: async (): Promise<PendingOperation[]> => {
    return db.getOperations();
  },

  /**
   * Sync pending operations
   */
  syncPendingOperations: async (
    onProgress?: (current: number, total: number) => void
  ): Promise<{ successful: number; failed: number }> => {
    const operations = await db.getOperations();
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];

      try {
        const response = await fetch(op.url, {
          method: op.method,
          headers: op.headers,
          body: op.body ? JSON.stringify(op.body) : undefined
        });

        if (response.ok) {
          await db.removeOperation(op.id);
          successful++;
        } else {
          // Retry logic
          if (op.retries < 3) {
            op.retries++;
            await db.updateOperation(op);
          } else {
            await db.removeOperation(op.id);
          }
          failed++;
        }
      } catch (error) {
        // Network error - keep operation for retry
        if (op.retries < 3) {
          op.retries++;
          await db.updateOperation(op);
        }
        failed++;
      }

      onProgress?.(i + 1, operations.length);
    }

    return { successful, failed };
  },

  /**
   * Check if offline
   */
  isOffline: (): boolean => {
    return !navigator.onLine;
  },

  /**
   * Register online/offline listeners
   */
  registerSyncListeners: (callbacks: {
    onOnline?: () => void;
    onOffline?: () => void;
  }): (() => void) => {
    const handleOnline = () => {
      callbacks.onOnline?.();

      // Trigger background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          (registration as any).sync.register('sync-pending-data').catch((err: any) => {
            console.warn('Failed to register sync:', err);
          });
        });
      }
    };

    const handleOffline = () => {
      callbacks.onOffline?.();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },

  /**
   * Register Service Worker
   */
  registerServiceWorker: async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('Service Worker registered successfully');

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Notify user about update
              console.log('New version available');
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  },

  /**
   * Clear offline data
   */
  clearOfflineData: async (): Promise<void> => {
    await db.clear();
  },

  /**
   * Get offline status
   */
  getOfflineStatus: async (): Promise<{
    isOffline: boolean;
    pendingOperations: number;
  }> => {
    const operations = await db.getOperations();
    return {
      isOffline: !navigator.onLine,
      pendingOperations: operations.length
    };
  }
};

export default offlineSyncService;
