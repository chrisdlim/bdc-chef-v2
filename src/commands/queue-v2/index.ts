import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from "@discordjs/builders";
import {
  Client,
  ChatInputCommandInteraction,
  CacheType,
  ApplicationCommandOptionType,
} from "discord.js";
import { getConfig } from "../../config";
import { getRoleMention, numberedList } from "../../utils/text";
import { getUserAsMention } from "../../utils/user";
import { Command } from "../types";
import { getBumpQueueButton } from "./bump-queue";
import { getJoinQueueButton } from "./join-queue";
import { getLeaveQueueButton } from "./leave-queue";
import { defaultQueueTimeoutMinutes, expireQueue, getQueueTitle } from "./utils";
import { QueueFields } from './fields';

const config = getConfig();
const defaultQueueSize = 5;
const getFooterText = (queueSize: number) => `${queueSize} chefs for hire!`;

const Options = {
  SIZE: "size",
  TIMEOUT: 'timeout',
};

export const QueueV2: Command = {
  name: "q",
  description: "Assemble a french brigade",
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
    }
  ],
  run: async function (
    _client: Client<boolean>,
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const { user } = interaction;

    const inputQueueSize = interaction.options.getInteger(Options.SIZE);
    const queueTimeout = interaction.options.getInteger(Options.TIMEOUT) || defaultQueueTimeoutMinutes;

    const queueSize =
      inputQueueSize && inputQueueSize > 1 ? inputQueueSize : defaultQueueSize;

    const footerText = getFooterText(queueSize);

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(getQueueTitle(queueSize, 1))
      .setTimestamp(new Date())
      .addFields(
        {
          name: QueueFields.USERS,
          value: numberedList([getUserAsMention(user)]),
        },
        {
          name: QueueFields.TIMEOUT,
          value: queueTimeout.toString() + ' minutes',
        },
      )
      .setFooter({
        text: footerText,
      });

    const embedActions = new ActionRowBuilder<ButtonBuilder>().addComponents(
      getJoinQueueButton(),
      getLeaveQueueButton(),
      getBumpQueueButton(),
    );

    await interaction.reply({
      content: getRoleMention(config.tiltedGamersRoleId),
      embeds: [embed],
      components: [embedActions],
    }).then((message) => expireQueue(message, queueTimeout));
  },
};

