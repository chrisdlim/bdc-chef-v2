import { ButtonBuilder, ButtonStyle } from "discord.js";

// Button IDs
export const BetButtonIds = {
  OPTION_1: "bet-option-1",
  OPTION_2: "bet-option-2",
  CLOSE: "bet-close",
  COMPLETE_1: "bet-complete-1",
  COMPLETE_2: "bet-complete-2",
} as const;

type BetButtonConfig = {
  id: string;
  label: string;
  style: ButtonStyle;
  disabled?: boolean;
};

const createButton = ({ id, label, style, disabled = false }: BetButtonConfig) =>
  new ButtonBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(style)
    .setDisabled(disabled);

export const getOpenBetButtons = (option1Label: string, option2Label: string) => [
  createButton({
    id: BetButtonIds.OPTION_1,
    label: option1Label,
    style: ButtonStyle.Primary,
  }),
  createButton({
    id: BetButtonIds.OPTION_2,
    label: option2Label,
    style: ButtonStyle.Primary,
  }),
  createButton({
    id: BetButtonIds.CLOSE,
    label: "Close",
    style: ButtonStyle.Secondary,
  }),
];

export const getClosedBetButtons = (option1Label: string, option2Label: string) => [
  createButton({
    id: BetButtonIds.COMPLETE_1,
    label: `${option1Label} wins`,
    style: ButtonStyle.Success,
  }),
  createButton({
    id: BetButtonIds.COMPLETE_2,
    label: `${option2Label} wins`,
    style: ButtonStyle.Success,
  }),
];

