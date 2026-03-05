import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { TodoTask } from '$lib/types';
import { ensureTagStyle } from './tagStyles';
import { tagFilter, tagFilterAnd, priorityFilter } from './ui';
import { settings } from './settings';

/** Convert a (possibly multi-word) raw tag string to camelCase.
 * "tag name" → "tagName", "Tag two" → "TagTwo", "tag 1" → "tag1"
 */
export function toCamelTag(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('')
    .replace(/[^A-Za-z0-9_-]/g, '');
}

/** Parse an input string and extract tags prefixed with '#'.
 * Returns the cleaned title and array of tags.
 */
function parseInput(
  input: string
): { title: string; tags: string[]; priority: number } {
  const tags: string[] = [];
  let priority = get(settings).defaultPriority;
  const prioMatch = input.match(/!([1-4])/);
  if (prioMatch) {
    priority = parseInt(prioMatch[1]);
    input = input.replace(prioMatch[0], '');
  }
  const withoutTags = input.replace(/#([A-Za-z0-9_-]+(?:\s+[A-Za-z0-9_-]+)*)/g, (_, raw) => {
    const tag = toCamelTag(raw);
    if (tag) { tags.push(tag); ensureTagStyle(tag); }
    return '';
  });
  return { title: withoutTags.trim(), tags, priority };
}

function createTask(title: string, tags: string[], priority: number): TodoTask {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    tags,
    priority,
    activePeriods: [],
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

  initial.forEach((t) => t.tags.forEach((tag) => ensureTagStyle(tag)));

  const store = writable<TodoTask[]>(initial);

  if (browser) {
    store.subscribe((value) => {
      localStorage.setItem('tasks', JSON.stringify(value));
    });
  }

  return store;
}

export const tasks = createTasks();

export function activateTask(id: string) {
  tasks.update((list) => {
    const currentlyActive = list.find((t) => {
      const lastPeriod = t.activePeriods[t.activePeriods.length - 1];
      return lastPeriod?.end === null;
    });
    if (currentlyActive?.id === id) return list;

    const now = Date.now();
    let previousId: string | undefined;

    const updated = list.map((t) => {
      const last = t.activePeriods[t.activePeriods.length - 1];
      if (last && last.end === null) {
        previousId = t.id;
        return {
          ...t,
          activePeriods: [...t.activePeriods.slice(0, -1), { ...last, end: now }]
        };
      }
      if (t.id === id) {
        return {
          ...t,
          activePeriods: [...t.activePeriods, { start: now, end: null }],
          updatedAt: now
        };
      }
      return t;
    });

    if (previousId && previousId !== id) {
      const idx = updated.findIndex((t) => t.id === previousId);
      if (idx > -1) {
        const prev = updated[idx];
        return [prev, ...updated.filter((_, i) => i !== idx)];
      }
    }
    return updated;
  });
}

export function deactivateTask(id: string) {
  const now = Date.now();
  tasks.update((list) =>
    list.map((t) => {
      if (t.id !== id) return t;
      const last = t.activePeriods[t.activePeriods.length - 1];
      if (!last || last.end !== null) return { ...t, updatedAt: now };
      return {
        ...t,
        activePeriods: [...t.activePeriods.slice(0, -1), { ...last, end: now }],
        updatedAt: now
      };
    })
  );
}

export function clearTask(id: string) {
  tasks.update((list) =>
    list.map((t) => {
      if (t.id !== id) return t;
      const last = t.activePeriods[t.activePeriods.length - 1];
      const activePeriods =
        last && last.end === null
          ? [...t.activePeriods.slice(0, -1), { ...last, end: Date.now() }]
          : t.activePeriods;
      return { ...t, isDone: true, activePeriods };
    })
  );
}

export function reorderTodo(id: string, beforeId: string | null) {
  tasks.update((list) => {
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return list;
    const [task] = list.splice(idx, 1);
    if (beforeId) {
      const targetIndex = list.findIndex((t) => t.id === beforeId);
      if (targetIndex === -1) list.push(task);
      else list.splice(targetIndex, 0, task);
    } else {
      list.push(task);
    }
    return [...list];
  });
}

export function moveToTop(id: string) {
  tasks.update((list) => {
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return list;
    const [task] = list.splice(idx, 1);
    list.unshift(task);
    return [...list];
  });
}

export function renameTag(oldName: string, newName: string) {
  tasks.update((list) =>
    list.map((t) =>
      t.tags.some((tag) => tag === oldName)
        ? { ...t, tags: t.tags.map((tag) => (tag === oldName ? newName : tag)) }
        : t
    )
  );
}

export function cyclePriority(id: string) {
  tasks.update((list) =>
    list.map((t) => {
      if (t.id !== id) return t;
      const current = t.priority ?? 4;
      const priority = current === 4 ? 3 : current === 3 ? 2 : current === 2 ? 1 : 4;
      return { ...t, priority };
    })
  );
}

export function renameTask(id: string, newName: string) {
  tasks.update((list) =>
    list.map((t) =>
      t.id === id ? { ...t, title: newName, updatedAt: Date.now() } : t
    )
  );
}

export function changeBorder(id: string, borderColor: string) {
  tasks.update((list) =>
    list.map((t) =>
      t.id === id ? { ...t, borderColor, updatedAt: Date.now() } : t
    )
  );
}

export function resetBorder(id: string) {
  tasks.update((list) =>
    list.map((t) =>
      t.id === id ? { ...t, borderColor: undefined, updatedAt: Date.now() } : t
    )
  );
}

export function addTag(id: string, tagName: string) {
  if (!tagName.match(/^[A-Za-z0-9_-]+$/) || tagName.length > 20) return;
  tasks.update((list) =>
    list.map((t) => {
      if (t.id !== id || t.tags.includes(tagName)) return t;
      ensureTagStyle(tagName);
      return { ...t, tags: [...t.tags, tagName] };
    })
  );
}

export function deleteTask(id: string) {
  tasks.update((list) => list.filter((t) => t.id !== id));
}

/** Add a new task from an input string. */
export function addTask(input: string): void {
  const { title, tags, priority } = parseInput(input);
  if (!title && tags.length === 0) return;
  const task = createTask(title, tags, priority);
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

export const todoTasks = derived(
  [tasks, tagFilter, tagFilterAnd, priorityFilter],
  ([$tasks, $filter, $and, $prio]) => {
    let res = $tasks.filter((t) => !t.isDone && !isTaskActive(t));
    if ($filter.length) {
      res = res.filter((t) =>
        $and
          ? $filter.every((tag) => t.tags.includes(tag))
          : $filter.some((tag) => t.tags.includes(tag))
      );
    }
    if ($prio !== null) {
      res = res.filter((t) => (t.priority ?? 4) === $prio);
    }
    return res;
  }
);

export const tags = derived(tasks, ($tasks) => {
  const set = new Set<string>();
  $tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
});

export const selectedDate = writable(new Date());
