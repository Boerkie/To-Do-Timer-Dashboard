// backend.ts
export const POCKETBASE_BACKEND = 'pocketbase';

export const usesPocketBaseBackend =
  import.meta.env.VITE_BOARD_REPOSITORY === POCKETBASE_BACKEND ||
  import.meta.env.VITE_TASK_REPOSITORY === POCKETBASE_BACKEND;
