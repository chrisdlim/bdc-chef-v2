import { ApplicationCommandType, BaseInteraction, Client } from 'discord.js';
import { Command } from './types';

export const Ping: Command = {
	name: 'ping',
	description: 'Ping Pong',
	type: ApplicationCommandType.ChatInput,
	run: async (client: Client, interaction: BaseInteraction) => {
		if (!interaction.isChatInputCommand()) return;
		const content = 'Pong!';
		await interaction.reply(content);
	}
};