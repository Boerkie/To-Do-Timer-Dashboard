<script lang="ts">
  import type { TodoTask } from '$lib/types';
  export let tasks: TodoTask[] = [];
</script>

<section class="cleared-list">
  <h2>Cleared</h2>
  <ul>
    {#each tasks as t}
      <li>{t.title}</li>
    {/each}
  </ul>
</section>

<style>
.cleared-list { padding: 1rem; }
</style>
