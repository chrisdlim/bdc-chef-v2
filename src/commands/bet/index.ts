import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from "@discordjs/builders";
import {
  APIEmbedField,
  Client,
  ChatInputCommandInteraction,
  CacheType,
  ApplicationCommandOptionType,
  userMention,
} from "discord.js";
import { Command } from "../types";
import { BetFields, BetStatus } from "./fields";
import { getOpenBetButtons } from "./buttons";
import { formatUserList } from "./utils";

const Options = {
  PROMPT: "prompt",
  OPTION_1: "option1",
  OPTION_2: "option2",
  WAGER: "wager",
} as const;

const DEFAULT_OPTION_1 = "Yes";
const DEFAULT_OPTION_2 = "No";

export const Bet: Command = {
  name: "bet",
  description: "Create a wager poll for your friends to bet on!",
  options: [
    {
      name: Options.PROMPT,
      description: "The bet prompt (e.g., 'Will Mike get over 10.5 kills?')",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: Options.OPTION_1,
      description: "First betting option (default: Yes)",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: Options.OPTION_2,
      description: "Second betting option (default: No)",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: Options.WAGER,
      description: "What's at stake? (e.g., 'a happy meal')",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  run: async function (
    _client: Client<boolean>,
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    // Defer to prevent timeout
    await interaction.deferReply();

    const { user } = interaction;

    const prompt = interaction.options.getString(Options.PROMPT, true);
    const option1 = interaction.options.getString(Options.OPTION_1) || DEFAULT_OPTION_1;
    const option2 = interaction.options.getString(Options.OPTION_2) || DEFAULT_OPTION_2;
    const wager = interaction.options.getString(Options.WAGER);

    const creatorMention = userMention(user.id);

    const fields: APIEmbedField[] = [
      {
        name: BetFields.PROMPT,
        value: prompt,
        inline: false,
      },
      {
        name: `☝️ ${option1}`,
        value: formatUserList([]),
        inline: true,
      },
      {
        name: `✌️ ${option2}`,
        value: formatUserList([]),
        inline: true,
      },
      {
        name: BetFields.CREATOR,
        value: creatorMention,
        inline: false,
      },
      {
        name: BetFields.STATUS,
        value: BetStatus.OPEN,
        inline: false,
      },
    ];

    // Add wager field if provided
    if (wager) {
      fields.splice(1, 0, {
        name: BetFields.WAGER,
        value: wager,
        inline: false,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle("🎰 WAAAAGER UP!!!")
      .addFields(fields)
      .setTimestamp();

    const buttons = getOpenBetButtons(option1, option2);
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    const wagerText = wager ? `\n💰 **Stakes:** ${wager}` : "";

    await interaction.editReply({
      content: `🎲 **New bet created!** ${creatorMention} wagers: **${prompt}**${wagerText}`,
      embeds: [embed],
      components: [actionRow],
    });
  },
};
