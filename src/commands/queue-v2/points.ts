import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, Client, User } from "discord.js"
import { getMongoClient } from "../../database/mongo-client";
import { numberedList } from "../../utils/text";
import { getUserAsMention } from "../../utils/user";
import { Command } from "../types";

const client = getMongoClient();
const pointsCollection = client.db('chef').collection('points');

const PointsActionMap = {
  'join': 10,
  'leave': -5
} as const

export const updatePoints = async (userId: string, action: keyof typeof PointsActionMap) => {
  const points = PointsActionMap[action];
  return await upsertPoints(userId, points);
}

const upsertPoints = async (userId: string, points: number) => {
  await pointsCollection.updateOne({
    user: userId
  }, {
    $inc: {
      points
    }
  }, {
    upsert: true
  });
}



export const ListPoints: Command = {
  name: "points",
  description: "List points",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'top',
      description: 'Top point havers',
      type: ApplicationCommandOptionType.Integer,
    }
  ],
  run: async (_client: Client, interaction: ChatInputCommandInteraction) => {
    const limit = interaction.options.getInteger('top', false);

    const query = limit ? 
      pointsCollection.find().sort({ points: -1 }).limit(limit) 
        : pointsCollection.find().sort({ points: -1 });

    const userPointDocuments = await query.toArray();

    if (userPointDocuments.length) {
      const userPoints = userPointDocuments
        .map(({ user: id, points }) => `${getUserAsMention({ id })} - ${(+points).toLocaleString()}`);
      await interaction.reply(numberedList(userPoints));
    } else {
      await interaction.reply({ content: 'No one points for any of the shitters yet.', ephemeral: true });
    }
  },
};
