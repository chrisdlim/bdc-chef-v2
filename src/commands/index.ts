import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { Cookoff } from "./cook-off";
import { LetHimCook } from "./let-him-cook";
import { Oops } from "./oops";
import { Test } from "./test";
import { Inhouse } from "./inhouse";
import { ButtonInteractionHandler, Command } from "./types";
import { Roll } from "./roll";
import { Ltg } from "./ltg";
import { TestDb } from "./test-db";
import { QueueV2 } from "./queue-v2";
import { AnonJoinQueue, AnonLeaveQueue } from "./anonymous-queue/actions";
import { ToxicLine } from "./toxic-line";
import { Cookout } from "./cookout";
import { AskChatGpt } from "./ask-chatgpt";
import { Duo } from "./duo";
import { Assemble } from "./assemble";
import { ListPoints } from "./queue-v2/points";
import { AnonymousQueueV2 } from "./anonymous-queue";
import { JoinQueue, LeaveQueue } from "./queue-v2/actions";

export const commands: Command[] = [
  Test,
  LetHimCook,
  Cookoff,
  Roll,
  Oops,
  Inhouse,
  Ltg,
  TestDb,
  QueueV2,
  Assemble,
  ToxicLine,
  Cookout,
  AskChatGpt,
  Duo,
  ListPoints,
  // AnonymousQueueV2,
];

export const buttonHandlers: ButtonInteractionHandler[] = [
  JoinQueue,
  LeaveQueue,
  AnonJoinQueue,
  AnonLeaveQueue,
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
