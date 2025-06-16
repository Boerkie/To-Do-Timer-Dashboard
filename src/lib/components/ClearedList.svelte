<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import { clearTask } from '$lib';
  export let tasks: TodoTask[] = [];
</script>

<section class="cleared-list">
  <ul
    on:dragover|preventDefault
    on:drop={(e: DragEvent) => {
      const activeId = e.dataTransfer?.getData('text/active');
      if (activeId) clearTask(activeId);
    }}
  >
    {#each tasks as t}
      <li>{t.title}</li>
    {/each}
  </ul>
</section>

<style>
.cleared-list { padding: 1rem; }
</style>
