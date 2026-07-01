import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { logoAttachment, LOGO_URL } from "./branding.js";

const POLL_EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

export const utilityCommands = [
  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("📊 Create a reaction poll")
    .addStringOption((o) => o.setName("question").setDescription("What to poll").setRequired(true))
    .addStringOption((o) => o.setName("option1").setDescription("First option").setRequired(true))
    .addStringOption((o) => o.setName("option2").setDescription("Second option").setRequired(true))
    .addStringOption((o) => o.setName("option3").setDescription("Third option (optional)"))
    .addStringOption((o) => o.setName("option4").setDescription("Fourth option (optional)")),

  new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("🤖 Show stats about the bot"),
];

export async function handleUtilityCommand(interaction, client) {
  const name = interaction.commandName;

  // ── poll ──────────────────────────────────────────────────────────────────
  if (name === "poll") {
    const question = interaction.options.getString("question");
    const options = [
      interaction.options.getString("option1"),
      interaction.options.getString("option2"),
      interaction.options.getString("option3"),
      interaction.options.getString("option4"),
    ].filter(Boolean);

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${question}`)
      .setDescription(options.map((o, i) => `${POLL_EMOJIS[i]}  **${o}**`).join("\n\n"))
      .setColor(0xDC143C)
      .setThumbnail(LOGO_URL)
      .setFooter({ text: `Poll by ${interaction.user.tag} • Core SMP S3 • React to vote!`, iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    const msg = await interaction.fetchReply();
    for (let i = 0; i < options.length; i++) {
      await msg.react(POLL_EMOJIS[i]);
    }
    return;
  }

  // ── botinfo ───────────────────────────────────────────────────────────────
  if (name === "botinfo") {
    const uptimeSeconds = Math.floor(process.uptime());
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    const embed = new EmbedBuilder()
      .setTitle("🤖 Core SMP Bot")
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .setDescription("Custom moderation & management bot for **Core SMP S3**.")
      .addFields(
        { name: "⏱️ Uptime", value: uptime, inline: true },
        { name: "💾 Memory", value: `${memMB} MB`, inline: true },
        { name: "💓 Ping", value: `${client.ws.ping}ms`, inline: true },
        { name: "🏰 Servers", value: `\`${client.guilds.cache.size}\``, inline: true },
        { name: "👥 Users", value: `\`${client.users.cache.size}\``, inline: true },
        { name: "📦 discord.js", value: `v14`, inline: true },
        { name: "🆔 Bot ID", value: `\`${client.user.id}\``, inline: true },
        { name: "📛 Tag", value: client.user.tag, inline: true }
      )
      .setColor(0xDC143C)
      .setFooter({ text: "Core SMP S3", iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }
}
