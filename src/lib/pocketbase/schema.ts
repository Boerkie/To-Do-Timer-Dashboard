// schema.ts
const MAX_SINGLE_RELATION = 1;
const MAX_TAG_LENGTH = 20;
const MAX_COLOR_LENGTH = 32;
const MIN_PRIORITY = 1;
const MAX_PRIORITY = 4;
const AUTHENTICATED_RULE = '@request.auth.id != ""';
const CREATE_OWN_BOARD_RULE = '@request.auth.id != "" && @request.body.owner = @request.auth.id';

export const POCKETBASE_COLLECTION_NAMES = {
  boards: 'boards',
  boardMembers: 'board_members',
  tasks: 'tasks',
  taskActivePeriods: 'task_active_periods',
  taskTags: 'task_tags',
  tagStyles: 'tag_styles',
  auditEvents: 'audit_events',
  users: 'users'
} as const;

export const BOARD_MEMBER_ROLES = ['viewer', 'contributor', 'editor', 'owner'] as const;

export const BOARD_PERMISSION_SCOPES = [
  'view:active',
  'view:dayRecap',
  'view:backlog',
  'view:details',
  'add:item',
  'add:tag',
  'add:details',
  'update:item',
  'update:details',
  'update:order',
  'update:active',
  'delete:item',
  'manage:members',
  'manage:board'
] as const;

export type BoardMemberRole = (typeof BOARD_MEMBER_ROLES)[number];
export type BoardPermissionScope = (typeof BOARD_PERMISSION_SCOPES)[number];

export const BOARD_ROLE_PERMISSION_PRESETS = {
  viewer: ['view:active', 'view:dayRecap'],
  contributor: [
    'view:active',
    'view:dayRecap',
    'view:backlog',
    'view:details',
    'add:item',
    'add:tag',
    'add:details'
  ],
  editor: [
    'view:active',
    'view:dayRecap',
    'view:backlog',
    'view:details',
    'add:item',
    'add:tag',
    'add:details',
    'update:item',
    'update:details',
    'update:order',
    'update:active',
    'delete:item'
  ],
  owner: BOARD_PERMISSION_SCOPES
} satisfies Record<BoardMemberRole, readonly BoardPermissionScope[]>;

function getBoardMemberRule(permission: BoardPermissionScope, boardField = 'board'): string {
  return `@request.auth.id != "" && (${boardField}.owner = @request.auth.id || (@collection.board_members:membership.board ?= ${boardField} && @collection.board_members:membership.user ?= @request.auth.id && @collection.board_members:membership.permissions ?= "${permission}"))`;
}

function getBoardMemberCreateRule(permission: BoardPermissionScope): string {
  return `@request.auth.id != "" && (@collection.boards:owned.id ?= @request.body.board && @collection.boards:owned.owner ?= @request.auth.id || (@collection.board_members:membership.board ?= @request.body.board && @collection.board_members:membership.user ?= @request.auth.id && @collection.board_members:membership.permissions ?= "${permission}"))`;
}

const BOARD_ACCESS_RULE = `@request.auth.id != "" && (owner = @request.auth.id || (@collection.board_members:membership.board ?= id && @collection.board_members:membership.user ?= @request.auth.id))`;
const BOARD_MANAGE_RULE = `@request.auth.id != "" && (owner = @request.auth.id || (@collection.board_members:membership.board ?= id && @collection.board_members:membership.user ?= @request.auth.id && @collection.board_members:membership.permissions ?= "manage:board"))`;
const BOARD_MEMBER_ACCESS_RULE = `@request.auth.id != "" && (user = @request.auth.id || board.owner = @request.auth.id || (@collection.board_members:membership.board ?= board && @collection.board_members:membership.user ?= @request.auth.id && @collection.board_members:membership.permissions ?= "manage:members"))`;

export type PocketBaseCollectionName =
  (typeof POCKETBASE_COLLECTION_NAMES)[keyof typeof POCKETBASE_COLLECTION_NAMES];

export type PocketBaseFieldType =
  | 'text'
  | 'number'
  | 'bool'
  | 'date'
  | 'select'
  | 'relation'
  | 'json';

export interface PocketBaseFieldDefinition {
  name: string;
  type: PocketBaseFieldType;
  required?: boolean;
  collectionId?: PocketBaseCollectionName;
  cascadeDelete?: boolean;
  maxSelect?: number;
  values?: readonly string[];
  min?: number;
  max?: number;
  pattern?: string;
}

export interface PocketBaseCollectionDefinition {
  name: PocketBaseCollectionName;
  type: 'base';
  listRule: string | null;
  viewRule: string | null;
  createRule: string | null;
  updateRule: string | null;
  deleteRule: string | null;
  fields: readonly PocketBaseFieldDefinition[];
  indexes: readonly string[];
}

