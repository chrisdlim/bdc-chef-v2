import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, Client } from "discord.js";
import { Command } from "./types";
import { getRandomNumberWithMaxVal } from "../utils/get-random-number";


export const Roll : Command = {
    name: 'roll',
    description: 'Roll the dice to test your odds against a specified number or roll a d20',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "maxrollvalue",
            description: "Specify a max value to roll to or leave it blank for a d20",
            type: ApplicationCommandOptionType.Integer,
            required: false,
        }

    ],
    run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        const options = interaction.options.getInteger("maxrollvalue")
        const inputMaxRollValue = options || 20;
        const randomValue = getRandomNumberWithMaxVal(inputMaxRollValue);

        await interaction.reply(`${interaction.member?.user.username} rolled a ${randomValue} out of ${inputMaxRollValue}`);
    }
}