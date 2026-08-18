// tasks.ts
import { derived, writable } from 'svelte/store';
import type { TodoTask } from '$lib/types';
import { createLocalTaskRepository } from '$lib/repositories/localTaskRepository';
import type { TaskRepositoryResult } from '$lib/repositories/taskRepository';
import { tagFilter, tagFilterAnd, priorityFilter } from './ui';

const DEFAULT_PRIORITY = 4;
const taskRepository = createLocalTaskRepository();

export const tasks = taskRepository.tasks;

export function activateTask(taskId: string): TaskRepositoryResult {
  return taskRepository.activateTask(taskId);
}

export function deactivateTask(taskId: string): TaskRepositoryResult {
  return taskRepository.deactivateTask(taskId);
}

export function clearTask(taskId: string): TaskRepositoryResult {
  return taskRepository.clearTask(taskId);
}

export function reorderTodo(taskId: string, beforeId: string | null): TaskRepositoryResult {
  return taskRepository.reorderTodo(taskId, beforeId);
}

export function moveToTop(taskId: string): TaskRepositoryResult {
  return taskRepository.moveToTop(taskId);
}

export function renameTag(oldName: string, newName: string): TaskRepositoryResult {
  return taskRepository.renameTag(oldName, newName);
}

export function cyclePriority(taskId: string): TaskRepositoryResult {
  return taskRepository.cyclePriority(taskId);
}

export function renameTask(taskId: string, newName: string): TaskRepositoryResult {
  return taskRepository.renameTask(taskId, newName);
}

export function changeBorder(taskId: string, borderColor: string): TaskRepositoryResult {
  return taskRepository.changeBorder(taskId, borderColor);
}

export function resetBorder(taskId: string): TaskRepositoryResult {
  return taskRepository.resetBorder(taskId);
}

export function addTag(taskId: string, tagName: string): TaskRepositoryResult {
  return taskRepository.addTag(taskId, tagName);
}

export function removeTag(taskId: string, tagName: string): TaskRepositoryResult {
  return taskRepository.removeTag(taskId, tagName);
}

export function updateTaskDetails(taskId: string, details: string): TaskRepositoryResult {
  return taskRepository.updateTaskDetails(taskId, details);
}

export function deleteTask(taskId: string): TaskRepositoryResult {
  return taskRepository.deleteTask(taskId);
}

export function addTask(input: string): TaskRepositoryResult {
  return taskRepository.addTask(input);
}

function isTaskActive(task: TodoTask): boolean {
  const lastPeriod = task.activePeriods[task.activePeriods.length - 1];
  return !!lastPeriod && lastPeriod.end === null;
}

export const activeTask = derived(tasks, ($tasks) =>
  $tasks.find((task) => !task.isDone && isTaskActive(task)) || null
);

export const clearedTasks = derived(tasks, ($tasks) =>
  $tasks.filter((task) => task.isDone)
);

export const todoTasks = derived(
  [tasks, tagFilter, tagFilterAnd, priorityFilter],
  ([$tasks, $filter, $and, $priority]) => {
    let filteredTasks = $tasks.filter((task) => !task.isDone && !isTaskActive(task));

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

export const tags = derived(tasks, ($tasks) => {
  const tagSet = new Set<string>();
  $tasks.forEach((task) => task.tags.forEach((tagName) => tagSet.add(tagName)));
  return Array.from(tagSet).sort((firstTag, secondTag) =>
    firstTag.localeCompare(secondTag, undefined, { sensitivity: 'base' })
  );
});

export const selectedDate = writable(new Date());
