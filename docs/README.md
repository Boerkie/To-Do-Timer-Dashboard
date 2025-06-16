# Core Requirements

This project implements a simple dashboard for tracking tasks and time spent. Below are the main functional requirements taken from the project documentation.

- **Single Active Task** – Only one task may be active at any time. Tasks move between the To‑Do list and the active area through drag and drop.
- **Task Timing** – Each task keeps track of time spent. Timers pause at the configured end of day and resume at the start of the next day.
- **Task Lists**
  - **To‑Do List** – New tasks can be added with tags and priorities. Tasks are reorderable by drag and drop.
  - **Active** – Shows the current task and its running timer.
  - **Cleared/Done** – Completed tasks are stored here and can be hidden or shown.
- **Priority Management** – Tasks have four priority levels (P1 to P4) represented by coloured indicators. Priorities can be cycled by clicking the indicator and lists can be filtered by priority.
- **Day Recap** – A visual recap of task activity for a selected day.
- **Tags** – All tags across tasks are displayed. Clicking tags filters the To‑Do list and dragging tags onto tasks assigns them.
- **Advanced Details** – Displays extra information and allows editing details and tags for the current task.

For a deeper explanation of the interface and components, see [REQUIREMENTS.md](../REQUIREMENTS.md).
