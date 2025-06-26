<script lang="ts">
  import { tagStyles, renameTag, tagFilter, tagFilterAnd } from '$lib';
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
    if (!editTag) return;
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
</script>

<section class="tags-list">
  <div class="palette">
    {#each tags as tag}
      <button
        type="button"
        class="tag-pill {selected.includes(tag) ? 'selected' : ''}"
        style="background:{get(tagStyles)[tag]?.bg};color:{get(tagStyles)[tag]
          ?.fg};border-color:{get(tagStyles)[tag]?.border}"
        draggable="true"
        aria-pressed={selected.includes(tag)}
        aria-label="Tag: {tag}"
        on:contextmenu|preventDefault={() => startEdit(tag)}
        on:dragstart={(e: DragEvent) =>
          e.dataTransfer?.setData('text/tag', tag)}
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
    <table
      class="edit-dialog"
      on:keydown={(e) => e.key === 'Escape' && (editTag = null)}
    >
      <tbody>
        <tr>
          <td colspan="2"><input type="text" bind:value={newName} /></td>
        </tr>
        <tr>
          <td>Background</td>
          <td><input type="color" bind:value={bg} /></td>
        </tr>
        <tr>
          <td>Text</td>
          <td><input type="color" bind:value={fg} /></td>
        </tr>
        <tr>
          <td>Border</td>
          <td><input type="color" bind:value={border} /></td>
        </tr>
        <tr>
          <td><button on:click={saveEdit}>Save</button></td>
          <td><button on:click={() => (editTag = null)}>Cancel</button></td>
        </tr>
      </tbody>
    </table>
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
    margin-top: 0.5rem;
    border-collapse: collapse;
    width: 100%;
  }
  .edit-dialog td {
    padding: 0.25rem;
  }
  .edit-dialog input[type='color'] {
    width: 100%;
  }
  .edit-dialog button {
    width: 100%;
  }
</style>
