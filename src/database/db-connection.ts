import { Db, MongoClient, MongoClientOptions } from "mongodb";
import { getConfig } from "../config";

const FIVE_MINUTES = 60 * 5 * 1000;

let dbConnection: Db;
const options: MongoClientOptions = {
  maxIdleTimeMS: FIVE_MINUTES,
};

const config = getConfig();

export const getConnection = (databaseName: string): Promise<Db> => {
  if (dbConnection) {
    console.log("Using existing connection");
    return Promise.resolve(dbConnection);
  } else {
    return MongoClient.connect(config.dbEndpoint, options)
      .then((connection: MongoClient) => {
        console.log("Connected to the database");
        dbConnection = connection.db(databaseName);
        return dbConnection;
      })
      .catch((error) => {
        console.log("Could not connect to the database: \n%s", error);
        throw error;
      });
  }
};
