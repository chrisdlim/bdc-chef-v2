import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { SystemError } from "../../error/system-error";
import { QueueActions, QueueOptionNames } from "./constants";
import { Command } from "../types";
import { InMemQueue } from "./in-mem-queue";
import { CommandOptionsAutoCompleteConfig } from "../../autocomplete/types";

const queue = new InMemQueue();

const autocompleteConfig: CommandOptionsAutoCompleteConfig = {
  [QueueOptionNames.ACTION]: () => Object.values(QueueActions),
  [QueueOptionNames.NAME]: () => queue.getCurrentQueueNames(),
};

export const Queue: Command = {
  name: "queue",
  description: "Queue commands",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: QueueOptionNames.ACTION,
      description: "Queue action",
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
      required: false,
    },
    {
      name: QueueOptionNames.NAME,
      description: "Name of queue",
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
      required: false,
    },
    {
      name: QueueOptionNames.SIZE,
      description: "Size of the queue",
      type: ApplicationCommandOptionType.Integer,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const { options } = interaction;
    const action = options.getString(QueueOptionNames.ACTION, false);
    const queueName = options.getString(QueueOptionNames.NAME);
    const queueSize = options.getInteger(QueueOptionNames.SIZE);
    const params = { action, queueName, queueSize }

    try {
      await queue.handleAction(interaction, params);
    } catch (error) {
      if (error instanceof SystemError) {
        await error.handle(interaction);
        return;
      }

      throw error;
    }
  },
  handleAutoComplete: async (interaction: AutocompleteInteraction) => {
    const { name, value } = interaction.options.getFocused(true);

    if (name in autocompleteConfig) {
      const choices = autocompleteConfig[name]();
      const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(value.toLowerCase()));

      await interaction.respond(
        filtered.map((choice) => ({ name: choice, value: choice }))
      );
    }

  }
};
