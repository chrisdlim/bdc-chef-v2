import { ChatInputCommandInteraction, Client, Events, Interaction } from "discord.js";
import { findCommandByName } from './commands';

export const registerInteractions = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleCommand(client, interaction);
    }
  });
};

const handleCommand = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
  const command = findCommandByName(interaction);

  if (!command) {
    await interaction.followUp({ content: 'Unhandled command!' });
    return;
  } else {
    if (command) {
      await command.run(client, interaction);
    }
  }
};