import { ObjectId } from "bson";
import type { WithId, Document } from "mongodb";

export type Gif = {
  url: string;
  embed_url: string;
  title: string;
};