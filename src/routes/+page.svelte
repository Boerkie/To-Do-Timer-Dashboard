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
    showCleared
  } from '$lib';

  let boundDate: Date = $selectedDate;
  $: selectedDate.set(boundDate);
</script>

<PageBanner />
<div class="app-grid">
  <!-- Left panel: Recap -->
  <div class="left-panel">
    <div class="box-title">Recap</div>
    <div class="box recap-box">
      <DayRecap bind:selectedDate={boundDate} />
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
    </div>
    <div class="box todo-list-box">
      <TodoList tasks={$todoTasks} />
    </div>
    <!-- pinned add bar -->
    <div class="add-bar-box">
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
      <AdvancedDetails task={$activeTask} />
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
  .recap-box {
    overflow: hidden;
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
    overflow-y: auto;
  }
  .todo-list-box {
    max-height: 30rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-width: 3px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
  /* container for pinned add bar */
  .add-bar-box {
    padding: 0 0.75rem 0.5rem;
    background-color: var(--bg-panel);
  }
  .priority-box {
    padding: 0.5rem;
  }
</style>
