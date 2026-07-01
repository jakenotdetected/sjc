import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { addWarning, getWarnings } from "./warnings.js";
import { logoAttachment, LOGO_URL } from "./branding.js";

export const moderationCommands = [
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("👢 Kick a member from the server")
    .addUserOption((o) => o.setName("user").setDescription("Who to kick").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Why are they being kicked?"))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("🔨 Ban a member from the server")
    .addUserOption((o) => o.setName("user").setDescription("Who to ban").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Why are they being banned?"))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("🔇 Timeout a member")
    .addUserOption((o) => o.setName("user").setDescription("Who to mute").setRequired(true))
    .addIntegerOption((o) =>
      o.setName("minutes").setDescription("Mute duration in minutes").setRequired(true)
    )
    .addStringOption((o) => o.setName("reason").setDescription("Why are they being muted?"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("⚠️ Log a warning against a member")
    .addUserOption((o) => o.setName("user").setDescription("Who to warn").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason for the warning").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("📋 List warnings for a member")
    .addUserOption((o) => o.setName("user").setDescription("Whose warnings to view").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
];

export async function handleModerationCommand(interaction) {
  const target = interaction.options.getUser?.("user");

  if (interaction.commandName === "kick") {
    const reason = interaction.options.getString("reason") ?? "No reason given";
    const member = await interaction.guild.members.fetch(target.id);
    await member.kick(reason);
    await interaction.reply({
      embeds: [resultEmbed("👢 Member Kicked", target, reason)],
      files: [logoAttachment()],
    });
    return;
  }

  if (interaction.commandName === "ban") {
    const reason = interaction.options.getString("reason") ?? "No reason given";
    await interaction.guild.members.ban(target.id, { reason });
    await interaction.reply({
      embeds: [resultEmbed("🔨 Member Banned", target, reason)],
      files: [logoAttachment()],
    });
    return;
  }

  if (interaction.commandName === "mute") {
    const minutes = interaction.options.getInteger("minutes");
    const reason = interaction.options.getString("reason") ?? "No reason given";
    const member = await interaction.guild.members.fetch(target.id);
    await member.timeout(minutes * 60 * 1000, reason);
    await interaction.reply({
      embeds: [resultEmbed("🔇 Member Muted", target, `${reason}\n⏱️ Duration: ${minutes} minute(s)`)],
      files: [logoAttachment()],
    });
    return;
  }

  if (interaction.commandName === "warn") {
    const reason = interaction.options.getString("reason");
    const count = addWarning(target.id, { moderatorTag: interaction.user.tag, reason });

    let autoNote = "";
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member) {
      if (count === 3) {
        await member.timeout(60 * 60 * 1000, "Auto-mute: 3 warnings");
        autoNote = "\n\n⚠️ **Auto-action:** Muted for **1 hour** (3 warnings reached)";
      } else if (count === 5) {
        await member.timeout(24 * 60 * 60 * 1000, "Auto-mute: 5 warnings");
        autoNote = "\n\n🚨 **Auto-action:** Muted for **24 hours** (5 warnings reached)";
      } else if (count >= 7) {
        await interaction.guild.members.ban(target.id, { reason: "Auto-ban: 7+ warnings" });
        autoNote = "\n\n🔨 **Auto-action:** **Banned** (7+ warnings reached)";
      }
    }

    await interaction.reply({
      embeds: [resultEmbed("⚠️ Member Warned", target, `${reason}\n📋 Total warnings: **${count}**${autoNote}`)],
      files: [logoAttachment()],
    });
    return;
  }

  if (interaction.commandName === "warnings") {
    const warnings = getWarnings(target.id);
    const embed = new EmbedBuilder()
      .setTitle(`📋 Warnings for ${target.tag}`)
      .setColor(0xFF4500)
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: "Core SMP S3", iconURL: LOGO_URL });

    if (warnings.length === 0) {
      embed.setDescription("✅ No warnings on record.");
    } else {
      embed.setDescription(
        warnings
          .map((w, i) => `**${i + 1}.** ${w.reason}\n   ⤷ by ${w.moderatorTag} • <t:${Math.floor(new Date(w.at).getTime() / 1000)}:R>`)
          .join("\n\n")
      );
    }

    await interaction.reply({ embeds: [embed], files: [logoAttachment()], ephemeral: true });
  }
}

function resultEmbed(title, target, detail) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(`**Member:** ${target}\n**Reason:** ${detail}`)
    .setColor(0xDC143C)
    .setThumbnail(target.displayAvatarURL())
    .setFooter({ text: "Core SMP S3", iconURL: LOGO_URL })
    .setTimestamp();
}
