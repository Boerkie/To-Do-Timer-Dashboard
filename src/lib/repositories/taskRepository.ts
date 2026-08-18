// taskRepository.ts
import type { Writable } from 'svelte/store';
import type { TodoTask } from '$lib/types';

export type TaskRepositoryResult = void | Promise<void>;

export interface TaskRepository {
  tasks: Writable<TodoTask[]>;
  activateTask(taskId: string): TaskRepositoryResult;
  deactivateTask(taskId: string): TaskRepositoryResult;
  clearTask(taskId: string): TaskRepositoryResult;
  reorderTodo(taskId: string, beforeId: string | null): TaskRepositoryResult;
  moveToTop(taskId: string): TaskRepositoryResult;
  renameTag(oldName: string, newName: string): TaskRepositoryResult;
  cyclePriority(taskId: string): TaskRepositoryResult;
  renameTask(taskId: string, newName: string): TaskRepositoryResult;
  changeBorder(taskId: string, borderColor: string): TaskRepositoryResult;
  resetBorder(taskId: string): TaskRepositoryResult;
  addTag(taskId: string, tagName: string): TaskRepositoryResult;
  removeTag(taskId: string, tagName: string): TaskRepositoryResult;
  updateTaskDetails(taskId: string, details: string): TaskRepositoryResult;
  deleteTask(taskId: string): TaskRepositoryResult;
  addTask(input: string): TaskRepositoryResult;
}
