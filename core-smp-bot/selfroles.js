import {
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import {
  SELF_ROLES,
  SELF_ROLES_CATEGORY_NAME,
  SELF_ROLES_CHANNEL_NAME,
} from "./config.js";
import { logoAttachment, LOGO_URL } from "./branding.js";

export async function ensureSelfRoles(guild, log = console.log) {
  for (const def of SELF_ROLES) {
    let role = guild.roles.cache.find((r) => r.name === def.roleName);
    if (!role) {
      role = await guild.roles.create({ name: def.roleName, color: def.color, hoist: false });
      log(`  created self-role "${def.roleName}"`);
    }
  }

  const channels = await guild.channels.fetch();
  let category = channels.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === SELF_ROLES_CATEGORY_NAME
  );
  if (!category) {
    category = await guild.channels.create({
      name: SELF_ROLES_CATEGORY_NAME,
      type: ChannelType.GuildCategory,
    });
  }

  let panelChannel = channels.find(
    (c) => c.type === ChannelType.GuildText && c.name === SELF_ROLES_CHANNEL_NAME
  );
  if (panelChannel) return;

  panelChannel = await guild.channels.create({
    name: SELF_ROLES_CHANNEL_NAME,
    type: ChannelType.GuildText,
    parent: category.id,
  });

  const embed = new EmbedBuilder()
    .setTitle("📋 Self-Assignable Roles")
    .setDescription(
      "Pick what you want to be pinged for — click a button below to toggle it on or off anytime. 🔁\n\n" +
        SELF_ROLES.map((def) => `${def.emoji} **${def.roleName.replace(/^\S+\s/, "")}** — ${def.description}`).join("\n")
    )
    .setColor(0xDC143C)
    .setThumbnail(LOGO_URL)
    .setFooter({ text: "Core SMP S3 • Click again to remove a role", iconURL: LOGO_URL })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    SELF_ROLES.map((def) =>
      new ButtonBuilder()
        .setCustomId(`selfrole_${def.roleName}`)
        .setLabel(def.roleName.replace(/^\S+\s/, ""))
        .setEmoji(def.emoji)
        .setStyle(ButtonStyle.Secondary)
    )
  );

  await panelChannel.send({ embeds: [embed], components: [row], files: [logoAttachment()] });
  log(`  created self-roles panel in ${SELF_ROLES_CHANNEL_NAME}`);
}

export async function toggleSelfRole(interaction, roleName) {
  const role = interaction.guild.roles.cache.find((r) => r.name === roleName);
  if (!role) {
    await interaction.reply({ content: "That role no longer exists.", ephemeral: true });
    return;
  }

  const member = interaction.member;
  if (member.roles.cache.has(role.id)) {
    await member.roles.remove(role);
    await interaction.reply({ content: `❌ Removed **${roleName}**.`, ephemeral: true });
  } else {
    await member.roles.add(role);
    await interaction.reply({ content: `✅ Added **${roleName}**.`, ephemeral: true });
  }
}
