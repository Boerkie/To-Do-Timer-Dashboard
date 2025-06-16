import { writable } from 'svelte/store';

/** Whether the Cleared tasks section is visible */
export const showCleared = writable(false);

/** Selected tags for filtering the TODO list */
export const tagFilter = writable<string[]>([]);

/** True if filtering is by AND, false for OR */
export const tagFilterAnd = writable(true);
