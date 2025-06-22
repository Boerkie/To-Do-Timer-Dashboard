<!-- DayRecap.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { tasks } from '$lib/stores/tasks';
  import { settings } from '$lib/stores/settings';
  import { PRIORITY_COLORS } from '$lib/constants';
  import type { TodoTask, ActivePeriod } from '$lib/types';
  import { now } from '$lib/timeUtils';

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

  onMount(() => {
    updateDayRange();
  });

  const rangeMs = () => dayEndMs - dayStartMs;

  const recapData = derived([tasks, now], ([$tasks, $now]) => {
    const entries: Array<{
      task: TodoTask;
      periods: Array<{ start: number; end: number }>;
      first: number;
    }> = [];
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

<div class="box-header">
  <h2 class="header-title">
    {selectedDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}
  </h2>
  <div class="picker-group">
    <button
      class="date-picker"
      on:click={() => dateInput.showPicker()}
      aria-label="Pick date">📅</button
    >
    <!-- Invisible but layout-present input -->
    <input
      type="date"
      bind:this={dateInput}
      bind:value={dateString}
      on:change={onDateChange}
      class="offscreen-input"
    />
  </div>
</div>
<section class="recap-timeline">
  <div class="timeline-wrapper">
    <div class="time-grid">
      {#each hours as h}
        <div
          class="hour-line"
          style:top={((h - dayStartMs) / rangeMs()) * 100 + '%'}
        >
          {new Date(h).toLocaleTimeString([], { hour: '2-digit' })}
        </div>
      {/each}
    </div>
    <div class="bars-container">
      {#each $recapData as { task, periods }}
        <div class="event-wrap">
          {#each periods as { start, end }}
            <div
              class="event-bar"
              style="background-color: {PRIORITY_COLORS[
                task.priority ?? 4
              ]}; top: {((start - dayStartMs) / rangeMs()) *
                100}%; height: {((end - start) / rangeMs()) * 100}%"
              title={`${task.title}: ${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            >
              <span class="bar-time"
                >{new Date(start).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })} – {new Date(end).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span
              >
            </div>
          {/each}
          <div class="bar-label">
            <span class="prio p{task.priority ?? 4}"></span>
            <span class="label-text">{task.title}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
  }
  .offscreen-input {
    position: absolute;
    width: 0;
    height: 0;
    margin: 0;
    padding: 0;
    opacity: 0;
    pointer-events: none;
  }
  .recap-timeline {
    position: relative;
    height: 90%;
    --column-width: 4rem;
  }
  .timeline-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    height: 96%;
    position: relative;
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
  .bars-container {
    position: relative;
    display: flex;
    gap: 0.5rem;
    padding-left: 1rem;
    height: 100%;
    overflow-y: visible;
  }
  .event-wrap {
    position: relative;
    flex: 0 0 var(--column-width);
    height: 100%;
  }
  .event-bar {
    position: absolute;
    left: 0;
    min-height: 20px;
    width: 100%;
    border-radius: 0.25rem;
    overflow: hidden;
    color: #fff;
    font-size: 0.8rem;
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
  .bar-label {
    position: absolute;
    bottom: -2.5rem;
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

  .date-picker {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
  }
</style>
