import { ChatInputCommandInteraction } from "discord.js";

export const getVoiceChannelByInteraction = (
  interaction: ChatInputCommandInteraction
) => {
  const { user, guild } = interaction;
  const member = guild?.members.cache.get(user.id);
  return member?.voice.channel;
};
