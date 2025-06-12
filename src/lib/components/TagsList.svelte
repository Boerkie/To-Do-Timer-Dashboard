<script lang="ts">
  export let tags: string[] = [];
</script>

<section class="tags-list">
  <h2>Tags</h2>
  <ul>
    {#each tags as tag}
      <li>{tag}</li>
    {/each}
  </ul>
</section>

<style>
.tags-list { padding: 1rem; }
</style>
