import { GuildMember, User } from "discord.js";

export const getUserAsMention = (user: User | GuildMember) => `<@${user.id}>`;
export const getUserWithDiscriminator = ({ username, discriminator }: User) => `${username}${discriminator}`;