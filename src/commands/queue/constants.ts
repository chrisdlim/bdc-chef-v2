export const QueueActions = {
  LIST: 'list',
  SHOW: 'show',
  START: 'start',
  JOIN: 'join',
  DELETE: 'delete',
  LEAVE: 'leave',
} as const;

export const QueueOptionNames = {
  ACTION: 'action',
  NAME: 'name',
  SIZE: 'size',
} as const;
