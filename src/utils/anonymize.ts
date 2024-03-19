import jwt from "jsonwebtoken";
import { getConfig } from "../config";
const config = getConfig();

export const encryptValue = (value: string, salt: number) => {
  return jwt.sign(value, `${config.anonymizeToken}-${salt}`);
};

export const decryptValue = (encryptedValue: string) => {
  return jwt.decode(encryptedValue);
};
