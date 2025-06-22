<!-- TodoList.svelte -->
<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import {
    deactivateTask,
    reorderTodo,
    renameTask,
    changeBorder,
    deleteTask as removeTask
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
        const id = e.dataTransfer?.getData('text/task');
        const activeId = e.dataTransfer?.getData('text/active');
        if (id) reorderTodo(id, null);
        if (activeId) deactivateTask(activeId);
      }}
    >
      {#each tasks as t}
        <TodoItem
          task={t}
          on:rename={(e) => renameTask(e.detail.id, e.detail.newName)}
          on:changeBorder={(e) => changeBorder(e.detail.id, e.detail.borderColor)}
          on:delete={(e) => removeTask(e.detail.id)}
        />
      {/each}
    </ol>
  </div>
</section>

<style>
  .todo-list {
    /* container with flexible layout */
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
