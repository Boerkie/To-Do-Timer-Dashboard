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
    MigrationPrompt,
    SharingPanel,
    todoTasks,
    clearedTasks,
    activeTask,
    selectedDate,
    tags,
    taskCommandError,
    clearTaskCommandError,
    showCleared,
    renameTask,
    addTag,
    PRIORITY_COLORS,
    borderPreviewColor,
    canManageMembers,
    canViewActive,
    canViewBacklog,
    canViewDayRecap,
    canViewDetails,
    usesPocketBaseBackend,
  } from '$lib';
  import { now } from '$lib/timeUtils';

</script>

<PageBanner />
<MigrationPrompt />
{#if $taskCommandError}
  <div class="task-error" role="status">
    <span>{$taskCommandError}</span>
    <button type="button" aria-label="Dismiss task error" on:click={clearTaskCommandError}>
      Dismiss
    </button>
  </div>
{/if}
<div class="app-grid">
  <!-- Left panel: Recap -->
  <div class="left-panel">
    <div class="box-title">Recap</div>
    <div class="box recap-box">
      {#if $canViewDayRecap}
        <DayRecap bind:selectedDate={$selectedDate} />
      {/if}
    </div>
  </div>

  <!-- Main panel: Active, To-Do, Cleared -->
  <div class="main-panel">
    <div class="box-title">Active</div>
    <div
      class="box active-box"
      style="--active-bg:{$activeTask ? (($borderPreviewColor?.id === $activeTask.id ? $borderPreviewColor?.color : null) ?? $activeTask.borderColor ?? PRIORITY_COLORS[$activeTask.priority ?? 4]) : 'var(--border)'}"
    >
      {#if $canViewActive}
        <ActiveTask task={$activeTask} />
      {/if}
    </div>

    <div class="header-row">
      <div class="box-title">TO DO List</div>
    </div>
    <div class="box todo-list-box">
      {#if $canViewBacklog}
        <TodoList tasks={$todoTasks} />
      {/if}
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
        task={$canViewDetails ? $activeTask : null}
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
      {#if $canViewBacklog}
        <TagsList tags={$tags} />
      {/if}
    </div>
    {#if usesPocketBaseBackend && $canManageMembers}
      <div class="box-title">Sharing</div>
      <div class="box sharing-box">
        <SharingPanel />
      </div>
    {/if}
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
  .task-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 1rem;
    background: #4a1f25;
    color: #ffe8e8;
    border-bottom: 1px solid #d35a6b;
  }
  .task-error button {
    border: 1px solid currentColor;
    border-radius: 0.25rem;
    background: transparent;
    color: inherit;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
  }
</style>
