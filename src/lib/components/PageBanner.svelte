<script lang="ts">
  import { settings } from '$lib/stores/settings';
  import type { Settings } from '$lib/stores/settings';
  import { showCleared } from '$lib';
  import { onDestroy } from 'svelte';
  import SettingsModal from './Settings.svelte';

  let showModal = false;
  let localSettings: Settings;

  const unsubscribe = settings.subscribe((value) => {
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
    showCleared.update((v) => !v);
  }

  onDestroy(unsubscribe);
</script>

<header class="page-banner">
  <h1>⏳ {$settings.userName}'s TODO Timer Dashboard</h1>
  <div class="actions">
    <button on:click={() => (showModal = true)} title="Settings">⚙️ Settings</button>
  </div>
</header>

<SettingsModal
  bind:visible={showModal}
  bind:localSettings
  on:save={saveSettings}
  on:cancel={cancel}
  on:export={exportData}
  on:import={importData}
  on:toggleCleared={toggleCleared}
/>

<style>
  .page-banner {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 1rem;
    background-color: var(--banner-bg);
  }
  .page-banner h1 {
    grid-column: 2;
    text-align: center;
  }
  .actions {
    grid-column: 3;
    justify-self: end;
  }
  .actions button {
    margin-left: 0.5rem;
  }
</style>
