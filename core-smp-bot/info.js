import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { logoAttachment, LOGO_URL } from "./branding.js";

export const infoCommands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🏓 Check the bot's response latency"),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("🏰 Display stats and info about this server"),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("👤 Display info about a member")
    .addUserOption((o) => o.setName("user").setDescription("Who to look up (default: yourself)")),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("🖼️ Show a user's full-size avatar")
    .addUserOption((o) => o.setName("user").setDescription("Whose avatar (default: yourself)")),

  new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("🎭 Display info about a specific role")
    .addRoleOption((o) => o.setName("role").setDescription("Which role to inspect").setRequired(true)),
];

export async function handleInfoCommand(interaction, client) {
  const name = interaction.commandName;

  // ── ping ──────────────────────────────────────────────────────────────────
  if (name === "ping") {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();
    const roundtrip = reply.createdTimestamp - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .setDescription("Bot is online and responding.")
      .addFields(
        { name: "📡 Roundtrip Latency", value: `\`${roundtrip}ms\``, inline: true },
        { name: "💓 WebSocket Heartbeat", value: `\`${client.ws.ping}ms\``, inline: true }
      )
      .setColor(roundtrip < 100 ? 0x2ECC71 : roundtrip < 250 ? 0xF39C12 : 0xE74C3C)
      .setThumbnail(LOGO_URL)
      .setFooter({ text: "Core SMP S3", iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }

  // ── serverinfo ────────────────────────────────────────────────────────────
  if (name === "serverinfo") {
    const guild = await interaction.guild.fetch();
    const owner = await guild.fetchOwner();
    const channels = guild.channels.cache;
    const textCount = channels.filter((c) => c.type === 0).size;
    const voiceCount = channels.filter((c) => c.type === 2).size;
    const categoryCount = channels.filter((c) => c.type === 4).size;
    const roleCount = guild.roles.cache.size - 1;
    const emojiCount = guild.emojis.cache.size;

    const embed = new EmbedBuilder()
      .setTitle(`🏰 ${guild.name}`)
      .setDescription(guild.description ?? "")
      .setThumbnail(guild.iconURL({ size: 256 }) ?? LOGO_URL)
      .addFields(
        { name: "👑 Owner", value: `${owner.user}`, inline: true },
        { name: "📅 Created", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: "🆔 Server ID", value: `\`${guild.id}\``, inline: true },
        { name: "👥 Members", value: `\`${guild.memberCount}\``, inline: true },
        { name: "🎭 Roles", value: `\`${roleCount}\``, inline: true },
        { name: "😄 Emojis", value: `\`${emojiCount}\``, inline: true },
        { name: "💬 Text Channels", value: `\`${textCount}\``, inline: true },
        { name: "🔊 Voice Channels", value: `\`${voiceCount}\``, inline: true },
        { name: "📁 Categories", value: `\`${categoryCount}\``, inline: true },
        {
          name: "💎 Server Boost",
          value: `Level **${guild.premiumTier}** — \`${guild.premiumSubscriptionCount ?? 0}\` boosts`,
          inline: true,
        },
        { name: "🌍 Locale", value: guild.preferredLocale, inline: true },
        {
          name: "✅ Verification",
          value: ["None", "Low", "Medium", "High", "Very High"][guild.verificationLevel] ?? "Unknown",
          inline: true,
        }
      )
      .setColor(0xDC143C)
      .setFooter({ text: "Core SMP S3", iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }

  // ── userinfo ──────────────────────────────────────────────────────────────
  if (name === "userinfo") {
    const target = interaction.options.getUser("user") ?? interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    const topRoles = member?.roles.cache
      .filter((r) => r.id !== interaction.guild.roles.everyone.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => `${r}`)
      .slice(0, 8)
      .join(" ");

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "🆔 User ID", value: `\`${target.id}\``, inline: true },
        { name: "🤖 Bot", value: target.bot ? "Yes" : "No", inline: true },
        { name: "📅 Account Created", value: `<t:${Math.floor(target.createdTimestamp / 1000)}:D>\n<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
      );

    if (member) {
      embed.addFields(
        { name: "📥 Joined Server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>\n<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: "🏷️ Nickname", value: member.nickname ?? "None", inline: true },
        { name: "🎖️ Top Role", value: `${member.roles.highest}`, inline: true }
      );

      if (topRoles) {
        embed.addFields({ name: `📋 Roles [${member.roles.cache.size - 1}]`, value: topRoles });
      }
    }

    embed
      .setColor(member?.displayColor || 0xDC143C)
      .setFooter({ text: "Core SMP S3", iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }

  // ── avatar ────────────────────────────────────────────────────────────────
  if (name === "avatar") {
    const target = interaction.options.getUser("user") ?? interaction.user;
    const avatarURL = target.displayAvatarURL({ size: 1024, extension: "png" });

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ ${target.tag}'s Avatar`)
      .setURL(avatarURL)
      .setImage(avatarURL)
      .setColor(0xDC143C)
      .setFooter({ text: "Core SMP S3", iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }

  // ── roleinfo ──────────────────────────────────────────────────────────────
  if (name === "roleinfo") {
    const role = interaction.options.getRole("role");
    await interaction.guild.members.fetch();
    const memberCount = interaction.guild.members.cache.filter((m) => m.roles.cache.has(role.id)).size;

    const perms = role.permissions.toArray().map((p) =>
      p.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    );
    const permText = perms.length > 0 ? perms.slice(0, 8).join(", ") + (perms.length > 8 ? `… +${perms.length - 8} more` : "") : "None";

    const embed = new EmbedBuilder()
      .setTitle(`🎭 ${role.name}`)
      .addFields(
        { name: "🆔 Role ID", value: `\`${role.id}\``, inline: true },
        { name: "🎨 Color", value: role.hexColor, inline: true },
        { name: "👥 Members", value: `\`${memberCount}\``, inline: true },
        { name: "📌 Hoisted", value: role.hoist ? "✅ Yes" : "❌ No", inline: true },
        { name: "💬 Mentionable", value: role.mentionable ? "✅ Yes" : "❌ No", inline: true },
        { name: "🤖 Managed", value: role.managed ? "✅ Yes (bot/integration)" : "❌ No", inline: true },
        { name: "📅 Created", value: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`, inline: true },
        { name: "📊 Position", value: `\`${role.position}\``, inline: true },
        { name: "⚙️ Key Permissions", value: permText }
      )
      .setColor(role.color || 0xDC143C)
      .setFooter({ text: "Core SMP S3", iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }
}
