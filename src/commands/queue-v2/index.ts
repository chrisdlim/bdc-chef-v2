import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  italic,
} from "@discordjs/builders";
import {
  Client,
  ChatInputCommandInteraction,
  CacheType,
  ApplicationCommandOptionType,
} from "discord.js";
import { getGiphyBySearch } from "../../api";
import { getConfig } from "../../config";
import { getRandomElement } from "../../utils/random";
import { getRoleMention, numberedList } from "../../utils/text";
import { getUserAsMention, getUserWithDiscriminator } from "../../utils/user";
import { Command } from "../types";
import { getJoinQueueButton } from "./join-queue";
import { getLeaveQueueButton } from "./leave-queue";
import { getQueueTitle } from "./utils";

const config = getConfig();

const defaultQueueSize = 5;

const defaultFooterText = (queueSize: number) => `${queueSize} chefs for hire!`;

const getTimeoutMs = (minutes: number) => minutes * 1000 * 60;

const getQueueExpirationText = (currentTime: Date, timeout: number, timeoutMinutes: number) => 
  `Queue expires at ${new Date(currentTime.getTime() + timeout)
      .toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} in ${timeoutMinutes} minute(s)`;

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
      description: "Minutes for queue to be active",
      type: ApplicationCommandOptionType.Integer,
    },
  ],
  run: async function (
    _client: Client<boolean>,
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const inputQueueSize = interaction.options.getInteger(Options.SIZE);
    const timeoutMinutes = interaction.options.getInteger(Options.TIMEOUT) || 0;
    const timeout = getTimeoutMs(timeoutMinutes);
    
    const queueSize =
    inputQueueSize && inputQueueSize > 1 ? inputQueueSize : defaultQueueSize;
    
    const currentTime = new Date();

    const queueExpirationText = timeout ? getQueueExpirationText(currentTime, timeout, timeoutMinutes) : '';

    const footerText = [defaultFooterText(queueSize), queueExpirationText].join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(getQueueTitle(queueSize, 1))
      .setTimestamp(currentTime)
      .addFields({
        name: "Chefs on standby:",
        value: numberedList([getUserAsMention(interaction.user)]),
      })
      .setFooter({
        text: footerText,
      });

    const embedActions = new ActionRowBuilder<ButtonBuilder>().addComponents(
      getJoinQueueButton(),
      getLeaveQueueButton()
    );

    await interaction.reply({
      embeds: [embed],
      components: [embedActions],
    }).then(() => {
      if (timeout) {
        setTimeout(async () => {
          await interaction.deleteReply();
          await interaction.followUp(`Welp, we're out of food. Come back later! ${italic('(Queue expired)')}`);
        }, timeout);
      }
    });
  },
};

export const Assemble: Command = {
  name: "assemble",
  description: "Assemble gamers",
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    if (
      !config.powerfulUser.includes(getUserWithDiscriminator(interaction.user))
    ) {
      await interaction.reply("You do not have the power to assemble...");
      const noPowerGifs = await getGiphyBySearch("you+have+no+power");
      const { embed_url: gifUrl } = getRandomElement(noPowerGifs);
      await interaction.followUp(gifUrl);
    } else {
      await interaction.reply(
        `${getUserAsMention(
          interaction.user
        )} wants to assemble! ${getRoleMention(config.tiltedGamersRoleId)}`
      );
      await QueueV2.run(_client, interaction);
    }
  },
};
