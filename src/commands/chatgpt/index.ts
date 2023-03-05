// export const AskChatGpt = () => {
//   return await openai.createCompletion({
//     model: "text-davinci-003",
//     prompt: 'how are you today',
//     temperature: 0,
//   });
// }
import {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { Command } from "../types";

export const AskChatGpt: Command = {
  name: "",
  description: "My test",
  type: ApplicationCommandType.ChatInput,
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    await interaction.reply({ content: "Test success", ephemeral: true });
  },
};
