import { initBot } from "./bot";
import { getConfig } from "./config";

const config = getConfig();

(async () => {
  await initBot(config.token);
})();
