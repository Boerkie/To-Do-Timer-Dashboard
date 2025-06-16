import { writable } from 'svelte/store';

/** Whether the Cleared tasks section is visible */
export const showCleared = writable(false);
