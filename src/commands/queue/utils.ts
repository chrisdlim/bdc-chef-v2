import { ChatInputCommandInteraction, User } from "discord.js";
import { SystemError } from "../../error/system-error";
import { getUserAsMention } from "../../utils/user";

type InMemQueues = Map<string, Set<string>>

const queueNamePrefix = 'queue';

export const QueueActions = {
  SHOW: 'show',
  START: 'start',
  JOIN: 'join',
  CLEAR: 'clear',
  LEAVE: 'leave',
} as const;

export const QueueOptionNames = {
  ACTION: 'action',
  NAME: 'name'
} as const;


export const getCurrentQueueNames = (inMemQueues: InMemQueues) => [...inMemQueues.keys()];

export const getQueueMembersByName = (inMemQueues: InMemQueues, name: string) => {
  if (inMemQueues.has(name)) {
    return [...inMemQueues.get(name)!.keys()];
  }
  throw new SystemError(`Sorry, ${name} is not a queue anymore.`);
};

export const getIncrementedQueueName = (inMemQueues: InMemQueues) => {
  const queueSize = inMemQueues.size;
  return `${queueNamePrefix}${queueSize || 1}`
}