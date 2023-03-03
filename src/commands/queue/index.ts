
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
  User
} from "discord.js";
import { SystemError } from "../../error/system-error";
import {
  getCurrentQueueNames,
  getIncrementedQueueName,
  getQueueMembersByName,
  QueueActions,
  QueueOptionNames
} from "./utils";
import { Command } from "../types";
import { getUserAsMention } from "../../utils/user";

const inMemQueues = new Map<string, Set<string>>();

export const Queue: Command = {
  name: 'queue',
  description: 'Queue commands',
  type: ApplicationCommandType.ChatInput,
  autocompleteConfig: {
    [QueueOptionNames.ACTION]: Object.values(QueueActions),
    [QueueOptionNames.NAME]: getCurrentQueueNames(inMemQueues),
  },
  options: [
    {
      name: QueueOptionNames.ACTION,
      description: 'Queue action',
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
    {
      name: QueueOptionNames.NAME,
      description: 'Name of queue',
      type: ApplicationCommandOptionType.String,
      required: false,
      autocomplete: true,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const { options } = interaction;
    const action = options.getString(QueueOptionNames.ACTION, true);
    const queueName = options.getString(QueueOptionNames.NAME) || getIncrementedQueueName(inMemQueues);

    await handleAction(interaction, action, queueName);
    try {
      const queueMembers = getQueueMembersByName(inMemQueues, queueName);
      const queueMembersAsNumberedList = queueMembers.map((value, index) => `${index + 1}. ${value}`);
      await interaction.reply([`Current queue: ${queueName}`, ...queueMembersAsNumberedList].join('\n'));
    } catch (error) {
      if (error instanceof SystemError) {
        await error.handle(interaction);
        return;
      }

      throw error;
    }
  }
}

const handleAction = async (interaction: ChatInputCommandInteraction, action: string, queueName: string) => {
  const { user } = interaction;
  try {
    switch (action) {
      case QueueActions.START:
        handleStart(user, queueName);
        break;
      default:
        break;
    }
  } catch (error) {
    if (error instanceof SystemError) {
      await error.handle(interaction);
      return;
    }

    throw error;
  }
}

const handleStart = (user: User, queueName: string) => {
  const queueNames = getCurrentQueueNames(inMemQueues)
    .map((name) => name.toLocaleLowerCase());

  if (queueNames.includes(queueName.toLowerCase())) {
    throw new SystemError(`Sorry, ${queueName} is already taken.`);
  }

  const userMention = getUserAsMention(user);
  const queue = new Set<string>();
  queue.add(userMention);

  inMemQueues.set(queueName, queue)
};


