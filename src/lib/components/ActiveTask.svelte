<!-- ActiveTask.svelte -->
<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import {
    activateTask,
    deactivateTask,
    clearTask,
    moveToTop,
    tagStyles,
    tasks as tasksStore,
    cyclePriority,
    PRIORITY_LABELS
  } from '$lib';
  import { get } from 'svelte/store';
  import { now, getTotalMs, formatMs } from '$lib/timeUtils';
  export let task: TodoTask | null = null;

  let showActions = false;

  $: totalMs = task ? getTotalMs(task.activePeriods, $now) : 0;
  $: displayTime = formatMs(totalMs);
</script>

<section
  class="active-task"
  on:dragover|preventDefault
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
    <div
      class="current"
      draggable="true"
      on:dragstart={(e: DragEvent) => {
        showActions = true;
        e.dataTransfer?.setData('text/active', task.id);
      }}
      on:dragend={() => (showActions = false)}
    >
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
      >❌</div>
      <div
        class="action drop-right"
        class:visible={showActions}
        on:dragover|preventDefault
        on:drop={(e: DragEvent) => {
          e.stopPropagation();
          clearTask(task.id);
          showActions = false;
        }}
      >✅</div>
      <div class="row">
        <span
          class="prio p{task.priority ?? 4}"
          title={PRIORITY_LABELS[task.priority ?? 4]}
          on:click={() => cyclePriority(task.id)}
        ></span>
        <span class="title">{task.title}</span>
        <span class="time">{displayTime}</span>
      </div>
      <div class="tags">
        {#each [...task.tags].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) as tag}
          <span
            class="tag-pill"
            style="background:{get(tagStyles)[tag]?.bg};color:{get(tagStyles)[tag]?.fg};border-color:{get(tagStyles)[tag]?.border}"
            >{tag}</span
          >
        {/each}
      </div>
    </div>
  {:else}
    <p>No active task</p>
  {/if}
</section>

<style>
.active-task {
  padding: 0;
}
.current {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  background: var(--bg-box);
  border: 1px solid var(--border);
  border-radius: 0.25rem;
}
.row {
  display: flex;
  align-items: baseline;
}
.prio {
  width: 1rem;
  height:1rem;
  border-radius: 0.2rem;
  margin-right: 0.5rem;
  cursor: pointer;
}
.title {
  margin-right: auto;
}
.p1 { background: #ff5555; }
.p2 { background: #ff9900; }
.p3 { background: #22aa22; }
.p4 { background: #888888; }
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: flex-end;
}
.tag-pill {
  padding: 0.1rem 0.3rem;
  border: var(--tag-border-width, 2px) solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.7rem;
}

.action {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 5.5rem;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  user-select: none;
}
.drop-left {
  left: 0;
  background: linear-gradient(to left, transparent 0%, #ffdddd 80%, #ffdddd 100%);
  border-left: 5px solid #ff4444;
}
.drop-right {
  right: 0;
  background: linear-gradient(to right, transparent 0%, #ddffdd 80%, #ddffdd 100%);
  border-right: 5px solid #44aa44;
}
.visible {
  display: flex;
}
</style>
