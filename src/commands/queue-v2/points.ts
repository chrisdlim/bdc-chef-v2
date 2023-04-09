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

export const updatePoints = async (user: Pick<User, 'id'>, action: keyof typeof PointsActionMap) => {
  const points = PointsActionMap[action];
  return await upsertPoints(user, points);
}

const upsertPoints = async (user: Pick<User, 'id'>, points: number) => {
  await pointsCollection.updateOne({
    user: user.id
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

    const userPointDocuments = await pointsCollection.find().sort({ points: -1 }).toArray();

    if (userPointDocuments.length) {
      const userPoints = await pointsCollection.find().sort({ points: -1 }).toArray()
        .then((result) => result
          .map(({ user: id, points }) => `${getUserAsMention({ id })} - ${(+points).toLocaleString()}`));
      await interaction.reply(numberedList(userPoints));
    } else {
      await interaction.reply({ content: 'No one points for any of the shitters yet.', ephemeral: true });
    }
  },
};
