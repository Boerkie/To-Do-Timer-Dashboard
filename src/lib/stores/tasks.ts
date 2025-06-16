import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { TodoTask } from '$lib/types';

/** Parse an input string and extract tags prefixed with '#'.
 * Returns the cleaned title and array of tags.
 */
function parseInput(input: string): { title: string; tags: string[] } {
  const tags: string[] = [];
  const withoutTags = input.replace(/#([A-Za-z0-9_-]+)/g, (_, tag) => {
    tags.push(tag);
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

  const store = writable<TodoTask[]>(initial);

  if (browser) {
    store.subscribe((value) => {
      localStorage.setItem('tasks', JSON.stringify(value));
    });
  }

  return store;
}

export const tasks = createTasks();

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
