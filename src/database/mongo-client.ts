import { MongoClient, ServerApiVersion } from "mongodb";
import { getConfig } from "../config";

const FIVE_MINUTES = 60 * 5 * 1000;
const { mongoUri } = getConfig();

export const getMongoClient = () => {
  return new MongoClient(mongoUri, { waitQueueTimeoutMS: FIVE_MINUTES, serverApi: ServerApiVersion.v1 });
}