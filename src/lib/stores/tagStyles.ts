import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface TagStyle {
  name: string;
  bg: string;
  fg: string;
  border: string;
}

function createTagStyles() {
  const initial: Record<string, TagStyle> =
    browser && localStorage.getItem('tagStyles')
      ? JSON.parse(localStorage.getItem('tagStyles')!)
      : {};

  const store = writable<Record<string, TagStyle>>(initial);

  if (browser) {
    store.subscribe((val) => {
      localStorage.setItem('tagStyles', JSON.stringify(val));
    });
  }

  return store;
}

export const tagStyles = createTagStyles();

export function ensureTagStyle(name: string) {
  tagStyles.update((styles) => {
    if (!styles[name]) {
      styles[name] = { name, bg: '#eee', fg: '#000', border: '#ccc' };
    }
    return styles;
  });
}
