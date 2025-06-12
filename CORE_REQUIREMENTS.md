# Core Requirements Overview

The TODO Timer Dashboard follows these key behaviors:

- **Single Active Task** – only one task can run at a time.
- **Task Movement** – drag a task from the To‑Do list to activate it. When deactivated, it returns to the **top** of the To‑Do list. Completed tasks move to the Cleared/Done list.
- **Adding Tasks** – use the `Add new task` field. `#tags` and priority via `!` are recognized.
- **Time Tracking** – each task records how long it was active for the day. Timers pause at the configured day end and resume the next day.
- **Date Navigation** – choose another day in the Recap section to review past or future activity.
- **Tags List** – shows every tag in use. Clicking a tag filters tasks; dragging a tag onto a task assigns it.

See [docs/README.md](docs/README.md) for more detail about the application and the `TodoTask` interface.
