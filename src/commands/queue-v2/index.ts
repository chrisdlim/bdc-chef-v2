import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from "@discordjs/builders";
import {
  AutocompleteInteraction,
  Client,
  ChatInputCommandInteraction,
  CacheType,
  ApplicationCommandOptionType,
  userMention,
  roleMention,
} from "discord.js";
import { getConfig } from "../../config";
import { numberedList } from "../../utils/text";
import { Command } from "../types";
import {
  defaultQueueTimeoutMinutes,
  expireQueue,
  getQueueTitle,
} from "./utils";
import { QueueFields } from "./fields";
import { getQueueButtons } from "./buttons/utils";
import { getUserWithDiscriminator } from "../../utils/user";

const config = getConfig();
const defaultQueueSize = 5;
const getFooterText = (queueSize: number) => `${queueSize} chefs for hire!`;

const Options = {
  SIZE: "size",
  TIMEOUT: "timeout",
  GAME: "game",
};

const gameChoices = [
  { name: "Valorant", value: "Valorant" },
  { name: "League of Legends", value: "League of Legends" },
  { name: "PUBG", value: "PUBG" },
  { name: "Counter-Strike 2", value: "Counter-Strike 2" },
  { name: "Anything", value: "Anything" },
  { name: "Other", value: "Other" },
];

export const QueueV2: Command = {
  name: "q",
  description: "Assemble a french brigade",
  handleAutoComplete: async (interaction: AutocompleteInteraction) => {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    const filtered = gameChoices.filter((choice) =>
      choice.name.toLowerCase().includes(focusedValue) ||
      choice.value.toLowerCase().includes(focusedValue)
    );

    // If user typed something not in the list, add their input as an option
    if (focusedValue && !filtered.some((c) => c.value.toLowerCase() === focusedValue)) {
      filtered.unshift({ name: focusedValue, value: focusedValue });
    }

    await interaction.respond(filtered.slice(0, 25));
  },
  options: [
    {
      name: Options.SIZE,
      description: "Queue size",
      type: ApplicationCommandOptionType.Integer,
    },
    {
      name: Options.TIMEOUT,
      description: "Queue timeout, defaults to 30 minutes",
      type: ApplicationCommandOptionType.Integer,
    },
    {
      name: Options.GAME,
      description: "Game to play",
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
    }
  ],
  run: async function (
    _client: Client<boolean>,
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const { user } = interaction;

    const inputQueueSize = interaction.options.getInteger(Options.SIZE);
    const queueTimeout =
      interaction.options.getInteger(Options.TIMEOUT) ||
      defaultQueueTimeoutMinutes;
    const queueSize =
      inputQueueSize && inputQueueSize > 1 ? inputQueueSize : defaultQueueSize;

    const footerText = getFooterText(queueSize);
    const userAsMention = userMention(user.id);
    const gameChoice = interaction.options.getString(Options.GAME) || "im lonely and want to play anything";

    const timeQueueStarted = new Date();
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(getQueueTitle(queueSize, 1))
      .setTimestamp(timeQueueStarted)
      .addFields(
        {
          name: QueueFields.USERS,
          value: numberedList(
            [userAsMention],
            {
              time: timeQueueStarted.getTime(),
            }
          ),
        },
        {
          name: QueueFields.GAME,
          value: gameChoice.toString(),
        },
        {
          name: QueueFields.TIMEOUT,
          value: queueTimeout.toLocaleString() + " minutes",
        },
      )
      .setFooter({
        text: footerText,
      });

    const buttons = getQueueButtons();
    const embedActions = new ActionRowBuilder<ButtonBuilder>().addComponents(
      buttons
    );

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({
      content: config.powerfulUser.includes(
        getUserWithDiscriminator(interaction.user)
      )
        ? "actual dog ass u are"
        : "queue started",
    });

    // Send embedded queue
    await interaction.channel
      ?.send({
        embeds: [embed],
        components: [embedActions],
        allowedMentions: { parse: ["roles"] },
      })
      .then((message) => expireQueue(message, queueTimeout));

    // Follow up with ping
    await interaction.followUp({
      content: `${roleMention(
        config.tiltedGamersRoleId
      )} join if ur a queuety pie -${userAsMention}`,
      allowedMentions: {
        parse: ["roles"],
      },
    });
  },
};
