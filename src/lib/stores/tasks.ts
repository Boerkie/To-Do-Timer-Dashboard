import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { TodoTask } from '$lib/types';
import { ensureTagStyle } from './tagStyles';

/** Parse an input string and extract tags prefixed with '#'.
 * Returns the cleaned title and array of tags.
 */
function parseInput(input: string): { title: string; tags: string[] } {
  const tags: string[] = [];
  const withoutTags = input.replace(/#([A-Za-z0-9_-]+)/g, (_, tag) => {
    tags.push(tag);
    ensureTagStyle(tag);
    return '';
  });
  return { title: withoutTags.trim(), tags };
}

function createTask(title: string, tags: string[]): TodoTask {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    tags,
    activePeriods: [],
    totalTimeToday: 0,
    createdAt: now,
    updatedAt: now,
    isDone: false
  };
}

function createTasks() {
  const initial: TodoTask[] =
    browser && localStorage.getItem('tasks')
      ? JSON.parse(localStorage.getItem('tasks')!)
      : [];

  initial.forEach((t) => t.tags.forEach((tag) => ensureTagStyle(tag)));

  const store = writable<TodoTask[]>(initial);

  if (browser) {
    store.subscribe((value) => {
      localStorage.setItem('tasks', JSON.stringify(value));
    });
  }

  return store;
}

export const tasks = createTasks();

export function activateTask(id: string) {
  const now = Date.now();
  tasks.update((list) => {
    let previous: TodoTask | undefined;
    list.forEach((t) => {
      const last = t.activePeriods[t.activePeriods.length - 1];
      if (last && last.end === null) {
        last.end = now;
        previous = t;
      }
    });

    const task = list.find((t) => t.id === id);
    if (task) {
      task.activePeriods.push({ start: now, end: null });
      task.updatedAt = now;
    }

    if (previous && previous.id !== id) {
      const idx = list.findIndex((t) => t.id === previous!.id);
      if (idx > -1) {
        list.splice(idx, 1);
        list.unshift(previous!);
      }
    }
    return [...list];
  });
}

export function deactivateTask(id: string) {
  const now = Date.now();
  tasks.update((list) => {
    const task = list.find((t) => t.id === id);
    if (task) {
      const last = task.activePeriods[task.activePeriods.length - 1];
      if (last && last.end === null) {
        last.end = now;
      }
      task.updatedAt = now;
    }
    return [...list];
  });
}

export function clearTask(id: string) {
  tasks.update((list) => {
    const task = list.find((t) => t.id === id);
    if (task) {
      task.isDone = true;
      const last = task.activePeriods[task.activePeriods.length - 1];
      if (last && last.end === null) {
        last.end = Date.now();
      }
    }
    return [...list];
  });
}

export function reorderTodo(id: string, beforeId: string | null) {
  tasks.update((list) => {
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return list;
    const [task] = list.splice(idx, 1);
    if (beforeId) {
      const targetIndex = list.findIndex((t) => t.id === beforeId);
      if (targetIndex === -1) list.push(task);
      else list.splice(targetIndex, 0, task);
    } else {
      list.push(task);
    }
    return [...list];
  });
}

/** Add a new task from an input string. */
export function addTask(input: string): void {
  const { title, tags } = parseInput(input);
  if (!title && tags.length === 0) return;
  const task = createTask(title, tags);
  tasks.update((list) => [...list, task]);
}

function isTaskActive(t: TodoTask): boolean {
  const last = t.activePeriods[t.activePeriods.length - 1];
  return !!last && last.end === null;
}

export const activeTask = derived(tasks, ($tasks) =>
  $tasks.find((t) => !t.isDone && isTaskActive(t)) || null
);

export const clearedTasks = derived(tasks, ($tasks) =>
  $tasks.filter((t) => t.isDone)
);

export const todoTasks = derived(tasks, ($tasks) =>
  $tasks.filter((t) => !t.isDone && !isTaskActive(t))
);

export const tags = derived(tasks, ($tasks) => {
  const set = new Set<string>();
  $tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
  return Array.from(set);
});

export const selectedDate = writable(new Date());
