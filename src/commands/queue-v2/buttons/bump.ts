import { ButtonBuilder, ButtonStyle } from "discord.js";

export const bumpQueueButtonId = "q2-bump";
export const bumpQueueLabel = "Bump";

export const getBumpQueueButton = (isDisabled = false) =>
  new ButtonBuilder()
    .setCustomId(bumpQueueButtonId)
    .setLabel(bumpQueueLabel)
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(isDisabled);
