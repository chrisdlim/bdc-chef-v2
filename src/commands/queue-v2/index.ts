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
  userMention,
  roleMention
} from "discord.js";
import { getConfig } from "../../config";
import { getRoleMention, numberedList } from "../../utils/text";
import { Command } from "../types";
import { defaultQueueTimeoutMinutes, expireQueue, getMinutesInMillis, getQueueTitle } from "./utils";
import { QueueFields } from './fields';
import { getBumpQueueButton, getJoinQueueButton, getLeaveQueueButton } from "./buttons";
import { getQueueButtons } from "./buttons/utils";

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
          value: numberedList([userMention(user.id)]),
        },
        {
          name: QueueFields.TIMEOUT,
          value: queueTimeout.toLocaleString() + ' minutes',
        },
      )
      .setFooter({
        text: footerText,
      });

    const buttons = getQueueButtons();
    const embedActions = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(buttons);
    
    await interaction.deferReply();

    // Send embedded queue
    await interaction.editReply({
      embeds: [embed],
      components: [embedActions],
      allowedMentions: { parse: ['roles'] },
    }).then((message) => expireQueue(message, queueTimeout));

    // Follow up with ping
    await interaction.followUp({
      content: `${roleMention(config.tiltedGamersRoleId)} join if ur a queue-ty pie`,
      allowedMentions: {
        parse: ['roles']
      }
    });
  },
};

