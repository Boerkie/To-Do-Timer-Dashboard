// permissions.ts
import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import type { UnsubscribeFunc } from 'pocketbase';
import { usesPocketBaseBackend } from '$lib/repositories/backend';
import { pocketBaseClient } from '$lib/pocketbase/client';
import {
  BOARD_ROLE_PERMISSION_PRESETS,
  POCKETBASE_COLLECTION_NAMES,
  type BoardMemberRole,
  type BoardPermissionScope
} from '$lib/pocketbase/schema';
import { activeBoardId } from './boards';
import { authState } from './auth';

export type BoardPermissionStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface BoardPermissionState {
  status: BoardPermissionStatus;
  role: BoardMemberRole | null;
  permissions: readonly BoardPermissionScope[];
  errorMessage: string | null;
}

interface PocketBaseBoardRecord {
  id: string;
  owner: string;
}

interface PocketBaseMemberRecord {
  role?: BoardMemberRole;
  permissions?: BoardPermissionScope[];
}

let permissionUnsubscribers: UnsubscribeFunc[] = [];

const FULL_PERMISSION_STATE: BoardPermissionState = {
  status: 'ready',
  role: 'owner',
  permissions: BOARD_ROLE_PERMISSION_PRESETS.owner,
  errorMessage: null
};

const EMPTY_PERMISSION_STATE: BoardPermissionState = {
  status: 'idle',
  role: null,
  permissions: [],
  errorMessage: null
};

export const boardPermissionState = writable<BoardPermissionState>(
  usesPocketBaseBackend ? EMPTY_PERMISSION_STATE : FULL_PERMISSION_STATE
);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to load board permissions.';
}

function normalizePermissions(memberRecord: PocketBaseMemberRecord): readonly BoardPermissionScope[] {
  const role = memberRecord.role;
  if (memberRecord.permissions?.length) return memberRecord.permissions;
  return role ? BOARD_ROLE_PERMISSION_PRESETS[role] : [];
}

async function loadPocketBasePermissions(boardId: string, userId: string): Promise<void> {
  boardPermissionState.update((state) => ({ ...state, status: 'loading', errorMessage: null }));

  try {
    const boardRecord = await pocketBaseClient
      .collection(POCKETBASE_COLLECTION_NAMES.boards)
      .getOne<PocketBaseBoardRecord>(boardId);

    if (boardRecord.owner === userId) {
      boardPermissionState.set(FULL_PERMISSION_STATE);
      return;
    }

    const filter = pocketBaseClient.filter('board = {:boardId} && user = {:userId}', {
      boardId,
      userId
    });
    const memberRecord = await pocketBaseClient
      .collection(POCKETBASE_COLLECTION_NAMES.boardMembers)
      .getFirstListItem<PocketBaseMemberRecord>(filter);
    const role = memberRecord.role ?? null;

    boardPermissionState.set({
      status: 'ready',
      role,
      permissions: normalizePermissions(memberRecord),
      errorMessage: null
    });
  } catch (error) {
    boardPermissionState.set({
      status: 'error',
      role: null,
      permissions: [],
      errorMessage: getErrorMessage(error)
    });
  }
}

function clearPermissionSubscriptions(): void {
  permissionUnsubscribers.forEach((unsubscribe) => {
    void unsubscribe();
  });
  permissionUnsubscribers = [];
}

async function syncPocketBasePermissions(
  boardId: string | null,
  userId: string | null
): Promise<void> {
  clearPermissionSubscriptions();

  if (!boardId || !userId) {
    boardPermissionState.set(EMPTY_PERMISSION_STATE);
    return;
  }

  await loadPocketBasePermissions(boardId, userId);

  try {
    const memberFilter = pocketBaseClient.filter('board = {:boardId}', { boardId });
    const boardUnsubscribe = await pocketBaseClient
      .collection(POCKETBASE_COLLECTION_NAMES.boards)
      .subscribe(boardId, () => {
        void loadPocketBasePermissions(boardId, userId);
      });
    const memberUnsubscribe = await pocketBaseClient
      .collection(POCKETBASE_COLLECTION_NAMES.boardMembers)
      .subscribe(
        '*',
        () => {
          void loadPocketBasePermissions(boardId, userId);
        },
        { filter: memberFilter }
      );

    permissionUnsubscribers = [boardUnsubscribe, memberUnsubscribe];
  } catch {
    clearPermissionSubscriptions();
  }
}

export function hasBoardPermission(
  state: BoardPermissionState,
  permission: BoardPermissionScope
): boolean {
  return state.permissions.includes(permission);
}

function createPermissionStore(permission: BoardPermissionScope) {
  return derived(boardPermissionState, ($boardPermissionState) =>
    hasBoardPermission($boardPermissionState, permission)
  );
}

export const canViewActive = createPermissionStore('view:active');
export const canViewDayRecap = createPermissionStore('view:dayRecap');
export const canViewBacklog = createPermissionStore('view:backlog');
export const canViewDetails = createPermissionStore('view:details');
export const canAddItem = createPermissionStore('add:item');
export const canAddTag = createPermissionStore('add:tag');
export const canAddDetails = createPermissionStore('add:details');
export const canUpdateItem = createPermissionStore('update:item');
export const canUpdateDetails = createPermissionStore('update:details');
export const canUpdateOrder = createPermissionStore('update:order');
export const canUpdateActive = createPermissionStore('update:active');
export const canDeleteItem = createPermissionStore('delete:item');
export const canManageMembers = createPermissionStore('manage:members');
export const canManageBoard = createPermissionStore('manage:board');

if (browser && usesPocketBaseBackend) {
  derived([activeBoardId, authState], ([$activeBoardId, $authState]) => ({
    boardId: $activeBoardId,
    userId: $authState.record?.id ?? null
  })).subscribe(({ boardId, userId }) => {
    void syncPocketBasePermissions(boardId, userId);
  });
}
