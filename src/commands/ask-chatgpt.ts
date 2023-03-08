import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { askChatGpt, getOpenAI } from "../api";
import { getUserAsMention } from "../utils/user";
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
    const userMention = getUserAsMention(interaction.user);
    const prompt = interaction.options.getString("prompt", true);

    await interaction.deferReply();

    const answer = await askChatGpt(openai, prompt);

    const promptWithAnswer = [
      `${userMention}, you asked:`,
      `> ${prompt.trim()}`,
      answer.trim(),
    ].join("\n");
    await interaction.followUp(promptWithAnswer);
  },
};
