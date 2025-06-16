<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { settings } from '$lib/stores/settings';

  let unsubscribe: () => void;

  onMount(() => {
    unsubscribe = settings.subscribe(({ theme }) => {
      document.documentElement.classList.toggle('theme-dark', theme === 'dark');
      document.documentElement.classList.toggle('theme-light', theme === 'light');
    });
  });

  onDestroy(() => {
    unsubscribe && unsubscribe();
  });
</script>

<slot />

<style>
  :global(.theme-light) {
    --bg-panel: #fafbfc;
    --bg-box: #ffffff;
    --text-color: #1a1a1a;
    --border: #e0e0e0;
    --accent: #0d7ae6;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
  }
  :global(.theme-dark) {
    --bg-panel: #1e1e2f;
    --bg-box: #2e2e42;
    --text-color: #f5f5f5;
    --border: #33383d;
    --accent: #60aaff;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
  }

  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: var(--bg-panel);
    color: var(--text-color);
  }
</style>
