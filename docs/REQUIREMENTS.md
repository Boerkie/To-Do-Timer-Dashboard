## Interface Overview

The application UI is composed of the following components:

1. **Page Banner**
    - Displays the application name ("TODO Timer Dashboard").
    - Includes common controls:
        - **Export/Import** button (icon: floppy disk).
        - **Theme/Settings** button (gear icon).
    - Allows configuration of day start/end times, which is respected throughout the application.

2. **Day Recap** (left column)
    - Shows a timeline recap of all tasks active for the selected day.
    - Contains:
        - **Header**: "Recap" title (left) and a date picker (right).
        - **Timeline Graph**:
            - **X-axis**: Task labels, ordered by the first time they entered the active block for the day.
            - **Y-axis**: Blocks/bars indicating durations for which each task was active.
            - "DS"/"DE": Denote day start and day end.
            - **NOW marker**: A horizontal line across the timeline indicating the current time.
        - Visual separation (lines) for clarity.
    - *Purpose*: Provides an at-a-glance overview of the day’s activities and timing.

3. **Active**
    - Shows at most **one** task at any time.
    - Tracks and displays the duration that the active task has been running (live timer).
    - Tasks are moved here from the To‑Do List.
    - **Task total time spent timers pause at the end of day and start at the start of day.**

4. **To‑Do List**
    - Lists all pending tasks not currently active.
    - Includes an **Add new task** input (with tags and priority parsing).
    - Tasks can be dragged into the Active box.
    - Tasks leaving Active return to the **top** of this list.
    - **Items in the list should be re-orderable with drag and drop.**
    - Each task can display associated tags and priority.

5. **Cleared/Done List**
    - Completed tasks are moved here.
    - This list can be toggled (shown/hidden) via a "Hide Cleared" button.

6. **Advanced Details**
    - Provides extra info about the **currently active task**.
    - The list here are basically headings.
    - This section allows for a **"Details" text box** for the active task.
    - **Task border colour** can be set from here, along with **priority**.
    - Can include:
        - Task description/details.
        - Time spent today/this week.
        - Breakdown by tags or custom fields.
    - May include edit/delete controls or extended properties.

7. **Tags List**
    - Shows all tags used across all tasks.
    - **Clicking on a tag should filter the list and only show tasks that have the selected tag(s).**
    - **Dragging a tag onto a task assigns/adds that tag to the task.** (Can drag to the list, the active task, or the details of the active task.)
    - **Cannot drag off from the list. When grabbing an item from the list, it should always be the item and not the tag.**
    - A tag can just be deleted from the details box.

---

## Core Requirements

- **Single Active Task:** Only one task can be active at a time.
- **Task Movement:**
    - Tasks can be dragged between the To‑Do List and Active.
    - When a task is activated, it is removed from the To‑Do List and placed in Active.
    - When a task is deactivated, its timer stops and it returns to the **top** of the To‑Do List.
    - Completed tasks are moved to the Cleared/Done List.
- **Task Addition:**
    - Tasks can be added using the **Add new task** input, supporting tags (`#tag`) and priorities (`!`).
    - New tasks appear at the **bottom** of the To‑Do List.
- **Priority Handling:**
    - Priority values cycle from **P4** (default) to **P3**, **P2**, **P1**, then restart at **P4**.
- **Task Timing:**
    - Each task tracks the cumulative duration it was active for the day.
    - The Day Recap shows a bar/timeline visualization per task.
    - Timer resumes from where it left off if a task is reactivated the same day.
    - **Task timers pause at the end of the day and resume at the start of the next day.**
- **Date Navigation:**
    - Users can select a day (using the date picker) to view past/future day recaps.
    - Timeline respects the configured day start/end (from Banner).
- **Tags and Filtering:**
    - All unique tags from all tasks are shown in the Tags List.
    - Selecting a tag filters or highlights associated tasks in all lists.
    - Dragging a tag onto a task adds the tag to that task.
    - Filtering by priority highlights the selected priority similar to tag filtering.

---

## UI/UX Notes

- Dark theme by default, with theming support.
- All components update reactively.
- Task drag-and-drop should have clear visual feedback.
- Timeline in Day Recap should update live as time advances.
- “Advanced details” adapts to show info for the current active task.
- Active item displays like a slightly enlarged list entry instead of occupying one-third of the width.
- List items show total time spent and tags on a line beneath the name and timer, with list numbers outside the rounded item.
- Day Recap layout should resemble a sequence diagram with bars filled during active periods.
