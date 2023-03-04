import { ObjectId } from "mongodb";


export interface TestDbResult extends Document {
    _id: ObjectId;
    name: string;
    data: {
      message: string;
    }
  }
  