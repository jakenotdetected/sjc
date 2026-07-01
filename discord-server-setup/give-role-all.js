import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

const { BOT_TOKEN, GUILD_ID } = process.env;
const ROLE_NAME = "🔥 Official Core Smp member";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("clientReady", async () => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const role = guild.roles.cache.find((r) => r.name === ROLE_NAME) ??
      (await guild.roles.fetch()).find((r) => r.name === ROLE_NAME);
    if (!role) {
      console.error(`Role "${ROLE_NAME}" not found. Run /setup-server first.`);
      process.exit(1);
    }

    const members = await guild.members.fetch();
    console.log(`Fetched ${members.size} members. Assigning "${ROLE_NAME}"...`);

    let added = 0, skipped = 0, failed = 0;
    for (const member of members.values()) {
      if (member.user.bot) { skipped++; continue; }
      if (member.roles.cache.has(role.id)) { skipped++; continue; }
      try {
        await member.roles.add(role);
        added++;
        console.log(`  + ${member.user.tag}`);
      } catch (err) {
        failed++;
        console.error(`  ! failed for ${member.user.tag}: ${err.message}`);
      }
    }

    console.log(`Done. Added: ${added}, skipped (already had it / bots): ${skipped}, failed: ${failed}`);
  } catch (err) {
    console.error("Bulk role assign failed:", err);
  } finally {
    client.destroy();
  }
});

client.login(BOT_TOKEN);
