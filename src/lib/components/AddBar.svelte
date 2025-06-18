<!-- AddBar.svelte -->
<script lang="ts">
  import { addTask } from '$lib';
  let newTask = '';

  function submit() {
    addTask(newTask);
    newTask = '';
  }
</script>

<div class="add-bar">
  <input
    type="text"
    placeholder="Add new task (#tag for tags)"
    bind:value={newTask}
    on:keydown={(e) => e.key === 'Enter' && submit()}
  />
  <button type="button" on:click={submit}>Add</button>
</div>

<style>
  .add-bar {
    display: flex;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
