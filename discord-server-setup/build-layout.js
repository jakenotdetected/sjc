import { PermissionsBitField, ChannelType } from "discord.js";

export const SERVER_NAME = "Core SMP S3";

// Red-themed recolor of the roles visible in the reference screenshot.
// Order matters: first entry ends up highest in the role list (closest to top).
export const ROLES = [
  {
    name: "👑 Owner",
    color: 0x8B0000, // dark red
    hoist: true,
    permissions: [PermissionsBitField.Flags.Administrator],
  },
  {
    name: "🔱 Co Owner",
    color: 0xB22222, // firebrick
    hoist: true,
    permissions: [PermissionsBitField.Flags.Administrator],
  },
  {
    name: "⚔️ Administrator",
    color: 0xDC143C, // crimson
    hoist: true,
    permissions: [PermissionsBitField.Flags.Administrator],
  },
  {
    name: "🛡️ In game admin",
    color: 0xFF4500, // orange-red
    hoist: true,
    permissions: [
      PermissionsBitField.Flags.KickMembers,
      PermissionsBitField.Flags.BanMembers,
      PermissionsBitField.Flags.ManageMessages,
      PermissionsBitField.Flags.ModerateMembers,
      PermissionsBitField.Flags.MuteMembers,
      PermissionsBitField.Flags.DeafenMembers,
      PermissionsBitField.Flags.MoveMembers,
    ],
  },
  {
    name: "🔥 Official Core Smp member",
    color: 0xFF6B6B, // soft red
    hoist: true,
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.AddReactions,
      PermissionsBitField.Flags.Connect,
      PermissionsBitField.Flags.Speak,
      PermissionsBitField.Flags.UseVAD,
      PermissionsBitField.Flags.ChangeNickname,
    ],
  },
  {
    name: "🌱 New member",
    color: 0xFFA07A, // light salmon
    hoist: true,
    permissions: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.AddReactions,
      PermissionsBitField.Flags.Connect,
      PermissionsBitField.Flags.Speak,
      PermissionsBitField.Flags.UseVAD,
    ],
  },
  // No custom "Server Booster" entry: Discord auto-creates and manages that
  // role itself (it already exists on this server even at 0 boosts), and a
  // second hand-made role with the same name just causes a confusing
  // duplicate in the role list with no real boost link.
];

// Cosmetic perks bolted onto Discord's own managed "Server Booster" role,
// since we don't create a duplicate of our own.
const BOOSTER_PERKS = [
  PermissionsBitField.Flags.UseExternalEmojis,
  PermissionsBitField.Flags.UseExternalStickers,
];

// Staff roles that count as "Administrator+" for channel-lockdown purposes.
const ADMIN_TIER_ROLES = ["👑 Owner", "🔱 Co Owner", "⚔️ Administrator"];
// Staff roles allowed into staff-only channels (admin tier + in-game admins).
const STAFF_ROLES = [...ADMIN_TIER_ROLES, "🛡️ In game admin"];

// Channels where @everyone can read but only admin-tier roles can post.
const ANNOUNCE_ONLY_CHANNELS = ["📢│announcements", "📜│rules"];
// Channels (text or voice) hidden from @everyone, visible only to staff.
const STAFF_ONLY_CHANNELS = ["⚠️│reports", "🎙️│Staff VC"];

// Custom template: multiple themed categories instead of one flat list.
export const CATEGORIES = [
  {
    name: "📌 Welcome",
    textChannels: ["📢│announcements", "📜│rules", "🆕│getting-new-members"],
  },
  {
    name: "💬 Community",
    textChannels: ["💬│general", "🎮│ign", "📸│media", "🤖│bot-commands"],
  },
  {
    name: "⚔️ SMP",
    textChannels: ["🗺️│builds", "🤝│trades", "⚠️│reports"],
  },
  {
    name: "📺 Content",
    textChannels: ["📺│youtube"],
  },
  {
    name: "🔊 Voice",
    voiceChannels: ["🔊│Voice 1", "🔊│Voice 2", "🎙️│Staff VC"],
  },
];

/**
 * Wipes (optionally) and rebuilds the server layout.
 * @param {import("discord.js").Guild} guild
 * @param {{ wipe?: boolean, log?: (msg: string) => void }} opts
 */
