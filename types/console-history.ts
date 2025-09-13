// Simple notification type
export type NotificationStatus = 'success' | 'error' | 'warning' | 'info';
export interface Notification {
  id: string;
  timestamp: Date;
  status: NotificationStatus;
  title: string;
  description?: string;
  eventType?: string; // Optional simple string for categorization
  data?: Record<string, any>; // Flexible data object
}