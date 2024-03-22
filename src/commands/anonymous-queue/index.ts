import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  spoiler,
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
  getAnonName,
  getQueueTitle,
} from "../queue-v2/utils";
import { QueueFields } from "../queue-v2/fields";
import { getQueueButtons } from "./buttons/utils";
import { getUserWithDiscriminator } from "../../utils/user";
import { encryptValue } from "../../utils/anonymize";
import { getOpenAI } from "../../api";

const config = getConfig();
const defaultQueueSize = 5;
const getFooterText = (queueSize: number) => `${queueSize} chefs for hire!`;

const Options = {
  SIZE: "size",
  TIMEOUT: "timeout",
};

const openai = getOpenAI();

export const AnonymousQueueV2: Command = {
  name: "qa",
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

    const generatedName = await getAnonName(openai);
    const footerText = getFooterText(queueSize);
    const timeQueueStarted = new Date();
    const userAsMention = userMention(user.id);
    const memberMap = new Map();
    memberMap.set(userAsMention, generatedName);
    // const botUserMention = userMention("1081386980144840794");
    // const botUserMention2 = userMention("1080585921893773352");
    // const botGeneratedName = await getAnonName(openai);
    // const botGeneratedName2 = await getAnonName(openai);
    // memberMap.set(botUserMention, botGeneratedName);
    // memberMap.set(botUserMention2, botGeneratedName2);
    const memberNames = Array.from(memberMap.values());
    const anonymizedMembersStr = numberedList(memberNames);
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(getQueueTitle(queueSize, 1))
      .setTimestamp(timeQueueStarted)
      .addFields(
        {
          name: QueueFields.USERS,
          value: anonymizedMembersStr,
        },
        {
          name: QueueFields.TIMEOUT,
          value: queueTimeout.toLocaleString() + " minutes",
        },
        {
          name: QueueFields.SECRET,
          value: spoiler(
            encryptValue(
              JSON.stringify(Object.fromEntries(memberMap)),
              timeQueueStarted.getTime()
            )
          ),
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
      )} join if ur a queuety pie`,
      allowedMentions: {
        parse: ["roles"],
      },
    });
  },
};
