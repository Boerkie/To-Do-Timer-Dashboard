// localBoardRepository.ts
import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import type { Board } from '$lib/types';
import type { BoardRepository } from './boardRepository';

const BOARDS_STORAGE_KEY = 'boards';
const ACTIVE_BOARD_STORAGE_KEY = 'activeBoardId';

function readStoredBoards(): Board[] {
  if (!browser) return [];

  const storedBoards = localStorage.getItem(BOARDS_STORAGE_KEY);
  if (!storedBoards) return [];

  try {
    return JSON.parse(storedBoards);
  } catch {
    return [];
  }
}

function readStoredActiveBoardId(): string | null {
  if (!browser) return null;
  return localStorage.getItem(ACTIVE_BOARD_STORAGE_KEY);
}

function createBoard(name: string): Board {
  const nowTimestamp = Date.now();

  return {
    id: crypto.randomUUID(),
    name,
    createdAt: nowTimestamp,
    updatedAt: nowTimestamp
  };
}

export function createLocalBoardRepository(): BoardRepository {
  const boards = writable<Board[]>(readStoredBoards());
  const activeBoardId = writable<string | null>(readStoredActiveBoardId());

  if (browser) {
    boards.subscribe((value) => {
      localStorage.setItem(BOARDS_STORAGE_KEY, JSON.stringify(value));
    });

    activeBoardId.subscribe((value) => {
      if (value) localStorage.setItem(ACTIVE_BOARD_STORAGE_KEY, value);
      else localStorage.removeItem(ACTIVE_BOARD_STORAGE_KEY);
    });
  }

  return {
    boards,
    activeBoardId,

    ensureDefaultBoard(defaultName: string) {
      const existingBoards = get(boards);
      if (existingBoards.length > 0) return;

      const board = createBoard(defaultName);
      boards.set([board]);
      activeBoardId.set(board.id);
    },

    setActiveBoard(boardId: string) {
      const boardExists = get(boards).some((board) => board.id === boardId);
      if (boardExists) activeBoardId.set(boardId);
    },

    renameBoard(boardId: string, newName: string) {
      const nowTimestamp = Date.now();

      boards.update((boardList) =>
        boardList.map((board) =>
          board.id === boardId ? { ...board, name: newName, updatedAt: nowTimestamp } : board
        )
      );
    }
  };
}
