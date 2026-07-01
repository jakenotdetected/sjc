import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { logoAttachment, LOGO_URL } from "./branding.js";
import { removeWarning, clearWarnings } from "./warnings.js";

export const adminCommands = [
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("🗑️ Bulk delete messages in this channel")
    .addIntegerOption((o) =>
      o.setName("amount").setDescription("How many messages to delete (1–100)").setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .addUserOption((o) => o.setName("user").setDescription("Only delete messages from this user"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("🔒 Prevent @everyone from sending messages in this channel")
    .addStringOption((o) => o.setName("reason").setDescription("Reason for locking"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("🔓 Re-allow @everyone to send messages in this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("⏱️ Set a slowmode cooldown on this channel")
    .addIntegerOption((o) =>
      o.setName("seconds").setDescription("Seconds between messages (0 = off)").setRequired(true).setMinValue(0).setMaxValue(21600)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("📢 Post a branded announcement to #announcements")
    .addStringOption((o) => o.setName("message").setDescription("Announcement body").setRequired(true))
    .addStringOption((o) => o.setName("title").setDescription("Embed title (default: 📢 Announcement)"))
    .addBooleanOption((o) => o.setName("ping").setDescription("Ping @everyone? (default: true)"))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("💬 Make the bot send a message to any channel")
    .addChannelOption((o) =>
      o.setName("channel").setDescription("Target channel").setRequired(true).addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption((o) => o.setName("message").setDescription("What to say").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("unban")
    .setDescription("✅ Unban a user by their Discord ID")
    .addStringOption((o) => o.setName("user_id").setDescription("The banned user's ID").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason for unban"))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("🔊 Remove an active timeout from a member")
    .addUserOption((o) => o.setName("user").setDescription("Who to unmute").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("role")
    .setDescription("🎭 Add or remove a role from a member")
    .addStringOption((o) =>
      o.setName("action").setDescription("add or remove").setRequired(true)
        .addChoices({ name: "➕ Add", value: "add" }, { name: "➖ Remove", value: "remove" })
    )
    .addUserOption((o) => o.setName("user").setDescription("Target member").setRequired(true))
    .addRoleOption((o) => o.setName("role").setDescription("Which role").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  new SlashCommandBuilder()
    .setName("warnremove")
    .setDescription("🗑️ Remove a specific warning from a member")
    .addUserOption((o) => o.setName("user").setDescription("Who to remove the warning from").setRequired(true))
    .addIntegerOption((o) =>
      o.setName("index").setDescription("Warning number shown in /warnings").setRequired(true).setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("warnclear")
    .setDescription("🧹 Wipe ALL warnings from a member's record")
    .addUserOption((o) => o.setName("user").setDescription("Who to clear warnings for").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
];

export async function handleAdminCommand(interaction) {
  const name = interaction.commandName;

  // ── clear ─────────────────────────────────────────────────────────────────
  if (name === "clear") {
    const amount = interaction.options.getInteger("amount");
    const targetUser = interaction.options.getUser("user");

    let messages = await interaction.channel.messages.fetch({ limit: 100 });
    if (targetUser) messages = messages.filter((m) => m.author.id === targetUser.id);
    const toDelete = [...messages.values()].slice(0, amount);

    const deleted = await interaction.channel.bulkDelete(toDelete, true);

    const embed = new EmbedBuilder()
      .setTitle("🗑️ Messages Cleared")
      .setDescription(
        `Deleted **${deleted.size}** message(s)` +
          (targetUser ? ` from ${targetUser}` : "") +
          ` in ${interaction.channel}.`
      )
      .setColor(0xDC143C)
      .setFooter({ text: `Actioned by ${interaction.user.tag} • Core SMP S3`, iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()], ephemeral: true });
    return;
  }

  // ── lock ──────────────────────────────────────────────────────────────────
  if (name === "lock") {
    const reason = interaction.options.getString("reason") ?? "No reason given";
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false,
    });

    const embed = new EmbedBuilder()
      .setTitle("🔒 Channel Locked")
      .setDescription(`${interaction.channel} is now **locked**.\n**Reason:** ${reason}`)
      .setColor(0x8B0000)
      .setFooter({ text: `Locked by ${interaction.user.tag} • Core SMP S3`, iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }

  // ── unlock ────────────────────────────────────────────────────────────────
  if (name === "unlock") {
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null,
    });

    const embed = new EmbedBuilder()
      .setTitle("🔓 Channel Unlocked")
      .setDescription(`${interaction.channel} is now **open** again.`)
      .setColor(0x2ECC71)
      .setFooter({ text: `Unlocked by ${interaction.user.tag} • Core SMP S3`, iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }

  // ── slowmode ──────────────────────────────────────────────────────────────
  if (name === "slowmode") {
    const seconds = interaction.options.getInteger("seconds");
    await interaction.channel.setRateLimitPerUser(seconds);

    const embed = new EmbedBuilder()
      .setTitle("⏱️ Slowmode Updated")
      .setDescription(
        seconds === 0
          ? `Slowmode **disabled** in ${interaction.channel}.`
          : `Slowmode set to **${seconds}s** in ${interaction.channel}.`
      )
      .setColor(0xDC143C)
      .setFooter({ text: `Set by ${interaction.user.tag} • Core SMP S3`, iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }

  // ── announce ──────────────────────────────────────────────────────────────
  if (name === "announce") {
    const message = interaction.options.getString("message");
    const title = interaction.options.getString("title") ?? "📢 Announcement";
    const ping = interaction.options.getBoolean("ping") ?? true;

    const announceChannel = interaction.guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildText && c.name.toLowerCase().includes("announcements")
    );
    if (!announceChannel) {
      await interaction.reply({ content: "❌ Couldn't find an announcements channel.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(message)
      .setColor(0xDC143C)
      .setThumbnail(LOGO_URL)
      .setFooter({ text: `Announced by ${interaction.user.tag} • Core SMP S3`, iconURL: LOGO_URL })
      .setTimestamp();

    await announceChannel.send({
      content: ping ? "@everyone" : undefined,
      embeds: [embed],
      files: [logoAttachment()],
    });

    await interaction.reply({ content: `✅ Announcement sent to ${announceChannel}.`, ephemeral: true });
    return;
  }

  // ── say ───────────────────────────────────────────────────────────────────
  if (name === "say") {
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");
    await channel.send(message);
    await interaction.reply({ content: `✅ Message sent to ${channel}.`, ephemeral: true });
    return;
  }

  // ── unban ─────────────────────────────────────────────────────────────────
  if (name === "unban") {
    const userId = interaction.options.getString("user_id");
    const reason = interaction.options.getString("reason") ?? "No reason given";

    try {
      const ban = await interaction.guild.bans.fetch(userId);
      await interaction.guild.members.unban(userId, reason);

      const embed = new EmbedBuilder()
        .setTitle("✅ Member Unbanned")
        .setDescription(`**${ban.user.tag}** has been unbanned.\n**Reason:** ${reason}`)
        .setColor(0x2ECC71)
        .setThumbnail(ban.user.displayAvatarURL())
        .setFooter({ text: `Actioned by ${interaction.user.tag} • Core SMP S3`, iconURL: LOGO_URL })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    } catch {
      await interaction.reply({ content: "❌ That user ID isn't in the ban list.", ephemeral: true });
    }
    return;
  }

  // ── unmute ────────────────────────────────────────────────────────────────
  if (name === "unmute") {
    const target = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(target.id);
    await member.timeout(null);

    const embed = new EmbedBuilder()
      .setTitle("🔊 Member Unmuted")
      .setDescription(`${target} has had their timeout removed.`)
      .setColor(0x2ECC71)
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `Actioned by ${interaction.user.tag} • Core SMP S3`, iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }

  // ── role ──────────────────────────────────────────────────────────────────
  if (name === "role") {
    const action = interaction.options.getString("action");
    const target = interaction.options.getUser("user");
    const role = interaction.options.getRole("role");
    const member = await interaction.guild.members.fetch(target.id);

    if (action === "add") {
      await member.roles.add(role);
    } else {
      await member.roles.remove(role);
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Role ${action === "add" ? "Added" : "Removed"}`)
      .setDescription(
        `${action === "add" ? "➕ Added" : "➖ Removed"} **${role.name}** ${action === "add" ? "to" : "from"} ${target}.`
      )
      .setColor(role.color || 0xDC143C)
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `Actioned by ${interaction.user.tag} • Core SMP S3`, iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }

  // ── warnremove ────────────────────────────────────────────────────────────
  if (name === "warnremove") {
    const target = interaction.options.getUser("user");
    const index = interaction.options.getInteger("index") - 1;
    const removed = removeWarning(target.id, index);

    if (!removed) {
      await interaction.reply({ content: "❌ No warning found at that index.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("🗑️ Warning Removed")
      .setDescription(`Removed warning **#${index + 1}** from ${target}.\n**Was:** ${removed.reason}`)
      .setColor(0x2ECC71)
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `Actioned by ${interaction.user.tag} • Core SMP S3`, iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }

  // ── warnclear ─────────────────────────────────────────────────────────────
  if (name === "warnclear") {
    const target = interaction.options.getUser("user");
    const count = clearWarnings(target.id);

    const embed = new EmbedBuilder()
      .setTitle("🧹 Warnings Cleared")
      .setDescription(`Removed all **${count}** warning(s) from ${target}.`)
      .setColor(0x2ECC71)
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `Actioned by ${interaction.user.tag} • Core SMP S3`, iconURL: LOGO_URL })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [logoAttachment()] });
    return;
  }
}
