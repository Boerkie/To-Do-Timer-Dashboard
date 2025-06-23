<!-- ActiveTask.svelte -->
<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import {
    activateTask,
    deactivateTask,
    clearTask,
    moveToTop,
    tasks as tasksStore,
    renameTask,
    changeBorder,
    deleteTask
  } from '$lib';
  import TodoItem from './TodoItem.svelte';
  export let task: TodoTask | null = null;

  let showActions = false;
</script>

<section
  class="active-task"
  class:has-task={task}
  on:dragover|preventDefault
  on:dragenter={() => (showActions = true)}
  on:dragleave={() => (showActions = false)}
  on:drop={(e: DragEvent) => {
    const id = e.dataTransfer?.getData('text/task');
    const tag = e.dataTransfer?.getData('text/tag');
    if (id) activateTask(id);
    if (tag && task && !task.tags.includes(tag)) {
      tasksStore.update((list) => {
        const t = list.find((x) => x.id === task.id);
        if (t) t.tags = [...t.tags, tag];
        return [...list];
      });
    }
  }}
>
  {#if task}
    <TodoItem
      task={task}
      interceptDrop={false}
      compact={true}
      useThemeBorder={true}
      on:dragstart={(e) => {
        showActions = true;
        console.log('dragstart active', task.id);
        (e as unknown as DragEvent).dataTransfer?.setData('text/task', task.id);
      }}
      on:dragend={() => {
        console.log('dragend active');
        showActions = false;
      }}
      on:rename={(e) => renameTask(e.detail.id, e.detail.newName)}
      on:changeBorder={(e) => changeBorder(e.detail.id, e.detail.borderColor)}
      on:delete={(e) => deleteTask(e.detail.id)}
    />
    <div
      class="action drop-left"
      class:visible={showActions}
      on:dragover|preventDefault
      on:drop={(e: DragEvent) => {
        e.stopPropagation();
        moveToTop(task.id);
        deactivateTask(task.id);
        showActions = false;
      }}
    >
      ❌
    </div>
    <div
      class="action drop-right"
      class:visible={showActions}
      on:dragover|preventDefault
      on:drop={(e: DragEvent) => {
        e.stopPropagation();
        clearTask(task.id);
        showActions = false;
      }}
    >
      ✅
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
    padding: 0;
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
</style>
