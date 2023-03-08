import {
  AutocompleteInteraction,
  ButtonInteraction,
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

export type ButtonInteractionHandler = {
  id: string;
  label: string;
  run: (interaction: ButtonInteraction) => Promise<void>;
};
