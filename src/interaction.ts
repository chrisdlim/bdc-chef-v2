import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  Events,
  Interaction,
} from "discord.js";
import { findCommandByInteraction } from "./commands";

export const registerInteractions = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleCommand(client, interaction);
    }
    if (interaction.isAutocomplete()) {
      await handleAutoComplete(client, interaction);
    }
  });
};

const handleCommand = async (
  client: Client,
  interaction: ChatInputCommandInteraction
): Promise<void> => {
  const command = findCommandByInteraction(interaction);

  if (!command) {
    await interaction.followUp({ content: "Unhandled command!" });
    return;
  } else {
    await command.run(client, interaction);
  }
};

const handleAutoComplete = async (
  _client: Client,
  interaction: AutocompleteInteraction
): Promise<void> => {
  const command = findCommandByInteraction(interaction);


  if (!command) {
    await interaction.respond([]);
    return;
  }

  if (command.handleAutoComplete) {
    await command.handleAutoComplete(interaction);
  }
};
