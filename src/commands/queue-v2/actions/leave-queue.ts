import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  EmbedBuilder,
  userMention,
} from "discord.js";
import { SystemError } from "../../../error/system-error";
import { denumberList, numberedList } from "../../../utils/text";
import { ButtonInteractionHandler } from "../../types";
import {
  getQueueTitle,
  getNumberFromString,
  expireQueue,
  defaultQueueTimeoutMinutes,
} from "./../utils";
import { QueueFields } from "./../fields";
import { getQueueButtons } from "./../buttons/utils";

export const LeaveQueue: ButtonInteractionHandler = {
  id: "q2-leave",
  label: "Leave",
  run: async (interaction: ButtonInteraction) => {
    const {
      user,
      message: { embeds, components },
    } = interaction;
    const [embed] = embeds;
    if (!embed || !embed.data.fields) {
      throw new SystemError("Welp, I don't know what to do here. Goodbye.");
    }

    const mentionedUser = userMention(user.id);
    const [queueField, timeoutField, anonField] = embed.data.fields;
    const isAnon = anonField.value.toLowerCase() === "yes";
    const timeQueueStarted = new Date(embed.timestamp!).getTime();
    const { name, value: queuedUsersStr } = queueField;
    const currentQueuedUsers = denumberList(queuedUsersStr, {
      anonymize: isAnon,
      time: timeQueueStarted,
    });
    const queueSize = getNumberFromString(embed.footer?.text!);
    if (!currentQueuedUsers.includes(mentionedUser)) {
      await interaction.reply({
        content:
          "You are already a dogshit bus boy, get the f out of my kitchen.",
        ephemeral: true,
      });
      return;
    }

    const updatedQueuedUsers = currentQueuedUsers.filter(
      (user) => user !== mentionedUser
    );

    if (!updatedQueuedUsers.length) {
      await interaction.update({
        content: "Kitchen is closed! Everyone left the queue.",
        embeds: [],
        components: [],
      });
      return;
    }

    const wasQueueFull = currentQueuedUsers.length === queueSize;
    const isQueueFull = updatedQueuedUsers.length === queueSize;

    const queueTimeoutFieldValue = embed.data.fields?.find(
      ({ name }) => name === QueueFields.TIMEOUT
    )?.value;
    const queueTimeout = queueTimeoutFieldValue
      ? getNumberFromString(queueTimeoutFieldValue)
      : defaultQueueTimeoutMinutes;

    const updatedButtons = getQueueButtons(isQueueFull);

    const updatedQueuedUsersNumbered = numberedList(updatedQueuedUsers, {
      anonymize: isAnon,
      time: timeQueueStarted,
    });
    const updatedEmbed = {
      ...embed.data,
      fields: [
        { name, value: updatedQueuedUsersNumbered },
        timeoutField,
        anonField,
      ],
      title: getQueueTitle(queueSize, updatedQueuedUsers.length),
    };

    const updatedEmbedActions =
      new ActionRowBuilder<ButtonBuilder>().addComponents(updatedButtons);

    const editedEmbed = new EmbedBuilder(updatedEmbed);

    if (wasQueueFull) {
      await interaction.deferReply();
      await interaction
        .editReply({
          embeds: [editedEmbed],
          components: [updatedEmbedActions],
        })
        .then((message) => expireQueue(message, queueTimeout));
    } else {
      await interaction.update({
        embeds: [editedEmbed],
        components: [updatedEmbedActions],
      });
    }
  },
};
