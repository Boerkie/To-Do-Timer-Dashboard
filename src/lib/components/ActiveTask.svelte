<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import { activateTask, tagStyles } from '$lib';
  import { get } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';
  export let task: TodoTask | null = null;

  let now = Date.now();
  let timer: ReturnType<typeof setInterval>;

  onMount(() => {
    timer = setInterval(() => (now = Date.now()), 1000);
  });
  onDestroy(() => clearInterval(timer));

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

  $: totalTime = task
    ? task.activePeriods.reduce(
        (sum, p) => sum + ((p.end ?? now) - p.start),
        0
      )
    : 0;
</script>

<section
  class="active-task"
  on:dragover|preventDefault
  on:drop={(e: DragEvent) => {
    const id = e.dataTransfer?.getData('text/task');
    if (id) activateTask(id);
  }}
>
  {#if task}
    <div
      class="current"
      draggable="true"
      on:dragstart={(e: DragEvent) => e.dataTransfer?.setData('text/active', task.id)}
    >
      <div class="row">
        <span class="title">{task.title}</span>
        <span class="time">{formatDuration(totalTime)}</span>
      </div>
      <div class="tags">
        {#each [...task.tags].sort() as tag}
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
  padding: 1rem;
  border: 1px solid currentColor;
  min-height: 3rem;
}
.current {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: flex-end;
}
.tag-pill {
  padding: 0.1rem 0.3rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.7rem;
}
</style>
