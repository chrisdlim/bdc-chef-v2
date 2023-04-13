import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
} from "discord.js";
import { SystemError } from "../../error/system-error";
import { ButtonInteractionHandler } from "../types";
import { QueueFields } from "./fields";
import { defaultQueueTimeoutMinutes, expireQueue, getNumberFromString } from "./utils";

const id = "q2-bump";
const label = "Bump";

export const getBumpQueueButton = () =>
  new ButtonBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(ButtonStyle.Secondary);

export const BumpQueue: ButtonInteractionHandler = {
  id,
  label,
  run: async (interaction: ButtonInteraction) => {
    const {
      message: { embeds, components },
    } = interaction;
    const [embed] = embeds;
    const queueTimeoutFieldValue = embed.data.fields?.find(({ name }) => name === QueueFields.TIMEOUT)?.value;
    const queueTimeout = queueTimeoutFieldValue ?
      getNumberFromString(queueTimeoutFieldValue) : defaultQueueTimeoutMinutes;

    if (!embed || !embed.data.fields) {
      throw new SystemError("Welp, I don't know what to do here. Goodbye.");
    }

    await interaction.deferReply();
    await interaction.editReply({
      content: 'bump',
      components,
      embeds
    }).then((message) => expireQueue(message, queueTimeout));
  }
};
