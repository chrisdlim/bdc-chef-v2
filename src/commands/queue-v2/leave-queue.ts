import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import { SystemError } from "../../error/system-error";
import { denumberList, numberedList } from "../../utils/text";
import { getUserAsMention } from "../../utils/user";
import { ButtonInteractionHandler } from "../types";
import { getJoinQueueButton } from "./join-queue";
import { getQueueTitle, getNumberFromString } from "./utils";

const id = 'q2-leave';
const label = 'Leave queue';

export const getLeaveQueueButton = () => new ButtonBuilder()
  .setCustomId(id)
  .setLabel(label)
  .setStyle(ButtonStyle.Danger);

export const LeaveQueue: ButtonInteractionHandler = {
  id: 'q2-leave',
  label: 'Leave queue',
  run: async (interaction: ButtonInteraction) => {
    const { user, message: { embeds, components } } = interaction;
    const [embed] = embeds;
    if (!embed || !embed.data.fields) {
      throw new SystemError('Welp, I don\'t know what to do here. Goodbye.');
    }

    const userMention = getUserAsMention(user);
    const [queueField] = embed.data.fields;
    const { name, value: queuedUsersStr } = queueField;
    const currentQueuedUsers = denumberList(queuedUsersStr);
    const queueSize = getNumberFromString(embed.footer?.text!);

    if (!currentQueuedUsers.includes(userMention)) {
      await interaction.reply({
        content: 'You are already a dogshit bus boy, get the f out of my kitchen.',
        ephemeral: true,
      });
      return;
    }

    const updatedQueuedUsers = currentQueuedUsers.filter((user) => user !== userMention);

    if (!updatedQueuedUsers.length) {
      await interaction.update({
        content: 'Kitchen is closed! Everyone left the queue.',
        embeds: [],
        components: []
      });
      return;
    }

    const isQueueFull = updatedQueuedUsers.length === queueSize;

    const updatedButtons =
      components[0].components.map((button) => button.customId !== id ?
        getJoinQueueButton(isQueueFull) : new ButtonBuilder(button.data))


    const updatedQueuedUsersNumbered = numberedList(updatedQueuedUsers);
    const updatedEmbed = {
      ...interaction.message.embeds[0].data,
      fields: [{ name, value: updatedQueuedUsersNumbered }],
      title: getQueueTitle(
        queueSize,
        updatedQueuedUsers.length
      ),
    };

    const updatedEmbedActions = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(updatedButtons)

    const editedEmbed = new EmbedBuilder(updatedEmbed);
    await interaction.update({ embeds: [editedEmbed], components: [updatedEmbedActions] });
  }
};