export const pocketBaseCollections = [
  {
    name: POCKETBASE_COLLECTION_NAMES.boards,
    type: 'base',
    listRule: BOARD_ACCESS_RULE,
    viewRule: BOARD_ACCESS_RULE,
    createRule: CREATE_OWN_BOARD_RULE,
    updateRule: BOARD_MANAGE_RULE,
    deleteRule: BOARD_MANAGE_RULE,
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'localId', type: 'text', max: 64 },
      {
        name: 'owner',
        type: 'relation',
        required: true,
        collectionId: POCKETBASE_COLLECTION_NAMES.users,
        maxSelect: MAX_SINGLE_RELATION
      }
    ],
    indexes: [
      'CREATE INDEX `idx_boards_owner` ON `boards` (`owner`)',
      'CREATE UNIQUE INDEX `idx_boards_owner_local_id` ON `boards` (`owner`, `localId`) WHERE `localId` != ""'
    ]
  },
  {
    name: POCKETBASE_COLLECTION_NAMES.boardMembers,
    type: 'base',
    listRule: BOARD_MEMBER_ACCESS_RULE,
    viewRule: BOARD_MEMBER_ACCESS_RULE,
    createRule: getBoardMemberCreateRule('manage:members'),
    updateRule: getBoardMemberRule('manage:members'),
    deleteRule: getBoardMemberRule('manage:members'),
    fields: [
      {
        name: 'board',
        type: 'relation',
        required: true,
        collectionId: POCKETBASE_COLLECTION_NAMES.boards,
        maxSelect: MAX_SINGLE_RELATION,
        cascadeDelete: true
      },
      {
        name: 'user',
        type: 'relation',
        required: true,
        collectionId: POCKETBASE_COLLECTION_NAMES.users,
        maxSelect: MAX_SINGLE_RELATION
      },
      {
        name: 'role',
        type: 'select',
        required: true,
        maxSelect: MAX_SINGLE_RELATION,
        values: BOARD_MEMBER_ROLES
      },
      {
        name: 'permissions',
        type: 'select',
        maxSelect: BOARD_PERMISSION_SCOPES.length,
        values: BOARD_PERMISSION_SCOPES
      }
    ],
    indexes: [
      'CREATE UNIQUE INDEX `idx_board_members_board_user` ON `board_members` (`board`, `user`)',
      'CREATE INDEX `idx_board_members_user` ON `board_members` (`user`)'
    ]
  },
  {
    name: POCKETBASE_COLLECTION_NAMES.tasks,
    type: 'base',
    listRule: getBoardMemberRule('view:backlog'),
    viewRule: getBoardMemberRule('view:backlog'),
    createRule: getBoardMemberCreateRule('add:item'),
    updateRule: getBoardMemberRule('update:item'),
    deleteRule: getBoardMemberRule('delete:item'),
    fields: [
      {
        name: 'board',
        type: 'relation',
        required: true,
        collectionId: POCKETBASE_COLLECTION_NAMES.boards,
        maxSelect: MAX_SINGLE_RELATION,
        cascadeDelete: true
      },
      { name: 'localId', type: 'text', max: 64 },
      { name: 'title', type: 'text' },
      { name: 'details', type: 'text' },
      { name: 'priority', type: 'number', required: true, min: MIN_PRIORITY, max: MAX_PRIORITY },
      { name: 'borderColor', type: 'text', max: MAX_COLOR_LENGTH },
      { name: 'isDone', type: 'bool' },
      { name: 'sortOrder', type: 'number', required: true },
      { name: 'createdAt', type: 'number', required: true },
      { name: 'updatedAt', type: 'number', required: true }
    ],
    indexes: [
      'CREATE INDEX `idx_tasks_board_done_sort` ON `tasks` (`board`, `isDone`, `sortOrder`)',
      'CREATE INDEX `idx_tasks_board_priority` ON `tasks` (`board`, `priority`)',
      'CREATE UNIQUE INDEX `idx_tasks_board_local_id` ON `tasks` (`board`, `localId`) WHERE `localId` != ""'
    ]
  },
  {
    name: POCKETBASE_COLLECTION_NAMES.taskActivePeriods,
    type: 'base',
    listRule: getBoardMemberRule('view:active'),
    viewRule: getBoardMemberRule('view:active'),
    createRule: getBoardMemberCreateRule('update:active'),
    updateRule: getBoardMemberRule('update:active'),
    deleteRule: getBoardMemberRule('update:active'),
    fields: [
      {
        name: 'board',
        type: 'relation',
        required: true,
        collectionId: POCKETBASE_COLLECTION_NAMES.boards,
        maxSelect: MAX_SINGLE_RELATION,
        cascadeDelete: true
      },
      {
        name: 'task',
        type: 'relation',
        required: true,
        collectionId: POCKETBASE_COLLECTION_NAMES.tasks,
        maxSelect: MAX_SINGLE_RELATION,
        cascadeDelete: true
      },
      { name: 'startedAt', type: 'date', required: true },
      { name: 'endedAt', type: 'date' }
    ],
    indexes: [
      'CREATE INDEX `idx_task_active_periods_board_start` ON `task_active_periods` (`board`, `startedAt`)',
      'CREATE INDEX `idx_task_active_periods_task_start` ON `task_active_periods` (`task`, `startedAt`)'
    ]
  },
  {
    name: POCKETBASE_COLLECTION_NAMES.taskTags,
    type: 'base',
    listRule: getBoardMemberRule('view:backlog'),
    viewRule: getBoardMemberRule('view:backlog'),
    createRule: getBoardMemberCreateRule('add:tag'),
    updateRule: getBoardMemberRule('update:item'),
    deleteRule: getBoardMemberRule('update:item'),
    fields: [
      {
        name: 'board',
        type: 'relation',
        required: true,
        collectionId: POCKETBASE_COLLECTION_NAMES.boards,
        maxSelect: MAX_SINGLE_RELATION,
        cascadeDelete: true
      },
      {
        name: 'task',
        type: 'relation',
        required: true,
        collectionId: POCKETBASE_COLLECTION_NAMES.tasks,
        maxSelect: MAX_SINGLE_RELATION,
        cascadeDelete: true
      },
      { name: 'name', type: 'text', required: true, max: MAX_TAG_LENGTH, pattern: '^[A-Za-z0-9_-]+$' },
      { name: 'sortOrder', type: 'number', required: true }
    ],
    indexes: [
      'CREATE UNIQUE INDEX `idx_task_tags_task_name` ON `task_tags` (`task`, `name`)',
      'CREATE INDEX `idx_task_tags_board_name` ON `task_tags` (`board`, `name`)'
    ]
  },
  {
    name: POCKETBASE_COLLECTION_NAMES.tagStyles,
    type: 'base',
    listRule: getBoardMemberRule('view:backlog'),
    viewRule: getBoardMemberRule('view:backlog'),
    createRule: getBoardMemberCreateRule('add:tag'),
    updateRule: getBoardMemberRule('add:tag'),
    deleteRule: getBoardMemberRule('add:tag'),
    fields: [
      {
        name: 'board',
        type: 'relation',
        required: true,
        collectionId: POCKETBASE_COLLECTION_NAMES.boards,
        maxSelect: MAX_SINGLE_RELATION,
        cascadeDelete: true
      },
      { name: 'name', type: 'text', required: true, max: MAX_TAG_LENGTH, pattern: '^[A-Za-z0-9_-]+$' },
      { name: 'bg', type: 'text', required: true, max: MAX_COLOR_LENGTH },
      { name: 'fg', type: 'text', required: true, max: MAX_COLOR_LENGTH },
      { name: 'border', type: 'text', required: true, max: MAX_COLOR_LENGTH }
    ],
    indexes: ['CREATE UNIQUE INDEX `idx_tag_styles_board_name` ON `tag_styles` (`board`, `name`)']
  },
  {
    name: POCKETBASE_COLLECTION_NAMES.auditEvents,
    type: 'base',
    listRule: getBoardMemberRule('manage:board'),
    viewRule: getBoardMemberRule('manage:board'),
    createRule: AUTHENTICATED_RULE,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: 'board',
        type: 'relation',
        required: true,
        collectionId: POCKETBASE_COLLECTION_NAMES.boards,
        maxSelect: MAX_SINGLE_RELATION,
        cascadeDelete: true
      },
      {
        name: 'actor',
        type: 'relation',
        collectionId: POCKETBASE_COLLECTION_NAMES.users,
        maxSelect: MAX_SINGLE_RELATION
      },
      {
        name: 'entityType',
        type: 'select',
        required: true,
        maxSelect: MAX_SINGLE_RELATION,
        values: [
          'board',
          'board_member',
          'task',
          'task_active_period',
          'task_tag',
          'tag_style'
        ]
      },
      { name: 'entityId', type: 'text', required: true },
      { name: 'action', type: 'text', required: true },
      { name: 'payload', type: 'json' }
    ],
    indexes: ['CREATE INDEX `idx_audit_events_board_created` ON `audit_events` (`board`, `created`)']
  }
] satisfies readonly PocketBaseCollectionDefinition[];

export const localTaskDataFieldMap = {
  boardId: 'tasks.board',
  id: 'tasks.localId',
  title: 'tasks.title',
  details: 'tasks.details',
  tags: 'task_tags.name',
  priority: 'tasks.priority',
  borderColor: 'tasks.borderColor',
  activePeriods: 'task_active_periods.startedAt/endedAt',
  createdAt: 'tasks.createdAt',
  updatedAt: 'tasks.updatedAt',
  isDone: 'tasks.isDone'
} as const;

export const activeTaskDerivation = {
  collection: POCKETBASE_COLLECTION_NAMES.taskActivePeriods,
  filter: 'board = activeBoard && endedAt = ""',
  sort: '-startedAt'
} as const;
