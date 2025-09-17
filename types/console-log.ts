// Simple notification type
export type ConsoleLogStatus = 'success' | 'error' | 'warning' | 'info';
export interface ConsoleLog {
  id: string;
  timestamp: Date;
  status: ConsoleLogStatus;
  eventType: string;
  data: Record<string, any>;
}