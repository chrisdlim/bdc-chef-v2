import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
    Client,
    SlashCommandBuilder
  } from "discord.js";
  import { Command } from "./types";

import { getConnection } from "../utils/db-connection";
import { deleteCollection, findAllInCollection, insertOneIntoCollection } from "../utils/db-interpreter";
import { TestDbResult } from "../utils/db-types";
import { SystemError } from "../error/system-error";

export const TestDb: Command = {
    name: "testdb",
    description: "Test the connection to the database",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'insert',
            description: 'Test inserting into the db',
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: false,
        },
        {
            name: 'drop',
            description: 'Drops the test db to wipe everything out',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
    run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        const { options } = interaction;
        const insertName = options.getString('insert', false);
        const dropDb = options.getString('drop', false);

        const testDbConnection = await getConnection('test');
        if (testDbConnection) {
            if(dropDb) {
                await deleteCollection(testDbConnection, 'collection');
                interaction.reply('Deleted the test collection, Insert more to remake the collection');
            }

            if(!insertName && !dropDb) {
                const results: Array<TestDbResult> = 
                await findAllInCollection(testDbConnection, 'collection');
                
                if (results.length > 0) {
                    const resultNames = results.map(({name}) => name).join(', ');
                    interaction.reply(`Found results with the following names: ${resultNames}`);
                } else {
                    interaction.reply(`Ther are currently no Documents in the Collection`);
                }
            } else if (!dropDb) {
                const result = await insertOneIntoCollection(testDbConnection, 'collection', {
                    name: insertName,
                    data: {
                        message: 'This is an auto generated message'
                    }
                } as TestDbResult);

                if (result) {
                    interaction.reply(`Inserted one record with the following ID: ${result}`);
                } else {
                    throw new SystemError(`Something went wrong and could not insert any test results`);
                }
            }
        }
    },
};