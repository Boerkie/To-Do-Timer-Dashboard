<!-- TodoList.svelte -->
<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import {
    activateTask,
    deactivateTask,
    reorderTodo,
    tagStyles,
    tasks as tasksStore,
    cyclePriority,
    PRIORITY_LABELS
  } from '$lib';
  import { settings } from '$lib/stores/settings';
  import { get } from 'svelte/store';
  export let tasks: TodoTask[] = [];

  // format milliseconds into HH:MM:SS
  function formatDuration(ms: number): string {
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  // compute total active time for a task
  function totalTime(t: TodoTask): number {
    return t.activePeriods.reduce((sum, p) => sum + ((p.end ?? Date.now()) - p.start), 0);
  }

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
        <li
          class="task-row"
          draggable="true"
          on:dragstart={(e: DragEvent) => e.dataTransfer?.setData('text/task', t.id)}
          on:dragover|preventDefault={() => {}}
          on:drop={(e: DragEvent) => {
            e.stopPropagation();
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
          <div class="row">
            <span
              class="priority p{t.priority ?? 4}"
              title={PRIORITY_LABELS[t.priority ?? 4]}
              on:click={() => cyclePriority(t.id)}
            ></span>
            <span class="title">{t.title}</span>
            <span class="time">{formatDuration(totalTime(t))}</span>
          </div>
          <div class="tags">
            {#each [...t.tags].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) as tag}
              <span
                class="tag-pill"
                style="background:{get(tagStyles)[tag]?.bg};color:{get(tagStyles)[tag]?.fg};border-color:{get(tagStyles)[tag]?.border}"
                >{tag}</span
              >
            {/each}
          </div>
        </li>
      {/each}
    </ol>
  </div>
</section>

<style>
.todo-list {
  /* container with flexible layout */
  padding: 1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.list-area {
  /* scrolling area for tasks only */
  flex: 1;
  overflow-y: auto;
}
.task-row {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
  background: var(--bg-box);
  border: 2px solid var(--border);
  cursor: grab;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  
}
.task-row .priority {
    width: 1rem;
    height: 1rem;
    border-radius: 0.2rem;
  cursor: default;
}
.task-row .time {
  font-size: 0.8rem;
}
.p1 { background: #ff5555; }
.p2 { background: #ff9900; }
.p3 { background: #22aa22; }
.p4 { background: #888888; }
.task-row .title {
  flex: 1;
}
.task-row .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
  justify-content: flex-end;
}
.tag-pill {
  padding: 0.1rem 0.3rem;
  border-radius: 0.5rem;
  border: var(--tag-border-width, 2px) solid var(--border);
  font-size: 0.7rem;
}

ol {
  list-style-position: outside;
  padding-left: 2rem;
}

.hideNumbers {
  list-style: none;
  padding-left: 0;
}
</style>
