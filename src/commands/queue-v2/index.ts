import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
import { Client, ChatInputCommandInteraction, CacheType, ButtonStyle, ApplicationCommandOptionType} from "discord.js";
import { numberedList } from "../../utils/text";
import { getUserAsMention } from "../../utils/user";
import { Command } from "../types";
import { JoinQueue } from "./join-queue";
import { LeaveQueue } from "./leave-queue";
import { getQueueTitle } from "./utils";

const defaultQueueSize = 5;
const Options = {
  SIZE: 'size',
};

export const QueueV2: Command = {
  name: "q2",
  description: "Queue v2",
  options: [
    {
      name: Options.SIZE,
      description: 'Queue size',
      type: ApplicationCommandOptionType.Integer,
    }
  ],
  run: async function (_client: Client<boolean>, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    const queueSize = interaction.options.getInteger(Options.SIZE) || defaultQueueSize;

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(getQueueTitle(queueSize, 1))
      .setTimestamp(new Date())
      .addFields(
        {
          name: 'Chefs on standby:', value: numberedList([
            getUserAsMention(interaction.user)
          ])
        },
      );

    const joinQueueButton = new ButtonBuilder()
      .setCustomId(JoinQueue.id)
      .setLabel(JoinQueue.label)
      .setStyle(ButtonStyle.Primary);

    const leaveQueueButton = new ButtonBuilder()
      .setCustomId(LeaveQueue.id)
      .setLabel(LeaveQueue.label)
      .setStyle(ButtonStyle.Danger);

    const embedActions = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        joinQueueButton,
        leaveQueueButton
      );

    await interaction.reply({
      embeds: [embed],
      components: [embedActions],
    });
  },
}