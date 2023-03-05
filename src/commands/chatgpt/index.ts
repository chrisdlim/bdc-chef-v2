import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { Command } from "../types";
import { getOpenAI } from "./openai";

export const AskChatGpt: Command = {
  name: "",
  description: "My test",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "prompt",
      description: "Ask me something",
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const openAiApi = getOpenAI();
    await interaction.reply({ content: "Test success", ephemeral: true });
  },
};
