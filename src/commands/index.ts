import { ChatInputCommandInteraction, Client } from "discord.js";
import { Ping } from "./ping";
import { Test } from "./test";
import { Command } from "./types";

export const commands: Command[] = [Ping, Test];

export const registerApplicationCommands = (client: Client<true>) => {
  return client.application.commands.set(commands);
}

export const findCommandByName = (interaction: ChatInputCommandInteraction): Command | undefined => 
  commands.find(({ name }) => name === interaction.commandName);