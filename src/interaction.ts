import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Events,
  Interaction,
  Message,
  MessageInteraction,
} from "discord.js";
import {
  findButtonHandlerByInteraction,
  findCommandByInteraction,
} from "./commands";
import {
  getPromptAnswer,
  getFirstPromptResponse,
  getOpenAI,
} from "./api/chatgpt";
import { getUserAsMention, isUserMentioned } from "./utils/user";
import { numberedList } from "./utils/text";

export const registerInteractions = (client: Client<true>): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleCommand(client, interaction);
    }
    if (interaction.isAutocomplete()) {
      await handleAutoComplete(client, interaction);
    }
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
  });

  client.on(Events.MessageCreate, async (message: Message) => {
    const { content } = message;
    const isBotMentioned =
      isUserMentioned(message, client.user) &&
      message.mentions.users.size === 1 &&
      message.author.id !== client.user.id;

    if (isBotMentioned) {
      const defaultResponse = `Oops, I'm not sure how to reply, but go f yourself, shitter. Back in the kitchen please!`;
      const openaiApi = getOpenAI();
      const botMsg = await message.reply("Thinking...");
      const messageReply = await getPromptAnswer(openaiApi, content)
        .then(({ data }) => getFirstPromptResponse(data, defaultResponse))
        .catch(() => {
          // Error in case of rate limit or weird openai error response
          return defaultResponse;
        });
      await botMsg.edit(messageReply);
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
