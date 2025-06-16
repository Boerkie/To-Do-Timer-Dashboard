# Core Requirements

This document summarises the core functionality and user experience for the **TODO Timer Dashboard**. The full specification lives in [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md).

## Key Features

- Single active task with drag-and-drop movement between lists.
- Tasks may include tags and a cycling priority from **P4** (default) through **P3**, **P2**, **P1**, then back to **P4**.
- Each task records the time spent active per day; timers pause at day end and resume the next day.
- Tasks can be filtered by tag or priority, highlighting the selected filter.
- The Day Recap visualises active periods like a sequence diagram, filling bars for the time a task was active.

## User Interface Notes

- Active task is presented as an enlarged list item rather than occupying a third of the page.
- List items show total time spent and tags below the task name and timer, with a numeric index outside the rounded item.

Refer to the documentation folder for further details and component descriptions.
