# Core Requirements

- **Drag Source Encapsulation** - `TodoItem` sets drag data on start and clears it on end.
- **Conditional In-Component Reordering** - `TodoItem` only handles sibling reordering when `interceptDrop` is `true`.
- **Container-Level Drop Targets** - `ActiveTask` wraps the active item and overlay panels in a `.current` container that manages drag events.
- **Overlay Panels for Actions** - The left panel moves the task back and deactivates it. The right panel clears the task. Both become visible on drag and hide when done.
- **Section-Level Drop Processing** - The active-task section processes drops for activation or tagging when overlays do not.
- **Layout and Styling** - The `.current` wrapper uses `inline-flex` and overlays do not alter component size.

