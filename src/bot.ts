import { Client, Events, IntentsBitField } from "discord.js"
import { registerApplicationCommands } from './commands';
import { registerInteractions } from "./interaction";

export const initBot = async (token: string): Promise<void> => {
  console.log('Initializing bdc-chef...');

  const bot = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.MessageContent,
    ]
  });

  bot.on(Events.ClientReady, async (client) => {
    await registerApplicationCommands(client); // Register commands
    registerInteractions(client);
    console.log("Connected to Discord!")
  });

  await bot.login(token);
}