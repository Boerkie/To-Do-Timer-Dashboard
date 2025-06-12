<script lang="ts">
  import { get } from 'svelte/store';
  import { tasks, settings } from '$lib';

  let importInput: HTMLInputElement;

  function exportData() {
    const data = {
      tasks: get(tasks),
      settings: get(settings)
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todo-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result as string);
        if (obj.tasks) tasks.set(obj.tasks);
        if (obj.settings) settings.set(obj.settings);
      } catch (e) {
        console.error('Failed to import data', e);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  function handleExportImport() {
    if (confirm('Export current data? Click Cancel to import from file.')) {
      exportData();
    } else {
      importInput.click();
    }
  }
</script>

<header class="page-banner">
  <h1>TODO Timer Dashboard</h1>
  <nav class="controls">
    <input
      type="file"
      accept="application/json"
      on:change={importData}
      bind:this={importInput}
      style="display: none"
    />
    <button title="Export/Import" on:click={handleExportImport}>💾</button>
    <button title="Settings">⚙️</button>
  </nav>
</header>

<style>
.page-banner { display: flex; justify-content: space-between; align-items: center; padding: 1rem; }
</style>
