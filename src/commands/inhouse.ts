import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
  userMention,
} from "discord.js";

import { getVoiceChannelByInteraction } from "../utils/voice-channel";
import { Command } from "./types";
import {
  generateRandomParticipants,
  inhouseMatchmaking,
} from "../utils/match-making";

export const Inhouse: Command = {
  name: "inhouse",
  description: "Create Valorant teams based on members in VC",
  type: ApplicationCommandType.ChatInput,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    // Starting with VC but later want to convert to reaction on message
    const voiceChannel = getVoiceChannelByInteraction(interaction);

    if (!voiceChannel) {
      await interaction.reply("No one available");
      return;
    }

    const { members } = voiceChannel;
    // const yoink = members.map(i => i.user.id)

    // // Get username of all VC users
    let vcMembers: string[] = members.map((i) => i.user.username);
    // let vcMembers: string[] = [];

    // Auto-generate at least 10 for testing purposes
    if (vcMembers.length < 10) {
      const testMembers = generateRandomParticipants(10 - vcMembers.length);
      vcMembers = vcMembers.concat(testMembers);
    }

    let teams = inhouseMatchmaking(vcMembers);
    let t1 = teams.slice(0, 5);
    let t2 = teams.slice(5);

    // let t1 = teams.slice(0, 6).map(i => userMention(i));
    // let t2 = teams.slice(5).map(i => userMention(i));

    // await interaction.reply(`Team 1: <@${yoink}>, , ${userMention(t1[3])}, ${userMention(t1[4])}, ${userMention(t1[5])} `);
    await interaction.reply(
      `Team 1:\n-----\n${t1.join("\n")} \n\nTeam 2:\n-----\n${t2.join("\n")}`
    );
  },
};