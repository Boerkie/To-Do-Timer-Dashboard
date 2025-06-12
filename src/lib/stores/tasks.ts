import { writable } from 'svelte/store';
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
