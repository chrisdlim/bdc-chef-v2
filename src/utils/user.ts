import { Message, User } from "discord.js";

export const getUserWithDiscriminator = ({ username, discriminator }: User) =>
  `${username}${discriminator}`;
export const isUserMentioned = (message: Message, user: User): boolean =>
  message.mentions.users.has(user.id);
