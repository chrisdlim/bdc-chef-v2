import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    Client,
  } from "discord.js";
  import { Command } from "./types";

import { getConnection } from "../utils/db-connection";
import { findAllInCollection } from "../utils/db-interpreter";
import { TestDbResult } from "../utils/db-types";

export const TestDb: Command = {
    name: "testdb",
    description: "Test the connection to the database",
    type: ApplicationCommandType.ChatInput,
    run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
        let connection = await getConnection('test');
        if (connection) {
            let results: Array<TestDbResult> = [];
            await findAllInCollection(connection, 'collection', results);
            let resultNames = '';
            results.forEach(result => resultNames+=' '+result.name);
            interaction.reply(`Found results with the following names: ${resultNames}`);
        }
    },
};