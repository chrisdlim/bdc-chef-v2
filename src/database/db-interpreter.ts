import { Db, Document, ObjectId } from "mongodb";

export const findAllInCollection = <T extends Document>(
  db: Db,
  collectionName: string
): Promise<T[]> => {
  return db
    .collection(collectionName)
    .find({})
    .toArray()
    .then((results) => {
      return results.map((document) => {
        return document as unknown as T;
      });
    });
};

export const insertOneIntoCollection = <T extends Document>(
  db: Db,
  collectionName: string,
  item: T
): Promise<ObjectId> => {
  return db
    .collection(collectionName)
    .insertOne(item)
    .then(({ insertedId }) => insertedId);
};

export const deleteCollection = async (db: Db, collectionName: string) => {
  return db.collection(collectionName).drop();
};
