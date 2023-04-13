import { ButtonBuilder, ButtonStyle } from "discord.js";

export const leaveQueueButtonId = "q2-leave";
export const leaveQueueLabel = "Leave";

export const getLeaveQueueButton = (isDisabled = false) =>
  new ButtonBuilder()
    .setCustomId(leaveQueueButtonId)
    .setLabel(leaveQueueLabel)
    .setStyle(ButtonStyle.Danger)
    .setDisabled(isDisabled);
