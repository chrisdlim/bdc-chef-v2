import { ActionRowBuilder } from "@discordjs/builders";
import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { SystemError } from "../../error/system-error";
import { denumberList, numberedList } from "../../utils/text";
import { getUserAsMention } from "../../utils/user";
import { ButtonInteractionHandler } from "../types";
import { getQueueTitle, getNumberFromString } from "./utils";

const id = "q2-join";
const label = "Join queue";

export const getJoinQueueButton = (isDisabled = false) =>
  new ButtonBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(isDisabled);

export const JoinQueue: ButtonInteractionHandler = {
  id,
  label,
  run: async (interaction: ButtonInteraction) => {
    const {
      user,
      message: { embeds, components },
    } = interaction;
    const [embed] = embeds;

    if (!embed || !embed.data.fields) {
      throw new SystemError("Welp, I don't know what to do here. Goodbye.");
    }

    const userMention = getUserAsMention(user);
    const [queueField, ...remainingFields] = embed.data.fields;
    const { name, value: queuedUsersStr } = queueField;
    const currentQueuedUsers = denumberList(queuedUsersStr);
    const queueSize = getNumberFromString(embed.footer?.text!);

    if (currentQueuedUsers.includes(userMention)) {
      await interaction.reply({
        content: "You are already a master chef",
        ephemeral: true,
      });
      return;
    }

    const updatedQueuedUsers = [...currentQueuedUsers, userMention];
    const updatedQueuedUsersNumbered = numberedList(updatedQueuedUsers);

    const isQueueFull = updatedQueuedUsers.length === queueSize;

    const updatedButtons = components[0].components.map((button) =>
      button.customId === id
        ? getJoinQueueButton(isQueueFull)
        : new ButtonBuilder(button.data)
    );

    const updatedEmbed = {
      ...interaction.message.embeds[0].data,
      fields: [{ name, value: updatedQueuedUsersNumbered }, ...remainingFields],
      title: getQueueTitle(queueSize, updatedQueuedUsers.length),
    };

    const updatedEmbedActions =
      new ActionRowBuilder<ButtonBuilder>().addComponents(updatedButtons);

    const editedEmbed = new EmbedBuilder(updatedEmbed);
    await interaction.update({
      embeds: [editedEmbed],
      components: [updatedEmbedActions],
    });

    if (isQueueFull) {
      await interaction.followUp({
        content: ['OOOOOOORDER UP, We got a full french brigade!', updatedQueuedUsersNumbered].join('\n')
      });
    }
  },
};
