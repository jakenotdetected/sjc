import {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import {
  STAFF_ROLE_NAMES,
  TICKET_PANEL_CATEGORY_NAME,
  TICKET_PANEL_CHANNEL_NAME,
  TICKET_CATEGORY_NAME,
  LOG_CHANNEL_NAME,
} from "./config.js";
import { logoAttachment, LOGO_URL } from "./branding.js";

function roleByName(guild, name) {
  return guild.roles.cache.find((r) => r.name === name);
}

export async function ensureTicketPanel(guild, log = console.log) {
  const channels = await guild.channels.fetch();

  let category = channels.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === TICKET_PANEL_CATEGORY_NAME
  );
  if (!category) {
    category = await guild.channels.create({
      name: TICKET_PANEL_CATEGORY_NAME,
      type: ChannelType.GuildCategory,
    });
  }

  let panelChannel = channels.find(
    (c) => c.type === ChannelType.GuildText && c.name === TICKET_PANEL_CHANNEL_NAME
  );
  if (panelChannel) return;

  panelChannel = await guild.channels.create({
    name: TICKET_PANEL_CHANNEL_NAME,
    type: ChannelType.GuildText,
    parent: category.id,
  });

  const rulesChannel = channels.find(
    (c) => c.type === ChannelType.GuildText && c.name.toLowerCase().includes("rules")
  );
  const rulesLine = rulesChannel
    ? `🔹 Check ${rulesChannel} first — your answer might already be there\n`
    : "";

  const embed = new EmbedBuilder()
    .setTitle("🎫 Support Tickets")
    .setDescription(
      "Got a question, an issue, or need to report something?\n" +
        "Click **🎟️ Open Ticket** below and a private channel will be created just for you and staff.\n\n" +
        "**📋 Before you open one:**\n" +
        rulesLine +
        "🔹 Be ready to explain your issue clearly\n" +
        "🔹 One ticket at a time — staff will get to you fast 🚀"
    )
    .addFields(
      { name: "⏱️ Response time", value: "Usually within a few hours", inline: true },
      { name: "🔒 Privacy", value: "Only you + staff can see it", inline: true }
    )
    .setColor(0xDC143C)
    .setThumbnail(LOGO_URL)
    .setFooter({ text: "Core SMP S3 • Support", iconURL: LOGO_URL })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("Open Ticket")
      .setEmoji("🎟️")
      .setStyle(ButtonStyle.Danger)
  );

  await panelChannel.send({ embeds: [embed], components: [row], files: [logoAttachment()] });
  log(`  created ticket panel in ${TICKET_PANEL_CHANNEL_NAME}`);
}

export async function openTicket(interaction) {
  const guild = interaction.guild;
  const existing = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.topic === `ticket-owner:${interaction.user.id}`
  );
  if (existing) {
    await interaction.reply({
      content: `You already have an open ticket: ${existing}`,
      ephemeral: true,
    });
    return;
  }

  let category = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === TICKET_CATEGORY_NAME
  );
  if (!category) {
    category = await guild.channels.create({
      name: TICKET_CATEGORY_NAME,
      type: ChannelType.GuildCategory,
    });
  }

  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
    {
      id: interaction.user.id,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
      ],
    },
  ];
  for (const roleName of STAFF_ROLE_NAMES) {
    const role = roleByName(guild, roleName);
    if (role) {
      overwrites.push({
        id: role.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      });
    }
  }

  const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "user";
  const ticketChannel = await guild.channels.create({
    name: `ticket-${safeName}`,
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `ticket-owner:${interaction.user.id}`,
    permissionOverwrites: overwrites,
  });

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Close Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Secondary)
  );

  const welcomeEmbed = new EmbedBuilder()
    .setTitle("🎟️ Ticket Opened")
    .setDescription(
      `Hey ${interaction.user}, thanks for reaching out! 👋\n\n` +
        "Staff have been notified and will jump in shortly.\n" +
        "Take your time explaining the issue — screenshots help a lot 📸\n\n" +
        "Press **🔒 Close Ticket** below once it's resolved."
    )
    .setColor(0xDC143C)
    .setThumbnail(LOGO_URL)
    .setFooter({ text: "Core SMP S3 • Support", iconURL: LOGO_URL })
    .setTimestamp();

  const staffPing = STAFF_ROLE_NAMES.map((name) => roleByName(guild, name))
    .filter(Boolean)
    .map((r) => `<@&${r.id}>`)
    .join(" ");

  await ticketChannel.send({
    content: `${interaction.user}${staffPing ? ` ${staffPing}` : ""}`,
    embeds: [welcomeEmbed],
    components: [closeRow],
    files: [logoAttachment()],
  });

  await interaction.reply({
    content: `✅ Ticket opened: ${ticketChannel}`,
    ephemeral: true,
  });
}

export async function closeTicket(interaction) {
  const closingEmbed = new EmbedBuilder()
    .setTitle("🔒 Ticket Closing")
    .setDescription(`Closed by ${interaction.user}. This channel will be deleted in **5 seconds**.`)
    .setColor(0x8B0000)
    .setTimestamp();

  await interaction.reply({ embeds: [closingEmbed] });

  // Build transcript
  const messages = await interaction.channel.messages.fetch({ limit: 100 });
  const lines = [...messages.values()]
    .reverse()
    .filter((m) => !m.author.bot || m.content)
    .map((m) => `[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.content || "[embed/attachment]"}`)
    .join("\n");

  // Post transcript to log channel
  const logChannel = interaction.guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.name === LOG_CHANNEL_NAME
  );
  if (logChannel) {
    const ownerId = interaction.channel.topic?.match(/ticket-owner:(\d+)/)?.[1];
    const ownerTag = ownerId ? (await interaction.client.users.fetch(ownerId).catch(() => null))?.tag ?? "Unknown" : "Unknown";

    const transcriptEmbed = new EmbedBuilder()
      .setTitle("📋 Ticket Closed — Transcript")
      .addFields(
        { name: "🎫 Channel", value: interaction.channel.name, inline: true },
        { name: "🙋 Opened by", value: ownerTag, inline: true },
        { name: "🔒 Closed by", value: interaction.user.tag, inline: true }
      )
      .setColor(0x8B0000)
      .setFooter({ text: "Core SMP S3 • Staff Logs", iconURL: LOGO_URL })
      .setTimestamp();

    const transcriptText = lines.length > 3800
      ? lines.slice(0, 3800) + "\n… (truncated)"
      : lines || "No messages.";

    await logChannel.send({
      embeds: [transcriptEmbed],
      files: [logoAttachment()],
    });
    await logChannel.send({ content: `\`\`\`\n${transcriptText}\n\`\`\`` });
  }

  setTimeout(() => {
    interaction.channel.delete().catch(() => {});
  }, 5000);
}
