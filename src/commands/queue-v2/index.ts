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
  ANONYMOUS: "anon",
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
    },
    {
      name: Options.ANONYMOUS,
      description: "Make the queue anonymous",
      type: ApplicationCommandOptionType.Boolean,
    },
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
    const isAnon = interaction.options.getBoolean(Options.ANONYMOUS) || false;

    const queueSize =
      inputQueueSize && inputQueueSize > 1 ? inputQueueSize : defaultQueueSize;

    const footerText = getFooterText(queueSize);

    const userAsMention = userMention(user.id);

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
              anonymize: isAnon,
              time: timeQueueStarted.getTime(),
            }
          ),
        },
        {
          name: QueueFields.TIMEOUT,
          value: queueTimeout.toLocaleString() + " minutes",
        },
        {
          name: QueueFields.SECRET,
          value: isAnon ? "Yes" : "No",
        }
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
      )} join if ur a queuety pie ${isAnon ? "" : `-${userAsMention}`}`,
      allowedMentions: {
        parse: ["roles"],
      },
    });
  },
};
