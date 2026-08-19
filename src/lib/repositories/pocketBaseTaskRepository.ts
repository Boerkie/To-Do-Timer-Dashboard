// pocketBaseTaskRepository.ts
import { browser } from '$app/environment';
import { get, writable, type Readable } from 'svelte/store';
import type { RecordModel, UnsubscribeFunc } from 'pocketbase';
import { parseTaskInput } from '$lib/domain/taskInput';
import { pocketBaseClient } from '$lib/pocketbase/client';
import { POCKETBASE_COLLECTION_NAMES } from '$lib/pocketbase/schema';
import { settings } from '$lib/stores/settings';
import { ensureTagStyle } from '$lib/stores/tagStyles';
import type { ActivePeriod, TodoTask } from '$lib/types';
import type { TaskRepository } from './taskRepository';

const DEFAULT_PRIORITY = 4;
const SORT_ORDER_STEP = 1000;
const MAX_TAG_LENGTH = 20;
const TAG_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

interface PocketBaseTaskRecord extends RecordModel {
  board: string;
  title: string;
  details?: string;
  priority?: number;
  borderColor?: string;
  isDone?: boolean;
  sortOrder?: number;
  createdAt?: number;
  updatedAt?: number;
}

interface PocketBaseTaskTagRecord extends RecordModel {
  task: string;
  name: string;
  sortOrder?: number;
}

interface PocketBaseActivePeriodRecord extends RecordModel {
  task: string;
  startedAt: string;
  endedAt?: string;
}

function toPocketBaseDate(timestamp: number): string {
  return new Date(timestamp).toISOString().replace('T', ' ');
}

function fromPocketBaseDate(value: string): number {
  return Date.parse(value.replace(' ', 'T'));
}

function isActiveTask(task: TodoTask): boolean {
  const lastPeriod = task.activePeriods[task.activePeriods.length - 1];
  return !!lastPeriod && lastPeriod.end === null;
}

function mapActivePeriod(record: PocketBaseActivePeriodRecord): ActivePeriod {
  return {
    start: fromPocketBaseDate(record.startedAt),
    end: record.endedAt ? fromPocketBaseDate(record.endedAt) : null
  };
}

function mapTaskRecord(
  record: PocketBaseTaskRecord,
  tagsByTaskId: Map<string, string[]>,
  periodsByTaskId: Map<string, ActivePeriod[]>
): TodoTask {
  const nowTimestamp = Date.now();

  return {
    id: record.id,
    boardId: record.board,
    title: record.title,
    details: record.details || undefined,
    tags: tagsByTaskId.get(record.id) ?? [],
    priority: record.priority ?? DEFAULT_PRIORITY,
    borderColor: record.borderColor || undefined,
    activePeriods: periodsByTaskId.get(record.id) ?? [],
    createdAt: record.createdAt ?? nowTimestamp,
    updatedAt: record.updatedAt ?? nowTimestamp,
    isDone: record.isDone ?? false
  };
}

function orderTaskTags(tagRecords: PocketBaseTaskTagRecord[], taskId: string): string[] {
  return tagRecords
    .filter((record) => record.task === taskId)
    .sort((firstRecord, secondRecord) => (firstRecord.sortOrder ?? 0) - (secondRecord.sortOrder ?? 0))
    .map((record) => record.name);
}

function orderActivePeriods(
  periodRecords: PocketBaseActivePeriodRecord[],
  taskId: string
): ActivePeriod[] {
  return periodRecords
    .filter((record) => record.task === taskId)
    .map(mapActivePeriod)
    .sort((firstPeriod, secondPeriod) => firstPeriod.start - secondPeriod.start);
}

