import {
  AutocompleteInteraction,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
  run: (
    client: Client,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
  handleAutoComplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
