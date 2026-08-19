// client.ts
import PocketBase from 'pocketbase';

export const DEFAULT_POCKETBASE_URL = 'http://127.0.0.1:8090';

export function getPocketBaseUrl(): string {
  return import.meta.env.VITE_POCKETBASE_URL || DEFAULT_POCKETBASE_URL;
}

export function createPocketBaseClient(): PocketBase {
  return new PocketBase(getPocketBaseUrl());
}

export const pocketBaseClient = createPocketBaseClient();
