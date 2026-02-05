/**
 * Push Notification Service
 * FASE 3: STY-084 (Push Notifications)
 *
 * Manages push notifications for financial alerts
 */

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Push Notification Service
 */
export const pushNotificationService = {
  /**
   * Request notification permission
   */
  requestPermission: async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      return Notification.requestPermission();
    }

    return 'denied';
  },

  /**
   * Send local notification
   */
  sendNotification: async (payload: PushNotificationPayload): Promise<void> => {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      if ('serviceWorker' in navigator && 'ServiceWorkerRegistration' in window) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192.png',
          badge: payload.badge || '/icon-192.png',
          tag: payload.tag,
          data: payload.data,
          actions: payload.actions,
          requireInteraction: false
        });
      } else {
        // Fallback to standard Notification API
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192.png',
          tag: payload.tag,
          data: payload.data
        });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  },

  /**
   * Send transaction alert
   */
  sendTransactionAlert: async (
    type: 'expense' | 'income',
    amount: number,
    category: string
  ): Promise<void> => {
    const title = type === 'expense' ? '💸 Despesa Registrada' : '💰 Receita Registrada';
    const body = `${category} - R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    await pushNotificationService.sendNotification({
      title,
      body,
      tag: `transaction-${Date.now()}`,
      data: { type, amount, category }
    });
  },

  /**
   * Send goal milestone alert
   */
  sendGoalAlert: async (goalName: string, progress: number): Promise<void> => {
    const title = '🎯 Progresso na Meta';
    const body = `${goalName} - ${progress.toFixed(0)}% alcançado`;

    await pushNotificationService.sendNotification({
      title,
      body,
      tag: `goal-${goalName}`,
      data: { goalName, progress }
    });
  },

  /**
   * Send budget alert
   */
  sendBudgetAlert: async (category: string, percentage: number): Promise<void> => {
    let severity = '⚠️';
    if (percentage >= 100) severity = '🚨';
    else if (percentage >= 80) severity = '⚠️';

    const title = `${severity} Alerta de Orçamento`;
    const body = `${category} - ${percentage.toFixed(0)}% do orçamento utilizado`;

    await pushNotificationService.sendNotification({
      title,
      body,
      tag: `budget-${category}`,
      data: { category, percentage }
    });
  },

  /**
   * Send investment alert
   */
  sendInvestmentAlert: async (assetName: string, change: number): Promise<void> => {
    const type = change > 0 ? '📈' : '📉';
    const title = `${type} Atualização de Investimento`;
    const body = `${assetName} - ${change > 0 ? '+' : ''}${change.toFixed(2)}%`;

    await pushNotificationService.sendNotification({
      title,
      body,
      tag: `investment-${assetName}`,
      data: { assetName, change }
    });
  },

  /**
   * Send retirement progress alert
   */
  sendRetirementAlert: async (scenario: string, yearsToRetirement: number): Promise<void> => {
    const title = '🎓 Progresso na Aposentadoria';
    const body = `Cenário ${scenario} - ${yearsToRetirement} anos para aposentadoria`;

    await pushNotificationService.sendNotification({
      title,
      body,
      tag: `retirement-${scenario}`,
      data: { scenario, yearsToRetirement }
    });
  },

  /**
   * Subscribe to push service
   */
  subscribeToPush: async (vapidPublicKey: string): Promise<PushSubscription | null> => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  },

  /**
   * Unsubscribe from push service
   */
  unsubscribeFromPush: async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        return await subscription.unsubscribe();
      }

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  },

  /**
   * Get push subscription status
   */
  getPushStatus: async (): Promise<{
    supported: boolean;
    permission: NotificationPermission;
    subscribed: boolean;
  }> => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    const permission = 'Notification' in window ? Notification.permission : 'denied';
    let subscribed = false;

    if (supported) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        subscribed = !!subscription;
      } catch (error) {
        console.error('Failed to check push subscription:', error);
      }
    }

    return { supported, permission, subscribed };
  },

  /**
   * Listen to notification clicks
   */
  onNotificationClick: (callback: (action: string, data: Record<string, any>) => void): (() => void) => {
    const handleClick = (event: NotificationEvent) => {
      const action = event.action || 'default';
      callback(action, event.notification.data);
      event.notification.close();
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event: ExtendableMessageEvent) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          callback(event.data.action, event.data.data);
        }
      });
    }

    return () => {
      // Cleanup
    };
  }
};

export default pushNotificationService;
