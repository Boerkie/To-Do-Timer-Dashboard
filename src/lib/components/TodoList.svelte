<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import { addTask } from '$lib';
  export let tasks: TodoTask[] = [];

  let newTask = '';

  function submit() {
    addTask(newTask);
    newTask = '';
  }
</script>

<section class="todo-list">
  <h2>To-Do</h2>
  <ul>
    {#each tasks as t}
      <li>{t.title}</li>
    {/each}
  </ul>
  <div class="add-bar">
    <input
      type="text"
      placeholder="Add new task (#tag)"
      bind:value={newTask}
      on:keydown={(e) => e.key === 'Enter' && submit()}
    />
    <button type="button" on:click={submit}>Add</button>
  </div>
</section>

<style>
.todo-list { padding: 1rem; }
.add-bar {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}
</style>
