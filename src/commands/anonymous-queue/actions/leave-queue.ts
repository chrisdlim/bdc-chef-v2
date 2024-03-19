import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  EmbedBuilder,
  userMention,
} from "discord.js";
import { SystemError } from "../../../error/system-error";
import { anonymousList, denumberList, numberedList } from "../../../utils/text";
import { ButtonInteractionHandler } from "../../types";
import {
  getQueueTitle,
  getNumberFromString,
  expireQueue,
  defaultQueueTimeoutMinutes,
} from "./../../queue-v2/utils";
import { QueueFields } from "./../../queue-v2/fields";
import { getQueueButtons } from "./../buttons/utils";
import { leaveQueueButtonId, leaveQueueLabel } from "../buttons";
import { decryptValue, encryptValue } from "../../../utils/anonymize";

export const AnonLeaveQueue: ButtonInteractionHandler = {
  id: leaveQueueButtonId,
  label: leaveQueueLabel,
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
    const timeQueueStarted = new Date(embed.timestamp!).getTime();
    const { name, value: queuedUsersStr } = queueField;
    const decryptedQueueMembers = decryptValue(anonField.value);
    const currentQueuedUsers = denumberList(decryptedQueueMembers);
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

    const updatedMemberList = numberedList(updatedQueuedUsers);
    const anonymizedMembersList = anonymousList(updatedQueuedUsers);
    const updatedEmbed = {
      ...embed.data,
      fields: [
        { name, value: anonymizedMembersList },
        timeoutField,
        { ...anonField, value: encryptValue(updatedMemberList, timeQueueStarted) },
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
