<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    PageBanner,
    DayRecap,
    ActiveTask,
    TodoList,
    ClearedList,
    AdvancedDetails,
    TagsList,
    tasks,
    clearedTasks,
    activeTask,
    selectedDate,
    tags
  } from '$lib';
  import { settings } from '$lib/stores/settings';

  let themeClass = '';
  let unsubscribe: () => void;

  onMount(() => {
    // Subscribe only on client to avoid SSR errors
    unsubscribe = settings.subscribe(({ theme }) => {
      themeClass = theme === 'dark' ? 'theme-dark' : 'theme-light';
      document.documentElement.classList.toggle('theme-dark', theme === 'dark');
      document.documentElement.classList.toggle('theme-light', theme === 'light');
    });
  });

  onDestroy(() => {
    unsubscribe && unsubscribe();
  });
</script>

<PageBanner />
<div class="app-grid {themeClass}">
  <!-- Left panel: Recap -->
  <div class="left-panel">
    <div class="box-title">Recap</div>
    <div class="box recap-box">
      <DayRecap date={$selectedDate} />
    </div>
  </div>

  <!-- Main panel: Active, To-Do, Cleared -->
  <div class="main-panel">
    <div class="box-title">Active</div>
    <div class="box active-box" style="border-color: {$activeTask?.borderColor ?? 'transparent'}">
      <ActiveTask task={$activeTask} />
    </div>

    <div class="header-row">
      <div class="box-title">TO DO List</div>
      <button id="cleared-tab-btn" type="button">Cleared</button>
    </div>
    <div class="box todo-list-box">
      <TodoList tasks={$tasks} />
    </div>

    <div class="box-title">Cleared</div>
    <div class="box cleared-box">
      <ClearedList tasks={$clearedTasks} />
    </div>
  </div>

  <!-- Right panel: Details and Tags -->
  <div class="right-panel">
    <div class="box-title">Details</div>
    <div class="box details-box">
      <AdvancedDetails task={$activeTask} />
    </div>
    <div class="box-title">Tags</div>
    <div class="box tags-box">
      <TagsList tags={$tags} />
    </div>
  </div>
</div>

<style>
  :global(.theme-light) {
    --bg-panel: #f5f5f5;
    --bg-box: #ffffff;
    --text-color: #1e1e2f;
  }
  :global(.theme-dark) {
    --bg-panel: #1e1e2f;
    --bg-box: #2e2e42;
    --text-color: #f5f5f5;
  }

  .app-grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: 1rem;
    padding: 1rem;
    min-height: 100vh;
    background-color: var(--bg-panel);
    color: var(--text-color);
    box-sizing: border-box;
  }
  .left-panel,
  .main-panel,
  .right-panel {
    background-color: var(--bg-panel);
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .box {
    background-color: var(--bg-box);
    border: 2px solid transparent;
    border-radius: 0.25rem;
    padding: 0.75rem;
    overflow: auto;
  }
  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .box-title {
    font-weight: bold;
    padding-left: 0.5rem;
  }
  .active-box,
  .todo-list-box,
  .cleared-box {
    max-height: 200px;
    overflow-y: auto;
  }
</style>
