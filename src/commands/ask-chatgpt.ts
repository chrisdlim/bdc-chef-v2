import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
  userMention,
} from "discord.js";
import { askChatGpt, getOpenAI } from "../api";
import { Command } from "./types";

const openai = getOpenAI();

export const AskChatGpt: Command = {
  name: "ask-chatgpt",
  description: "Ask ChatGPT something",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "prompt",
      description: "Something to ask the chef",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const prompt = interaction.options.getString("prompt", true);
    await interaction.deferReply();
    const answer = await askChatGpt(openai, prompt);
    const promptWithAnswer = [
      `${userMention(interaction.user.id)}, you asked:`,
      `> ${prompt.trim()}`,
      answer.trim(),
    ].join("\n");
    await interaction.followUp(promptWithAnswer);
  },
};
