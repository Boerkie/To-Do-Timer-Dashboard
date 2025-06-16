<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import {
    addTask,
    activateTask,
    deactivateTask,
    reorderTodo,
    tagStyles,
    tasks as tasksStore
  } from '$lib';
  import { get } from 'svelte/store';
  export let tasks: TodoTask[] = [];

  let newTask = '';

  function submit() {
    addTask(newTask);
    newTask = '';
  }
</script>

<section class="todo-list">
  <ul
    on:dragover|preventDefault
    on:drop={(e: DragEvent) => {
      const id = e.dataTransfer?.getData('text/task');
      const activeId = e.dataTransfer?.getData('text/active');
      if (id) reorderTodo(id, null);
      if (activeId) deactivateTask(activeId);
    }}
  >
    {#each tasks as t}
      <li
        class="task-row"
        draggable="true"
        on:dragstart={(e: DragEvent) => e.dataTransfer?.setData('text/task', t.id)}
        on:dragover|preventDefault={() => {}}
        on:drop={(e: DragEvent) => {
          const id = e.dataTransfer?.getData('text/task');
          if (id && id !== t.id) reorderTodo(id, t.id);
          const tag = e.dataTransfer?.getData('text/tag');
          if (tag && !t.tags.includes(tag)) {
            tasksStore.update((list) => {
              const task = list.find((x) => x.id === t.id);
              if (task) task.tags = [...task.tags, tag];
              return [...list];
            });
          }
        }}
      >
        <span class="priority"></span>
        <span class="title">{t.title}</span>
        <span class="tags">
          {#each t.tags as tag}
            <span
              class="tag-pill"
              style="background:{get(tagStyles)[tag]?.bg};color:{get(tagStyles)[tag]?.fg};border-color:{get(tagStyles)[tag]?.border}"
              >{tag}</span
            >
          {/each}
        </span>
      </li>
    {/each}
  </ul>
  <div class="add-bar">
    <input
      type="text"
      placeholder="Add new task (#tag for tags)"
      bind:value={newTask}
      on:keydown={(e) => e.key === 'Enter' && submit()}
    />
    <button type="button" on:click={submit}>Add</button>
  </div>
</section>

<style>
.todo-list { padding: 1rem; }
.task-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
  background: var(--bg-box);
  border: 1px solid var(--border);
}
.task-row .priority {
  width: 0.75rem;
  height: 0.75rem;
  background: #888;
  margin-right: 0.5rem;
  border-radius: 0.1rem;
}
.task-row .title {
  flex: 1;
}
.task-row .tags {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
}
.tag-pill {
  padding: 0.1rem 0.3rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  font-size: 0.7rem;
}
.add-bar {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}
</style>
