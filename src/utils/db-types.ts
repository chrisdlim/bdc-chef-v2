import { ObjectId } from "mongodb";

//Make your Collection Data Types here

export interface TestDbResult extends Document {
    _id: ObjectId;
    name: string;
    data: {
      message: string;
    }
  }

  