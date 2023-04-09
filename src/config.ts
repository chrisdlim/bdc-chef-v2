import { SystemError } from "./error/system-error";

type Config = {
  token: string;
  giphyApiKey: string;
  openaiApiKey: string;
  easterEggNames: string[];
  dbEndpoint: string;
  powerfulUser: string;
  tiltedGamersRoleId: string;
  mongoUser: string;
  mongoPw: string;
};

export const getConfig = (): Config => {
  const token = process.env.TOKEN;
  const giphyApiKey = process.env.GIPHY_TOKEN;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const rawEasterEggNames = process.env.EASTER_EGG_NAMES;
  const dbEndpoint = process.env.DB_ENDPOINT;
  const powerfulUser = process.env.POWERFUL_USER || "";
  const tiltedGamersRoleId = process.env.TILTED_GAMERS_ROLE_ID || "";
  const mongoUser = process.env.MONGO_USER || '';
  const mongoPw = process.env.MONGO_PW || '';

  if (!token) {
    throw new SystemError("Missing discord token");
  }

  if (!giphyApiKey) {
    throw new SystemError("Missing giphy token");
  }

  if (!openaiApiKey) {
    throw new SystemError("Missing openai token");
  }

  if (!dbEndpoint) {
    throw new SystemError("Missing db endpoint");
  }

  if (!mongoUser || !mongoPw) {
    throw new SystemError('Missing mongo credentials');
  }

  return {
    token,
    giphyApiKey,
    openaiApiKey,
    easterEggNames: (rawEasterEggNames || "").split(","),
    dbEndpoint,
    powerfulUser,
    tiltedGamersRoleId,
    mongoUser,
    mongoPw,
  };
};
