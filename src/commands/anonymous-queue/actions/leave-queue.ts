import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  EmbedBuilder,
  spoiler,
  userMention,
} from "discord.js";
import { SystemError } from "../../../error/system-error";
import { despoil, numberedList } from "../../../utils/text";
import { ButtonInteractionHandler } from "../../types";
import { getQueueTitle, getNumberFromString } from "./../../queue-v2/utils";
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
    const decryptedQueueMembersJsonStr = decryptValue(
      despoil(secretField.value)
    );
    const memberMap = new Map(Object.entries(decryptedQueueMembersJsonStr));
    const currentQueuedMemberUserIds = Array.from(memberMap.keys());
    const queueSize = getNumberFromString(embed.footer?.text!);

    if (!currentQueuedMemberUserIds.includes(mentionedUser)) {
      await interaction.reply({
        content:
          "You are already a dogshit bus boy, get the f out of my kitchen.",
        ephemeral: true,
      });
      return;
    }

    memberMap.delete(mentionedUser);

    if (!memberMap.size) {
      await interaction.update({
        content: "Kitchen is closed! Everyone left the queue.",
        embeds: [],
        components: [],
      });
      return;
    }

    const updatedMemberNames = Array.from(memberMap.values());
    const anonymizedMembersStr = numberedList(updatedMemberNames);
    const isQueueFull = memberMap.size === queueSize;
    const updatedButtons = getQueueButtons(isQueueFull);

    const updatedEmbed = {
      ...embed.data,
      fields: [
        { ...queueField, value: anonymizedMembersStr },
        timeoutField,
        {
          ...secretField,
          value: spoiler(
            encryptValue(
              JSON.stringify(Object.fromEntries(memberMap)),
              timeQueueStarted
            )
          ),
        },
      ],
      title: getQueueTitle(queueSize, updatedMemberNames.length),
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
