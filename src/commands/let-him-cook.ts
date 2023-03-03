import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import getRandomElement from "../utils/get-random-element";
import { getVoiceChannelByInteraction } from "../utils/voice-channel";
import { Command } from "./types";

const chefRoles = [
  "BURGER FLIPPER",
  "BAKER",
  "PIT MASTER",
  "VEGGIE LOVER",
  "FRYER",
  "SOUS CHEF",
  "DOWN-BAD CHEF",
];

export const LetHimCook: Command = {
  name: "let-him-cook",
  description: "Whos cookin'?",
  type: ApplicationCommandType.ChatInput,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const role = getRandomElement(chefRoles);
    const voiceChannel = getVoiceChannelByInteraction(interaction);

    if (!voiceChannel) {
      await interaction.reply(
        "Theres no one here to cook! Is it...WET in here??"
      );
      return;
    }

    const { members } = voiceChannel;
    const selectedUser = members.random();
    await interaction.reply(
      `In need of a ${role}! LET <@${selectedUser?.id}> COOK!`
    );
  },
};
