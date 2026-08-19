<!-- ActiveTask.svelte -->
<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import {
    activateTask,
    deactivateTask,
    clearTask,
    moveToTop,
    addTag,
    renameTask,
    changeBorder,
    resetBorder,
    deleteTask,
    PRIORITY_COLORS,
    borderPreviewColor,
    canAddTag,
    canDeleteItem,
    canUpdateActive,
    canUpdateItem,
    canUpdateOrder,
  } from '$lib';
  import TodoItem from './TodoItem.svelte';
  export let task: TodoTask | null = null;

  $: previewColor = $borderPreviewColor?.id === task?.id ? $borderPreviewColor?.color : null;
  $: frameColor = task ? (previewColor ?? task.borderColor ?? PRIORITY_COLORS[task.priority ?? 4]) : '';

  let showActions = false;

  $: canMoveActiveTask = $canUpdateActive && $canUpdateOrder;
  $: canClearActiveTask = $canUpdateActive && $canUpdateItem;
  $: canDragActiveTask = canMoveActiveTask || canClearActiveTask;

  function handleWrapperDragStart(event: DragEvent) {
    if (!canDragActiveTask) return;
    if (task) event.dataTransfer?.setData('text/task', task.id);
    showActions = true;
  }

  function handleWrapperDragEnd() {
    showActions = false;
  }

  function dropMoveBack(e: DragEvent) {
    e.stopPropagation();
    if (!task || !canMoveActiveTask) return;
    moveToTop(task.id);
    deactivateTask(task.id);
    showActions = false;
  }

  function dropClear(e: DragEvent) {
    e.stopPropagation();
    if (!task || !canClearActiveTask) return;
    clearTask(task.id);
    showActions = false;
  }

  function sectionDrop(e: DragEvent) {
    const id = e.dataTransfer?.getData('text/task');
    const tag = e.dataTransfer?.getData('text/tag');
    if (id && $canUpdateActive) activateTask(id);
    if (tag && $canAddTag && task && !task.tags.includes(tag)) {
      addTag(task.id, tag);
    }
  }
</script>

<section
  class="active-task"
  class:has-task={task}
  style={task ? `background:${frameColor}` : ''}
  aria-label="Active Task Section"
  on:dragover|preventDefault
  on:drop={sectionDrop}
>
  {#if task}
    <div
      class="current"
      draggable={canDragActiveTask}
      role="listitem"
      aria-label="Active Task"
      on:dragstart={handleWrapperDragStart}
      on:dragend={handleWrapperDragEnd}
    >
      <TodoItem
        {task}
        interceptDrop={false}
        compact={true}
        useThemeBorder={true}
        on:rename={(e) => $canUpdateItem && renameTask(e.detail.id, e.detail.newName)}
        on:changeBorder={(e) => $canUpdateItem && changeBorder(e.detail.id, e.detail.borderColor)}
        on:resetBorder={(e) => $canUpdateItem && resetBorder(e.detail.id)}
        on:delete={(e) => $canDeleteItem && deleteTask(e.detail.id)}
      />
      {#if canMoveActiveTask}
        <div
          class="action drop-left"
          class:visible={showActions}
          role="button"
          tabindex="0"
          aria-label="Move Task Back"
          on:dragover|preventDefault
          on:drop={dropMoveBack}
        >
          ❌
        </div>
      {/if}
      {#if canClearActiveTask}
        <div
          class="action drop-right"
          class:visible={showActions}
          role="button"
          tabindex="0"
          aria-label="Clear Task"
          on:dragover|preventDefault
          on:drop={dropClear}
        >
          ✅
        </div>
      {/if}
    </div>
  {:else}
    <p>No active task</p>
  {/if}
</section>

<style>
  .active-task {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    background: var(--bg-box);
    border: 1px solid var(--border);
    border-radius: 0.25rem;
  }
  .has-task {
    padding: 0.5rem;
    border: none;
  }
  .action {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 6rem;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    user-select: none;
    z-index: 1;
  }
  .drop-left {
    left: 0;
    background: linear-gradient(
      to left,
      transparent 0%,
      #ffdddd 80%,
      #ffdddd 100%
    );
    border-left: 5px solid #ff4444;
  }
  .drop-right {
    right: 0;
    background: linear-gradient(
      to right,
      transparent 0%,
      #ddffdd 80%,
      #ddffdd 100%
    );
    border-right: 5px solid #44aa44;
  }
  .visible {
    display: flex;
  }
  .current {
    position: relative;
  }
</style>
