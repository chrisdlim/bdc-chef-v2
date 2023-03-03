import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { Command } from "./types";

export const Ping: Command = {
  name: "ping",
  description: "Ping Pong",
  type: ApplicationCommandType.ChatInput,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    await interaction.reply("Pong!");
  },
};
