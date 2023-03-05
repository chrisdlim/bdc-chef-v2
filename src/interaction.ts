import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  Events,
  Interaction,
  Message,
  MessageInteraction,
} from "discord.js";
import { findCommandByInteraction } from "./commands";
import {
  getPromptAnswer,
  getFirstPromptResponse,
  getOpenAI,
} from "./api/chatgpt";

export const registerInteractions = (client: Client<true>): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleCommand(client, interaction);
    }
    if (interaction.isAutocomplete()) {
      await handleAutoComplete(client, interaction);
    }
  });

  client.on(Events.MessageCreate, async (message: Message) => {
    const { content } = message;
    const isBotMentioned = message.mentions.users.has(client.user.id);

    if (isBotMentioned) {
      const defaultResponse = `Oops, I'm not sure how to reply, but go f yourself, shitter. Back in the kitchen please!`;
      const openaiApi = getOpenAI();
      const messageReply = await getPromptAnswer(openaiApi, content).then(
        ({ data }) => getFirstPromptResponse(data, defaultResponse)
      );
      await message.reply(messageReply);
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
