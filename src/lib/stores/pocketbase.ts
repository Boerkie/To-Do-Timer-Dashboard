// pocketbase.ts
import { writable } from 'svelte/store';
import { pocketBaseClient, getPocketBaseUrl } from '$lib/pocketbase/client';

export type PocketBaseConnectionState = 'idle' | 'checking' | 'connected' | 'unavailable';

export interface PocketBaseStatus {
  state: PocketBaseConnectionState;
  url: string;
  lastCheckedAt: number | null;
  errorMessage: string | null;
}

const INITIAL_STATUS: PocketBaseStatus = {
  state: 'idle',
  url: getPocketBaseUrl(),
  lastCheckedAt: null,
  errorMessage: null
};

export const pocketBaseStatus = writable<PocketBaseStatus>(INITIAL_STATUS);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to connect to PocketBase.';
}

export async function checkPocketBaseConnection(): Promise<void> {
  pocketBaseStatus.update((status) => ({
    ...status,
    state: 'checking',
    errorMessage: null
  }));

  try {
    await pocketBaseClient.health.check();
    pocketBaseStatus.set({
      state: 'connected',
      url: getPocketBaseUrl(),
      lastCheckedAt: Date.now(),
      errorMessage: null
    });
  } catch (error) {
    pocketBaseStatus.set({
      state: 'unavailable',
      url: getPocketBaseUrl(),
      lastCheckedAt: Date.now(),
      errorMessage: getErrorMessage(error)
    });
  }
}
