import { ActionRowBuilder } from "@discordjs/builders";
import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { SystemError } from "../../error/system-error";
import { denumberList, numberedList } from "../../utils/text";
import { getUserAsMention } from "../../utils/user";
import { ButtonInteractionHandler } from "../types";
import { getQueueTitle, getNumberFromString } from "./utils";

const id = "q2-bump";
const label = "Bump";

export const getBumpQueueButton = () =>
  new ButtonBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(ButtonStyle.Secondary);

export const BumpQueue: ButtonInteractionHandler = {
  id,
  label,
  run: async (interaction: ButtonInteraction) => {
    const {
      message: { embeds, components },
    } = interaction;
    const [embed] = embeds;

    if (!embed || !embed.data.fields) {
      throw new SystemError("Welp, I don't know what to do here. Goodbye.");
    }

    await interaction.reply({
      content: 'bump',
      components,
      embeds
    });
  },
};
