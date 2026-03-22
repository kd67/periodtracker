export interface NotificationRecord {
  id: string;
  reminderType: 'D-7' | 'D-3' | 'D-1';
  sentAt: string;
}

export class NotificationManager {
  private STORAGE_KEY = 'period_notifications_sent';

  private getNotifications(): NotificationRecord[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveNotifications(records: NotificationRecord[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
  }

  hasNotificationBeenSent(reminderType: 'D-7' | 'D-3' | 'D-1', nextPeriodDate: string): boolean {
    const notifications = this.getNotifications();
    const today = new Date().toISOString().split('T')[0];

    return notifications.some(
      (n) => n.reminderType === reminderType && n.sentAt === today
    );
  }

  recordNotificationSent(reminderType: 'D-7' | 'D-3' | 'D-1'): void {
    const notifications = this.getNotifications();
    const today = new Date().toISOString().split('T')[0];

    notifications.push({
      id: `${reminderType}-${today}`,
      reminderType,
      sentAt: today,
    });

    this.saveNotifications(notifications);
  }

  clearOldNotifications(nextPeriodDate: string): void {
    const notifications = this.getNotifications();
    const today = new Date().toISOString().split('T')[0];
    const nextDate = new Date(nextPeriodDate);
    const todayDate = new Date(today);

    const filtered = notifications.filter((n) => {
      const sentDate = new Date(n.sentAt);
      return sentDate >= new Date(todayDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    });

    this.saveNotifications(filtered);
  }

  sendNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(244, 63, 94)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgb(244, 63, 94)"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        ...options,
      });
    }
  }
}

export const notificationManager = new NotificationManager();
