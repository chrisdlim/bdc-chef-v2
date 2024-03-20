import { ActionRowBuilder, spoiler } from "@discordjs/builders";
import {
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
import { updatePoints } from "../../queue-v2/points";
import {
  getQueueTitle,
  getNumberFromString,
  getNumberStringFromString,
  getAnonName,
} from "../../queue-v2/utils";
import { joinQueueButtonId, joinQueueLabel } from "../buttons";
import { getQueueButtons } from "../buttons/utils";
import { decryptValue, encryptValue } from "../../../utils/anonymize";
import { askChatGpt, getOpenAI } from "../../../api";

const openai = getOpenAI();

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
    const [queueField, timeoutField, secretField] = embed.data.fields;
    const timeQueueStarted = new Date(embed.timestamp!).getTime();
    const decryptedQueueMembersJsonStr = decryptValue(
      despoil(secretField.value)
    );
    const memberMap = new Map(Object.entries(decryptedQueueMembersJsonStr));
    const currentQueuedMemberNames = Array.from(memberMap.values());
    const queueSize = getNumberFromString(embed.footer?.text!);

    if (memberMap.has(mentionedUser)) {
      await interaction.reply({
        content: "You are already a master chef",
        ephemeral: true,
      });
      return;
    }

    const generatedName = await getAnonName(openai, interaction.user);
    memberMap.set(mentionedUser, generatedName);
    const updatedMemberNames = [...currentQueuedMemberNames, generatedName];
    const anonymizedMembersStr = numberedList(updatedMemberNames);
    const isQueueFull = updatedMemberNames.length === queueSize;
    const updatedButtons = getQueueButtons(isQueueFull);

    const updatedEmbed = {
      ...embed.data,
      fields: [
        { ...queueField, value: anonymizedMembersStr },
        timeoutField,
        {
          ...secretField,
          value: isQueueFull
            ? "-"
            : spoiler(
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
      components: updatedButtons.length ? [updatedEmbedActions] : [],
    });

    if (isQueueFull) {
      const memberUserIds = Array.from(memberMap.keys());
      await interaction
        .followUp({
          content: [
            "OOOOOOORDER UP, we got a full french brigade!",
            numberedList(memberUserIds),
          ].join("\n"),
          allowedMentions: {
            parse: ["users"],
          },
        })
        .then(async () => {
          await Promise.all(
            memberUserIds.map((userMention: string) => {
              const id = getNumberStringFromString(userMention);
              return updatePoints(id, 10);
            })
          );
        });
    }
  },
};
