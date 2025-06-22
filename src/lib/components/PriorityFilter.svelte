<!-- PriorityFilter.svelte -->
<script lang="ts">
  import { PRIORITY_LABELS, priorityFilter } from '$lib';

  const priorities = [1, 2, 3, 4];

  function toggle(prio: number) {
    priorityFilter.update((v) => (v === prio ? null : prio));
  }
</script>

<section class="priority-filter">
  {#each priorities as p}
    <button
      class="prio p{p}"
      class:selected={$priorityFilter === p}
      type="button"
      on:click={() => toggle(p)}
    >
      {PRIORITY_LABELS[p]}
    </button>
  {/each}
</section>

<style>
  .priority-filter {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }
  .priority-filter button {
    border: none;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border-radius: 0.25rem;
    color: #fff;
  }
  .priority-filter button.selected {
    outline: 2px solid var(--accent);
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
