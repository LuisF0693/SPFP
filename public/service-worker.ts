/**
 * Service Worker
 * FASE 3: STY-082 (Service Worker Setup)
 *
 * Handles offline caching and background sync
 */

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'spfp-v1';
const OFFLINE_CACHE = 'spfp-offline-v1';
const API_CACHE = 'spfp-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

const API_ROUTES = [
  '/api/transactions',
  '/api/accounts',
  '/api/budgets',
  '/api/goals',
  '/api/investments',
  '/api/retirement'
];

// Install event - cache essential assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      await cache.addAll(STATIC_ASSETS);
      self.skipWaiting();
    })()
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== OFFLINE_CACHE && name !== API_CACHE && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
      self.clients.claim();
    })()
  );
});

// Fetch event - implement offline-first strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleAssetRequest(request));
  }
});

/**
 * Handle API requests with offline fallback
 */
async function handleAPIRequest(request: Request): Promise<Response> {
  try {
    // Try network first
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fallback to cache if network fails
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: 'Offline - Data may not be up to date',
        cached: false,
        timestamp: Date.now()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Handle asset requests
 */
async function handleAssetRequest(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html') || new Response('Offline');
    }

    return new Response('Offline', { status: 503 });
  }
}

/**
 * Background Sync - sync pending data when online
 */
self.addEventListener('sync' as any, (event: any) => {
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData(): Promise<void> {
  try {
    // Retrieve pending operations from IndexedDB
    const pendingOps = await getPendingOperations();

    // Process each pending operation
    for (const op of pendingOps) {
      try {
        await fetch(op.url, {
          method: op.method,
          headers: op.headers,
          body: op.body ? JSON.stringify(op.body) : undefined
        });

        // Mark as synced
        await removePendingOperation(op.id);

        // Notify clients about successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              operation: op.id
            });
          });
        });
      } catch (error) {
        console.error(`Failed to sync operation ${op.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

/**
 * Get pending operations from IndexedDB
 */
async function getPendingOperations(): Promise<any[]> {
  // Placeholder - implement with IndexedDB
  return [];
}

/**
 * Remove pending operation
 */
async function removePendingOperation(id: string): Promise<void> {
  // Placeholder - implement with IndexedDB
}

/**
 * Message handler - sync triggers from client
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SYNC_PENDING') {
    event.waitUntil(syncPendingData());
  }
});

export {};
