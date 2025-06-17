<!-- DayRecap.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { derived, writable } from 'svelte/store';
  import { tasks } from '$lib/stores/tasks';
  import { settings } from '$lib/stores/settings';
  import { PRIORITY_COLORS } from '$lib/constants';
  import type { TodoTask, ActivePeriod } from '$lib/types';

  export let selectedDate: Date = new Date();
  let dateString: string = selectedDate.toISOString().slice(0, 10);
  function onDateChange() {
    selectedDate = new Date(dateString);
  }

  let dayStartMs = 0;
  let dayEndMs = 0;
  const unsubscribe = settings.subscribe(({ dayStart, dayEnd }) => {
    const [sh, sm] = dayStart.split(':').map(Number);
    const [eh, em] = dayEnd.split(':').map(Number);
    const base = new Date(selectedDate.toISOString().slice(0, 10));
    dayStartMs = new Date(base).setHours(sh, sm, 0, 0);
    dayEndMs = new Date(base).setHours(eh, em, 0, 0);
  });

  $: if (selectedDate.toISOString().slice(0, 10) !== dateString) {
    dateString = selectedDate.toISOString().slice(0, 10);
  }

  const now = writable(Date.now());
  let timer: ReturnType<typeof setInterval>;
  onMount(() => {
    now.set(Date.now());
    timer = setInterval(() => now.set(Date.now()), 60000);
  });
  onDestroy(() => clearInterval(timer));

  const rangeMs = () => dayEndMs - dayStartMs;

  const recapData = derived([tasks, now], ([$tasks, $now]) => {
    const entries: Array<{ task: TodoTask; periods: Array<{ start: number; end: number }> }> = [];
    $tasks.forEach((task) => {
      const periods: Array<{ start: number; end: number }> = [];
      task.activePeriods.forEach((p: ActivePeriod) => {
        const s = p.start;
        const e = p.end ?? $now;
        if (s < dayEndMs && e > dayStartMs) {
          const start = Math.max(s, dayStartMs);
          const end = Math.min(e, dayEndMs);
          if (end > start) periods.push({ start, end });
        }
      });
      if (periods.length) entries.push({ task, periods });
    });
    return entries.sort((a, b) => a.task.createdAt - b.task.createdAt);
  });

  $: hours = [] as number[];
  $: {
    hours = [];
    for (let t = dayStartMs; t <= dayEndMs; t += 3600000) hours.push(t);
  }
</script>

<section class="recap-timeline">
  <header>
    <input type="date" bind:value={dateString} on:change={onDateChange} />
  </header>
  <div class="timeline-wrapper">
    <div class="time-grid">
      {#each hours as h}
        <div class="hour-line" style:top={(h - dayStartMs) / rangeMs() * 100 + '%'}>
          {new Date(h).toLocaleTimeString([], { hour: '2-digit' })}
        </div>
      {/each}
    </div>
    <div class="task-columns">
      {#each $recapData as { task, periods }}
        <div class="task-column">
          {#each periods as { start, end }}
            <div
              class="task-bar"
              style="background-color: {PRIORITY_COLORS[task.priority ?? 4]}; top: {(start - dayStartMs) / rangeMs() * 100}%; height: {(end - start) / rangeMs() * 100}%"
              title={`${task.title}: ${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            ></div>
          {/each}
          <div class="task-label">{task.title}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .recap-timeline {
    position: relative;
    height: 18rem;
    overflow-x: auto;
  }
  .timeline-wrapper {
    position: relative;
    height: 100%;
  }
  .time-grid {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
  .hour-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    border-top: 1px solid var(--border);
    font-size: 0.65rem;
    line-height: 0;
  }
  .task-columns {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    gap: 0.5rem;
    padding-left: 3rem;
  }
  .task-column {
    position: relative;
    flex: 0 0 4rem;
  }
  .task-bar {
    position: absolute;
    left: 25%;
    width: 50%;
    border-radius: 0.25rem;
  }
  .task-label {
    position: absolute;
    bottom: -1.2rem;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