export async function buildLayout(guild, { wipe = true, log = console.log } = {}) {
  const skipped = [];

  log(`Renaming server to "${SERVER_NAME}"...`);
  await guild.setName(SERVER_NAME);

  if (wipe) {
    log("Deleting existing channels and roles...");

    const channels = await guild.channels.fetch();
    for (const channel of channels.values()) {
      await channel.delete().catch((err) => {
        const msg = `could not delete channel ${channel?.name}: ${err.message}`;
        log(`  ${msg}`);
        skipped.push(msg);
      });
    }

    const roles = await guild.roles.fetch();
    for (const role of roles.values()) {
      if (role.name === "@everyone" || role.managed) continue;
      await role.delete().catch((err) => {
        const msg = `could not delete role ${role.name}: ${err.message}`;
        log(`  ${msg}`);
        skipped.push(msg);
      });
    }
  }

  log("Creating roles...");
  for (const roleDef of ROLES) {
    const existing = guild.roles.cache.find((r) => r.name === roleDef.name);
    if (existing) {
      log(`  role "${roleDef.name}" already exists, skipping`);
      continue;
    }
    await guild.roles.create({
      name: roleDef.name,
      color: roleDef.color,
      hoist: roleDef.hoist,
      permissions: roleDef.permissions,
    });
    log(`  created role "${roleDef.name}"`);
  }

  const boosterRole = guild.roles.cache.find((r) => r.managed && r.tags?.premiumSubscriberRole);
  if (boosterRole) {
    await boosterRole.setPermissions(
      boosterRole.permissions.add(BOOSTER_PERKS)
    );
    log(`  added cosmetic perks to Discord's managed "${boosterRole.name}" role`);
  }

  log("Creating categories + channels...");

  const roles = await guild.roles.fetch();
  const roleByName = (name) => roles.find((r) => r.name === name);

  function overwritesFor(channelName) {
    if (ANNOUNCE_ONLY_CHANNELS.includes(channelName)) {
      const overwrites = [
        {
          id: guild.roles.everyone.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
          deny: [PermissionsBitField.Flags.SendMessages],
        },
      ];
      for (const roleName of ADMIN_TIER_ROLES) {
        const role = roleByName(roleName);
        if (role) {
          overwrites.push({
            id: role.id,
            allow: [PermissionsBitField.Flags.SendMessages],
          });
        }
      }
      return overwrites;
    }

    if (STAFF_ONLY_CHANNELS.includes(channelName)) {
      const overwrites = [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      ];
      for (const roleName of STAFF_ROLES) {
        const role = roleByName(roleName);
        if (role) {
          overwrites.push({
            id: role.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.Connect,
              PermissionsBitField.Flags.Speak,
            ],
          });
        }
      }
      return overwrites;
    }

    return undefined; // open to everyone, no overwrites
  }

  for (const categoryDef of CATEGORIES) {
    const existing = (await guild.channels.fetch()).find(
      (c) => c.type === ChannelType.GuildCategory && c.name === categoryDef.name
    );
    const category =
      existing ??
      (await guild.channels.create({
        name: categoryDef.name,
        type: ChannelType.GuildCategory,
      }));
    if (!existing) log(`  created category "${categoryDef.name}"`);

    const channelsHere = await guild.channels.fetch();

    for (const name of categoryDef.textChannels ?? []) {
      const permissionOverwrites = overwritesFor(name);
      const exists = channelsHere.find(
        (c) => c.type === ChannelType.GuildText && c.name === name && c.parentId === category.id
      );
      if (exists) {
        if (permissionOverwrites) {
          await exists.permissionOverwrites.set(permissionOverwrites);
          log(`  updated permissions on existing text channel ${name}`);
        }
        log(`  text channel ${name} already exists, skipping creation`);
        continue;
      }
      await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites,
      });
      log(`  created text channel ${name}`);
    }

    for (const name of categoryDef.voiceChannels ?? []) {
      const permissionOverwrites = overwritesFor(name);
      const exists = channelsHere.find(
        (c) => c.type === ChannelType.GuildVoice && c.name === name && c.parentId === category.id
      );
      if (exists) {
        if (permissionOverwrites) {
          await exists.permissionOverwrites.set(permissionOverwrites);
          log(`  updated permissions on existing voice channel ${name}`);
        }
        log(`  voice channel ${name} already exists, skipping creation`);
        continue;
      }
      await guild.channels.create({
        name,
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites,
      });
      log(`  created voice channel ${name}`);
    }
  }

  log("Done! Server setup complete.");
  return { skipped };
}
