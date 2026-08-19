<script lang="ts">
  import { canAddTag, canUpdateItem, tagStyles, renameTag, tagFilter, tagFilterAnd } from '$lib';
  import { get } from 'svelte/store';

  export let tags: string[] = [];

  let editTag: string | null = null;
  let newName = '';
  let bg = '#eeeeee';
  let fg = '#000000';
  let border = '#cccccc';
  let selected: string[] = [];
  $: selected = $tagFilter;

  function startEdit(tag: string) {
    if (!$canUpdateItem) return;
    const style = get(tagStyles)[tag] || {
      bg: '#eeeeee',
      fg: '#000000',
      border: '#cccccc',
    };
    editTag = tag;
    newName = tag;
    bg = style.bg;
    fg = style.fg;
    border = style.border;
  }

  function saveEdit() {
    if (!editTag || !$canUpdateItem) return;
    tagStyles.update((styles) => {
      delete styles[editTag!];
      styles[newName] = { name: newName, bg, fg, border };
      return styles;
    });
    if (newName !== editTag) {
      renameTag(editTag, newName);
    }
    editTag = null;
  }

  function toggleTag(tag: string) {
    tagFilter.update((list) =>
      list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag],
    );
  }

  function toggleMode() {
    tagFilterAnd.update((v) => !v);
  }

  function handleEditKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') editTag = null;
  }
</script>

<section class="tags-list">
  <div class="palette">
    {#each tags as tag}
      <button
        type="button"
        class="tag-pill {selected.includes(tag) ? 'selected' : ''}"
        style="background:{$tagStyles[tag]?.bg};color:{$tagStyles[tag]?.fg};border-color:{$tagStyles[tag]?.border}"
        draggable={$canAddTag}
        aria-pressed={selected.includes(tag)}
        aria-label="Tag: {tag}"
        on:contextmenu|preventDefault={() => startEdit(tag)}
        on:dragstart={(e: DragEvent) =>
          $canAddTag && e.dataTransfer?.setData('text/tag', tag)}
        on:click={() => toggleTag(tag)}
        on:keydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTag(tag);
          }
        }}>{tag}</button
      >
    {/each}
  </div>

  {#if selected.length}
    <div class="filter-mode">
      Filter mode:
      <button on:click={toggleMode}>{$tagFilterAnd ? 'AND' : 'OR'}</button>
    </div>
  {/if}

  {#if editTag}
    <form
      class="edit-dialog"
      on:submit|preventDefault={saveEdit}
    >
      <label class="full-row">
        <span>Name</span>
        <input type="text" bind:value={newName} on:keydown={handleEditKeydown} />
      </label>
      <label>
        <span>Background</span>
        <input type="color" bind:value={bg} on:keydown={handleEditKeydown} />
      </label>
      <label>
        <span>Text</span>
        <input type="color" bind:value={fg} on:keydown={handleEditKeydown} />
      </label>
      <label>
        <span>Border</span>
        <input type="color" bind:value={border} on:keydown={handleEditKeydown} />
      </label>
      <div class="edit-actions">
        <button type="submit">Save</button>
        <button type="button" on:click={() => (editTag = null)}>Cancel</button>
      </div>
    </form>
  {/if}
</section>

<style>
  .tags-list {
    padding: 1rem;
  }
  .palette {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }
  .tag-pill {
    padding: 0.2rem 0.5rem;
    border: var(--tag-border-width, 2px) solid var(--border);
    border-radius: 0.5rem;
    font-size: 0.75rem;
    user-select: none;
    cursor: grab;
  }
  .tag-pill.selected {
    outline: 2px solid var(--accent);
  }
  .filter-mode {
    margin-top: 0.5rem;
  }
  .edit-dialog {
    display: grid;
    gap: 0.4rem;
    margin-top: 0.5rem;
    width: 100%;
  }
  .edit-dialog label {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.5rem;
    align-items: center;
  }
  .edit-dialog .full-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  .edit-dialog input[type='text'] {
    width: 100%;
  }
  .edit-dialog input[type='color'] {
    width: 3rem;
  }
  .edit-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
</style>
