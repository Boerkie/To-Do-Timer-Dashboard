<!-- MigrationPrompt.svelte -->
<script lang="ts">
  import {
    dismissMigrationPrompt,
    migrateLocalDataToPocketBase,
    migrationState
  } from '$lib/stores/migration';

  async function startMigration() {
    await migrateLocalDataToPocketBase();
  }
</script>

{#if $migrationState.status === 'ready' || $migrationState.status === 'migrating' || $migrationState.status === 'error'}
  <section class="migration-prompt" aria-live="polite">
    <div class="prompt-copy">
      <strong>Move local tasks to PocketBase?</strong>
      <span>{$migrationState.localTaskCount} local tasks are ready to upload.</span>
      {#if $migrationState.errorMessage}
        <span class="error">{$migrationState.errorMessage}</span>
      {/if}
    </div>
    <div class="prompt-actions">
      <button
        type="button"
        disabled={$migrationState.status === 'migrating'}
        on:click={startMigration}
      >
        {$migrationState.status === 'migrating' ? 'Moving...' : 'Move data'}
      </button>
      <button
        type="button"
        class="secondary"
        disabled={$migrationState.status === 'migrating'}
        on:click={dismissMigrationPrompt}
      >
        Later
      </button>
    </div>
  </section>
{/if}

<style>
  .migration-prompt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--bg-box);
    border-bottom: 1px solid var(--border);
    color: var(--text-color);
  }

  .prompt-copy {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .prompt-actions {
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--accent);
    border-radius: 0.25rem;
    background: var(--accent);
    color: var(--bg-box);
    cursor: pointer;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.7;
  }

  .secondary {
    background: transparent;
    color: var(--text-color);
  }

  .error {
    color: #ff7777;
  }

  @media (max-width: 700px) {
    .migration-prompt {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
