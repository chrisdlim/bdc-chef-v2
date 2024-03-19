import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  EmbedBuilder,
  userMention,
} from "discord.js";
import { SystemError } from "../../../error/system-error";
import {
  anonymousList,
  denumberList,
  despoil,
  numberedList,
} from "../../../utils/text";
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
    const [queueField, timeoutField, secretField] = embed.data.fields;
    const timeQueueStarted = new Date(embed.timestamp!).getTime();
    const decryptedQueueMembers = decryptValue(despoil(secretField.value));
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

    const isQueueFull = updatedQueuedUsers.length === queueSize;
    const updatedButtons = getQueueButtons(isQueueFull);
    const updatedMemberList = numberedList(updatedQueuedUsers);
    const anonymizedMembersList = anonymousList(updatedQueuedUsers);
    const updatedEmbed = {
      ...embed.data,
      fields: [
        { ...queueField, value: anonymizedMembersList },
        timeoutField,
        {
          ...secretField,
          value: encryptValue(updatedMemberList, timeQueueStarted),
        },
      ],
      title: getQueueTitle(queueSize, updatedQueuedUsers.length),
    };

    const updatedEmbedActions =
      new ActionRowBuilder<ButtonBuilder>().addComponents(updatedButtons);

    const editedEmbed = new EmbedBuilder(updatedEmbed);

    await interaction.update({
      embeds: [editedEmbed],
      components: [updatedEmbedActions],
    });
  },
};
