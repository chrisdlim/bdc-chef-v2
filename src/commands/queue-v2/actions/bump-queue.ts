import { ButtonInteraction } from "discord.js";
import { SystemError } from "../../../error/system-error";
import { ButtonInteractionHandler } from "../../types";
import { bumpQueueButtonId, bumpQueueLabel } from "../buttons";
import { QueueFields } from "../fields";
import { defaultQueueTimeoutMinutes, expireQueue, getNumberFromString } from "../utils";

export const BumpQueue: ButtonInteractionHandler = {
  id: bumpQueueButtonId,
  label: bumpQueueLabel,
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
