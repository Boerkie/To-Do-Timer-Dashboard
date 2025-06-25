// storage.ts
import { get } from 'svelte/store';
import { tasks, settings, tagStyles, ensureTagStyle } from '$lib';
import type { TodoTask } from './types';
import type { Settings } from './stores/settings';
import type { TagStyle } from './stores/tagStyles';

export interface ExportData {
  tasks: TodoTask[];
  settings: Settings;
  tagStyles: Record<string, TagStyle>;
}

export function downloadData(): void {
  const data: ExportData = {
    tasks: get(tasks),
    settings: get(settings),
    tagStyles: get(tagStyles)
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'todo-data.json';
  link.click();
  URL.revokeObjectURL(url);
}

export async function loadData(file: File): Promise<void> {
  const text = await file.text();
  if (!text.trim()) return;
  let data: Partial<ExportData>;
  try {
    data = JSON.parse(text);
  } catch {
    return;
  }
  if (data.tasks && Array.isArray(data.tasks) && data.tasks.length) {
    data.tasks.forEach((t) => t.tags.forEach((tag) => ensureTagStyle(tag)));
    tasks.set(data.tasks);
  }
  if (data.settings && Object.keys(data.settings).length) {
    settings.set(data.settings as Settings);
  }
  if (data.tagStyles && Object.keys(data.tagStyles).length) {
    tagStyles.set(data.tagStyles);
  }
}
