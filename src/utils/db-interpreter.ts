import { Db, Document, ObjectId } from "mongodb";


export const findAllInCollection = async <T extends Document> (
    db: Db, 
    collectionName: string
) : Promise<T[]> => {
    return await db.collection(collectionName).find({}).toArray()
        .then((results) => {
            return results.map((document) => {return document as unknown as T});
        })
        .catch((error) => {
            console.log(error); 
            return Array<T>();
        });
}

export const insertOneIntoCollection = async <T extends Document> (
    db: Db,
    collectionName: string,
    item: T
) : Promise<void | ObjectId> => {
    return db.collection(collectionName).insertOne(item)
        .then((result) => {
            return result.insertedId;
        })
        .catch((error) => {
            console.log(error);
        });
}

export const deleteCollection = async (
    db: Db,
    collectionName: string,
) => {
    return db.collection(collectionName).drop();
}