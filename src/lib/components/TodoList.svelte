<script lang="ts">
  import type { TodoTask } from '$lib/types';
  export let tasks: TodoTask[] = [];
</script>

<section class="todo-list">
  <h2>To-Do</h2>
  <ul>
    {#each tasks as t}
      <li>{t.title}</li>
    {/each}
  </ul>
</section>

<style>
.todo-list { padding: 1rem; }
</style>
