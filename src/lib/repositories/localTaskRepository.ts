// localTaskRepository.ts
import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import type { TodoTask } from '$lib/types';
import { parseTaskInput } from '$lib/domain/taskInput';
import { settings } from '$lib/stores/settings';
import { ensureTagStyle } from '$lib/stores/tagStyles';
import type { TaskRepository } from './taskRepository';

const TASKS_STORAGE_KEY = 'tasks';
const DEFAULT_PRIORITY = 4;
const MAX_TAG_LENGTH = 20;
const TAG_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

function readStoredTasks(): TodoTask[] {
  if (!browser) return [];

  const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
  if (!storedTasks) return [];

  try {
    return JSON.parse(storedTasks);
  } catch {
    return [];
  }
}

function createTask(title: string, tags: string[], priority: number): TodoTask {
  const nowTimestamp = Date.now();

  return {
    id: crypto.randomUUID(),
    title,
    tags,
    priority,
    activePeriods: [],
    createdAt: nowTimestamp,
    updatedAt: nowTimestamp,
    isDone: false
  };
}

function isActiveTask(task: TodoTask): boolean {
  const lastPeriod = task.activePeriods[task.activePeriods.length - 1];
  return !!lastPeriod && lastPeriod.end === null;
}

function ensureTaskTags(tasks: TodoTask[]): void {
  tasks.forEach((task) => {
    task.tags.forEach((tagName) => ensureTagStyle(tagName));
  });
}

