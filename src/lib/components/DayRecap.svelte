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
  let dateInput: HTMLInputElement;

  // update selected date when the hidden input changes
  function onDateChange() {
    selectedDate = new Date(dateString);
  }

  let dayStartMs = 0;
  let dayEndMs = 0;
  let currentSettings = { dayStart: '08:00', dayEnd: '18:00' };

  // compute day start and end times in milliseconds
  function updateDayRange() {
    const [sh, sm] = currentSettings.dayStart.split(':').map(Number);
    const [eh, em] = currentSettings.dayEnd.split(':').map(Number);
    const base = new Date(selectedDate.toISOString().slice(0, 10));
    dayStartMs = new Date(base).setHours(sh, sm, 0, 0);
    dayEndMs = new Date(base).setHours(eh, em, 0, 0);
  }

  const unsubscribe = settings.subscribe(({ dayStart, dayEnd }) => {
    currentSettings = { dayStart, dayEnd };
    updateDayRange();
  });

  $: if (selectedDate.toISOString().slice(0, 10) !== dateString) {
    dateString = selectedDate.toISOString().slice(0, 10);
    updateDayRange();
  }

  const now = writable(Date.now());
  let timer: ReturnType<typeof setInterval>;
  onMount(() => {
    updateDayRange();
    now.set(Date.now());
    timer = setInterval(() => now.set(Date.now()), 60000);
  });
  onDestroy(() => clearInterval(timer));

  const rangeMs = () => dayEndMs - dayStartMs;

  const recapData = derived([tasks, now], ([$tasks, $now]) => {
    const entries: Array<{ task: TodoTask; periods: Array<{ start: number; end: number }>; first: number }> = [];
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
      if (periods.length) {
        const first = Math.min(...periods.map((p) => p.start));
        entries.push({ task, periods, first });
      }
    });
    return entries.sort((a, b) => a.first - b.first);
  });

  $: hours = [] as number[];
  $: {
    hours = [];
    for (let t = dayStartMs; t <= dayEndMs; t += 3600000) hours.push(t);
  }
</script>

<section class="recap-timeline">
  <header>
    <h2>{selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
    <button class="date-picker" on:click={() => dateInput.showPicker()} aria-label="Pick date">📅</button>
    <input type="date" bind:value={dateString} on:change={onDateChange} bind:this={dateInput} style="display: none" />
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
            >
              <span class="bar-time">{new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          {/each}
          <div class="task-label">
            <span class="prio p{task.priority ?? 4}"></span>
            <span class="label-text">{task.title}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .recap-timeline {
    position: relative;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .timeline-wrapper {
    position: relative;
    height: calc(100% - 1.5rem);
    margin-top: 1.5rem;
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
    overflow: hidden;
    color: #fff;
    font-size: 0.5rem;
  }
  .bar-time {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 0 0.1rem;
    text-align: center;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .task-label {
    position: absolute;
    bottom: -1.8rem;
    left: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    text-align: center;
  }
  .label-text {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .prio {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 0.1rem;
  }
  .p1 { background: #ff5555; }
  .p2 { background: #ff9900; }
  .p3 { background: #22aa22; }
  .p4 { background: #888888; }

  .date-picker {
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
  }
</style>
