export function clickOutside(node: HTMLElement, callback: () => void) {
  function handle(event: MouseEvent) {
    if (!node.contains(event.target as Node)) {
      callback();
    }
  }
  document.addEventListener('mousedown', handle);
  return {
    destroy() {
      document.removeEventListener('mousedown', handle);
    }
  };
}
