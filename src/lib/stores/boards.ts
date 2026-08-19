// boards.ts
import { browser } from '$app/environment';
import { derived } from 'svelte/store';
import { usesPocketBaseBackend } from '$lib/repositories/backend';
import { createLocalBoardRepository } from '$lib/repositories/localBoardRepository';
import { createPocketBaseBoardRepository } from '$lib/repositories/pocketBaseBoardRepository';
import type { BoardRepository, BoardRepositoryResult } from '$lib/repositories/boardRepository';
import { authState } from './auth';

const DEFAULT_BOARD_NAME = 'Default';

const boardRepository = createBoardRepository();

function createBoardRepository(): BoardRepository {
  return usesPocketBaseBackend ? createPocketBaseBoardRepository() : createLocalBoardRepository();
}

if (browser) {
  boardRepository.ensureDefaultBoard(DEFAULT_BOARD_NAME);

  if (usesPocketBaseBackend) {
    authState.subscribe(($authState) => {
      if ($authState.isValid) {
        void boardRepository.ensureDefaultBoard(DEFAULT_BOARD_NAME);
      }
    });
  }
}

export const boards = boardRepository.boards;
export const activeBoardId = boardRepository.activeBoardId;

export const activeBoard = derived([boards, activeBoardId], ([$boards, $activeBoardId]) =>
  $boards.find((board) => board.id === $activeBoardId) ?? null
);

export function ensureDefaultBoard(defaultName = DEFAULT_BOARD_NAME): BoardRepositoryResult {
  return boardRepository.ensureDefaultBoard(defaultName);
}

export function setActiveBoard(boardId: string): BoardRepositoryResult {
  return boardRepository.setActiveBoard(boardId);
}

export function renameBoard(boardId: string, newName: string): BoardRepositoryResult {
  return boardRepository.renameBoard(boardId, newName);
}
