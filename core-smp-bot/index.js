import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { ensureTicketPanel, openTicket, closeTicket } from "./tickets.js";
import { ensureSelfRoles, toggleSelfRole } from "./selfroles.js";
import { handleMemberJoin } from "./welcome.js";
import { handleModerationCommand, moderationCommands } from "./moderation.js";
import { handleAdminCommand, adminCommands } from "./admin.js";
import { handleInfoCommand, infoCommands } from "./info.js";
import { handleUtilityCommand, utilityCommands } from "./utility.js";

const { BOT_TOKEN, GUILD_ID } = process.env;

if (!BOT_TOKEN || !GUILD_ID) {
  console.error("Missing BOT_TOKEN or GUILD_ID in .env");
  process.exit(1);
}

process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("Uncaught exception:", err));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.GuildMember],
});

const MOD_COMMANDS = new Set(moderationCommands.map((c) => c.name));
const ADMIN_COMMANDS = new Set(adminCommands.map((c) => c.name));
const INFO_COMMANDS = new Set(infoCommands.map((c) => c.name));
const UTILITY_COMMANDS = new Set(utilityCommands.map((c) => c.name));

client.once("clientReady", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    await ensureTicketPanel(guild, console.log);
    await ensureSelfRoles(guild, console.log);
    console.log("✅ Panels ready.");
  } catch (err) {
    console.error("Startup setup failed:", err);
  }
});

client.on("guildMemberAdd", async (member) => {
  if (member.guild.id !== GUILD_ID) return;
  await handleMemberJoin(member, console.log);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === "open_ticket") return openTicket(interaction);
      if (interaction.customId === "close_ticket") return closeTicket(interaction);
      if (interaction.customId.startsWith("selfrole_")) {
        return toggleSelfRole(interaction, interaction.customId.slice("selfrole_".length));
      }
      return;
    }

    if (interaction.isChatInputCommand()) {
      if (interaction.guildId !== GUILD_ID) {
        await interaction.reply({ content: "This bot isn't enabled here.", ephemeral: true });
        return;
      }

      const cmd = interaction.commandName;

      if (MOD_COMMANDS.has(cmd)) return handleModerationCommand(interaction);
      if (ADMIN_COMMANDS.has(cmd)) return handleAdminCommand(interaction);
      if (INFO_COMMANDS.has(cmd)) return handleInfoCommand(interaction, client);
      if (UTILITY_COMMANDS.has(cmd)) return handleUtilityCommand(interaction, client);
    }
  } catch (err) {
    console.error(`Error handling interaction (${interaction.customId ?? interaction.commandName}):`, err);
    const payload = { content: `❌ Something went wrong: ${err.message}`, ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.login(BOT_TOKEN);
