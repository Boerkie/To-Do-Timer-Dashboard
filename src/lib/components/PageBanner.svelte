<script lang="ts">
  import { settings } from '$lib/stores/settings';
  import type { Settings } from '$lib/stores/settings';
  import { showCleared } from '$lib';
  import { onDestroy } from 'svelte';

  let showModal = false;
  let localSettings: Settings;

  const unsubscribe = settings.subscribe(value => {
    localSettings = { ...value };
  });

  function saveSettings() {
    settings.set(localSettings);
    showModal = false;
  }

  function cancel() {
    showModal = false;
  }

  // Stub export/import; replace with actual implementations or dispatch events
  function exportData() {
    const event = new CustomEvent('export');
    dispatchEvent(event);
  }
  function importData() {
    const event = new CustomEvent('import');
    dispatchEvent(event);
  }

  function toggleCleared() {
    showCleared.update(v => !v);
  }

  onDestroy(unsubscribe);
</script>

<header class="page-banner">
  <h1>⏳ TODO Timer Dashboard</h1>
  <div class="actions">
    <button on:click={() => (showModal = true)} title="Settings">⚙️ Settings</button>
  </div>
</header>

{#if showModal}
  <div class="modal-overlay" on:click={cancel}>
  <div class="modal" on:click|stopPropagation>
      <h2>Settings</h2>
      <form on:submit|preventDefault={saveSettings} class="settings-form">
        <label>
          Day Start:
          <input type="time" bind:value={localSettings.dayStart} required />
        </label>
        <label>
          Day End:
          <input type="time" bind:value={localSettings.dayEnd} required />
        </label>
        <label>
          Theme:
          <select bind:value={localSettings.theme}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label>
          Tag Border Width:
          <input type="number" min="0" bind:value={localSettings.tagBorderWidth} />
        </label>
        <label>
          Show List Numbers:
          <input type="checkbox" bind:checked={localSettings.showListNumbers} />
        </label>
        <div class="form-buttons">
          <button type="button" on:click={exportData}>Export</button>
          <button type="button" on:click={importData}>Import</button>
          <button type="button" on:click={toggleCleared}>{$showCleared ? 'Hide Cleared' : 'Show Cleared'}</button>
        </div>

        <div class="modal-actions">
          <button type="submit">Save</button>
          <button type="button" on:click={cancel}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .page-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--banner-bg);
  }
  .actions button {
    margin-left: 0.5rem;
  }
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal {
    background: var(--modal-bg);
    padding: 1.5rem;
    border-radius: 0.5rem;
    width: 300px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  .settings-form {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 0.75rem;
  }
  .settings-form label {
    display: contents;
  }
  .settings-form input,
  .settings-form select {
    width: 100%;
  }
  .form-buttons {
    grid-column: 1 / -1;
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .modal-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
  }
  .modal-actions button {
    margin-left: 0.5rem;
  }
</style>
