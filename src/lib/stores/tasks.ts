import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { TodoTask } from '$lib/types';

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
