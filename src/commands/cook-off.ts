import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
  Collection,
  GuildMember,
} from "discord.js";
import { getUserAsMention } from "../utils/user";
import { getVoiceChannelByInteraction } from "../utils/voice-channel";
import { Command } from "./types";

const getTwoChefs = (members: Collection<string, GuildMember>) => {
  const firstUser = members.random();
  members.delete(firstUser!.id);
  const secondUser = members.random();
  return [firstUser, secondUser];
};

export const Cookoff: Command = {
  name: "cook-off",
  description: "Chooses 2 captains",
  type: ApplicationCommandType.ChatInput,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const voiceChannel = getVoiceChannelByInteraction(interaction);

    if (!voiceChannel) {
      await interaction.reply("Looks like no one's here to cook...");
      return;
    }

    const { members } = voiceChannel;

    if (members.size < 2) {
      await interaction.reply(
        "Uh oh, we need at least 2 chefs here for a cook-off"
      );
      return;
    }

    const [firstUser, secondUser] = getTwoChefs(members.clone());
    const firstMention = getUserAsMention(firstUser!);
    const secondMention = getUserAsMention(secondUser!);

    await interaction.reply(
      `We got a cook-off on our hands! ${firstMention} vs. ${secondMention}`
    );
  },
};
