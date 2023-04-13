import { Message, strikethrough } from "discord.js";
import { denumberList, numberedList } from "../../utils/text";

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
    const [embed] = embeds;

    const [queueField, ...remainingFields] = embed.data.fields!;
    const { name, value: queuedUsersStr } = queueField;
    const currentQueuedUsers = denumberList(queuedUsersStr);
    const currentQueuedUsersStrikethrough = currentQueuedUsers.map((value) => strikethrough(value));
    const updatedQueuedUsersNumbered = numberedList(currentQueuedUsersStrikethrough);

    const updatedEmbed = {
      ...embed.data,
      title: 'Queue expired',
      fields: [
        {
          name,
          value: updatedQueuedUsersNumbered
        },
        ...remainingFields
      ]
    }
    await message.edit({
      embeds: [updatedEmbed],
      components: [],
    })
  }, getMinutesInMillis(timeoutMinutes));
}