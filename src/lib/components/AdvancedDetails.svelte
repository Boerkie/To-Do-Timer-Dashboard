<!-- AdvancedDetails.svelte -->
<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import { tagStyles, tasks as tasksStore, PRIORITY_LABELS } from '$lib';
  import { get } from 'svelte/store';
  import {
    now,
    getTotalMs,
    formatMs,
    getLastDaysTotals,
    dayBoundary,
  } from '$lib/timeUtils';

  export let task: TodoTask | null = null;
  export let daysToShow = 7;
  let detailsSection: HTMLElement;

  $: totalMs = task ? getTotalMs(task.activePeriods, $now) : 0;
  $: displayTime = formatMs(totalMs);

   // raw totals for the last N days (excluding today)
  let rawLastDaysTotals: { date: string; duration: string }[] = [];
  $: if (task) {
    const snapshotTimestamp = Date.now();
    rawLastDaysTotals = getLastDaysTotals(
      task.activePeriods,
      daysToShow,
      snapshotTimestamp
    );
  } else {
    rawLastDaysTotals = [];
  }

  // only keep days with non-zero duration
  let lastDaysTotals: { date: string; duration: string }[] = [];
  $: lastDaysTotals = rawLastDaysTotals.filter(
    ({ duration }) => duration !== '00:00:00'
  );

  // recompute yesterday's date string at each local midnight
  let yesterdayDateStr = '';
  $: if ($dayBoundary) {
    const d = new Date($dayBoundary);
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    yesterdayDateStr = `${yyyy}-${mm}-${dd}`;
  }
  
  function removeTag(tag: string) {
    if (!task) return;
    tasksStore.update((list) => {
      const t = list.find((x) => x.id === task!.id);
      if (t) t.tags = t.tags.filter((tg) => tg !== tag);
      return [...list];
    });
  }
</script>

<section class="advanced-details" bind:this={detailsSection}>
  {#if task}
    <div class="header">
      <h3>{task.title}</h3>
    </div>
    <textarea placeholder="Task details" bind:value={task.details}></textarea>
    <div class="readonly">Today: {displayTime}</div>
    {#each lastDaysTotals as { date, duration }}
      <div class="readonly">
        {date === yesterdayDateStr ? 'Yesterday' : date}: {duration}
      </div>
    {/each}
    <div class="readonly priority-display">
      <span class="prio p{task.priority ?? 4}"></span>
      {PRIORITY_LABELS[task.priority ?? 4]}
    </div>
    <div class="readonly">
      Created: {new Date(task.createdAt).toLocaleString()}
    </div>
    <div class="tags">
      {#each [...task.tags].sort( (a, b) => a.localeCompare( b, undefined, { sensitivity: 'base' }, ), ) as tag}
        <span
          class="tag-pill"
          draggable="true"
          on:dragstart={(e: DragEvent) =>
            e.dataTransfer?.setData('text/tag', tag)}
          on:dragend={(e: DragEvent) => {
            const el = detailsSection;
            if (!el.contains(document.elementFromPoint(e.clientX, e.clientY))) {
              removeTag(tag);
            }
          }}
          style="background:{get(tagStyles)[tag]?.bg};color:{get(tagStyles)[tag]
            ?.fg};border-color:{get(tagStyles)[tag]?.border}">{tag}</span
        >
      {/each}
    </div>
  {:else}
    <div class="placeholder">
      <div class="header">
        <h3>&nbsp;</h3>
        <span class="time">00:00:00</span>
      </div>
      <textarea placeholder="Task details" disabled></textarea>
      <div class="readonly">Today: 00:00:00</div>
      <div class="readonly priority-display">
        <span class="prio p4"></span>
        P4 - Low
      </div>
      <div class="readonly">Created:</div>
      <div class="tags"></div>
    </div>
  {/if}
</section>

<style>
  .advanced-details {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  textarea {
    width: 100%;
    min-height: 4rem;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    justify-content: flex-start;
  }
  .tag-pill {
    padding: 0.2rem 0.5rem;
    border-radius: 0.5rem;
    border: var(--tag-border-width, 2px) solid var(--border);
    font-size: 0.75rem;
    cursor: grab;
  }
  .readonly {
    font-size: 0.8rem;
  }
  .priority-display {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .prio {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 0.1rem;
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
  .placeholder {
    visibility: hidden;
  }
</style>
