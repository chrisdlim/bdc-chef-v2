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
  try {
    const command = findCommandByInteraction(interaction);

    if (!command) {
      await interaction.reply({
        content: `Oops, I can't cook that right now. [${interaction.commandName}]`,
        ephemeral: true,
      });
      return;
    } else {
      await command.run(client, interaction);
    }
  } catch (error) {
    console.log("Received error when handling command", {
      error,
      interaction,
    });
  }
};

const handleAutoComplete = async (
  _client: Client,
  interaction: AutocompleteInteraction
): Promise<void> => {
  try {
    const command = findCommandByInteraction(interaction);

    if (!command) {
      await interaction.respond([]);
      return;
    }

    if (command.handleAutoComplete) {
      await command.handleAutoComplete(interaction);
    }
  } catch (error) {
    console.log("Received error when handling autocomplete", {
      error,
    });
  }
};
