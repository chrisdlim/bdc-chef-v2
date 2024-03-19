import { ButtonBuilder, ButtonStyle } from "discord.js";

export const leaveQueueButtonId = "anon-q2-leave";
export const leaveQueueLabel = "Leave";

export const getAnonLeaveQueueButton = () =>
  new ButtonBuilder()
    .setCustomId(leaveQueueButtonId)
    .setLabel(leaveQueueLabel)
    .setStyle(ButtonStyle.Danger);
