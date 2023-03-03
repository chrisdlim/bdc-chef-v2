
import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, Client } from "discord.js";
import { Command } from "./types";

const QueueActions = {
  START: 'start',
  JOIN: 'join',
  CLEAR: 'clear',
} as const;

const QueueOptionNames = {
  ACTION: 'action',
  NAME: 'name'
} as const;

const localQueue = new Map<string, Set<string>>();
const something = new Set<string>();
something.add('hello');
localQueue.set('test', something);

export const Queue: Command = {
  name: 'queue',
  description: 'Queue commands',
  type: ApplicationCommandType.ChatInput,
  autocompleteConfig: {
    [QueueOptionNames.ACTION]: Object.values(QueueActions),
    [QueueOptionNames.NAME]: [...localQueue.keys()],
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
    console.log(interaction.user);
    await interaction.reply('Testing');
  }
}