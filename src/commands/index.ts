import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { Cookoff } from "./cook-off";
import { LetHimCook } from "./let-him-cook";
import { Oops } from "./oops";
import { Ping } from "./ping";
import { Test } from "./test";
import { Inhouse } from "./inhouse";
import { Command } from "./types";
import { Roll } from "./roll";
import { Queue } from "./queue";

export const commands: Command[] = [
  Ping,
  Test,
  LetHimCook,
  Cookoff,
  Roll,
  Oops,
  Inhouse,
  Queue,
  Ltg,
];

export const registerApplicationCommands = (client: Client<true>) => {
  return client.application.commands.set(commands);
};

export const findCommandByInteraction = (
  interaction: ChatInputCommandInteraction | AutocompleteInteraction
): Command | undefined =>
  commands.find(({ name }) => name === interaction.commandName);