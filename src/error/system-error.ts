import { ChatInputCommandInteraction, italic } from "discord.js";

export class SystemError extends Error {
  constructor(message: string) {
    super(message);
  }

  handle = async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
      content: italic(this.message),
      ephemeral: true,
    });
  };
}
