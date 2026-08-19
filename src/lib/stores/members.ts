// members.ts
import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { ClientResponseError, type RecordModel, type UnsubscribeFunc } from 'pocketbase';
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type MemberStatus = 'idle' | 'loading' | 'ready' | 'saving' | 'error';

export interface BoardMember {
  id: string;
  userId: string;
  userEmail: string | null;
  role: BoardMemberRole;
  permissions: readonly BoardPermissionScope[];
}

export interface BoardMemberState {
  status: MemberStatus;
  members: BoardMember[];
  errorMessage: string | null;
}

interface PocketBaseMemberRecord extends RecordModel {
  user: string;
  role: BoardMemberRole;
  permissions?: BoardPermissionScope[];
  expand?: {
    user?: {
      email?: string;
    };
  };
}

interface PocketBaseUserRecord extends RecordModel {
  email?: string;
}

const INITIAL_MEMBER_STATE: BoardMemberState = {
  status: 'idle',
  members: [],
  errorMessage: null
};

export const boardMemberState = writable<BoardMemberState>(INITIAL_MEMBER_STATE);
let memberUnsubscribe: UnsubscribeFunc | null = null;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to update board members.';
}

function getCurrentBoardId(): string | null {
  return get(activeBoardId);
}

function mapMemberRecord(record: PocketBaseMemberRecord): BoardMember {
  const role = record.role;

  return {
    id: record.id,
    userId: record.user,
    userEmail: record.expand?.user?.email ?? null,
    role,
    permissions: record.permissions?.length ? record.permissions : BOARD_ROLE_PERMISSION_PRESETS[role]
  };
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

async function resolveUserId(identity: string): Promise<string> {
  const trimmedIdentity = identity.trim();
  if (!EMAIL_PATTERN.test(trimmedIdentity)) return trimmedIdentity;

  const filter = pocketBaseClient.filter('email = {:email}', { email: trimmedIdentity });
  const userRecord = await pocketBaseClient
    .collection(POCKETBASE_COLLECTION_NAMES.users)
    .getFirstListItem<PocketBaseUserRecord>(filter);

  return userRecord.id;
}

export async function refreshBoardMembers(): Promise<void> {
  if (!usesPocketBaseBackend) {
    boardMemberState.set(INITIAL_MEMBER_STATE);
    return;
  }

  const boardId = getCurrentBoardId();
  if (!boardId) {
    boardMemberState.set(INITIAL_MEMBER_STATE);
    return;
  }

  boardMemberState.update((state) => ({ ...state, status: 'loading', errorMessage: null }));

  try {
    const filter = pocketBaseClient.filter('board = {:boardId}', { boardId });
    const memberRecords = await pocketBaseClient
      .collection(POCKETBASE_COLLECTION_NAMES.boardMembers)
      .getFullList<PocketBaseMemberRecord>({ filter, sort: 'role,created', expand: 'user' });

    boardMemberState.set({
      status: 'ready',
      members: memberRecords.map(mapMemberRecord),
      errorMessage: null
    });
  } catch (error) {
    boardMemberState.set({
      status: 'error',
      members: [],
      errorMessage: getErrorMessage(error)
    });
  }
}

function clearMemberSubscription(): void {
  if (memberUnsubscribe) void memberUnsubscribe();
  memberUnsubscribe = null;
}

async function syncBoardMembers(boardId: string | null, userId: string | null): Promise<void> {
  clearMemberSubscription();

  if (!usesPocketBaseBackend || !boardId || !userId) {
    boardMemberState.set(INITIAL_MEMBER_STATE);
    return;
  }

  await refreshBoardMembers();

  try {
    const filter = pocketBaseClient.filter('board = {:boardId}', { boardId });
    memberUnsubscribe = await pocketBaseClient
      .collection(POCKETBASE_COLLECTION_NAMES.boardMembers)
      .subscribe(
        '*',
        () => {
          void refreshBoardMembers();
        },
        { filter }
      );
  } catch {
    clearMemberSubscription();
  }
}

export async function addBoardMember(identity: string, role: BoardMemberRole): Promise<void> {
  const boardId = getCurrentBoardId();
  if (!usesPocketBaseBackend || !boardId || !identity.trim()) return;

  boardMemberState.update((state) => ({ ...state, status: 'saving', errorMessage: null }));

  try {
    const userId = await resolveUserId(identity);
    const filter = pocketBaseClient.filter('board = {:boardId} && user = {:userId}', {
      boardId,
      userId
    });
    const existingMember = await getFirstRecord<PocketBaseMemberRecord>(
      POCKETBASE_COLLECTION_NAMES.boardMembers,
      filter
    );
    const memberData = {
      board: boardId,
      user: userId,
      role,
      permissions: BOARD_ROLE_PERMISSION_PRESETS[role]
    };

    if (existingMember) {
      await pocketBaseClient
        .collection(POCKETBASE_COLLECTION_NAMES.boardMembers)
        .update(existingMember.id, memberData);
    } else {
      await pocketBaseClient.collection(POCKETBASE_COLLECTION_NAMES.boardMembers).create(memberData);
    }

    await refreshBoardMembers();
  } catch (error) {
    boardMemberState.update((state) => ({
      ...state,
      status: 'error',
      errorMessage: getErrorMessage(error)
    }));
  }
}

export async function updateBoardMemberRole(
  memberId: string,
  role: BoardMemberRole
): Promise<void> {
  if (!usesPocketBaseBackend) return;

  boardMemberState.update((state) => ({ ...state, status: 'saving', errorMessage: null }));

  try {
    await pocketBaseClient.collection(POCKETBASE_COLLECTION_NAMES.boardMembers).update(memberId, {
      role,
      permissions: BOARD_ROLE_PERMISSION_PRESETS[role]
    });
    await refreshBoardMembers();
  } catch (error) {
    boardMemberState.update((state) => ({
      ...state,
      status: 'error',
      errorMessage: getErrorMessage(error)
    }));
  }
}

export async function removeBoardMember(memberId: string): Promise<void> {
  if (!usesPocketBaseBackend) return;

  boardMemberState.update((state) => ({ ...state, status: 'saving', errorMessage: null }));

  try {
    await pocketBaseClient.collection(POCKETBASE_COLLECTION_NAMES.boardMembers).delete(memberId);
    await refreshBoardMembers();
  } catch (error) {
    boardMemberState.update((state) => ({
      ...state,
      status: 'error',
      errorMessage: getErrorMessage(error)
    }));
  }
}

if (browser && usesPocketBaseBackend) {
  derived([activeBoardId, authState], ([$activeBoardId, $authState]) => ({
    boardId: $activeBoardId,
    userId: $authState.record?.id ?? null
  })).subscribe(({ boardId, userId }) => {
    void syncBoardMembers(boardId, userId);
  });
}