export function createLocalTaskRepository(): TaskRepository {
  const initialTasks = readStoredTasks();
  ensureTaskTags(initialTasks);

  const tasks = writable<TodoTask[]>(initialTasks);

  if (browser) {
    tasks.subscribe((value) => {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(value));
    });
  }

  return {
    tasks,

    activateTask(taskId: string) {
      tasks.update((taskList) => {
        const currentlyActive = taskList.find((task) => isActiveTask(task));
        if (currentlyActive?.id === taskId) return taskList;

        const nowTimestamp = Date.now();
        let previousId: string | undefined;

        const updatedTasks = taskList.map((task) => {
          const lastPeriod = task.activePeriods[task.activePeriods.length - 1];

          if (lastPeriod && lastPeriod.end === null) {
            previousId = task.id;
            return {
              ...task,
              activePeriods: [
                ...task.activePeriods.slice(0, -1),
                { ...lastPeriod, end: nowTimestamp }
              ]
            };
          }

          if (task.id === taskId) {
            return {
              ...task,
              activePeriods: [...task.activePeriods, { start: nowTimestamp, end: null }],
              updatedAt: nowTimestamp
            };
          }

          return task;
        });

        if (previousId && previousId !== taskId) {
          const previousIndex = updatedTasks.findIndex((task) => task.id === previousId);
          if (previousIndex > -1) {
            const previousTask = updatedTasks[previousIndex];
            return [
              previousTask,
              ...updatedTasks.filter((candidateTask, taskIndex) => taskIndex !== previousIndex)
            ];
          }
        }

        return updatedTasks;
      });
    },

    deactivateTask(taskId: string) {
      const nowTimestamp = Date.now();

      tasks.update((taskList) =>
        taskList.map((task) => {
          if (task.id !== taskId) return task;

          const lastPeriod = task.activePeriods[task.activePeriods.length - 1];
          if (!lastPeriod || lastPeriod.end !== null) return { ...task, updatedAt: nowTimestamp };

          return {
            ...task,
            activePeriods: [
              ...task.activePeriods.slice(0, -1),
              { ...lastPeriod, end: nowTimestamp }
            ],
            updatedAt: nowTimestamp
          };
        })
      );
    },

    clearTask(taskId: string) {
      tasks.update((taskList) =>
        taskList.map((task) => {
          if (task.id !== taskId) return task;

          const nowTimestamp = Date.now();
          const lastPeriod = task.activePeriods[task.activePeriods.length - 1];
          const activePeriods =
            lastPeriod && lastPeriod.end === null
              ? [...task.activePeriods.slice(0, -1), { ...lastPeriod, end: nowTimestamp }]
              : task.activePeriods;

          return { ...task, isDone: true, activePeriods, updatedAt: nowTimestamp };
        })
      );
    },

    reorderTodo(taskId: string, beforeId: string | null) {
      tasks.update((taskList) => {
        const taskIndex = taskList.findIndex((task) => task.id === taskId);
        if (taskIndex === -1) return taskList;

        const reorderedTasks = [...taskList];
        const [task] = reorderedTasks.splice(taskIndex, 1);

        if (beforeId) {
          const targetIndex = reorderedTasks.findIndex((targetTask) => targetTask.id === beforeId);
          if (targetIndex === -1) reorderedTasks.push(task);
          else reorderedTasks.splice(targetIndex, 0, task);
        } else {
          reorderedTasks.push(task);
        }

        return reorderedTasks.map((nextTask) =>
          nextTask.id === taskId ? { ...nextTask, updatedAt: Date.now() } : nextTask
        );
      });
    },

    moveToTop(taskId: string) {
      tasks.update((taskList) => {
        const taskIndex = taskList.findIndex((task) => task.id === taskId);
        if (taskIndex === -1) return taskList;

        const reorderedTasks = [...taskList];
        const [task] = reorderedTasks.splice(taskIndex, 1);
        reorderedTasks.unshift({ ...task, updatedAt: Date.now() });
        return reorderedTasks;
      });
    },

    renameTag(oldName: string, newName: string) {
      const nowTimestamp = Date.now();

      tasks.update((taskList) =>
        taskList.map((task) =>
          task.tags.some((tagName) => tagName === oldName)
            ? {
                ...task,
                tags: task.tags.map((tagName) => (tagName === oldName ? newName : tagName)),
                updatedAt: nowTimestamp
              }
            : task
        )
      );
    },

    cyclePriority(taskId: string) {
      const nowTimestamp = Date.now();

      tasks.update((taskList) =>
        taskList.map((task) => {
          if (task.id !== taskId) return task;

          const currentPriority = task.priority ?? DEFAULT_PRIORITY;
          const priority =
            currentPriority === 4
              ? 3
              : currentPriority === 3
                ? 2
                : currentPriority === 2
                  ? 1
                  : 4;

          return { ...task, priority, updatedAt: nowTimestamp };
        })
      );
    },

    renameTask(taskId: string, newName: string) {
      const nowTimestamp = Date.now();

      tasks.update((taskList) =>
        taskList.map((task) =>
          task.id === taskId ? { ...task, title: newName, updatedAt: nowTimestamp } : task
        )
      );
    },

    changeBorder(taskId: string, borderColor: string) {
      const nowTimestamp = Date.now();

      tasks.update((taskList) =>
        taskList.map((task) =>
          task.id === taskId ? { ...task, borderColor, updatedAt: nowTimestamp } : task
        )
      );
    },

    resetBorder(taskId: string) {
      const nowTimestamp = Date.now();

      tasks.update((taskList) =>
        taskList.map((task) =>
          task.id === taskId ? { ...task, borderColor: undefined, updatedAt: nowTimestamp } : task
        )
      );
    },

    addTag(taskId: string, tagName: string) {
      if (!TAG_NAME_PATTERN.test(tagName) || tagName.length > MAX_TAG_LENGTH) return;

      const nowTimestamp = Date.now();

      tasks.update((taskList) =>
        taskList.map((task) => {
          const tagExists = task.tags.some(
            (existingTag) => existingTag.toLowerCase() === tagName.toLowerCase()
          );

          if (task.id !== taskId || tagExists) return task;

          ensureTagStyle(tagName);
          return { ...task, tags: [...task.tags, tagName], updatedAt: nowTimestamp };
        })
      );
    },

    removeTag(taskId: string, tagName: string) {
      const nowTimestamp = Date.now();

      tasks.update((taskList) =>
        taskList.map((task) =>
          task.id === taskId && task.tags.includes(tagName)
            ? {
                ...task,
                tags: task.tags.filter((existingTag) => existingTag !== tagName),
                updatedAt: nowTimestamp
              }
            : task
        )
      );
    },

    updateTaskDetails(taskId: string, details: string) {
      const nowTimestamp = Date.now();
      const nextDetails = details ? details : undefined;

      tasks.update((taskList) =>
        taskList.map((task) =>
          task.id === taskId ? { ...task, details: nextDetails, updatedAt: nowTimestamp } : task
        )
      );
    },

    deleteTask(taskId: string) {
      tasks.update((taskList) => taskList.filter((task) => task.id !== taskId));
    },

    addTask(input: string) {
      const defaultPriority = get(settings).defaultPriority;
      const { title, tags, priority } = parseTaskInput(input, defaultPriority);

      if (!title && tags.length === 0) return;

      tags.forEach((tagName) => ensureTagStyle(tagName));
      const task = createTask(title, tags, priority);
      tasks.update((taskList) => [...taskList, task]);
    }
  };
}
