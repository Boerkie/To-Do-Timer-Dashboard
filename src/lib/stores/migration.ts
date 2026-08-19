// migration.ts
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { ClientResponseError, type RecordModel } from 'pocketbase';
import { pocketBaseClient } from '$lib/pocketbase/client';
import {
  BOARD_ROLE_PERMISSION_PRESETS,
  POCKETBASE_COLLECTION_NAMES
} from '$lib/pocketbase/schema';
import type { Board, TodoTask } from '$lib/types';
import { authState } from './auth';
import type { TagStyle } from './tagStyles';

const TASKS_STORAGE_KEY = 'tasks';
const BOARDS_STORAGE_KEY = 'boards';
const ACTIVE_BOARD_STORAGE_KEY = 'activeBoardId';
const TAG_STYLES_STORAGE_KEY = 'tagStyles';
const MIGRATION_STORAGE_KEY = 'pocketbaseMigration:v1';
const MIGRATION_VERSION = 1;
const DEFAULT_BOARD_NAME = 'Default';
const DEFAULT_LOCAL_BOARD_ID = 'default-local-board';
const DEFAULT_PRIORITY = 4;
const SORT_ORDER_STEP = 1000;

type MigrationStatus = 'idle' | 'ready' | 'hidden' | 'migrating' | 'complete' | 'error';
type StoredTodoTask = Omit<TodoTask, 'boardId'> & { boardId?: string | null };

interface MigrationCompletion {
  version: number;
  userId: string;
  completedAt: number;
}

export interface MigrationState {
  status: MigrationStatus;
  localTaskCount: number;
  errorMessage: string | null;
}

interface PocketBaseBoardRecord extends RecordModel {
  localId?: string;
}

interface PocketBaseTaskRecord extends RecordModel {
  localId?: string;
}

const INITIAL_MIGRATION_STATE: MigrationState = {
  status: 'idle',
  localTaskCount: 0,
  errorMessage: null
};

export const migrationState = writable<MigrationState>(INITIAL_MIGRATION_STATE);

function readJson<T>(storageKey: string, fallback: T): T {
  if (!browser) return fallback;

  const storedValue = localStorage.getItem(storageKey);
  if (!storedValue) return fallback;

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

function readLocalTasks(): StoredTodoTask[] {
  const storedTasks = readJson<StoredTodoTask[]>(TASKS_STORAGE_KEY, []);
  return Array.isArray(storedTasks) ? storedTasks : [];
}

function readLocalBoards(): Board[] {
  const storedBoards = readJson<Board[]>(BOARDS_STORAGE_KEY, []);
  return Array.isArray(storedBoards) ? storedBoards : [];
}

function readLocalTagStyles(): Record<string, TagStyle> {
  return readJson<Record<string, TagStyle>>(TAG_STYLES_STORAGE_KEY, {});
}

function readActiveLocalBoardId(): string | null {
  if (!browser) return null;
  return localStorage.getItem(ACTIVE_BOARD_STORAGE_KEY);
}

function readMigrationCompletion(): MigrationCompletion | null {
  return readJson<MigrationCompletion | null>(MIGRATION_STORAGE_KEY, null);
}

function getCurrentUserId(): string | null {
  return pocketBaseClient.authStore.record?.id ?? null;
}

function hasCompletedMigration(userId: string): boolean {
  const completion = readMigrationCompletion();
  return completion?.version === MIGRATION_VERSION && completion.userId === userId;
}

function markMigrationComplete(userId: string): void {
  if (!browser) return;

  const completion: MigrationCompletion = {
    version: MIGRATION_VERSION,
    userId,
    completedAt: Date.now()
  };

  localStorage.setItem(MIGRATION_STORAGE_KEY, JSON.stringify(completion));
}

function getFallbackBoard(tasks: StoredTodoTask[]): Board {
  const nowTimestamp = Date.now();
  const taskBoardId = tasks.find((task) => task.boardId)?.boardId;

  return {
    id: readActiveLocalBoardId() ?? taskBoardId ?? DEFAULT_LOCAL_BOARD_ID,
    name: DEFAULT_BOARD_NAME,
    createdAt: nowTimestamp,
    updatedAt: nowTimestamp
  };
}

function getLocalBoardsForTasks(tasks: StoredTodoTask[]): Board[] {
  const boardsById = new Map(readLocalBoards().map((board) => [board.id, board]));
  const fallbackBoard = getFallbackBoard(tasks);

  if (boardsById.size === 0 && tasks.length > 0) {
    boardsById.set(fallbackBoard.id, fallbackBoard);
  }

  tasks.forEach((task) => {
    const boardId = task.boardId ?? fallbackBoard.id;
    if (!boardsById.has(boardId)) {
      boardsById.set(boardId, {
        ...fallbackBoard,
        id: boardId
      });
    }
  });

  return Array.from(boardsById.values());
}

function normalizeTaskBoard(task: StoredTodoTask, fallbackBoardId: string): TodoTask {
  return {
    ...task,
    boardId: task.boardId ?? fallbackBoardId,
    tags: Array.isArray(task.tags) ? task.tags : [],
    activePeriods: Array.isArray(task.activePeriods) ? task.activePeriods : [],
    isDone: task.isDone ?? false
  };
}

function toPocketBaseDate(timestamp: number): string {
  return new Date(timestamp).toISOString().replace('T', ' ');
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Local data migration failed.';
}

async function getFirstRecord<T extends RecordModel>(
  collectionName: string,
  filter: string
): Promise<T | null> {
  try {
    return await pocketBaseClient.collection(collectionName).getFirstListItem<T>(filter);
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) return null;
    throw error;
  }
}

