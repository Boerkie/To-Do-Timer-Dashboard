<script lang="ts">
  import { tagStyles } from '$lib';
  import { get } from 'svelte/store';

  export let tags: string[] = [];

  let editTag: string | null = null;
  let newName = '';
  let bg = '#eee';
  let fg = '#000';
  let border = '#ccc';

  function startEdit(tag: string) {
    const style = get(tagStyles)[tag] || { bg: '#eee', fg: '#000', border: '#ccc' };
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
    editTag = null;
  }
</script>

<section class="tags-list">
  <div class="palette">
    {#each tags as tag}
      <span
        class="tag-pill"
        style="background:{get(tagStyles)[tag]?.bg};color:{get(tagStyles)[tag]?.fg};border-color:{get(tagStyles)[tag]?.border}"
        draggable="true"
        on:contextmenu|preventDefault={() => startEdit(tag)}
        on:dragstart={(e: DragEvent) => e.dataTransfer?.setData('text/tag', tag)}
        >{tag}</span
      >
    {/each}
  </div>

  {#if editTag}
    <table class="edit-dialog">
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
.tags-list { padding: 1rem; }
.palette { display: flex; gap: 0.25rem; flex-wrap: wrap; }
.tag-pill {
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  user-select: none;
  cursor: grab;
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
