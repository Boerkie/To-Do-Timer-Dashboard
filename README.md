# To-Do-Timer-Dashboard

This project is a small prototype for a time-tracking TODO list. It is built
with **Svelte** and **TypeScript** and focuses on the idea that you can only
work on one task at a time.

## Interface Overview

The application UI is composed of seven main components:

1. **Page banner** – provides the application name and common controls such as
   export/import, theming and settings.
2. **Day recap** – a left column that lists all active activity for the current
   day. It includes a date picker and respects the day start/end times
   configured in the banner.
3. **Active** – contains at most one task at a time and tracks the active
   duration.
4. **To‑Do list** – shows the remaining tasks. A separate **Add Item** input at
   the bottom lets you add new tasks.
5. **Advanced details** – provides extra information about the currently active
   task.
6. **Tags list** – shows every tag that exists across tasks.
7. **Done list** – an optional list of completed tasks that can be toggled
   on or off.

## Core Requirements

- The interface has two boxes:
  - **Active**: contains at most one task and tracks how long that task has been
    active.
  - **List**: holds the remaining tasks. Items can be dragged between this box
    and the Active box.
- Only one item may be in the Active box at any given time.
- When an item leaves the Active box its timer stops and it returns to the List
  box, returning to the top of the To‑Do list.
- New tasks can be added via an **Add Item** input at the bottom of the list and
  will appear at the bottom.

## License

This project is licensed under the [MIT License](LICENSE).
