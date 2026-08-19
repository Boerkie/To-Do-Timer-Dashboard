// tagStyles.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { RecordModel, UnsubscribeFunc } from 'pocketbase';
import { usesPocketBaseBackend } from '$lib/repositories/backend';
import { pocketBaseClient } from '$lib/pocketbase/client';
import { POCKETBASE_COLLECTION_NAMES } from '$lib/pocketbase/schema';
import { activeBoardId } from './boards';

export interface TagStyle {
  name: string;
  bg: string;
  fg: string;
  border: string;
}

interface PocketBaseTagStyleRecord extends RecordModel {
  name: string;
  bg: string;
  fg: string;
  border: string;
}

let tagStyleUnsubscribe: UnsubscribeFunc | null = null;

function clearTagStyleSubscription(): void {
  if (tagStyleUnsubscribe) void tagStyleUnsubscribe();
  tagStyleUnsubscribe = null;
}

function createTagStyles() {
  const initial: Record<string, TagStyle> =
    browser && localStorage.getItem('tagStyles')
      ? JSON.parse(localStorage.getItem('tagStyles')!)
      : {};

  const store = writable<Record<string, TagStyle>>(initial);

  if (browser) {
    store.subscribe((val) => {
      localStorage.setItem('tagStyles', JSON.stringify(val));
    });
  }

  return store;
}

export const tagStyles = createTagStyles();

export async function refreshTagStyles(boardId: string | null): Promise<void> {
  if (!usesPocketBaseBackend || !boardId) return;

  const filter = pocketBaseClient.filter('board = {:boardId}', { boardId });
  const tagStyleRecords = await pocketBaseClient
    .collection(POCKETBASE_COLLECTION_NAMES.tagStyles)
    .getFullList<PocketBaseTagStyleRecord>({ filter, sort: 'name' });
  const nextTagStyles = tagStyleRecords.reduce<Record<string, TagStyle>>(
    (styles, record) => ({
      ...styles,
      [record.name]: {
        name: record.name,
        bg: record.bg,
        fg: record.fg,
        border: record.border
      }
    }),
    {}
  );

  tagStyles.set(nextTagStyles);
}

async function syncPocketBaseTagStyles(boardId: string | null): Promise<void> {
  clearTagStyleSubscription();

  if (!usesPocketBaseBackend || !boardId) return;

  try {
    await refreshTagStyles(boardId);
    const filter = pocketBaseClient.filter('board = {:boardId}', { boardId });
    tagStyleUnsubscribe = await pocketBaseClient
      .collection(POCKETBASE_COLLECTION_NAMES.tagStyles)
      .subscribe(
        '*',
        () => {
          void refreshTagStyles(boardId).catch(() => {
            clearTagStyleSubscription();
          });
        },
        { filter }
      );
  } catch {
    clearTagStyleSubscription();
  }
}

export function ensureTagStyle(name: string) {
  tagStyles.update((styles) => {
    if (!styles[name]) {
      styles[name] = { name, bg: '#eeeeee', fg: '#000000', border: '#cccccc' };
    }
    return styles;
  });
}

if (browser && usesPocketBaseBackend) {
  activeBoardId.subscribe((boardId) => {
    void syncPocketBaseTagStyles(boardId);
  });
}
