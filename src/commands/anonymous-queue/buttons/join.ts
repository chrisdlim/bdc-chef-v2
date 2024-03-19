import { ButtonBuilder, ButtonStyle } from "discord.js";

export const joinQueueButtonId = "anon-q2-join";
export const joinQueueLabel = "Join";

export const getAnonJoinQueueButton = () =>
  new ButtonBuilder()
    .setCustomId(joinQueueButtonId)
    .setLabel(joinQueueLabel)
    .setStyle(ButtonStyle.Primary);
