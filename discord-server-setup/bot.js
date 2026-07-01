import "dotenv/config";
import { Client, GatewayIntentBits, MessageFlags } from "discord.js";
import { buildLayout } from "./build-layout.js";

const { BOT_TOKEN, GUILD_ID } = process.env;

if (!BOT_TOKEN || !GUILD_ID) {
  console.error("Missing BOT_TOKEN or GUILD_ID in .env (copy .env.example -> .env and fill it in).");
  process.exit(1);
}

// Never let an unhandled error (e.g. trying to message a channel a wipe just
// deleted) take the whole bot process down.
process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("Uncaught exception:", err));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}. Listening for /setup-server in guild ${GUILD_ID}.`);
});

async function safeReply(interaction, payload) {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  } catch (err) {
    // The channel the command was run in may have been deleted by the wipe
    // itself — fall back to posting in the guild's #general channel instead.
    console.error("Could not reply to interaction directly:", err.message);
    try {
      const fallback = interaction.guild?.channels.cache.find(
        (c) => c.name.includes("general") && c.isTextBased?.()
      );
      if (fallback) {
        await fallback.send(payload.content);
      } else {
        console.error("No fallback channel found; message was:", payload.content);
      }
    } catch (fallbackErr) {
      console.error("Fallback channel send also failed:", fallbackErr.message);
    }
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "setup-server") return;
  if (interaction.guildId !== GUILD_ID) {
    await safeReply(interaction, {
      content: "This command isn't enabled for this server.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!interaction.memberPermissions?.has("Administrator")) {
    await safeReply(interaction, {
      content: "You need Administrator permission to run this.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const wipe = interaction.options.getBoolean("wipe") ?? true;

  await safeReply(interaction, {
    content: `Starting server rebuild (wipe: ${wipe})... I'll follow up when it's done.`,
    flags: MessageFlags.Ephemeral,
  });

  try {
    const { skipped } = await buildLayout(interaction.guild, {
      wipe,
      log: (msg) => console.log(msg),
    });

    let summary = "Server rebuild complete.";
    if (skipped.length) {
      summary +=
        `\n\nCouldn't remove ${skipped.length} item(s) (likely above the bot's role in the hierarchy):\n` +
        skipped.map((s) => `- ${s}`).join("\n");
    }
    await safeReply(interaction, { content: summary, flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error(err);
    await safeReply(interaction, {
      content: `Rebuild failed: ${err.message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
});

client.login(BOT_TOKEN);
