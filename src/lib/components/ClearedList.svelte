<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import { clearTask } from '$lib';
  export let tasks: TodoTask[] = [];
</script>

<section class="cleared-list">
  <ul>
    {#each tasks as t}
      <li>
        <span>{t.title}</span>
        <button type="button" class="delete-btn" on:click={() => clearTask(t.id)}>
          🗑️
        </button>
      </li>
    {/each}
  </ul>
</section>

<style>
  .cleared-list {
    padding: 1rem;
  }
  ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-box);
    border: 2px solid var(--border);
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
  }
  .delete-btn {
    background: transparent;
    border: none;
    cursor: pointer;
  }
</style>
