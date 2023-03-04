import { Db, Document } from "mongodb";


export const findAllInCollection = async <T extends Document>(
    db: Db, 
    collectionName: string,
    resultArray: Array<T>) : Promise<T[]|void> => {
    await db.collection(collectionName).find({}).toArray().then(
        results => {
            return results.map(result => resultArray.push(result as unknown as T));
        }
    )
}