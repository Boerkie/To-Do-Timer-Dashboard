<script lang="ts">
  import type { TodoTask } from '$lib/types';
  export let task: TodoTask | null = null;
</script>

<section class="advanced-details">
  <h2>Details</h2>
  {#if task}
    <textarea placeholder="Task details" bind:value={task.details}></textarea>
  {:else}
    <p>No task selected.</p>
  {/if}
</section>

<style>
.advanced-details { padding: 1rem; }
</style>
