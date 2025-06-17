<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { settings } from '$lib/stores/settings';

  let unsubscribe: () => void;

  onMount(() => {
    const banner = document.querySelector('.page-banner') as HTMLElement;
    if (banner) {
      document.documentElement.style.setProperty('--header-height', `${banner.offsetHeight}px`);
    }
    unsubscribe = settings.subscribe(({ theme, tagBorderWidth }) => {
      document.documentElement.classList.toggle('theme-dark', theme === 'dark');
      document.documentElement.classList.toggle('theme-light', theme === 'light');
      document.documentElement.style.setProperty('--tag-border-width', `${tagBorderWidth}px`);
    });
  });

  onDestroy(() => {
    unsubscribe && unsubscribe();
  });
</script>

<slot />

<style>
  :global(:root) {
    --tag-border-width: 2px;
    --header-height: 70px;
  }
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
