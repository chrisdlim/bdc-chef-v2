import { ActionRowBuilder } from "@discordjs/builders";
import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
  userMention,
} from "discord.js";
import { SystemError } from "../../../error/system-error";
import { anonymousList, denumberList, numberedList } from "../../../utils/text";
import { ButtonInteractionHandler } from "../../types";
import { updatePoints } from "../../queue-v2/points";
import {
  getQueueTitle,
  getNumberFromString,
  getNumberStringFromString,
} from "../../queue-v2/utils";
import { joinQueueButtonId, joinQueueLabel } from "../buttons";
import { getQueueButtons } from "../buttons/utils";
import { decryptValue, encryptValue } from "../../../utils/anonymize";

const getQueueFullFollowupMessage = (listOfUsers: string, isAnon = false) => {
  const users = isAnon
    ? numberedList(denumberList(listOfUsers, { anonymize: isAnon }))
    : listOfUsers;
  return ["OOOOOOORDER UP, we got a full french brigade!", users].join("\n");
};

export const AnonJoinQueue: ButtonInteractionHandler = {
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
    const [queueField, timeoutField, anonField] = embed.data.fields;
    const timeQueueStarted = new Date(embed.timestamp!).getTime();
    const { name, value: queuedUsersStr } = queueField;
    const decryptedQueueMembers = decryptValue(anonField.value);
    const currentQueuedUsers = denumberList(decryptedQueueMembers);
    const queueSize = getNumberFromString(embed.footer?.text!);

    if (currentQueuedUsers.includes(mentionedUser)) {
      await interaction.reply({
        content: "You are already a master chef",
        ephemeral: true,
      });
      return;
    }

    const updatedQueuedUsers = [...currentQueuedUsers, mentionedUser];
    const updatedMemberList = numberedList(updatedQueuedUsers);
    const anonymizedMembersList = anonymousList(updatedQueuedUsers);

    const isQueueFull = updatedQueuedUsers.length === queueSize;

    const updatedButtons = getQueueButtons(isQueueFull);

    const updatedEmbed = {
      ...embed.data,
      fields: [
        { name, value: anonymizedMembersList },
        timeoutField,
        {
          ...anonField,
          value: isQueueFull ? '-' : encryptValue(updatedMemberList, timeQueueStarted),
        },
      ],
      title: getQueueTitle(queueSize, updatedQueuedUsers.length),
    };

    const updatedEmbedActions =
      new ActionRowBuilder<ButtonBuilder>().addComponents(updatedButtons);

    const editedEmbed = new EmbedBuilder(updatedEmbed);
    await interaction.update({
      embeds: [editedEmbed],
      components: updatedButtons.length ? [updatedEmbedActions] : [],
    });

    if (isQueueFull) {
      await interaction
        .followUp({
          content: getQueueFullFollowupMessage(updatedMemberList),
          allowedMentions: {
            parse: ["users"],
          },
        })
        .then(async () => {
          await Promise.all(
            updatedQueuedUsers.map((userMention: string) => {
              const id = getNumberStringFromString(userMention);
              return updatePoints(id, 10);
            })
          );
        });
    }
  },
};
