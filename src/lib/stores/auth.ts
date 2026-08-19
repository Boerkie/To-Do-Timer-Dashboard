// auth.ts
import { readable, writable } from 'svelte/store';
import type { AuthRecord } from 'pocketbase';
import { pocketBaseClient } from '$lib/pocketbase/client';

const USERS_COLLECTION = 'users';

export interface AuthState {
  isValid: boolean;
  token: string;
  record: AuthRecord;
}

export interface RegisterInput {
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string;
}

const authStateStore = writable<AuthState>({
  isValid: pocketBaseClient.authStore.isValid,
  token: pocketBaseClient.authStore.token,
  record: pocketBaseClient.authStore.record
});

function syncAuthState(): void {
  authStateStore.set({
    isValid: pocketBaseClient.authStore.isValid,
    token: pocketBaseClient.authStore.token,
    record: pocketBaseClient.authStore.record
  });
}

export const authState = readable<AuthState>(undefined, (set) => {
  const unsubscribeStore = authStateStore.subscribe(set);
  const unsubscribeAuth = pocketBaseClient.authStore.onChange(syncAuthState, true);

  return () => {
    unsubscribeAuth();
    unsubscribeStore();
  };
});

export async function login(email: string, password: string): Promise<void> {
  await pocketBaseClient.collection(USERS_COLLECTION).authWithPassword(email, password);
  syncAuthState();
}

export function logout(): void {
  pocketBaseClient.authStore.clear();
  syncAuthState();
}

export async function register({ email, password, passwordConfirm, name }: RegisterInput): Promise<void> {
  await pocketBaseClient.collection(USERS_COLLECTION).create({
    email,
    password,
    passwordConfirm,
    name
  });
}

export async function refreshAuth(): Promise<void> {
  if (!pocketBaseClient.authStore.isValid) return;

  await pocketBaseClient.collection(USERS_COLLECTION).authRefresh();
  syncAuthState();
}
