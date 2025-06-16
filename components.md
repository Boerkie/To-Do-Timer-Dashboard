# Component Overview

This document describes the core UI components used in the TODO Timer Dashboard. Each component is provided as a minimal Svelte file inside `src/lib/components` so the application can be expanded easily.

- **PageBanner** – Displays the application title and placeholder buttons for future import/export and settings features.
- **DayRecap** – Shows a selectable date and a placeholder timeline for task activity.
- **ActiveTask** – Displays the currently active task if one exists.
- **TodoList** – Lists tasks that are waiting to be activated.
- **ClearedList** – Lists tasks that have been completed.
- **AdvancedDetails** – Placeholder area for additional details about the active task.
- **TagsList** – Shows all tags known to the system.

These components implement the features outlined in [REQUIREMENTS.md](../REQUIREMENTS.md) and are intended as starting points for further development.
