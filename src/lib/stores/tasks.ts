// tasks.ts
import { derived, writable } from 'svelte/store';
import type { TodoTask } from '$lib/types';
import { usesPocketBaseBackend } from '$lib/repositories/backend';
import { createLocalTaskRepository } from '$lib/repositories/localTaskRepository';
import { createPocketBaseTaskRepository } from '$lib/repositories/pocketBaseTaskRepository';
import type { TaskRepository } from '$lib/repositories/taskRepository';
import type { TaskRepositoryResult } from '$lib/repositories/taskRepository';
import { tagFilter, tagFilterAnd, priorityFilter } from './ui';
import { activeBoardId } from './boards';

const DEFAULT_PRIORITY = 4;
const taskRepository = createTaskRepository();

function createTaskRepository(): TaskRepository {
  return usesPocketBaseBackend
    ? createPocketBaseTaskRepository(activeBoardId)
    : createLocalTaskRepository(activeBoardId);
}

export const tasks = taskRepository.tasks;
export const taskCommandError = writable<string | null>(null);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Task update failed.';
}

function runTaskCommand(command: () => TaskRepositoryResult): TaskRepositoryResult {
  taskCommandError.set(null);

  try {
    const result = command();

    if (result && typeof (result as Promise<void>).then === 'function') {
      return (result as Promise<void>).catch((error) => {
        taskCommandError.set(getErrorMessage(error));
      });
    }

    return result;
  } catch (error) {
    taskCommandError.set(getErrorMessage(error));
  }
}

export function clearTaskCommandError(): void {
  taskCommandError.set(null);
}

export function activateTask(taskId: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.activateTask(taskId));
}

export function deactivateTask(taskId: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.deactivateTask(taskId));
}

export function clearTask(taskId: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.clearTask(taskId));
}

export function reorderTodo(taskId: string, beforeId: string | null): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.reorderTodo(taskId, beforeId));
}

export function moveToTop(taskId: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.moveToTop(taskId));
}

export function renameTag(oldName: string, newName: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.renameTag(oldName, newName));
}

export function cyclePriority(taskId: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.cyclePriority(taskId));
}

export function renameTask(taskId: string, newName: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.renameTask(taskId, newName));
}

export function changeBorder(taskId: string, borderColor: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.changeBorder(taskId, borderColor));
}

export function resetBorder(taskId: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.resetBorder(taskId));
}

export function addTag(taskId: string, tagName: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.addTag(taskId, tagName));
}

export function removeTag(taskId: string, tagName: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.removeTag(taskId, tagName));
}

export function updateTaskDetails(taskId: string, details: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.updateTaskDetails(taskId, details));
}

export function deleteTask(taskId: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.deleteTask(taskId));
}

export function addTask(input: string): TaskRepositoryResult {
  return runTaskCommand(() => taskRepository.addTask(input));
}

function isTaskActive(task: TodoTask): boolean {
  const lastPeriod = task.activePeriods[task.activePeriods.length - 1];
  return !!lastPeriod && lastPeriod.end === null;
}

export const activeBoardTasks = derived([tasks, activeBoardId], ([$tasks, $activeBoardId]) =>
  $activeBoardId ? $tasks.filter((task) => task.boardId === $activeBoardId) : []
);

export const activeTask = derived(activeBoardTasks, ($activeBoardTasks) =>
  $activeBoardTasks.find((task) => !task.isDone && isTaskActive(task)) || null
);

export const clearedTasks = derived(activeBoardTasks, ($activeBoardTasks) =>
  $activeBoardTasks.filter((task) => task.isDone)
);

export const todoTasks = derived(
  [activeBoardTasks, tagFilter, tagFilterAnd, priorityFilter],
  ([$activeBoardTasks, $filter, $and, $priority]) => {
    let filteredTasks = $activeBoardTasks.filter((task) => !task.isDone && !isTaskActive(task));

    if ($filter.length) {
      filteredTasks = filteredTasks.filter((task) =>
        $and
          ? $filter.every((tagName) => task.tags.includes(tagName))
          : $filter.some((tagName) => task.tags.includes(tagName))
      );
    }

    if ($priority !== null) {
      filteredTasks = filteredTasks.filter((task) => (task.priority ?? DEFAULT_PRIORITY) === $priority);
    }

    return filteredTasks;
  }
);

export const tags = derived(activeBoardTasks, ($activeBoardTasks) => {
  const tagSet = new Set<string>();
  $activeBoardTasks.forEach((task) => task.tags.forEach((tagName) => tagSet.add(tagName)));
  return Array.from(tagSet).sort((firstTag, secondTag) =>
    firstTag.localeCompare(secondTag, undefined, { sensitivity: 'base' })
  );
});

export const selectedDate = writable(new Date());
