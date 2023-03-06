import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { getConfig } from "../config";
import { getRoleMention } from "../utils/text";
import { getUserAsMention } from "../utils/user";
import { Command } from "./types";

const config = getConfig();

export const Ltg: Command = {
  name: "ltg",
  description: "Lunch Time Gamers",
  type: ApplicationCommandType.ChatInput,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    await interaction.reply(
      `${getUserAsMention(interaction.user)} looking for some gamers!!! ${getRoleMention(config.tiltedGamersRoleId)}`
    );
  },
};
