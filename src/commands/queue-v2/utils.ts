import { Message } from "discord.js";

export const getQueueTitle = (size: number, currentQueueSize: number) => {
  if (size === currentQueueSize) {
    return `OOOOORDER UP, WE GOT ALL ${size} CHEFS`;
  }
  return `Lookin' for ${size - currentQueueSize} more gamer(s)`;
};

export const getNumberStringFromString = (value: string): string => value.replace(/[^0-9]/g, "");

export const getNumberFromString = (value: string): number => {
  return +getNumberStringFromString(value);
}

export const defaultQueueTimeoutMinutes = 30;

export const getMinutesInMillis = (minutes: number) => 1000 * 60 * minutes;

export const expireQueue = (message: Message<boolean>, timeoutMinutes: number) => {
  setTimeout(async () => {
    console.log('Disabling queue after timeout in minutes', timeoutMinutes);
    const { embeds } = message;
    await message.edit({
      embeds,
      components: [],
    })
  }, getMinutesInMillis(timeoutMinutes));
}