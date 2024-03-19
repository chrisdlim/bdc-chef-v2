import { ButtonBuilder, ButtonStyle } from "discord.js";

export const joinQueueButtonId = "q2-join";
export const joinQueueLabel = "Join";

export const getJoinQueueButton = () =>
  new ButtonBuilder()
    .setCustomId(joinQueueButtonId)
    .setLabel(joinQueueLabel)
    .setStyle(ButtonStyle.Primary);