export function createPocketBaseTaskRepository(
  activeBoardId: Readable<string | null>
): TaskRepository {
  const tasks = writable<TodoTask[]>([]);
  let hydrationRequestId = 0;
  let realtimeUnsubscribers: UnsubscribeFunc[] = [];

  async function fetchBoardTasks(boardId: string): Promise<TodoTask[]> {
    const filter = pocketBaseClient.filter('board = {:boardId}', { boardId });
    const [taskRecords, tagRecords, periodRecords] = await Promise.all([
      pocketBaseClient
        .collection(POCKETBASE_COLLECTION_NAMES.tasks)
        .getFullList<PocketBaseTaskRecord>({ filter, sort: 'sortOrder,created' }),
      pocketBaseClient
        .collection(POCKETBASE_COLLECTION_NAMES.taskTags)
        .getFullList<PocketBaseTaskTagRecord>({ filter, sort: 'sortOrder,created' }),
      pocketBaseClient
        .collection(POCKETBASE_COLLECTION_NAMES.taskActivePeriods)
        .getFullList<PocketBaseActivePeriodRecord>({ filter, sort: 'startedAt,created' })
    ]);

    const tagsByTaskId = new Map<string, string[]>();
    const periodsByTaskId = new Map<string, ActivePeriod[]>();

    taskRecords.forEach((taskRecord) => {
      tagsByTaskId.set(taskRecord.id, orderTaskTags(tagRecords, taskRecord.id));
      periodsByTaskId.set(taskRecord.id, orderActivePeriods(periodRecords, taskRecord.id));
    });

    return taskRecords.map((taskRecord) => mapTaskRecord(taskRecord, tagsByTaskId, periodsByTaskId));
  }

  async function hydrateTasks(boardId = get(activeBoardId)): Promise<void> {
    const requestId = ++hydrationRequestId;

    if (!boardId) {
      tasks.set([]);
      return;
    }

    try {
      const nextTasks = await fetchBoardTasks(boardId);
      if (requestId === hydrationRequestId) tasks.set(nextTasks);
    } catch {
      if (requestId === hydrationRequestId) tasks.set([]);
    }
  }

  async function updateTaskRecord(taskId: string, data: Record<string, unknown>): Promise<void> {
    await pocketBaseClient.collection(POCKETBASE_COLLECTION_NAMES.tasks).update(taskId, {
      ...data,
      updatedAt: Date.now()
    });
  }

  async function closeOpenPeriods(boardId: string, taskId?: string): Promise<void> {
    const filter = taskId
      ? pocketBaseClient.filter('board = {:boardId} && task = {:taskId} && endedAt = ""', {
          boardId,
          taskId
        })
      : pocketBaseClient.filter('board = {:boardId} && endedAt = ""', { boardId });

    const activePeriods = await pocketBaseClient
      .collection(POCKETBASE_COLLECTION_NAMES.taskActivePeriods)
      .getFullList<PocketBaseActivePeriodRecord>({ filter });

    const endedAt = toPocketBaseDate(Date.now());
    await Promise.all(
      activePeriods.map((periodRecord) =>
        pocketBaseClient
          .collection(POCKETBASE_COLLECTION_NAMES.taskActivePeriods)
          .update(periodRecord.id, { endedAt })
      )
    );
  }

  async function persistTaskOrder(taskList: TodoTask[]): Promise<void> {
    await Promise.all(
      taskList.map((task, taskIndex) =>
        updateTaskRecord(task.id, { sortOrder: (taskIndex + 1) * SORT_ORDER_STEP })
      )
    );
  }

  function clearRealtimeSubscriptions(): void {
    realtimeUnsubscribers.forEach((unsubscribe) => {
      void unsubscribe();
    });
    realtimeUnsubscribers = [];
  }

  async function subscribeToBoardTasks(boardId: string): Promise<void> {
    const filter = pocketBaseClient.filter('board = {:boardId}', { boardId });
    const collectionNames = [
      POCKETBASE_COLLECTION_NAMES.tasks,
      POCKETBASE_COLLECTION_NAMES.taskTags,
      POCKETBASE_COLLECTION_NAMES.taskActivePeriods
    ];

    try {
      realtimeUnsubscribers = await Promise.all(
        collectionNames.map((collectionName) =>
          pocketBaseClient.collection(collectionName).subscribe(
            '*',
            () => {
              void hydrateTasks(boardId);
            },
            { filter }
          )
        )
      );
    } catch {
      clearRealtimeSubscriptions();
    }
  }

  async function syncBoardTasks(boardId: string | null): Promise<void> {
    clearRealtimeSubscriptions();
    await hydrateTasks(boardId);

    if (boardId) await subscribeToBoardTasks(boardId);
  }

  if (browser) {
    activeBoardId.subscribe((boardId) => {
      void syncBoardTasks(boardId);
    });
  }

  return {
    tasks,

    async activateTask(taskId: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      const currentlyActive = get(tasks).find((task) => isActiveTask(task));
      if (currentlyActive?.id === taskId) return;

      const nowTimestamp = Date.now();
      await closeOpenPeriods(boardId);
      await pocketBaseClient.collection(POCKETBASE_COLLECTION_NAMES.taskActivePeriods).create({
        board: boardId,
        task: taskId,
        startedAt: toPocketBaseDate(nowTimestamp)
      });
      await updateTaskRecord(taskId, { updatedAt: nowTimestamp });
      await hydrateTasks(boardId);
    },

    async deactivateTask(taskId: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      await closeOpenPeriods(boardId, taskId);
      await updateTaskRecord(taskId, {});
      await hydrateTasks(boardId);
    },

    async clearTask(taskId: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      await closeOpenPeriods(boardId, taskId);
      await updateTaskRecord(taskId, { isDone: true });
      await hydrateTasks(boardId);
    },

    async reorderTodo(taskId: string, beforeId: string | null) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      const currentTasks = [...get(tasks)];
      const taskIndex = currentTasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return;

      const [task] = currentTasks.splice(taskIndex, 1);
      if (beforeId) {
        const targetIndex = currentTasks.findIndex((targetTask) => targetTask.id === beforeId);
        if (targetIndex === -1) currentTasks.push(task);
        else currentTasks.splice(targetIndex, 0, task);
      } else {
        currentTasks.push(task);
      }

      await persistTaskOrder(currentTasks);
      await hydrateTasks(boardId);
    },

    async moveToTop(taskId: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      const currentTasks = get(tasks);
      const taskIndex = currentTasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return;

      const reorderedTasks = [...currentTasks];
      const [task] = reorderedTasks.splice(taskIndex, 1);
      reorderedTasks.unshift(task);

      await persistTaskOrder(reorderedTasks);
      await hydrateTasks(boardId);
    },

    async renameTag(oldName: string, newName: string) {
      const boardId = get(activeBoardId);
      if (!boardId || oldName === newName) return;

      const filter = pocketBaseClient.filter('board = {:boardId} && name = {:oldName}', {
        boardId,
        oldName
      });
      const tagRecords = await pocketBaseClient
        .collection(POCKETBASE_COLLECTION_NAMES.taskTags)
        .getFullList<PocketBaseTaskTagRecord>({ filter });

      await Promise.all(
        tagRecords.map((tagRecord) =>
          pocketBaseClient
            .collection(POCKETBASE_COLLECTION_NAMES.taskTags)
            .update(tagRecord.id, { name: newName })
        )
      );
      await hydrateTasks(boardId);
    },

    async cyclePriority(taskId: string) {
      const boardId = get(activeBoardId);
      const task = get(tasks).find((currentTask) => currentTask.id === taskId);
      if (!boardId || !task) return;

      const currentPriority = task.priority ?? DEFAULT_PRIORITY;
      const priority =
        currentPriority === 4
          ? 3
          : currentPriority === 3
            ? 2
            : currentPriority === 2
              ? 1
              : 4;

      await updateTaskRecord(taskId, { priority });
      await hydrateTasks(boardId);
    },

    async renameTask(taskId: string, newName: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      await updateTaskRecord(taskId, { title: newName });
      await hydrateTasks(boardId);
    },

    async changeBorder(taskId: string, borderColor: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      await updateTaskRecord(taskId, { borderColor });
      await hydrateTasks(boardId);
    },

    async resetBorder(taskId: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      await updateTaskRecord(taskId, { borderColor: '' });
      await hydrateTasks(boardId);
    },

    async addTag(taskId: string, tagName: string) {
      const boardId = get(activeBoardId);
      if (!boardId || !TAG_NAME_PATTERN.test(tagName) || tagName.length > MAX_TAG_LENGTH) return;

      const task = get(tasks).find((currentTask) => currentTask.id === taskId);
      const tagExists = task?.tags.some(
        (existingTag) => existingTag.toLowerCase() === tagName.toLowerCase()
      );
      if (!task || tagExists) return;

      ensureTagStyle(tagName);
      await pocketBaseClient.collection(POCKETBASE_COLLECTION_NAMES.taskTags).create({
        board: boardId,
        task: taskId,
        name: tagName,
        sortOrder: task.tags.length * SORT_ORDER_STEP
      });
      await updateTaskRecord(taskId, {});
      await hydrateTasks(boardId);
    },

    async removeTag(taskId: string, tagName: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      const filter = pocketBaseClient.filter(
        'board = {:boardId} && task = {:taskId} && name = {:tagName}',
        { boardId, taskId, tagName }
      );
      const tagRecords = await pocketBaseClient
        .collection(POCKETBASE_COLLECTION_NAMES.taskTags)
        .getFullList<PocketBaseTaskTagRecord>({ filter });

      await Promise.all(
        tagRecords.map((tagRecord) =>
          pocketBaseClient.collection(POCKETBASE_COLLECTION_NAMES.taskTags).delete(tagRecord.id)
        )
      );
      await updateTaskRecord(taskId, {});
      await hydrateTasks(boardId);
    },

    async updateTaskDetails(taskId: string, details: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      await updateTaskRecord(taskId, { details });
      await hydrateTasks(boardId);
    },

    async deleteTask(taskId: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      await pocketBaseClient.collection(POCKETBASE_COLLECTION_NAMES.tasks).delete(taskId);
      await hydrateTasks(boardId);
    },

    async addTask(input: string) {
      const boardId = get(activeBoardId);
      if (!boardId) return;

      const defaultPriority = get(settings).defaultPriority;
      const { title, tags, priority } = parseTaskInput(input, defaultPriority);
      if (!title && tags.length === 0) return;

      const nowTimestamp = Date.now();
      const taskRecord = await pocketBaseClient
        .collection(POCKETBASE_COLLECTION_NAMES.tasks)
        .create<PocketBaseTaskRecord>({
          board: boardId,
          title,
          priority,
          isDone: false,
          sortOrder: (get(tasks).length + 1) * SORT_ORDER_STEP,
          createdAt: nowTimestamp,
          updatedAt: nowTimestamp
        });

      await Promise.all(
        tags.map((tagName, tagIndex) => {
          ensureTagStyle(tagName);
          return pocketBaseClient.collection(POCKETBASE_COLLECTION_NAMES.taskTags).create({
            board: boardId,
            task: taskRecord.id,
            name: tagName,
            sortOrder: tagIndex * SORT_ORDER_STEP
          });
        })
      );
      await hydrateTasks(boardId);
    }
  };
}