async function deleteRecords(collectionName: string, filter: string): Promise<void> {
  const records = await pocketBaseClient.collection(collectionName).getFullList<RecordModel>({ filter });

  await Promise.all(
    records.map((record) => pocketBaseClient.collection(collectionName).delete(record.id))
  );
}

async function ensureOwnerMembership(boardId: string, userId: string): Promise<void> {
  const collectionName = POCKETBASE_COLLECTION_NAMES.boardMembers;
  const filter = pocketBaseClient.filter('board = {:boardId} && user = {:userId}', {
    boardId,
    userId
  });
  const existingMember = await getFirstRecord<RecordModel>(collectionName, filter);
  const memberData = {
    board: boardId,
    user: userId,
    role: 'owner',
    permissions: BOARD_ROLE_PERMISSION_PRESETS.owner
  };

  if (existingMember) {
    await pocketBaseClient.collection(collectionName).update(existingMember.id, memberData);
    return;
  }

  await pocketBaseClient.collection(collectionName).create(memberData);
}

async function upsertBoard(localBoard: Board, userId: string): Promise<PocketBaseBoardRecord> {
  const collectionName = POCKETBASE_COLLECTION_NAMES.boards;
  const filter = pocketBaseClient.filter('owner = {:userId} && localId = {:localId}', {
    userId,
    localId: localBoard.id
  });
  const existingBoard = await getFirstRecord<PocketBaseBoardRecord>(collectionName, filter);
  const boardData = {
    name: localBoard.name,
    localId: localBoard.id,
    owner: userId
  };

  const boardRecord = existingBoard
    ? await pocketBaseClient.collection(collectionName).update<PocketBaseBoardRecord>(existingBoard.id, boardData)
    : await pocketBaseClient.collection(collectionName).create<PocketBaseBoardRecord>(boardData);

  await ensureOwnerMembership(boardRecord.id, userId);
  return boardRecord;
}

async function upsertTask(
  task: TodoTask,
  boardId: string,
  sortOrder: number
): Promise<PocketBaseTaskRecord> {
  const collectionName = POCKETBASE_COLLECTION_NAMES.tasks;
  const filter = pocketBaseClient.filter('board = {:boardId} && localId = {:localId}', {
    boardId,
    localId: task.id
  });
  const existingTask = await getFirstRecord<PocketBaseTaskRecord>(collectionName, filter);
  const taskData = {
    board: boardId,
    localId: task.id,
    title: task.title,
    details: task.details ?? '',
    priority: task.priority ?? DEFAULT_PRIORITY,
    borderColor: task.borderColor ?? '',
    isDone: task.isDone,
    sortOrder,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };

  return existingTask
    ? pocketBaseClient.collection(collectionName).update<PocketBaseTaskRecord>(existingTask.id, taskData)
    : pocketBaseClient.collection(collectionName).create<PocketBaseTaskRecord>(taskData);
}

async function replaceTaskTags(task: TodoTask, boardId: string, taskId: string): Promise<void> {
  const collectionName = POCKETBASE_COLLECTION_NAMES.taskTags;
  const filter = pocketBaseClient.filter('task = {:taskId}', { taskId });

  await deleteRecords(collectionName, filter);
  await Promise.all(
    task.tags.map((tagName, tagIndex) =>
      pocketBaseClient.collection(collectionName).create({
        board: boardId,
        task: taskId,
        name: tagName,
        sortOrder: tagIndex * SORT_ORDER_STEP
      })
    )
  );
}

