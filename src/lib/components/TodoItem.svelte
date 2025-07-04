<!-- TodoItem.svelte -->
<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { get } from 'svelte/store';
  import type { TodoTask } from '$lib/types';
  import { reorderTodo, cyclePriority, tagStyles, tasks, PRIORITY_LABELS } from '$lib';
  import { clickOutside } from '$lib/actions/clickOutside';
  import { formatMs, getTotalMs, now } from '$lib/timeUtils';

  export let task: TodoTask;
  export let interceptDrop = true;
  export let compact = false;
  export let useThemeBorder = false;

  let titleElement: HTMLSpanElement;
  let rowElement: HTMLLIElement;
  let overflowBtn: HTMLButtonElement;
  let colorInput: HTMLInputElement;
  let menuOpen = false;
  let menuLeft = 0;
  let menuTop = 0;
  let editingTitle = false;
  let showColorPicker = false;
  let draftTitle = task.title;
  let draftBorderColor = task.borderColor || '#000000';

  let dragging = false;

  const dispatch = createEventDispatcher();

  function startRename() {
    draftTitle = task.title;
    editingTitle = true;
    menuOpen = false;
  }

  function commitRename() {
    editingTitle = false;
    dispatch('rename', { id: task.id, newName: draftTitle });
  }

  async function openColorPicker() {
    showColorPicker = true;
    await tick();
    colorInput?.showPicker?.();
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
    if (menuOpen) {
      menuLeft = overflowBtn.offsetLeft;
      menuTop = overflowBtn.offsetTop + overflowBtn.offsetHeight;
    }
  }

  function applyBorder() {
    showColorPicker = false;
    menuOpen = false;
    dispatch('changeBorder', { id: task.id, borderColor: draftBorderColor });
  }

  function deleteTask() {
    dispatch('delete', { id: task.id });
  }

  $: borderStyleProps = task.borderColor && !useThemeBorder
    ? { style: `--task-border: ${task.borderColor}` }
    : {};

</script>

<li
  class="task-row"
  data-id={task.id}
  class:compact={compact}
  bind:this={rowElement}
  {...borderStyleProps}
  draggable="true"
  on:dragstart={(e: DragEvent) => {
    dragging = true;
    e.dataTransfer?.setData('text/task', task.id);
  }}
  on:dragend={() => (dragging = false)}
  on:dragover|preventDefault={interceptDrop ? () => {} : null}
  on:drop={interceptDrop ? (e: DragEvent) => {
    e.stopPropagation();
    const id = e.dataTransfer?.getData('text/task');
    if (id && id !== task.id) reorderTodo(id, task.id);
    const tag = e.dataTransfer?.getData('text/tag');
    if (tag && !task.tags.includes(tag)) {
      tasks.update((list) => {
        const t = list.find((x) => x.id === task.id);
        if (t) t.tags = [...t.tags, tag];
        return [...list];
      });
    }
  }: null}>
  <div class="row">
    <button
      type="button"
      class="priority p{task.priority ?? 4}"
      title={PRIORITY_LABELS[task.priority ?? 4]}
      aria-label="Change priority"
      on:click={() => cyclePriority(task.id)}
    ></button>
    {#if editingTitle}
      <input
        class="title-input"
        bind:this={titleElement}
        bind:value={draftTitle}
        on:blur={commitRename}
        on:keydown={(e) => {
          if (e.key === 'Enter') commitRename();
          if (e.key === 'Escape') {
            editingTitle = false;
            draftTitle = task.title;
          }
        }}
      />
    {:else}
      <span
        class="title"
        bind:this={titleElement}
        role="button"
        tabindex="0"
        aria-label="Rename task"
        on:dblclick={startRename}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && startRename()}
      >{task.title}</span>
    {/if}
    <button
      type="button"
      bind:this={overflowBtn}
      tabindex="0"
      aria-label="More actions"
      on:click={toggleMenu}
    >
      ⋮
    </button>
    <span class="time">{formatMs(getTotalMs(task.activePeriods, $now))}</span>
  </div>
  <div class="tags">
    {#each [...task.tags].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) as tag}
      <span
        class="tag-pill"
        style="background:{get(tagStyles)[tag]?.bg};color:{get(tagStyles)[tag]?.fg};border-color:{get(tagStyles)[tag]?.border}"
      >{tag}</span>
    {/each}
  </div>
  {#if menuOpen}
    <div
      class="menu"
      style="left:{menuLeft}px;top:{menuTop}px;"
      role="menu"
      tabindex="0"
      on:mouseleave={() => (menuOpen = false)}
      use:clickOutside={() => (menuOpen = false)}
    >
      {#if showColorPicker}
        <input
          type="color"
          class="color-picker"
          bind:this={colorInput}
          bind:value={draftBorderColor}
          on:change={applyBorder}
          on:blur={() => (menuOpen = false)}
          on:keydown={(e) => {
            if (e.key === 'Escape') {
              showColorPicker = false;
              menuOpen = false;
              draftBorderColor = task.borderColor || '#000000';
            }
          }}
        />
      {:else}
        <button type="button" on:click={startRename}>Rename</button>
        <button type="button" on:click={openColorPicker}>Change border</button>
        <button type="button" on:click={() => dispatch('resetBorder', { id: task.id })}>Reset border</button>
        <div class="separator"></div>
        <button type="button" on:click={deleteTask}>Delete</button>
      {/if}
    </div>
  {/if}
</li>

<style>
  .task-row {
    list-style: none;
    padding: 0.25rem 0.5rem;
    border-radius: 0.35rem;
    margin: 0 0 0.25rem 0;
    background: var(--bg-box);
    border: 2px solid var(--task-border, var(--border));
    cursor: grab;
  }
  .compact {
    margin: 0;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .priority {
    width: 1rem;
    height: 1rem;
    border-radius: 0.2rem;
    cursor: default;
    border: none;
  }
  .time {
    font-size: 0.8rem;
  }
  .p1 {
    background: #ff5555;
  }
  .p2 {
    background: #ff9900;
  }
  .p3 {
    background: #22aa22;
  }
  .p4 {
    background: #888888;
  }
  .title {
    flex: 1;
  }
  .title-input {
    flex: 1;
    font: inherit;
    background: transparent;
    border: none;
    color: var(--contrast-color);
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-top: 0.25rem;
    justify-content: flex-end;
  }
  .tag-pill {
    padding: 0.1rem 0.3rem;
    border-radius: 0.5rem;
    border: var(--tag-border-width, 2px) solid var(--border);
    font-size: 0.7rem;
  }
  .overflow-btn {
    opacity: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .task-row:hover .overflow-btn,
  .task-row:focus-within .overflow-btn {
    opacity: 1;
  }
  .absolute {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
  }
  .menu {
    position: absolute;
    display: flex;
    flex-direction: column;
    background: var(--menu-bg);
    color: var(--menu-text);
    border: 1px solid var(--menu-border);
    border-radius: 0.25rem;
    box-shadow: 0 2px 6px var(--menu-shadow);
    z-index: 10;
  }
  .menu button {
    background: transparent;
    border: none;
    padding: 0.25rem 0.75rem;
    text-align: left;
    color: inherit;
    cursor: pointer;
  }
  .color-picker {
    width: 100%;
    border: 1px solid var(--menu-border);
    background: var(--menu-bg);
  }
  .separator {
    height: 1px;
    background: var(--menu-border);
    margin: 0.25rem 0;
  }
</style>
