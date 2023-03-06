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
const defaultQueueSize = 5;

const autocompleteConfig: CommandOptionsAutoCompleteConfig = {
  [QueueOptionNames.ACTION]: () => Object.values(QueueActions),
};

/**
 * @deprecated
 */
export const Queue: Command = {
  name: "q-old",
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
      name: QueueOptionNames.SIZE,
      description: "Size of the queue",
      type: ApplicationCommandOptionType.Integer,
    },
    {
      name: QueueOptionNames.USER,
      description: "User to add",
      type: ApplicationCommandOptionType.User,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const { options } = interaction;
    const action = options.getString(QueueOptionNames.ACTION, false);
    const queueSize =
      options.getInteger(QueueOptionNames.SIZE) || defaultQueueSize;
    const user = options.getUser(QueueOptionNames.USER);

    const params = { action, queueSize, user };

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
      const filtered = choices.filter((choice) =>
        choice.toLowerCase().startsWith(value.toLowerCase())
      );

      await interaction.respond(
        filtered.map((choice) => ({ name: choice, value: choice }))
      );
    }
  },
};
