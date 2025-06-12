<script lang="ts">
  import type { TodoTask } from '$lib/types';
  export let task: TodoTask | null = null;
</script>

<section class="active-task">
  {#if task}
    <h2>{task.title}</h2>
    <p>Active for: <!-- timer placeholder --></p>
  {:else}
    <p>No active task</p>
  {/if}
</section>

<style>
.active-task { padding: 1rem; border: 1px solid currentColor; }
</style>
