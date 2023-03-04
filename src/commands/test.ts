import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { Command } from "./types";

export const Test: Command = {
  name: "test",
  description: "My test",
  type: ApplicationCommandType.ChatInput,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    await interaction.reply(`<@${139238040764678145}> needs MILK`);
  },
};
