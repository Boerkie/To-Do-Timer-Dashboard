<!-- AdvancedDetails.svelte -->
<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import { tagStyles, tasks as tasksStore, PRIORITY_LABELS, ensureTagStyle } from '$lib';
  import { get } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';
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
  const dispatch = createEventDispatcher();

  let editingTitle = false;
  let draftTitle = '';
  let addingTag = false;
  let newTag = '';
  const MAX_TAG_LENGTH = 20;
  let draftDetails = '';

  $: totalMs = task ? getTotalMs(task.activePeriods, $now) : 0;
  $: displayTime = formatMs(totalMs);

  // raw totals for the last N days (excluding today)
  let rawLastDaysTotals: { date: string; duration: string }[] = [];
  $: if (task) {
    const snapshotTimestamp = Date.now();
    rawLastDaysTotals = getLastDaysTotals(
      task.activePeriods,
      daysToShow,
      snapshotTimestamp,
    );
  } else {
    rawLastDaysTotals = [];
  }

  // only keep days with non-zero duration
  let lastDaysTotals: { date: string; duration: string }[] = [];
  $: lastDaysTotals = rawLastDaysTotals.filter(
    ({ duration }) => duration !== '00:00:00',
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

  function startTitleEdit() {
    if (!task) return;
    draftTitle = task.title;
    editingTitle = true;
  }

  function commitTitle() {
    if (!task) return;
    editingTitle = false;
    dispatch('rename', { id: task.id, newName: draftTitle });
  }

  function startAddTag() {
    addingTag = true;
    newTag = '';
  }

  function commitTag() {
    if (!task) {
      addingTag = false;
      return;
    }
    const tagName = newTag.trim();
    const valid = /^[A-Za-z0-9_-]+$/.test(tagName);
    if (
      tagName &&
      valid &&
      tagName.length <= MAX_TAG_LENGTH &&
      !task.tags.some((t) => t.toLowerCase() === tagName.toLowerCase())
    ) {
      ensureTagStyle(tagName);
      dispatch('addTag', { id: task.id, tagName });
    }
    addingTag = false;
  }
</script>

<section class="advanced-details" bind:this={detailsSection}>
  {#if task}
    <div class="header" on:dblclick={startTitleEdit} role="button" tabindex="0" aria-label="Edit title (double click)">
      {#if editingTitle}
        <input
          class="title-input"
          bind:value={draftTitle}
          on:blur={commitTitle}
          on:keydown={(e) => {
            if (e.key === 'Enter') commitTitle();
            if (e.key === 'Escape') {
              editingTitle = false;
              draftTitle = task.title;
            }
          }}
        />
      {:else}
        <h3>{task.title}</h3>
        <button
          type="button"
          class="edit-icon"
          aria-label="Edit title"
          on:click={startTitleEdit}
          on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && startTitleEdit()}
        >✎</button>
      {/if}
    </div>
    <textarea
      placeholder="Task details"
      bind:value={task.details}
      on:focus={() => (draftDetails = task.details ?? '')}
      on:keydown={(e) => {
        if (e.key === 'Escape') {
          task.details = draftDetails;
          (e.target as HTMLTextAreaElement).blur();
        }
      }}
    ></textarea>
    <div class="readonly">Recent Time spend</div>
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
          role="button"
          tabindex="0"
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
      {#if addingTag}
        <input
          class="tag-pill tag-input"
          bind:value={newTag}
          on:blur={commitTag}
          on:keydown={(e) => {
            if (e.key === 'Enter') commitTag();
            if (e.key === 'Escape') {
              addingTag = false;
              newTag = '';
            }
          }}
        />
      {:else}
        <button type="button" class="tag-pill add-tag" on:click={startAddTag}>[+]</button>
      {/if}
    </div>
  {:else}
    <div class="advanced-details">
      <div class="header">
        <h3>Example Task</h3>
      </div>
      <textarea placeholder="Task details" disabled readonly>Drag a task from the TO DO list to the Active box to see it's advanced details here.</textarea>
      <div class="readonly">Recent Time spend</div>
      <div class="readonly">Today: 01:23:45</div>
      <div class="readonly">Yesterday: 02:34:56</div>
      <div class="readonly priority-display">
        <span class="prio p2"></span>
        P2 - High
      </div>
      <div class="readonly">
        Created: 2025-06-19 09:00:00
      </div>
      <div class="tags">
        <span class="tag-pill" style="background:#ffeb3b;color:#333;border-color:#fbc02d" tabindex="-1">work</span>
        <span class="tag-pill" style="background:#90caf9;color:#333;border-color:#1976d2" tabindex="-1">project</span>
      </div>
    </div>
  {/if}
</section>

<style>
  .advanced-details {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .header {
    position: relative;
    display: flex;
    margin-top: 0px;
  }
  .edit-icon {
    opacity: 0;
    cursor: pointer;
    font-size: 0.8rem;
    background: var(--bg-box);
    border: none;
    color: var(--contrast-color);
    height: 2rem;
  }
  .header:hover .edit-icon {
    opacity: 1;
  }
  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  .title-input {
    font: inherit;
    border: none;
    background: transparent;
    width: 100%;
    margin-bottom: 1rem;
    color: var(--contrast-color);
  }
  textarea {
    width: 100%;
    min-height: 4rem;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .tag-pill {
    padding: 0.2rem 0.5rem;
    border-radius: 0.5rem;
    border: var(--tag-border-width, 2px) solid var(--border);
    font-size: 0.75rem;
    cursor: grab;
  }
  .add-tag {
    margin-left: auto;
    cursor: pointer;
  }
  .tag-input {
    margin-left: auto;
    font: inherit;
    border: none;
    background: transparent;
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

</style>
