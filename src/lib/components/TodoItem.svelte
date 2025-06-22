<!-- TodoItem.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import type { TodoTask } from '$lib/types';
  import {
    reorderTodo,
    tasks as tasksStore,
    cyclePriority,
    tagStyles,
    PRIORITY_LABELS,
  } from '$lib';
  import { formatMs, getTotalMs, now } from '$lib/timeUtils';

  export let task: TodoTask;

  let titleElement: HTMLSpanElement;
  let isTall = false;
  let menuOpen = false;
  let observer: ResizeObserver;

  // detect number of lines spanned by title
  function checkHeight() {
    const style = getComputedStyle(titleElement);
    const line = parseFloat(style.lineHeight);
    isTall = titleElement.clientHeight / line >= 3;
  }

  // placeholder action handlers
  function renameTask(id: string) {
    console.log('rename task', id);
  }
  function changeBorder(id: string) {
    console.log('change border', id);
  }
  function deleteTask(id: string) {
    console.log('delete task', id);
  }

  onMount(() => {
    checkHeight();
    observer = new ResizeObserver(checkHeight);
    observer.observe(titleElement);
  });

  onDestroy(() => {
    observer.disconnect();
  });
</script>

<li
  class="task-row"
  draggable="true"
  on:dragstart={(e: DragEvent) => e.dataTransfer?.setData('text/task', task.id)}
  on:dragover|preventDefault={() => {}}
  on:drop={(e: DragEvent) => {
    e.stopPropagation();
    const id = e.dataTransfer?.getData('text/task');
    if (id && id !== task.id) reorderTodo(id, task.id);
    const tag = e.dataTransfer?.getData('text/tag');
    if (tag && !task.tags.includes(tag)) {
      tasksStore.update((list) => {
        const t = list.find((x) => x.id === task.id);
        if (t) t.tags = [...t.tags, tag];
        return [...list];
      });
    }
  }}
>
  <div class="row">
    <button
      type="button"
      class="priority p{task.priority ?? 4}"
      title={PRIORITY_LABELS[task.priority ?? 4]}
      aria-label="Change priority"
      on:click={() => cyclePriority(task.id)}
    ></button>
    <span class="title" bind:this={titleElement}>{task.title}</span>
    <button
      type="button"
      class="overflow-btn {isTall ? 'absolute' : ''}"
      tabindex="0"
      aria-label="More actions"
      on:click={() => (menuOpen = !menuOpen)}
    >
      ⋮
    </button>
    <span class="time">{formatMs(getTotalMs(task.activePeriods, $now))}</span>
  </div>
  <div class="tags">
    {#each [...task.tags].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) as tag}
      <span
        class="tag-pill"
        style="background:{get(tagStyles)[tag]?.bg};color:{get(tagStyles)[tag]?.fg};border-color:{get(tagStyles)[tag]?.border}"
      >{tag}</span>
    {/each}
  </div>
  {#if menuOpen}
    <div class="menu">
      <button type="button" on:click={() => renameTask(task.id)}>Rename</button>
      <button type="button" on:click={() => changeBorder(task.id)}>Change border</button>
      <div class="separator"></div>
      <button type="button" on:click={() => deleteTask(task.id)}>Delete</button>
    </div>
  {/if}
</li>

<style>
  .task-row {
    position: relative;
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
  .priority {
    width: 1rem;
    height: 1rem;
    border-radius: 0.2rem;
    cursor: default;
    border: none;
  }
  .time {
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
  .title {
    flex: 1;
  }
  .tags {
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
  .overflow-btn {
    opacity: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .task-row:hover .overflow-btn,
  .task-row:focus-within .overflow-btn {
    opacity: 1;
  }
  .absolute {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
  }
  .menu {
    position: absolute;
    top: 1.5rem;
    right: 0.25rem;
    display: flex;
    flex-direction: column;
    background: var(--bg-box);
    border: 1px solid var(--border);
    border-radius: 0.25rem;
    z-index: 1;
  }
  .menu button {
    background: none;
    border: none;
    padding: 0.25rem 0.75rem;
    text-align: left;
    cursor: pointer;
  }
  .separator {
    height: 1px;
    background: var(--border);
    margin: 0.25rem 0;
  }
</style>
