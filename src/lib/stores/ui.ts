import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/** Whether the Cleared tasks section is visible (persisted) */
function createShowCleared() {
  const initial = browser ? localStorage.getItem('showCleared') === 'true' : false;
  const store = writable(initial);
  if (browser) {
    store.subscribe((val) => localStorage.setItem('showCleared', String(val)));
  }
  return store;
}
export const showCleared = createShowCleared();

/** Selected tags for filtering the TODO list */
export const tagFilter = writable<string[]>([]);

/** True if filtering is by AND, false for OR */
export const tagFilterAnd = writable(true);

/** Selected priority for filtering or null for all */
export const priorityFilter = writable<number | null>(null);
