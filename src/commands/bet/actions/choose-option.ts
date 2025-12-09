import { ActionRowBuilder } from "@discordjs/builders";
import {
  ButtonBuilder,
  ButtonInteraction,
  EmbedBuilder,
  userMention,
} from "discord.js";
import { SystemError } from "../../../error/system-error";
import { ButtonInteractionHandler } from "../../types";
import { BetFields, BetStatus } from "../fields";
import {
  getOption1Users,
  getOption2Users,
  getOptionLabelsFromButtons,
  formatUserList,
  findFieldByName,
} from "../utils";
import { getOpenBetButtons, BetButtonIds } from "../buttons";

const handleChooseOption = async (
  interaction: ButtonInteraction,
  chosenOption: 1 | 2
) => {
  // Defer immediately to prevent "Unknown interaction" timeout
  await interaction.deferUpdate();

  const {
    user,
    message: { embeds, components },
  } = interaction;
  const [embed] = embeds;

  if (!embed || !embed.data.fields) {
    throw new SystemError("Could not find bet data.");
  }

  const status = findFieldByName(embed.data.fields, BetFields.STATUS);
  if (status !== BetStatus.OPEN) {
    await interaction.followUp({
      content: "This bet is no longer accepting entries!",
      ephemeral: true,
    });
    return;
  }

  const mentionedUser = userMention(user.id);
  const option1Users = getOption1Users(embed.data.fields);
  const option2Users = getOption2Users(embed.data.fields);
  const { option1Label, option2Label } = getOptionLabelsFromButtons(components);

  const isInOption1 = option1Users.includes(mentionedUser);
  const isInOption2 = option2Users.includes(mentionedUser);

  let updatedOption1Users = [...option1Users];
  let updatedOption2Users = [...option2Users];

  if (chosenOption === 1) {
    if (isInOption1) {
      await interaction.followUp({
        content: `You're already betting on "${option1Label}"!`,
        ephemeral: true,
      });
      return;
    }
    // Remove from option 2 if present, add to option 1
    updatedOption2Users = option2Users.filter((u) => u !== mentionedUser);
    updatedOption1Users = [...option1Users, mentionedUser];
  } else {
    if (isInOption2) {
      await interaction.followUp({
        content: `You're already betting on "${option2Label}"!`,
        ephemeral: true,
      });
      return;
    }
    // Remove from option 1 if present, add to option 2
    updatedOption1Users = option1Users.filter((u) => u !== mentionedUser);
    updatedOption2Users = [...option2Users, mentionedUser];
  }

  // Update the inline fields (option user lists)
  let inlineIndex = 0;
  const updatedFields = embed.data.fields.map((field) => {
    if (field.inline) {
      const updatedValue = inlineIndex === 0
        ? formatUserList(updatedOption1Users)
        : formatUserList(updatedOption2Users);
      inlineIndex++;
      return { ...field, value: updatedValue };
    }
    return field;
  });

  const updatedEmbed = new EmbedBuilder({
    ...embed.data,
    fields: updatedFields,
  });

  const buttons = getOpenBetButtons(option1Label, option2Label);
  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

  await interaction.editReply({
    embeds: [updatedEmbed],
    components: [actionRow],
  });
};

export const ChooseOption1: ButtonInteractionHandler = {
  id: BetButtonIds.OPTION_1,
  label: "Option 1",
  run: async (interaction: ButtonInteraction) => {
    await handleChooseOption(interaction, 1);
  },
};

export const ChooseOption2: ButtonInteractionHandler = {
  id: BetButtonIds.OPTION_2,
  label: "Option 2",
  run: async (interaction: ButtonInteraction) => {
    await handleChooseOption(interaction, 2);
  },
};

