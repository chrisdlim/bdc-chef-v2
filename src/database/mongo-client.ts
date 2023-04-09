import { MongoClient, ServerApiVersion } from "mongodb";
import { getConfig } from "../config";

const FIVE_MINUTES = 60 * 5 * 1000;
const { mongoUser, mongoPw } = getConfig();

export const getMongoClient = () => {
  const uri = `mongodb+srv://${mongoUser}:${mongoPw}@bdc-chef.yddryuo.mongodb.net/?retryWrites=true&w=majority`;
  return new MongoClient(uri, { waitQueueTimeoutMS: FIVE_MINUTES, serverApi: ServerApiVersion.v1 });
}