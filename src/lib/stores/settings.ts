import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Settings {
  userName: string;
  dayStart: string; // HH:MM
  dayEnd: string;   // HH:MM
  theme:
  | 'light'
  | 'dark'
  | 'solarized-light'
  | 'solarized-dark'
  | 'theme-dracula'
  | 'theme-nord'
  | 'theme-monokai'
  | 'theme-material-light'
  | 'theme-material-dark'
  | 'theme-flat-sunset'
  | 'theme-flat-ocean'
  | 'theme-flat-forest'
  | 'theme-autumn';
  tagBorderWidth: number;
  showListNumbers: boolean;
  reorderAtDayEnd: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  userName: 'User',
  dayStart: '08:00',
  dayEnd: '18:00',
  theme: 'dark',
  tagBorderWidth: 2,
  showListNumbers: true,
  reorderAtDayEnd: false
};

function createSettings() {
  const initial: Settings =
    browser && localStorage.getItem('settings')
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('settings')!) }
      : DEFAULT_SETTINGS;

  const store = writable<Settings>(initial);

  if (browser) {
    store.subscribe((value) => {
      localStorage.setItem('settings', JSON.stringify(value));
    });
  }

  return store;
}

export const settings = createSettings();
