# Core Requirements Overview

This document summarises the fundamental features of the TODO Timer Dashboard. It is intended as a quick reference for developers.

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

Refer to `REQUIREMENTS.md` for full details.
