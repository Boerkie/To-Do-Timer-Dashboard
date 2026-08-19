<!-- PROJECT_ROADMAP.md -->
# To-Do Timer Dashboard Roadmap

This file is the handoff source for fresh Codex chats. Read it first, then inspect the current code before making changes.

## Product Direction

The app tracks one personal task list where only one task can be active at a time. Sharing lets other people view or help manage that same list, but it does not introduce separate per-user active tasks.

Target architecture:

```text
Svelte UI
  -> store facade and read models
    -> repository interfaces
      -> local repository now
      -> PocketBase repository later
```

PocketBase is the preferred backend because it keeps the app close to click-and-run while adding authentication, persistent storage, collection rules, and realtime updates.

## Current State

- SvelteKit app using `adapter-static` and hash routing.
- Task, settings, tag style, and UI state are still persisted locally.
- Task mutations now flow through repository command functions.
- The task store is now a facade that exposes commands and derived read models.
- Initial board repository contracts exist, but the UI does not use boards yet.
- No README files should be created or edited unless explicitly approved.

Key files:

- `src/lib/stores/tasks.ts`: public task command facade and derived read models.
- `src/lib/repositories/taskRepository.ts`: task repository interface.
- `src/lib/repositories/localTaskRepository.ts`: current localStorage-backed task implementation.
- `src/lib/repositories/boardRepository.ts`: board repository interface.
- `src/lib/repositories/localBoardRepository.ts`: current localStorage-backed board implementation.
- `src/lib/domain/taskInput.ts`: pure task input parser and tag normalization.
- `src/lib/types.ts`: shared domain types.

## Completed Refactor Slices

1. Component mutation cleanup
   - `ActiveTask`, `TodoItem`, and `AdvancedDetails` no longer write directly into the task array.
   - Details editing now drafts locally and commits through `updateTaskDetails`.
   - Tag add/remove operations now use store commands.

2. Repository boundary
   - Added `TaskRepository`.
   - Added `createLocalTaskRepository`.
   - Slimmed `tasks.ts` into a facade.
   - Added `Board`, `BoardRepository`, and `createLocalBoardRepository`.

Verification already performed:

```bash
npm run check
npm run build
```

Both passed with existing accessibility warnings.

## Known Warnings

These existed before the migration work and are safe to handle in a separate cleanup slice:

- `DayRecap.svelte`: define standard `line-clamp` alongside `-webkit-line-clamp`.
- `AdvancedDetails.svelte`: drag/drop section needs an ARIA role.
- `TagsList.svelte`: table should not own keyboard listeners.

## Roadmap

### Epic 1: Repository and Board Integration

Goal: make the app consciously operate against a selected board/list while still using local storage.

Stories:

1. Add a `src/lib/stores/boards.ts` facade over `createLocalBoardRepository`.
2. Ensure a default board exists on first load.
3. Add `boardId` to `TodoTask`.
4. Migrate existing local tasks into the default board.
5. Update task read models to filter by active board.
6. Keep the visible UI unchanged except for any minimal board bootstrap state.

Acceptance:

- Existing local tasks still appear.
- New tasks are assigned to the active board.
- `npm run check` and `npm run build` pass.

### Epic 2: PocketBase Client Foundation

Goal: add backend connectivity without replacing task persistence yet.

Stories:

1. Add PocketBase SDK dependency.
2. Add `src/lib/pocketbase/client.ts`.
3. Read `VITE_POCKETBASE_URL`, defaulting to `http://127.0.0.1:8090`.
4. Add a lightweight connection/status store.
5. Add login/logout/register scaffolding behind a small auth facade.

Acceptance:

- App can connect to local PocketBase.
- Auth state can be observed from Svelte.
- Existing local task behavior is not broken.

### Epic 3: PocketBase Schema

Goal: define the first backend data model.

Collections:

- `boards`
- `board_members`
- `tasks`
- `task_active_periods`
- `task_tags`
- `tag_styles`
- `audit_events` optional

Initial task fields:

- `board`
- `title`
- `details`
- `tags` or relation records
- `priority`
- `borderColor`
- `isDone`
- `sortOrder`
- `created`
- `updated`

Acceptance:

- Schema can represent all current local task data.
- Active task can be derived from active periods or represented safely as a board-level field.

### Epic 4: PocketBase Task Repository

Goal: implement `TaskRepository` against PocketBase.

Stories:

1. Add `src/lib/repositories/pocketBaseTaskRepository.ts`.
2. Implement task fetch and store hydration.
3. Implement `addTask`.
4. Implement `renameTask`, `updateTaskDetails`, `addTag`, `removeTag`.
5. Implement `activateTask` and `deactivateTask`.
6. Implement `reorderTodo` using server-stored order.
7. Add a switch that chooses local or PocketBase repository.

Acceptance:

- The store facade does not change.
- Components do not import PocketBase directly.
- Local repository remains available as a fallback.

### Epic 5: Local Data Migration

Goal: let existing users move browser data into PocketBase.

Stories:

1. Detect local tasks when logged in.
2. Show a migration prompt.
3. Create default board if needed.
4. Upload tasks, active periods, tags, and tag styles.
5. Mark migration complete locally.
6. Keep export/import available as a safety net.

Acceptance:

- Migration is repeat-safe.
- No local task data is deleted until backend save succeeds.

### Epic 6: Permissions and Sharing

Goal: enforce board access rules.

Permission scopes:

- `view:active`
- `view:dayRecap`
- `view:backlog`
- `view:details`
- `add:item`
- `add:tag`
- `add:details`
- `update:item`
- `update:details`
- `update:order`
- `update:active`
- `delete:item`
- `manage:members`
- `manage:board`

Stories:

1. Add role presets: Viewer, Contributor, Editor, Owner.
2. Add board member collection rules.
3. Gate UI controls based on permissions.
4. Enforce permissions in PocketBase rules and hooks.
5. Add owner sharing UI.
6. Add invite or member-add flow.

Acceptance:

- UI hides controls the member cannot use.
- Direct API calls cannot bypass permissions.

### Epic 7: Realtime Collaboration

Goal: update open boards when another member changes them.

Stories:

1. Subscribe to task changes for active board.
2. Subscribe to tag style changes.
3. Subscribe to active period changes.
4. Reconcile optimistic local changes with server state.
5. Handle permission failures cleanly.

Acceptance:

- Two browsers show shared board updates without manual refresh.
- Active task changes remain board-global.

### Epic 8: Packaging

Goal: keep the project close to click-and-run.

Stories:

1. Add scripts to start Svelte and PocketBase separately.
2. Add optional helper script to start both.
3. Build static frontend for deployment.
4. Explore serving built frontend from PocketBase public files.
5. Document run steps outside README unless README editing is explicitly approved.

Acceptance:

- Local development is two commands or one helper command.
- Production-like local run is easy to repeat.

## Fresh Chat Kickoff Prompts

Use one of these in a new chat:

```text
Read PROJECT_ROADMAP.md and continue Epic 1. Do not edit README files. Start by inspecting the current repository state, then implement the next smallest safe slice.
```

```text
Read PROJECT_ROADMAP.md and implement the PocketBase client foundation from Epic 2. Keep existing localStorage behavior working.
```

```text
Read PROJECT_ROADMAP.md and review the current repository boundary for risks before we add PocketBase.
```

## Working Rules

- Prefer small, verifiable slices.
- Run `npm run check` after code changes.
- Run `npm run build` after module boundary or dependency changes.
- Do not edit `README*.md` unless the user explicitly approves it.
- Do not let components import PocketBase directly.
- Keep task permissions behind repository or service commands.
