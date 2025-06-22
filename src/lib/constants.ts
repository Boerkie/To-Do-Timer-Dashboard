// constants.ts
// Priority color and label information for tasks
export const PRIORITY_LABELS: Record<number, string> = {
  1: 'P1 - Urgent',
  2: 'P2 - High',
  3: 'P3 - Normal',
  4: 'P4 - Low'
};
export const PRIORITY_COLORS: Record<number, string> = {
  1: '#ff5555',
  2: '#ff9900',
  3: '#22aa22',
  4: '#888888'
};

export const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'solarized-light', label: 'Solarized Light' },
  { value: 'solarized-dark', label: 'Solarized Dark' },
  { value: 'theme-dracula', label: 'Dracula' },
  { value: 'theme-nord', label: 'Nord' },
  { value: 'theme-monokai', label: 'Monokai' },
  { value: 'theme-material-light', label: 'Material Light' },
  { value: 'theme-material-dark', label: 'Material Dark' },
  { value: 'theme-flat-sunset', label: 'Flat Sunset' },
  { value: 'theme-flat-ocean', label: 'Flat Ocean' },
  { value: 'theme-flat-forest', label: 'Flat Forest' },
  { value: 'theme-autumn', label: 'Autumn' },
];

