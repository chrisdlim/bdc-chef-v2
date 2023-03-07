import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { getGiphyBySearch } from "../api";
import { Gif } from "../api/giphy/types";
import getRandomElement from "../utils/get-random-element";
import { Command } from "./types";

export const Cookout: Command = {
  name: "cookout",
  description: "Yo, who's down for good ol' fashion burger?",
  type: ApplicationCommandType.ChatInput,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    await interaction.reply('AYYYYOOOOO, COOKOUT?');

    const cookoutGifs = await getGiphyBySearch('cookout');
    const randomGif = getRandomElement<Gif>(cookoutGifs);
    await interaction.followUp(randomGif.embed_url);
  },
};
