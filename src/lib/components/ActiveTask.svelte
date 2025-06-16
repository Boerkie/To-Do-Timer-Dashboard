<script lang="ts">
  import type { TodoTask } from '$lib/types';
  import { activateTask, tagStyles } from '$lib';
  import { get } from 'svelte/store';
  export let task: TodoTask | null = null;
</script>

<section
  class="active-task"
  on:dragover|preventDefault
  on:drop={(e) => {
    const id = e.dataTransfer.getData('text/task');
    if (id) activateTask(id);
  }}
>
  {#if task}
    <div
      class="current"
      draggable="true"
      on:dragstart={(e) => e.dataTransfer.setData('text/active', task.id)}
    >
      <h2>{task.title}</h2>
      <div class="tags">
        {#each task.tags as tag}
          <span
            class="tag-pill"
            style="background:{get(tagStyles)[tag]?.bg};color:{get(tagStyles)[tag]?.fg};border-color:{get(tagStyles)[tag]?.border}"
            >{tag}</span
          >
        {/each}
      </div>
    </div>
  {:else}
    <p>No active task</p>
  {/if}
</section>

<style>
.active-task {
  padding: 1rem;
  border: 1px solid currentColor;
  min-height: 3rem;
}
.current {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tag-pill {
  padding: 0.1rem 0.3rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.7rem;
}
</style>
