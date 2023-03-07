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

export const ToxicLine: Command = {
  name: "toxic",
  description: "BEWARE DO NOT USE!",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "User",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const user = interaction.options.getUser("user", true);
    const userMention = getUserAsMention(user);

    await interaction.deferReply();

    const insultPrompt = "generate an insult about someone's valorant aim";
    const insult = await askChatGpt(openai, insultPrompt);

    await interaction.editReply({
      content: `${userMention}, ${insult}`,
    });
  },
};
