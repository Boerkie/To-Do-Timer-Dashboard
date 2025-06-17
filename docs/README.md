# Documentation Overview

This folder collects the key requirements for the TODO Timer Dashboard. Refer to `REQUIREMENTS.md` for full details.

## Interface Summary

The dashboard is made up of the following parts:

- **Page Banner** – displays the application name and basic controls for import/export and settings.
- **Day Recap** – shows a timeline of task activity for the selected day.
- **Active Task** – contains at most one task with a live timer.
- **To-Do List** – lists upcoming tasks that can be dragged to the active area.
- **Cleared/Done List** – stores tasks marked as complete and can be hidden.
- **Advanced Details** – offers optional information and controls for the active task.
- **Tags List** – lists all tags and allows filtering or dragging tags onto tasks.

## Core Functionality

- Only one task is active at any time.
- Tasks can be dragged between the To-Do List and the active area.
- A task returning from Active is placed at the top of the To-Do List.
- Tasks can include tags and priorities when created.
- Each task records the time it has been active for the day and resumes if reactivated.
- Users can view a recap of any day, respecting configured start and end times.
- Selecting a tag filters relevant tasks in all lists.

## Task Management
- Only one task can be active at any time.
- Tasks move between lists when activated, deactivated or cleared.
- New tasks support tags (`#tag`) and priorities (`!`).
- Priority values cycle from **P4** (default) through **P3**, **P2**, **P1** and back to **P4**.

## Timing Behaviour
- Each task records its active durations by day.
- Timers pause automatically at the configured end of day and resume at the next start of day.
- The Day Recap visualises these periods on a sequence‑style timeline.

## Filtering
- Tags and priorities can be selected to filter the To‑Do List.
- Selected filters are highlighted for clarity.
- Tags may be dragged onto tasks to assign them directly.

## Interface Notes
- The Active item resembles an enlarged list entry rather than a wide panel.
- List entries display total time spent and tags beneath the task title and timer.
- List numbering appears outside the rounded task boxes.

## User Experience

- Dark theme enabled by default with theming support.
- All components reactively update as state changes.
- Drag-and-drop interactions provide clear visual feedback.
- The Day Recap timeline updates while time advances.
- Advanced details adapt to show information for the current active task.

