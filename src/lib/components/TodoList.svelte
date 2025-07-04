<!-- TodoList.svelte -->
<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import {
    deactivateTask,
    reorderTodo,
    renameTask,
    changeBorder,
    resetBorder,
    deleteTask as removeTask,
    addTag
  } from '$lib';
  import TodoItem from './TodoItem.svelte';
  import { settings } from '$lib/stores/settings';
  export let tasks: TodoTask[] = [];
</script>

<section class="todo-list">
  <div class="list-area">
    <ol
      class:hideNumbers={!$settings.showListNumbers}
      on:dragover|preventDefault
      on:drop={(e: DragEvent) => {
        const tag = e.dataTransfer?.getData('text/tag');
        if (tag) {
          const target = document.elementFromPoint(e.clientX, e.clientY);
          const li = target?.closest('li.task-row') as HTMLLIElement | null;
          const taskId = li?.dataset.id;
          if (taskId) addTag(taskId, tag);
          return;
        }
        const draggedId = e.dataTransfer?.getData('text/task');
        if (!draggedId) return;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const li = target?.closest('li.task-row') as HTMLLIElement | null;
        const beforeId = li?.dataset.id ?? null;
        reorderTodo(draggedId, beforeId);
        deactivateTask(draggedId);
      }}
    >
      {#each tasks as t}
        <TodoItem
          task={t}
          interceptDrop={false}
          on:rename={(e) => renameTask(e.detail.id, e.detail.newName)}
          on:changeBorder={(e) => changeBorder(e.detail.id, e.detail.borderColor)}
          on:resetBorder={(e) => resetBorder(e.detail.id)}
          on:delete={(e) => removeTask(e.detail.id)}
        />
      {/each}
    </ol>
  </div>
</section>

<style>
  .todo-list {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .list-area {
    flex: 1;
    overflow-y: visible;
  }

  ol {
    list-style-position: outside;
    margin-block-start: 0em;
    margin-block-end: 0em;
    padding-left: 2rem;
  }

  .hideNumbers {
    list-style: none;
    padding-left: 0;
  }
</style>
