import { ChatInputCommandInteraction } from "discord.js";
import { italicize } from "../utils/text";

export class SystemError extends Error {
  constructor(message: string) {
    super(message);
  }

  handle = async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
      content: italicize(this.message),
      ephemeral: true,
    });
  }
}