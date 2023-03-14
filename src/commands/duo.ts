import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { getUserAsMention } from "../utils/user";
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
    }
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const user = interaction.options.getUser('user', true);
    const userMention = getUserAsMention(user);
    await interaction.reply(`Alright, where is my sous chef?! GET THE F IN THE KITCHEN! ${userMention}`);
  },
};
