<script lang="ts">
  import {
    PageBanner,
    DayRecap,
    ActiveTask,
    TodoList,
    ClearedList,
    AdvancedDetails,
    TagsList,
    tasks
  } from '$lib';
  import { derived } from 'svelte/store';

  const activeTask = derived(tasks, ($tasks) =>
    $tasks.find((t) => t.activePeriods.some((p) => p.end === null)) ?? null
  );
  const todoTasks = derived(tasks, ($tasks) =>
    $tasks.filter((t) => !t.isDone && t.activePeriods.every((p) => p.end !== null))
  );
  const clearedTasks = derived(tasks, ($tasks) => $tasks.filter((t) => t.isDone));
  const tags = derived(tasks, ($tasks) => [...new Set($tasks.flatMap((t) => t.tags))]);
</script>

<PageBanner />

<div class="layout">
  <DayRecap />
  <section class="main">
    <ActiveTask task={$activeTask} />
    <TodoList tasks={$todoTasks} />
    <ClearedList tasks={$clearedTasks} />
    <AdvancedDetails task={$activeTask} />
    <TagsList tags={$tags} />
  </section>
</div>

<style>
  .layout {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .layout > :first-child {
    flex: 1 1 40%;
  }

  .main {
    flex: 1 1 60%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
