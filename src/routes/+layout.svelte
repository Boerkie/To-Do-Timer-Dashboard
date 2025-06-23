<!-- +layout.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { settings } from '$lib/stores/settings';

  let unsubscribe: () => void;

  onMount(() => {
    const banner = document.querySelector('.page-banner') as HTMLElement;
    if (banner) {
      document.documentElement.style.setProperty(
        '--header-height',
        `${banner.offsetHeight}px`,
      );
    }
    unsubscribe = settings.subscribe(({ theme, tagBorderWidth }) => {
      const themeClassMap = {
        light: 'theme-light',
        dark: 'theme-dark',
        'solarized-light': 'theme-solarized-light',
        'solarized-dark': 'theme-solarized-dark',
        'theme-dracula': 'theme-dracula',
        'theme-nord': 'theme-nord',
        'theme-monokai': 'theme-monokai',
        'theme-material-light': 'theme-material-light',
        'theme-material-dark': 'theme-material-dark',
        'theme-flat-sunset': 'theme-flat-sunset',
        'theme-flat-ocean': 'theme-flat-ocean',
        'theme-flat-forest': 'theme-flat-forest',
        'theme-autumn': 'theme-autumn',
      };
      Object.values(themeClassMap).forEach((className) => {
        document.documentElement.classList.toggle(
          className,
          themeClassMap[theme] === className,
        );
      });
      document.documentElement.style.setProperty(
        '--tag-border-width',
        `${tagBorderWidth}px`,
      );
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
    --menu-bg: var(--bg-box);
    --menu-text: var(--text-color);
    --menu-border: var(--border);
    --menu-shadow: rgba(0, 0, 0, 0.3);
    --contrast-color: #1a1a1a;
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
    --contrast-color: #fff;
  }
  :global(.theme-solarized-light) {
    --bg-panel: #fdf6e3;
    --bg-box: #eee8d5;
    --text-color: #586e75;
    --border: #93a1a1;
    --accent: #268bd2;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
  }
  :global(.theme-solarized-dark) {
    --bg-panel: #002b36;
    --bg-box: #073642;
    --text-color: #839496;
    --border: #586e75;
    --accent: #268bd2;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
    --contrast-color: #ddd;
  }
  :global(.theme-dracula) {
    --bg-panel: #282a36;
    --bg-box: #44475a;
    --text-color: #f8f8f2;
    --border: #6272a4;
    --accent: #ff79c6;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
    --contrast-color: #ddd;
  }
  :global(.theme-nord) {
    --bg-panel: #2e3440;
    --bg-box: #3b4252;
    --text-color: #d8dee9;
    --border: #4c566a;
    --accent: #88c0d0;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
    ---contrast-color: #ddd;
  }
  :global(.theme-monokai) {
    --bg-panel: #2e2e2e;
    --bg-box: #272822;
    --text-color: #f8f8f2;
    --border: #75715e;
    --accent: #e5b567;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
    --contrast-color: #ddd;
  }
  :global(.theme-material-light) {
    --bg-panel: #fafafa;
    --bg-box: #ffffff;
    --text-color: #212121;
    --border: #e0e0e0;
    --accent: #6200ea;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
  }
  :global(.theme-material-dark) {
    --bg-panel: #121212;
    --bg-box: #1e1e1e;
    --text-color: #e0e0e0;
    --border: #333333;
    --accent: #bb86fc;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
    --contrast-color: #ddd;
  }
  :global(.theme-flat-sunset) {
    --bg-panel: #2c3e50;
    --bg-box: #34495e;
    --text-color: #ecf0f1;
    --border: #16a085;
    --accent: #e67e22;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
    --contrast-color: #ddd;
  }
  :global(.theme-flat-ocean) {
    --bg-panel: #16a085;
    --bg-box: #1abc9c;
    --text-color: #ffffff;
    --border: #2c3e50;
    --accent: #2980b9;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
    --contrast-color: #ddd;
  }
  :global(.theme-flat-forest) {
    --bg-panel: #27ae60;
    --bg-box: #2ecc71;
    --text-color: #ffffff;
    --border: #1abc9c;
    --accent: #f39c12;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
    --contrast-color: #dddddd;
  }
  :global(.theme-autumn) {
    --bg-panel: #ffd200;
    --bg-box: #f47b20;
    --text-color: #4a2e04;
    --border: #9c5708;
    --accent: #f05133;
    --banner-bg: var(--bg-box);
    --modal-bg: var(--bg-box);
    --contrast-color: #3f2907;
  }

  :global(body) {
    margin: 0px;
    font-size: 120%;
    font-family: system-ui, sans-serif;
    background: var(--bg-panel);
    color: var(--text-color);
  }
</style>
