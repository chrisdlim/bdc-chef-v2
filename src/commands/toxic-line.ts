import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import getRandomElement from "../utils/get-random-element";
import { getUserAsMention } from "../utils/user";
import { Command } from "./types";

const toxicLines = [
  "hahahahah",
  "lolololol",
  "LIMFOW, LIMFOW",
  "Go kick rocks",
  "You need help from woojin?",
  "I'm boomed",
  "I hope you get cancer",
];

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
    const randomToxicLine = getRandomElement(toxicLines);
    await interaction.reply({
      content: `Nice whiff ${userMention}. ${randomToxicLine}`,
      tts: true,
    });
  },
};
