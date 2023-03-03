import { ApplicationCommandType, ChatInputCommandInteraction, Client } from 'discord.js';
import { getGiphyBySearch } from '../giphy/api';
import { getRandomElement } from '../utils/random';
import { Command } from './types';

export const Oops: Command = {
	name: 'oops',
	description: 'Oops...',
	type: ApplicationCommandType.ChatInput,
	run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
		const gordonGifs = await getGiphyBySearch('gordon+ramsay+disappointed');
		const { embed_url: gifUrl } = getRandomElement(gordonGifs);
		await interaction.reply(gifUrl);
	}
};