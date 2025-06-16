# Core Requirements

This README consolidates earlier summaries and is the primary reference for the TODO Timer Dashboard core requirements.

This document summarizes the essential behaviors for the TODO Timer Dashboard application.

- Only **one task** can be active at a time.
- Tasks move between lists:
  - Activate a task by dragging it from the To‑Do List into the Active box.
  - Deactivating a task returns it to the **top** of the To‑Do List.
  - Completed tasks are placed in the Cleared/Done List.
- New tasks are added using the `Add new task` input with support for `#tags` and priority via `!`.
- Each task tracks the total time it was active for the day.
- Timers pause at the configured end of day and resume at the next day start.
- Users can pick different days to review using the date picker in the Recap section.
- All tags used across tasks are shown in the Tags List. Selecting a tag filters the tasks, and dragging a tag onto a task assigns it.

For a more detailed explanation of the UI, see [REQUIREMENTS.md](../REQUIREMENTS.md).

## TodoTask Interface

The application represents each task using the following TypeScript interface:

```ts
export interface ActivePeriod {
  start: number;
  end: number | null;
}

export interface TodoTask {
  id: string;
  title: string;
  details?: string;
  tags: string[];
  priority?: number;
  borderColor?: string;
  activePeriods: ActivePeriod[];
  totalTimeToday: number;
  createdAt: number;
  updatedAt: number;
  isDone: boolean;
}
```

This interface lives in [`src/lib/types.ts`](../src/lib/types.ts).
