<!-- Settings.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { showCleared, downloadData, loadData } from '$lib';
  import { THEMES } from '$lib/constants';
  import { clickOutside } from '$lib/actions/clickOutside';
  import type { Settings } from '$lib/stores/settings';

  export let visible = false;
  export let localSettings: Settings;

  const dispatch = createEventDispatcher();
  let fileInput: HTMLInputElement;

  function save() {
    dispatch('save');
  }
  function cancel() {
    dispatch('cancel');
  }
  function exportData() {
    downloadData();
  }
  function importData() {
    fileInput.value = '';
    fileInput.click();
  }
  async function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    await loadData(input.files[0]);
  }
  function toggleCleared() {
    dispatch('toggleCleared');
  }
</script>

{#if visible}
  <div
    class="modal-overlay"
    role="presentation"
    on:click={cancel}
    on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') cancel(); }}
    use:clickOutside={() => dispatch('cancel')}
  >
    <div class="modal" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown|stopPropagation>
      <h2>Settings</h2>
      <form on:submit|preventDefault={save} class="settings-form">
        <label>
          Name:
          <input type="text" bind:value={localSettings.userName} />
        </label>
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
            {#each THEMES as theme}
              <option value={theme.value}>{theme.label}</option>
            {/each}
          </select>
        </label>
        <label>
          Tag Border Width:
          <input
            type="number"
            min="0"
            bind:value={localSettings.tagBorderWidth}
          />
        </label>
        <label>
          Show List Numbers:
          <input type="checkbox" bind:checked={localSettings.showListNumbers} />
        </label>
        <label>
          Move Active Task on Day End:
          <input type="checkbox" bind:checked={localSettings.reorderAtDayEnd} />
        </label>
        <div class="form-buttons">
          <button type="button" on:click={exportData}>Export</button>
          <button type="button" on:click={importData}>Import</button>
          <button type="button" on:click={toggleCleared}>
            {$showCleared ? 'Hide Cleared' : 'Show Cleared'}
          </button>
        </div>
        <input
          class="hidden-file-input"
          type="file"
          accept="application/json"
          bind:this={fileInput}
          on:change={handleFile}
        />
        <div class="modal-actions">
          <button type="submit">Save</button>
          <button type="button" on:click={cancel}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
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
  .hidden-file-input {
    display: none;
  }
</style>
