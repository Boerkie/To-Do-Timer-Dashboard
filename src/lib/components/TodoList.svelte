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
  import { formatMs, getTotalMs, now } from '$lib/timeUtils';
  export let tasks: TodoTask[] = [];

  // compute total active time for a task
  function totalTime(t: TodoTask): number {
    return t.activePeriods.reduce(
      (sum, p) => sum + ((p.end ?? Date.now()) - p.start),
      0,
    );
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
          on:dragstart={(e: DragEvent) =>
            e.dataTransfer?.setData('text/task', t.id)}
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
            <button
              type="button"
              class="priority p{t.priority ?? 4}"
              title={PRIORITY_LABELS[t.priority ?? 4]}
              aria-label="Change priority"
              on:click={() => cyclePriority(t.id)}
            ></button>
            <span class="title">{t.title}</span>
            <span class="time">{formatMs(getTotalMs(t.activePeriods, $now))}</span>
          </div>
          <div class="tags">
            {#each [...t.tags].sort( (a, b) => a.localeCompare( b, undefined, { sensitivity: 'base' }, ), ) as tag}
              <span
                class="tag-pill"
                style="background:{get(tagStyles)[tag]?.bg};color:{get(
                  tagStyles,
                )[tag]?.fg};border-color:{get(tagStyles)[tag]?.border}"
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
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .list-area {
    flex: 1;
    overflow-y: visible;
  }
  .task-row {
    padding: 0.25rem 0.5rem;
    border-radius: 0.35rem;
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
    border: none;
  }
  .task-row .time {
    font-size: 0.8rem;
  }
  .p1 {
    background: #ff5555;
  }
  .p2 {
    background: #ff9900;
  }
  .p3 {
    background: #22aa22;
  }
  .p4 {
    background: #888888;
  }
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
    margin-block-start: 0em;
    padding-left: 2rem;
  }

  .hideNumbers {
    list-style: none;
    padding-left: 0;
  }
</style>
