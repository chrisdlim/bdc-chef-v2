import { ApplicationCommandType, ChatInputCommandInteraction, Client } from 'discord.js';
import { Command } from './types';

export const Ltg: Command = {
	name: 'ltg',
	description: 'Lunch Time Gamers',
	type: ApplicationCommandType.ChatInput,
	run: async (_client: Client, interaction: ChatInputCommandInteraction) => {

		await interaction.reply(`<@${interaction.user.id}> looking for some gamers!!! @Tilted Gamers`);
	}
};