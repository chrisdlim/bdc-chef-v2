import { InteractionResponse, Message, strikethrough } from "discord.js";
import { SystemError } from "../../error/system-error";
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

export const expireQueue = (interaction: Message<boolean>, timeoutMinutes: number) => {
  try {
    setTimeout(async () => {
      console.log('Reached queue expiration', { timeoutMinutes, interactionId: interaction.id });
      const message = await interaction.fetch();

      if (!message) {
        throw new SystemError(`Could not find message for: ${interaction}`)
      }

      const { embeds } = message;

      const [embed] = embeds;

      if (!embed || !embed.data.fields) {
        // Nothing to expire if embed fields are gone
        console.log('No embed or embed data found, nothing to expire.');
        return;
      }

      const [queueField, ...remainingFields] = embed.data.fields;
      const { name, value: queuedUsersStr } = queueField;
      const currentQueuedUsers = denumberList(queuedUsersStr);
      const queueSize = getNumberFromString(embed.footer?.text!);

      const isQueueFull = currentQueuedUsers.length === queueSize;

      if (isQueueFull) {
        console.log('Not expiring completed queue.');
        return;
      }

      const updatedQueueUsers = currentQueuedUsers.map((value) => strikethrough(value));
      const updatedQueuedUsersNumbered = numberedList(updatedQueueUsers);

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
      await interaction.edit({
        embeds: [updatedEmbed],
        components: [],
      })
    }, getMinutesInMillis(timeoutMinutes));
  } catch (error) {
    console.log('Error expiring queue', error);
  }
}