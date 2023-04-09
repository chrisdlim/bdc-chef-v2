import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, Client, User } from "discord.js"
import { getMongoClient } from "../../database/mongo-client";
import { numberedList } from "../../utils/text";
import { getUserAsMention } from "../../utils/user";
import { Command } from "../types";

const client = getMongoClient();
const pointsCollection = client.db('chef').collection('points');

const PointsActionMap = {
  'start': 10,
  'join': 5,
  'leave': -2
} as const

export const updatePoints = async (user: User, action: keyof typeof PointsActionMap) => {
  switch (action) {
    case 'start':
    case 'join':
      return await addPoints(user, PointsActionMap[action]);
    case 'leave':
      return await deductPoints(user, PointsActionMap[action]);
    default:
      break;
  }
}

const addPoints = async (user: User, points: number) => {
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

const deductPoints = async (user: User, points: number) => {
  await pointsCollection.updateOne({
    user: user.id,
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
