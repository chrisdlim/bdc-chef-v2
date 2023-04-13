import { Client, ChatInputCommandInteraction, userMention } from "discord.js";
import { getGiphyBySearch } from "../api";
import { Gif } from "../api/giphy/types";
import { getConfig } from "../config";
import getRandomElement from "../utils/get-random-element";
import { getRoleMention } from "../utils/text";
import { getUserWithDiscriminator } from "../utils/user";
import { QueueV2 } from "./queue-v2";
import { Command } from "./types";

const config = getConfig();

export const Assemble: Command = {
  name: "assemble",
  description: "Assemble gamers",
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    if (
      !config.powerfulUser.includes(getUserWithDiscriminator(interaction.user))
    ) {
      await interaction.reply("You do not have the power to assemble...");
      const noPowerGifs = await getGiphyBySearch("you+have+no+power");
      const { embed_url: gifUrl } = getRandomElement<Gif>(noPowerGifs);
      await interaction.followUp(gifUrl);
    } else {
      await interaction.reply(
        `${userMention(
          interaction.user.id
        )} wants to assemble! ${getRoleMention(config.tiltedGamersRoleId)}`
      );
      await QueueV2.run(_client, interaction);
    }
  },
};
