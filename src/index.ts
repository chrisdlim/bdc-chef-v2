import { initBot } from "./bot";

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  throw new Error("Discord token required!");
}

(async () => {
  await initBot(TOKEN);
})();
