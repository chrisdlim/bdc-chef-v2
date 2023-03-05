import { Db, MongoClient, MongoClientOptions } from "mongodb";

const FIVE_MINUTES = 60 * 5 * 1000;

let dbConnection: Db;
const options: MongoClientOptions = {
  maxIdleTimeMS: FIVE_MINUTES,
};

export const getConnection = (databaseName: string): Promise<Db | void> => {
  if (dbConnection) {
    console.log("Using existing connection");
    return Promise.resolve(dbConnection);
  } else {
    return MongoClient.connect(process.env.DB_ENDPOINT!, options)
      .then((connection: MongoClient) => {
        console.log("Connected to the database");
        dbConnection = connection.db(databaseName);
        return dbConnection;
      })
      .catch((error) => {
        console.log("Could not connect to the database: \n%s", error);
      });
  }
};
