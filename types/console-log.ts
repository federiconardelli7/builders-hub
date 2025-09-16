// Simple notification type
export type ConsoleLogStatus = 'success' | 'error' | 'warning' | 'info';
export interface ConsoleLog {
  id: string;
  timestamp: Date;
  status: ConsoleLogStatus;
  title: string;
  description?: string;
  eventType?: string; // Optional simple string for categorization
  data?: Record<string, any>; // Flexible data object
}