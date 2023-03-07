import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { CreateCompletionResponseChoicesInner } from "openai";
import { getOpenAI, getPromptAnswer } from "../api";
import getRandomElement from "../utils/get-random-element";
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
    }
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const user = interaction.options.getUser("user", true);
    const userMention = getUserAsMention(user);

    await interaction.deferReply();

    const insult = await getPromptAnswer(openai, 'generate an insult about someone\s valorant aim')
      .then(({ data }) => data.choices[0].text);

    await interaction.editReply({
      content: `${userMention}, ${insult}`,
    });
  },
};
