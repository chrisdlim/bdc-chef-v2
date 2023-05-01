import { ActionRowBuilder } from "@discordjs/builders";
import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  userMention
} from "discord.js";
import { SystemError } from "../../../error/system-error";
import { denumberList, numberedList } from "../../../utils/text";
import { ButtonInteractionHandler } from "../../types";
import { updatePoints } from "../points";
import { getQueueTitle, getNumberFromString, getNumberStringFromString } from "../utils";
import { joinQueueButtonId, joinQueueLabel } from '../buttons';
import { getQueueButtons } from "../buttons/utils";

export const JoinQueue: ButtonInteractionHandler = {
  id: joinQueueButtonId,
  label: joinQueueLabel,
  run: async (interaction: ButtonInteraction) => {
    const {
      user,
      message: { embeds },
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

    if (currentQueuedUsers.includes(mentionedUser)) {
      await interaction.reply({
        content: "You are already a master chef",
        ephemeral: true,
      });
      return;
    }

    const updatedQueuedUsers = [...currentQueuedUsers, mentionedUser];
    const updatedQueuedUsersNumbered = numberedList(updatedQueuedUsers);

    const isQueueFull = updatedQueuedUsers.length === queueSize;

    const updatedButtons = getQueueButtons(isQueueFull);

    const updatedEmbed = {
      ...embed.data,
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
        content: ['OOOOOOORDER UP, We got a full french brigade!', updatedQueuedUsersNumbered].join('\n'),
        allowedMentions: {
          parse: ['users']
        }
      }).then(async () => {
        await Promise.all(updatedQueuedUsers.map((userMention: string) => {
          const id = getNumberStringFromString(userMention);
          return updatePoints(id, 10);
        }))
      });
    }
  },
};
