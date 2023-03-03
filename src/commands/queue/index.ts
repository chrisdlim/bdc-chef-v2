
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { SystemError } from "../../error/system-error";
import {
  QueueActions,
  QueueOptionNames
} from "./utils";
import { Command } from "../types";
import { InMemQueue } from "./in-mem-queue";

const queue = new InMemQueue();

export const Queue: Command = {
  name: 'queue',
  description: 'Queue commands',
  type: ApplicationCommandType.ChatInput,
  autocompleteConfig: {
    [QueueOptionNames.ACTION]: Object.values(QueueActions),
    [QueueOptionNames.NAME]: queue.getCurrentQueueNames(),
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
    const queueName = options.getString(QueueOptionNames.NAME);

    try {
      await queue.handleAction(interaction, action, queueName);
    } catch (error) {
      if (error instanceof SystemError) {
        await error.handle(interaction);
        return;
      }

      throw error;
    }
  }
}