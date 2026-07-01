import { EmbedBuilder, ChannelType } from "discord.js";
import { NEW_MEMBER_ROLE_NAME, WELCOME_CHANNEL_NAME } from "./config.js";
import { logoAttachment, LOGO_URL } from "./branding.js";

export async function handleMemberJoin(member, log = console.log) {
  const guild = member.guild;

  const newMemberRole = guild.roles.cache.find((r) => r.name === NEW_MEMBER_ROLE_NAME);
  if (newMemberRole) {
    await member.roles.add(newMemberRole).catch((err) =>
      log(`  could not add ${NEW_MEMBER_ROLE_NAME} to ${member.user.tag}: ${err.message}`)
    );
  }

  const welcomeChannel = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.name === WELCOME_CHANNEL_NAME
  );
  if (!welcomeChannel) return;

  const memberCount = guild.memberCount;

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Core SMP S3", iconURL: LOGO_URL })
    .setTitle("⚔️ A new warrior has entered the SMP! ⚔️")
    .setDescription(
      `Welcome, ${member}! 🔥\n\n` +
        `You've just joined **Core SMP S3** — glad to have you here.\n\n` +
        "**🗺️ Getting started:**\n" +
        "🔹 Drop your in-game name in 🎮│ign\n" +
        "🔹 Read 📜│rules before you dive in\n" +
        "🔹 Say hi in 💬│general\n" +
        "🔹 Grab some roles in 📋│self-roles 🔔"
    )
    .addFields({ name: "👥 Member #", value: `${memberCount}`, inline: true })
    .setColor(0xDC143C)
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: "Core SMP S3", iconURL: LOGO_URL })
    .setTimestamp();

  await welcomeChannel
    .send({ content: `${member} 🎉`, embeds: [embed], files: [logoAttachment()] })
    .catch((err) => log(`  could not send welcome message: ${err.message}`));
}
