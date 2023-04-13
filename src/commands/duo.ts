import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
  userMention,
} from "discord.js";
import { Command } from "./types";

export const Duo: Command = {
  name: "duo",
  description: "Where's my sous chef at?",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'user',
      description: 'Your sous chef',
      type: ApplicationCommandOptionType.User,
      required: true
    }
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const user = interaction.options.getUser('user', true);
    await interaction.reply(`Alright, where is my sous chef?! GET THE F IN THE KITCHEN! ${userMention(user.id)}`);
  },
};
