import { ActionRow, APIEmbedField, ButtonComponent, ComponentType, MessageActionRowComponent } from "discord.js";
import { BetFields } from "./fields";
import { BetButtonIds } from "./buttons";

export const findFieldByName = (
  fields: APIEmbedField[] | undefined,
  name: string
): string => {
  return fields?.find((f) => f.name === name)?.value || "";
};

// Get option labels from button components (open bet state)
export const getOptionLabelsFromButtons = (
  components: ActionRow<MessageActionRowComponent>[] | undefined
): { option1Label: string; option2Label: string } => {
  const buttons = components?.[0]?.components?.filter(
    (c): c is ButtonComponent => c.type === ComponentType.Button
  ) || [];
  
  const option1Button = buttons.find((b) => b.customId === BetButtonIds.OPTION_1);
  const option2Button = buttons.find((b) => b.customId === BetButtonIds.OPTION_2);
  
  return {
    option1Label: option1Button?.label || "Option 1",
    option2Label: option2Button?.label || "Option 2",
  };
};

// Get option labels from complete buttons (closed bet state - labels end with " wins")
export const getOptionLabelsFromCompleteButtons = (
  components: ActionRow<MessageActionRowComponent>[] | undefined
): { option1Label: string; option2Label: string } => {
  const buttons = components?.[0]?.components?.filter(
    (c): c is ButtonComponent => c.type === ComponentType.Button
  ) || [];
  
  const complete1Button = buttons.find((b) => b.customId === BetButtonIds.COMPLETE_1);
  const complete2Button = buttons.find((b) => b.customId === BetButtonIds.COMPLETE_2);
  
  // Strip " wins" suffix from button labels (case-insensitive)
  const stripWins = (label: string | null | undefined) => label?.replace(/ wins$/i, "") || "";
  
  return {
    option1Label: stripWins(complete1Button?.label) || "Option 1",
    option2Label: stripWins(complete2Button?.label) || "Option 2",
  };
};

// Get inline fields - option user fields are the only inline fields
const getInlineFields = (fields: APIEmbedField[] | undefined) =>
  fields?.filter((f) => f.inline) || [];

export const getOption1Users = (fields: APIEmbedField[] | undefined): string[] => {
  // First inline field is option 1
  const inlineFields = getInlineFields(fields);
  const value = inlineFields[0]?.value;
  if (!value || value === "-") return [];
  return value.split("\n").filter(Boolean);
};

export const getOption2Users = (fields: APIEmbedField[] | undefined): string[] => {
  // Second inline field is option 2
  const inlineFields = getInlineFields(fields);
  const value = inlineFields[1]?.value;
  if (!value || value === "-") return [];
  return value.split("\n").filter(Boolean);
};

export const getCreatorId = (fields: APIEmbedField[] | undefined): string => {
  const creatorMention = findFieldByName(fields, BetFields.CREATOR);
  // Extract user ID from mention format <@123456789>
  const match = creatorMention.match(/<@(\d+)>/);
  return match ? match[1] : "";
};

export const formatUserList = (users: string[]): string =>
  users.length > 0 ? users.join("\n") : "-";

export const getBetTitle = (status: string): string => {
  return `🎰 Wager ${status === "open" ? "- place your bets!" : ""}`;
};

