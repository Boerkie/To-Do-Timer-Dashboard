// pocketBaseBoardRepository.ts
import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import type { RecordModel } from 'pocketbase';
import { pocketBaseClient } from '$lib/pocketbase/client';
import { BOARD_ROLE_PERMISSION_PRESETS, POCKETBASE_COLLECTION_NAMES } from '$lib/pocketbase/schema';
import { authState } from '$lib/stores/auth';
import type { Board } from '$lib/types';
import type { BoardRepository } from './boardRepository';

const ACTIVE_BOARD_STORAGE_KEY = 'pocketbaseActiveBoardId';

interface PocketBaseBoardRecord extends RecordModel {
  name: string;
  owner: string;
}

function readStoredActiveBoardId(): string | null {
  if (!browser) return null;
  return localStorage.getItem(ACTIVE_BOARD_STORAGE_KEY);
}

function mapBoardRecord(record: PocketBaseBoardRecord): Board {
  return {
    id: record.id,
    name: record.name,
    createdAt: Date.parse(record.created),
    updatedAt: Date.parse(record.updated)
  };
}

function getCurrentUserId(): string | null {
  return pocketBaseClient.authStore.record?.id ?? null;
}

async function createOwnerMembership(boardId: string, userId: string): Promise<void> {
  await pocketBaseClient.collection(POCKETBASE_COLLECTION_NAMES.boardMembers).create({
    board: boardId,
    user: userId,
    role: 'owner',
    permissions: BOARD_ROLE_PERMISSION_PRESETS.owner
  });
}

export function createPocketBaseBoardRepository(): BoardRepository {
  const boards = writable<Board[]>([]);
  const activeBoardId = writable<string | null>(readStoredActiveBoardId());
  let hydrationRequestId = 0;

  async function hydrateBoards(): Promise<void> {
    const requestId = ++hydrationRequestId;
    const userId = getCurrentUserId();

    if (!userId) {
      boards.set([]);
      activeBoardId.set(null);
      return;
    }

    try {
      const boardRecords = await pocketBaseClient
        .collection(POCKETBASE_COLLECTION_NAMES.boards)
        .getFullList<PocketBaseBoardRecord>({ sort: 'created' });
      const nextBoards = boardRecords.map(mapBoardRecord);

      if (requestId !== hydrationRequestId) return;

      boards.set(nextBoards);

      const selectedBoardId = get(activeBoardId);
      const selectedBoardExists = nextBoards.some((board) => board.id === selectedBoardId);
      activeBoardId.set(selectedBoardExists ? selectedBoardId : nextBoards[0]?.id ?? null);
    } catch {
      if (requestId === hydrationRequestId) {
        boards.set([]);
        activeBoardId.set(null);
      }
    }
  }

  if (browser) {
    activeBoardId.subscribe((value) => {
      if (value) localStorage.setItem(ACTIVE_BOARD_STORAGE_KEY, value);
      else localStorage.removeItem(ACTIVE_BOARD_STORAGE_KEY);
    });

    authState.subscribe(() => {
      void hydrateBoards();
    });
  }

  return {
    boards,
    activeBoardId,

    async ensureDefaultBoard(defaultName: string) {
      const userId = getCurrentUserId();
      if (!userId) return;

      await hydrateBoards();
      if (get(boards).length > 0) return;

      const boardRecord = await pocketBaseClient
        .collection(POCKETBASE_COLLECTION_NAMES.boards)
        .create<PocketBaseBoardRecord>({
          name: defaultName,
          owner: userId
        });

      await createOwnerMembership(boardRecord.id, userId);
      boards.set([mapBoardRecord(boardRecord)]);
      activeBoardId.set(boardRecord.id);
    },

    setActiveBoard(boardId: string) {
      const boardExists = get(boards).some((board) => board.id === boardId);
      if (boardExists) activeBoardId.set(boardId);
    },

    async renameBoard(boardId: string, newName: string) {
      const boardRecord = await pocketBaseClient
        .collection(POCKETBASE_COLLECTION_NAMES.boards)
        .update<PocketBaseBoardRecord>(boardId, { name: newName });

      boards.update((boardList) =>
        boardList.map((board) => (board.id === boardId ? mapBoardRecord(boardRecord) : board))
      );
    }
  };
}
