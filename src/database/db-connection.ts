import { Db, MongoClient, MongoClientOptions } from "mongodb";

const FIVE_MINUTES = 60 * 5 * 1000;

let dbConnection: Db;
const options: MongoClientOptions = {
  maxIdleTimeMS: FIVE_MINUTES,
};

const DB_ENDPOINT = process.env.DB_ENDPOINT;

if (!DB_ENDPOINT) {
  throw new Error('DB_ENDPOINT not provided.');
}

export const getConnection = (databaseName: string): Promise<Db> => {
  if (dbConnection) {
    console.log("Using existing connection");
    return Promise.resolve(dbConnection);
  } else {
    return MongoClient.connect(DB_ENDPOINT, options)
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
