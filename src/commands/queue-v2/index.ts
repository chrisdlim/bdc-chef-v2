import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from "@discordjs/builders";
import {
  Client,
  ChatInputCommandInteraction,
  CacheType,
  ButtonStyle,
  ApplicationCommandOptionType,
} from "discord.js";
import { getGiphyBySearch } from "../../api";
import { getConfig } from "../../config";
import { getRandomElement } from "../../utils/random";
import { getRoleMention, numberedList } from "../../utils/text";
import { getUserAsMention, getUserWithDiscriminator } from "../../utils/user";
import { Command } from "../types";
import { getJoinQueueButton, JoinQueue } from "./join-queue";
import { getLeaveQueueButton, LeaveQueue } from "./leave-queue";
import { getQueueTitle } from "./utils";

const config = getConfig();

const defaultQueueSize = 5;
const Options = {
  SIZE: "size",
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
  ],
  run: async function (
    _client: Client<boolean>,
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const inputQueueSize = interaction.options.getInteger(Options.SIZE);
    const queueSize =
      inputQueueSize && inputQueueSize > 1 ? inputQueueSize : defaultQueueSize;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(getQueueTitle(queueSize, 1))
      .setTimestamp(new Date())
      .addFields({
        name: "Chefs on standby:",
        value: numberedList([getUserAsMention(interaction.user)]),
      })
      .setFooter({
        text: `${queueSize} chefs for hire!`,
      });

    const embedActions = new ActionRowBuilder<ButtonBuilder>().addComponents(
      getJoinQueueButton(),
      getLeaveQueueButton()
    );

    await interaction.reply({
      embeds: [embed],
      components: [embedActions],
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
