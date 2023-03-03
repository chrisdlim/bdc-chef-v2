import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { CommandOptionsAutoCompleteConfig } from "../autocomplete/types";

export interface Command extends ChatInputApplicationCommandData {
  run: (
    client: Client,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
  autocompleteConfig?: CommandOptionsAutoCompleteConfig;
}
