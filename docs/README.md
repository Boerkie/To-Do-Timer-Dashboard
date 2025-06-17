# TODO Timer Dashboard Documentation

This README outlines the interface and lists the core requirements that govern the TODO Timer Dashboard.

## Interface Overview

The application is structured into these components:

1. **Page Banner**
   - Shows the dashboard title and buttons for export/import and settings.
   - Lets users configure day start and end times which all timers respect.
2. **Day Recap**
   - Provides a timeline of task activity for the selected day.
   - Marks day start, day end and the current time.
3. **Active**
   - Displays at most one task with a live timer.
   - Timers pause at day end and resume the next day.
4. **To‑Do List**
   - Holds upcoming tasks that can be reordered.
   - Tasks can be dragged into the Active block.
5. **Cleared/Done List**
   - Stores completed tasks and can be toggled.
6. **Advanced Details**
   - Shows optional information for the active task such as description, time spent and colour/priority.
7. **Tags List**
   - Lists all tags. Clicking filters tasks while dragging assigns a tag.

## Core Requirements

- **Single Active Task** – only one task can be active at a time.
- **Task Movement**
  - Tasks can be dragged between the To‑Do List and Active.
  - Deactivated tasks return to the top of the To‑Do List and new tasks appear at the bottom.
- **Task Timing**
  - Each task records its daily active time.
  - Timers pause at the configured end of day and resume at the next start.
- **Task Addition**
  - Tasks support tags (`#tag`) and priorities (`!`).
  - Priority cycles from **P4** (default) to **P1**.
- **Personalised Header** – the title uses the configured user name.
- **Date Navigation** – selecting any day in the Day Recap shows the timeline for that day.
- **Tags and Filtering** – the Tags List enables filtering and drag‑and‑drop assignment.
- **Persistent Add Bar** – new tasks can always be added via the pinned bar directly under the scrollable list.

## UI/UX Notes

- Dark theme enabled by default with optional theming.
- All components update reactively as state changes.
- Drag‑and‑drop interactions provide clear feedback.
- The Day Recap timeline updates live while time progresses.
- The Active item resembles a large list entry with list numbers outside rounded boxes.
