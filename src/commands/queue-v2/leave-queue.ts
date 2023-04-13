import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  userMention
} from "discord.js";
import { SystemError } from "../../error/system-error";
import { denumberList, numberedList } from "../../utils/text";
import { ButtonInteractionHandler } from "../types";
import { getJoinQueueButton } from "./join-queue";
import { getQueueTitle, getNumberFromString, expireQueue, defaultQueueTimeoutMinutes } from "./utils";
import { id as JoinButtonId } from './join-queue';
import { QueueFields } from "./fields";

export const id = "q2-leave";
const label = "Leave";

export const getLeaveQueueButton = (isDisabled = false) =>
  new ButtonBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(ButtonStyle.Danger)
    .setDisabled(isDisabled);

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
    const [queueField, ...remainingFields] = embed.data.fields;
    const { name, value: queuedUsersStr } = queueField;
    const currentQueuedUsers = denumberList(queuedUsersStr);
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

    const queueTimeoutFieldValue = embed.data.fields?.find(({ name }) => name === QueueFields.TIMEOUT)?.value;
    const queueTimeout = queueTimeoutFieldValue ?
      getNumberFromString(queueTimeoutFieldValue) : defaultQueueTimeoutMinutes;

    const updatedButtons = components[0].components.map((button) =>
      button.customId === JoinButtonId
        ? getJoinQueueButton(isQueueFull)
        : new ButtonBuilder(button.data)
    );

    const updatedQueuedUsersNumbered = numberedList(updatedQueuedUsers);
    const updatedEmbed = {
      ...embed.data,
      fields: [{ name, value: updatedQueuedUsersNumbered }, ...remainingFields],
      title: getQueueTitle(queueSize, updatedQueuedUsers.length),
    };

    const updatedEmbedActions =
      new ActionRowBuilder<ButtonBuilder>().addComponents(updatedButtons);

    const editedEmbed = new EmbedBuilder(updatedEmbed);

    await interaction.deferReply();
    if (wasQueueFull) {
      await interaction.editReply({
        embeds: [editedEmbed],
        components: [updatedEmbedActions],
      }).then((message) => expireQueue(message, queueTimeout));
    } else {
      await interaction.editReply({
        embeds: [editedEmbed],
        components: [updatedEmbedActions],
      });
    }
  },
};
