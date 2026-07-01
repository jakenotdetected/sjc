import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { buildLayout } from "./build-layout.js";

const { BOT_TOKEN, GUILD_ID, WIPE_EXISTING } = process.env;

if (!BOT_TOKEN || !GUILD_ID) {
  console.error("Missing BOT_TOKEN or GUILD_ID in .env (copy .env.example -> .env and fill it in).");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", async () => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    console.log(`Connected to guild: ${guild.name} (${guild.id})`);
    await buildLayout(guild, { wipe: WIPE_EXISTING === "true" });
  } catch (err) {
    console.error("Setup failed:", err);
  } finally {
    client.destroy();
  }
});

client.login(BOT_TOKEN);
