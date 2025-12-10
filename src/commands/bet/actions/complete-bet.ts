import {
  ButtonInteraction,
  EmbedBuilder,
} from "discord.js";
import { SystemError } from "../../../error/system-error";
import { ButtonInteractionHandler } from "../../types";
import { BetFields, BetStatus } from "../fields";
import {
  getCreatorId,
  getOption1Users,
  getOption2Users,
  findFieldByName,
  formatUserList,
  getOptionLabelsFromCompleteButtons,
} from "../utils";
import { BetButtonIds } from "../buttons";

const handleCompleteBet = async (
  interaction: ButtonInteraction,
  winningOption: 1 | 2
) => {
  const {
    user,
    message: { embeds, components },
  } = interaction;
  const [embed] = embeds;

  if (!embed || !embed.data.fields) {
    throw new SystemError("Could not find bet data.");
  }

  const creatorId = getCreatorId(embed.data.fields);
  if (user.id !== creatorId) {
    const exposeLoser = Math.random() < 0.5;
    await interaction.reply({
      content: exposeLoser
        ? `Look at this loser <@${user.id}> trying to complete the bet 💀`
        : "Only the bet creator can complete this bet!",
      ephemeral: !exposeLoser,
    });
    return;
  }

  const status = findFieldByName(embed.data.fields, BetFields.STATUS);
  if (status === BetStatus.COMPLETED) {
    await interaction.reply({
      content: "This bet is already completed!",
      ephemeral: true,
    });
    return;
  }

  const { option1Label, option2Label } = getOptionLabelsFromCompleteButtons(components);
  
  // Debug: log the fields to see what's there
  console.log("Embed fields:", JSON.stringify(embed.data.fields, null, 2));
  
  const option1Users = getOption1Users(embed.data.fields);
  const option2Users = getOption2Users(embed.data.fields);
  
  console.log("Option 1 users:", option1Users);
  console.log("Option 2 users:", option2Users);
  
  const prompt = findFieldByName(embed.data.fields, BetFields.PROMPT);
  const wager = findFieldByName(embed.data.fields, BetFields.WAGER);

  const winningLabel = winningOption === 1 ? option1Label : option2Label;
  const winners = winningOption === 1 ? option1Users : option2Users;
  const losers = winningOption === 1 ? option2Users : option1Users;

  console.log("Winning option:", winningOption);
  console.log("Winners:", winners);
  console.log("Losers:", losers);

  const resultFields = [
    {
      name: BetFields.PROMPT,
      value: prompt,
      inline: false,
    },
    {
      name: "🏆 Result",
      value: `**${winningLabel}**`,
      inline: false,
    },
    {
      name: `✅ Winners (${winners.length})`,
      value: formatUserList(winners),
      inline: true,
    },
    {
      name: `❌ Losers (${losers.length})`,
      value: formatUserList(losers),
      inline: true,
    },
    {
      name: BetFields.STATUS,
      value: BetStatus.COMPLETED,
      inline: false,
    },
  ];

  // Add wager field if it exists
  if (wager) {
    resultFields.splice(1, 0, {
      name: BetFields.WAGER,
      value: wager,
      inline: false,
    });
  }

  const resultEmbed = new EmbedBuilder()
    .setTitle("🎰 Wager - Results Are In!")
    .setColor(0x00ff00) // Green for completed
    .addFields(resultFields)
    .setTimestamp();

  await interaction.update({
    embeds: [resultEmbed],
    components: [], // Remove all buttons
  });

  // Announce the results
  const winnersStr = winners.length > 0 ? winners.join(", ") : "No one";
  const losersStr = losers.length > 0 ? losers.join(", ") : "No one";
  const wagerStr = wager ? `\n💰 Stakes: **${wager}**` : "";
  
  await interaction.followUp({
    content: `🎉 **The bet is complete!**\n\n**"${prompt}"**${wagerStr}\n\n🏆 Result: **${winningLabel}**\n\n✅ Winners: ${winnersStr}\n❌ Losers: ${losersStr}`,
    allowedMentions: { parse: ["users"] },
  });
};

export const CompleteBet1: ButtonInteractionHandler = {
  id: BetButtonIds.COMPLETE_1,
  label: "Option 1 Wins",
  run: async (interaction: ButtonInteraction) => {
    await handleCompleteBet(interaction, 1);
  },
};

export const CompleteBet2: ButtonInteractionHandler = {
  id: BetButtonIds.COMPLETE_2,
  label: "Option 2 Wins",
  run: async (interaction: ButtonInteraction) => {
    await handleCompleteBet(interaction, 2);
  },
};

