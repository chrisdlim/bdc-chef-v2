import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { SystemError } from "../../error/system-error";
import { denumberList, numberedList } from "../../utils/text";
import { getUserAsMention } from "../../utils/user";
import { ButtonInteractionHandler } from "../types";
import { getQueueTitle, getQueueSizeFromString as getNumberFromString } from "./utils";

export const JoinQueue: ButtonInteractionHandler = {
  id: 'q2-join',
  label: 'Join queue',
  run: async (interaction: ButtonInteraction) => {
    const { user, message: { embeds } } = interaction;
    const [embed] = embeds;

    if (!embed || !embed.data.fields) {
      throw new SystemError('Welp, I don\'t know what to do here. Goodbye.');
    }

    const userMention = getUserAsMention(user);
    const [queueField] = embed.data.fields;
    const { name, value: queuedUsersStr } = queueField;
    const currentQueuedUsers = denumberList(queuedUsersStr);
    const remainingSlots = getNumberFromString(embed.title!);
    const queueSize = remainingSlots + currentQueuedUsers.length;

    // if (currentQueuedUsers.includes(userMention)) {
    //   await interaction.reply({
    //     content: 'You are already a master chef',
    //     ephemeral: true,
    //   });
    //   return;
    // }

    const updatedQueuedUsers = [...currentQueuedUsers, userMention];
    const updatedQueuedUsersNumbered = numberedList(updatedQueuedUsers);

    const updatedEmbed = {
      ...interaction.message.embeds[0].data,
      fields: [{ name, value: updatedQueuedUsersNumbered }],
      title: getQueueTitle(
        queueSize, 
        updatedQueuedUsers.length
      ),
    }

    const editedEmbed = new EmbedBuilder(updatedEmbed)
    await interaction.reply({ embeds: [editedEmbed] });
  }
};