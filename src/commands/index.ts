import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { Cookoff } from "./cook-off";
import { LetHimCook } from "./let-him-cook";
import { Oops } from "./oops";
import { Ping } from "./ping";
import { Test } from "./test";
import { Inhouse } from "./inhouse";
import { ButtonInteractionHandler, Command } from "./types";
import { Roll } from "./roll";
import { Queue } from "./queue";
import { Ltg } from "./ltg";
import { TestDb } from "./test-db";
import { Assemble, QueueV2 } from "./queue-v2";
import { JoinQueue } from "./queue-v2/join-queue";
import { LeaveQueue } from "./queue-v2/leave-queue";

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
  TestDb,
  QueueV2,
  Assemble,
];

export const buttonHandlers: ButtonInteractionHandler[] = [
  JoinQueue,
  LeaveQueue,
];

export const registerApplicationCommands = (client: Client<true>) => {
  return client.application.commands.set(commands);
};

export const findCommandByInteraction = (
  interaction: ChatInputCommandInteraction | AutocompleteInteraction
): Command | undefined =>
  commands.find(({ name }) => name === interaction.commandName);

export const findButtonHandlerByInteraction = (buttonId: string) =>
  buttonHandlers.find(({ id }) => id === buttonId);