async function replaceTaskActivePeriods(
  task: TodoTask,
  boardId: string,
  taskId: string
): Promise<void> {
  const collectionName = POCKETBASE_COLLECTION_NAMES.taskActivePeriods;
  const filter = pocketBaseClient.filter('task = {:taskId}', { taskId });

  await deleteRecords(collectionName, filter);
  await Promise.all(
    task.activePeriods.map((period) => {
      const periodData: Record<string, unknown> = {
        board: boardId,
        task: taskId,
        startedAt: toPocketBaseDate(period.start)
      };

      if (period.end !== null) periodData.endedAt = toPocketBaseDate(period.end);
      return pocketBaseClient.collection(collectionName).create(periodData);
    })
  );
}

async function upsertTagStyle(boardId: string, tagStyle: TagStyle): Promise<void> {
  const collectionName = POCKETBASE_COLLECTION_NAMES.tagStyles;
  const filter = pocketBaseClient.filter('board = {:boardId} && name = {:name}', {
    boardId,
    name: tagStyle.name
  });
  const existingStyle = await getFirstRecord<RecordModel>(collectionName, filter);
  const styleData = {
    board: boardId,
    name: tagStyle.name,
    bg: tagStyle.bg,
    fg: tagStyle.fg,
    border: tagStyle.border
  };

  if (existingStyle) {
    await pocketBaseClient.collection(collectionName).update(existingStyle.id, styleData);
    return;
  }

  await pocketBaseClient.collection(collectionName).create(styleData);
}

export function evaluateMigrationPrompt(): void {
  const userId = getCurrentUserId();
  const localTaskCount = readLocalTasks().length;

  if (!browser || !userId || localTaskCount === 0) {
    migrationState.set(INITIAL_MIGRATION_STATE);
    return;
  }

  if (hasCompletedMigration(userId)) {
    migrationState.set({ status: 'complete', localTaskCount, errorMessage: null });
    return;
  }

  migrationState.set({ status: 'ready', localTaskCount, errorMessage: null });
}

export function dismissMigrationPrompt(): void {
  migrationState.update((state) => ({ ...state, status: 'hidden' }));
}

export async function migrateLocalDataToPocketBase(): Promise<void> {
  const userId = getCurrentUserId();
  const storedTasks = readLocalTasks();

  if (!browser || !userId || storedTasks.length === 0) {
    evaluateMigrationPrompt();
    return;
  }

  migrationState.set({
    status: 'migrating',
    localTaskCount: storedTasks.length,
    errorMessage: null
  });

  try {
    const localBoards = getLocalBoardsForTasks(storedTasks);
    const fallbackBoardId = localBoards[0]?.id ?? DEFAULT_LOCAL_BOARD_ID;
    const boardRecordsByLocalId = new Map<string, PocketBaseBoardRecord>();

    for (const localBoard of localBoards) {
      const boardRecord = await upsertBoard(localBoard, userId);
      boardRecordsByLocalId.set(localBoard.id, boardRecord);
    }

    for (const [taskIndex, storedTask] of storedTasks.entries()) {
      const task = normalizeTaskBoard(storedTask, fallbackBoardId);
      const boardRecord = boardRecordsByLocalId.get(task.boardId);
      if (!boardRecord) continue;

      const taskRecord = await upsertTask(task, boardRecord.id, (taskIndex + 1) * SORT_ORDER_STEP);
      await replaceTaskTags(task, boardRecord.id, taskRecord.id);
      await replaceTaskActivePeriods(task, boardRecord.id, taskRecord.id);
    }

    const localTagStyles = Object.values(readLocalTagStyles());
    for (const boardRecord of boardRecordsByLocalId.values()) {
      await Promise.all(
        localTagStyles.map((tagStyle) => upsertTagStyle(boardRecord.id, tagStyle))
      );
    }

    markMigrationComplete(userId);
    migrationState.set({
      status: 'complete',
      localTaskCount: storedTasks.length,
      errorMessage: null
    });
  } catch (error) {
    migrationState.set({
      status: 'error',
      localTaskCount: storedTasks.length,
      errorMessage: getErrorMessage(error)
    });
  }
}

if (browser) {
  authState.subscribe(() => {
    evaluateMigrationPrompt();
  });
}
