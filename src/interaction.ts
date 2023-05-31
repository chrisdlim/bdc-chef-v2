import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  Events,
  Interaction,
  Message,
} from "discord.js";
import { getOpenAI, askChatGpt } from "./api";
import {
  findButtonHandlerByInteraction,
  findCommandByInteraction,
} from "./commands";
import { SystemError } from "./error/system-error";
import { isUserMentioned } from "./utils/user";

export const registerInteractions = (client: Client<true>): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    try {

      if (interaction.isChatInputCommand()) {
        console.log('Handling ChatInputCommand', interaction);
        await handleCommand(client, interaction);
      }
      if (interaction.isAutocomplete()) {
        console.log('Handling Autocomplete', interaction);
        await handleAutoComplete(client, interaction);
      }
      if (interaction.isButton()) {
        console.log('Handling button click', interaction);
        await handleButtonInteraction(interaction);
      }
    } catch (error) {
      console.log('Error handling an interaction', interaction);
    }
  });

  client.on(Events.MessageCreate, async (message: Message) => {
    const { content } = message;
    const isBotMentioned =
      isUserMentioned(message, client.user) &&
      message.author.id !== client.user.id;

    if (isBotMentioned) {
      const botMsg = await message.reply("Thinking...");
      const openai = getOpenAI();
      const reply = await askChatGpt(openai, content);
      await botMsg.edit(reply);
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
    if (error instanceof SystemError) {
      await interaction.reply({
        content: error.message,
        ephemeral: true
      });
    }
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

const handleButtonInteraction = async (interaction: ButtonInteraction) => {
  const { customId } = interaction;

  const handler = findButtonHandlerByInteraction(customId);
  if (!handler) {
    console.log("Oops, could not find handler for button id", customId);
    await interaction.deferUpdate();
    return;
  }

  await handler.run(interaction);
};
