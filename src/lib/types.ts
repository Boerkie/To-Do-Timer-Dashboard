export interface ActivePeriod {
  start: number; // Epoch timestamp when active period started
  end: number | null; // Epoch timestamp when active period ended, or null if currently active
}

export interface TodoTask {
  id: string; // Unique identifier (UUID)
  title: string; // Short title or label for the task
  details?: string; // Optional long description/details
  tags: string[]; // Array of tags
  priority?: number; // Optional priority (lower is higher priority)
  borderColor?: string; // Optional border color for UI
  activePeriods: ActivePeriod[];
  totalTimeToday: number; // Milliseconds total active time for current day
  createdAt: number; // Creation timestamp
  updatedAt: number; // Last updated timestamp
  isDone: boolean; // Completed/cleared status
}

export type TodoTaskList = TodoTask[];
