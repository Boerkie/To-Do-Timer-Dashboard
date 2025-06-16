<!-- DayRecap.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tasks } from '$lib/stores/tasks';
  import { settings } from '$lib/stores/settings';
  import type { TodoTask, ActivePeriod } from '$lib/types';
  import { derived, writable } from 'svelte/store';

  export let selectedDate: Date = new Date();
  let dateString: string = selectedDate.toISOString().slice(0, 10);

  function onDateChange() {
    selectedDate = new Date(dateString);
  }

  let dayStartMs: number;
  let dayEndMs: number;
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

  const now = writable(Math.floor(Date.now() / (5 * 60000)) * (5 * 60000));
  let timer: ReturnType<typeof setInterval>;

  onMount(() => {
    now.set(Math.floor(Date.now() / (5 * 60000)) * (5 * 60000));
    timer = setInterval(
      () => now.set(Math.floor(Date.now() / (5 * 60000)) * (5 * 60000)),
      5 * 60000
    );
  });

  onDestroy(() => clearInterval(timer));

  const recapData = derived([tasks, now], ([$tasks, $now]) => {
    const map = new Map<string, { task: TodoTask; periods: Array<{ start: number; end: number }> }>();
    $tasks.forEach((task) => {
      task.activePeriods?.forEach((p: ActivePeriod) => {
        const s = new Date(p.start).getTime();
        const e = p.end ? new Date(p.end).getTime() : $now;
        if (s < dayEndMs && e > dayStartMs) {
          const start = Math.max(s, dayStartMs);
          const end = Math.min(e, dayEndMs);
          if (end > start) {
            if (!map.has(task.id)) map.set(task.id, { task, periods: [] });
            map.get(task.id)!.periods.push({ start, end });
          }
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.periods[0].start - b.periods[0].start);
  });

  const rangeMs = () => dayEndMs - dayStartMs;
</script>

<section class="day-recap">
  <header>
    <input type="date" bind:value={dateString} on:change={onDateChange} />
  </header>

  <div class="timeline-container">
    {#each $recapData as { task, periods }, row}
      <div class="task-line" style:top={row * 1.5 + 'rem'}>
        <span class="task-label">{task.title}</span>
        {#each periods as { start, end }}
          <div
            class="bar"
            title={`${task.title}: ${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            style:left={(start - dayStartMs) / rangeMs() * 100 + '%'}
            style:width={(end - start) / rangeMs() * 100 + '%'}
          ></div>
        {/each}
      </div>
    {/each}

    <div class="marker start" style:left="0%">DS</div>
    <div class="marker end" style:left="100%">DE</div>
    <div
      class="marker now"
      style:left={($now - dayStartMs) / rangeMs() * 100 + '%'}
    >NOW</div>
  </div>
</section>

<style>
  .timeline-container {
    position: relative;
    height: 10rem;
    border: 1px solid var(--border);
    margin-top: 1rem;
  }

  .bar {
    position: absolute;
    height: 1rem;
    background: var(--accent);
    border-radius: 0.25rem;
  }

  .task-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1.5rem;
  }

  .task-label {
    position: absolute;
    left: -0.5rem;
    transform: translateX(-100%);
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .marker {
    position: absolute;
    top: 0;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .marker.start { color: green; }
  .marker.end { color: red; }
  .marker.now { color: blue; transform: translateX(-50%); }
</style>
