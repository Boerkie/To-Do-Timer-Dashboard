<!-- Help.svelte -->
<script lang="ts">
  import { clickOutside } from '$lib/actions/clickOutside';
  import { createEventDispatcher } from 'svelte';

  export let visible = false;

  const dispatch = createEventDispatcher();
  function close() { dispatch('close'); }
</script>

{#if visible}
  <div
    class="modal-overlay"
    role="presentation"
    on:click={close}
    on:keydown={(e) => { if (e.key === 'Escape') close(); }}
    use:clickOutside={close}
  >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Help"
      tabindex="0"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <div class="modal-header">
        <h2>Help &amp; Guide</h2>
        <button class="close-btn" on:click={close} aria-label="Close help">✕</button>
      </div>

      <div class="content">

        <section>
          <h3>Adding Tasks</h3>
          <ul>
            <li>Type in the <strong>Add Bar</strong> at the bottom and press <kbd>Enter</kbd>.</li>
            <li>Add tags inline with <code>#tagname</code> — e.g. <code>Fix bug #work #urgent</code>.</li>
            <li>Multi-word tags are camelCased automatically: <code>#tag name</code> → <code>tagName</code>.</li>
            <li>Set priority inline with <code>!1</code>–<code>!4</code> — e.g. <code>Deploy hotfix !1</code>.</li>
            <li>New tasks get your <strong>Default Priority</strong> (set in Settings) if none is specified.</li>
          </ul>
        </section>

        <section>
          <h3>Priority</h3>
          <ul>
            <li><span class="prio p1">P1</span> Urgent &nbsp; <span class="prio p2">P2</span> High &nbsp; <span class="prio p3">P3</span> Normal &nbsp; <span class="prio p4">P4</span> Low</li>
            <li>Click the <strong>colored square</strong> on any task to cycle its priority.</li>
            <li>Use the <strong>Priority</strong> panel (right) to filter the list to one priority level.</li>
            <li>The <strong>Active box</strong> background reflects the active task's priority color.</li>
          </ul>
        </section>

        <section>
          <h3>Activating &amp; Completing Tasks</h3>
          <ul>
            <li><strong>Click</strong> a task in the list to make it the active task.</li>
            <li><strong>Drag</strong> any task onto the Active box to activate it.</li>
            <li>Drag the active task to the <strong>left (❌)</strong> to move it back to the list (pauses timer).</li>
            <li>Drag the active task to the <strong>right (✅)</strong> to mark it as cleared/done.</li>
            <li>Only one task is active at a time — activating a new one pauses the previous.</li>
          </ul>
        </section>

        <section>
          <h3>Task Actions (⋮ Menu)</h3>
          <ul>
            <li><strong>Double-click</strong> a task title to rename it inline.</li>
            <li>Click the <strong>⋮</strong> button to open the overflow menu:
              <ul>
                <li><em>Rename</em> — edit the title.</li>
                <li><em>Change border</em> — pick a custom border/highlight color.</li>
                <li><em>Reset border</em> — revert to the priority color.</li>
                <li><em>Delete</em> — permanently remove the task.</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h3>Tags</h3>
          <ul>
            <li><strong>Click</strong> a tag pill in the Tags panel to filter the list by that tag.</li>
            <li>Select multiple tags; toggle the <strong>AND / OR</strong> button to control matching.</li>
            <li><strong>Right-click</strong> a tag pill to edit its name, background, text, and border color.</li>
            <li><strong>Drag</strong> a tag from the Tags panel onto any task to add it to that task.</li>
            <li>You can also drag a tag onto the <strong>Active box</strong> or the <strong>Details panel</strong>.</li>
            <li>Add tags to the active task via the <strong>+ button</strong> in the Details panel.</li>
          </ul>
        </section>

        <section>
          <h3>Details Panel</h3>
          <ul>
            <li>Shows full info for the currently active task.</li>
            <li>Displays total time tracked across all sessions today.</li>
            <li>Click <strong>+</strong> to add a new tag by typing; multi-word input is camelCased.</li>
            <li>Drag any tag pill from Tags directly onto this panel to add it.</li>
          </ul>
        </section>

        <section>
          <h3>Recap Timeline</h3>
          <ul>
            <li>Shows a visual timeline of work periods within your configured day window.</li>
            <li>Click <strong>📅</strong> to view a past day's recap.</li>
            <li>Hover over a bar to see the task name and exact times.</li>
            <li><strong>Drag horizontally</strong> or <strong>scroll</strong> inside the bars area to pan when there are many tasks.</li>
            <li>Time labels respect the <strong>Time Format</strong> setting (12h / 24h).</li>
          </ul>
        </section>

        <section>
          <h3>Settings</h3>
          <ul>
            <li><strong>Name</strong> — displayed in the banner.</li>
            <li><strong>Day Start / End</strong> — defines the working window for time calculations and the timeline.</li>
            <li><strong>Theme</strong> — choose from 13 color themes.</li>
            <li><strong>Default Priority</strong> — priority assigned to new tasks when none is specified.</li>
            <li><strong>Time Format</strong> — 24h or 12h clock for the Recap timeline.</li>
            <li><strong>Tag Border Width</strong> — thickness of tag pill borders.</li>
            <li><strong>Show List Numbers</strong> — toggle ordered numbering on the task list.</li>
            <li><strong>Move Active Task on Day End</strong> — automatically returns the active task to the top of the list when your day ends.</li>
            <li><strong>Export / Import</strong> — save or restore all tasks and tag styles as a JSON file.</li>
            <li><strong>Show / Hide Cleared</strong> — toggle the cleared tasks section (persists across sessions).</li>
          </ul>
        </section>

      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .modal {
    background: var(--modal-bg);
    color: var(--text-color);
    border-radius: 0.5rem;
    width: min(640px, 90vw);
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem 0.5rem;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .modal-header h2 {
    margin: 0;
    font-size: 1.1rem;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: var(--text-color);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
  .close-btn:hover {
    background: var(--border);
  }
  .content {
    overflow-y: auto;
    padding: 1rem 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  section h3 {
    margin: 0 0 0.4rem;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent, var(--text-color));
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.2rem;
  }
  ul {
    margin: 0;
    padding-left: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.85rem;
  }
  ul ul {
    margin-top: 0.2rem;
  }
  kbd {
    background: var(--bg-box);
    border: 1px solid var(--border);
    border-radius: 0.2rem;
    padding: 0.05rem 0.35rem;
    font-size: 0.8rem;
    font-family: inherit;
  }
  code {
    background: var(--bg-box);
    border-radius: 0.2rem;
    padding: 0.05rem 0.3rem;
    font-size: 0.8rem;
    font-family: monospace;
  }
  .prio {
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 0.15rem;
    vertical-align: middle;
    margin-right: 0.2rem;
  }
  .p1 { background: #ff5555; }
  .p2 { background: #ff9900; }
  .p3 { background: #22aa22; }
  .p4 { background: #888888; }
</style>
