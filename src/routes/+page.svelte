<!-- +page.svelte -->
<script lang="ts">
  import {
    PageBanner,
    DayRecap,
    ActiveTask,
    TodoList,
    AddBar,
    ClearedList,
    AdvancedDetails,
    PriorityFilter,
    TagsList,
    todoTasks,
    clearedTasks,
    activeTask,
    selectedDate,
    tags,
    showCleared,
    renameTask,
    addTag,
  } from '$lib';
  import { now } from '$lib/timeUtils';

</script>

<PageBanner />
<div class="app-grid">
  <!-- Left panel: Recap -->
  <div class="left-panel">
    <div class="box-title">Recap</div>
    <div class="box recap-box">
      <DayRecap bind:selectedDate={$selectedDate} />
    </div>
  </div>

  <!-- Main panel: Active, To-Do, Cleared -->
  <div class="main-panel">
    <div class="box-title">Active</div>
    <div
      class="box active-box"
      style="--active-bg:{$activeTask?.borderColor || 'var(--border)'}"
    >
      <ActiveTask task={$activeTask} />
    </div>

    <div class="header-row">
      <div class="box-title">TO DO List</div>
    </div>
    <div class="box todo-list-box">
      <TodoList tasks={$todoTasks} />
    </div>
    <div class="box add-bar-box">
      <AddBar />
    </div>

    {#if $showCleared}
      <div class="box-title">Cleared</div>
      <div class="box cleared-box">
        <ClearedList tasks={$clearedTasks} />
      </div>
    {/if}
  </div>

  <!-- Right panel: Details and Tags -->
  <div class="right-panel">
    <div class="box-title">Details</div>
    <div class="box details-box">
      <AdvancedDetails
        task={$activeTask}
        on:rename={(e) => renameTask(e.detail.id, e.detail.newName)}
        on:addTag={(e) => addTag(e.detail.id, e.detail.tagName)}
      />
    </div>
    <div class="box-title">Priority</div>
    <div class="box priority-box">
      <PriorityFilter />
    </div>
    <div class="box-title">Tags</div>
    <div class="box tags-box">
      <TagsList tags={$tags} />
    </div>
  </div>
</div>

<style>
  .app-grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: 1rem;
    padding: 1rem;
    height: calc(100vh - var(--header-height));
    background-color: var(--bg-panel);
    color: var(--text-color);
    box-sizing: border-box;
    font-weight: 500;
  }
  .left-panel,
  .main-panel,
  .right-panel {
    background-color: var(--bg-panel);
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 100%;
    min-height: 0;
  }
  .box {
    background-color: var(--bg-box);
    border: 2px solid transparent;
    border-radius: 0.25rem;
    padding: 0.75rem;
  }
  .recap-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 30vw;
    min-height: 0;
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
  .cleared-box {
    max-height: 200px;
  }
  .active-box {
    background-color: var(--active-bg, var(--border));
  }
  .todo-list-box {
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
  .priority-box {
    padding: 0.5rem;
  }
</style>
