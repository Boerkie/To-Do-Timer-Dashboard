// boardRepository.ts
import type { Writable } from 'svelte/store';
import type { Board } from '$lib/types';

export type BoardRepositoryResult = void | Promise<void>;

export interface BoardRepository {
  boards: Writable<Board[]>;
  activeBoardId: Writable<string | null>;
  ensureDefaultBoard(defaultName: string): BoardRepositoryResult;
  setActiveBoard(boardId: string): BoardRepositoryResult;
  renameBoard(boardId: string, newName: string): BoardRepositoryResult;
}
