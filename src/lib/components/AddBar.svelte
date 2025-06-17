<!-- AddBar.svelte -->
<script lang="ts">
  // handle new task input
  import { addTask } from '$lib';
  let newTask = '';

  // add a task and clear input
  function submit() {
    addTask(newTask);
    newTask = '';
  }
</script>

<!-- add bar pinned below the list -->
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
  /* bar wrapper pinned to the bottom */
  .add-bar {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.5rem;
    position: sticky;
    bottom: 0;
    padding-top: 0.5rem;
    background: var(--bg-panel);
  }
</style>
