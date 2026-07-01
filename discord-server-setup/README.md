# Core SMP S3 — Discord server setup bot

One-shot script that configures a Discord server to match the reference
layout, renamed to **Core SMP S3** with a red role color theme.

## What it does

- Renames the target server to `Core SMP S3`
- Creates 7 roles (Owner, Co Owner, Administrator, In game admin,
  Official Core Smp member, New member, Server Booster) in red shades,
  with sensible permissions on the staff roles
- Creates a `Text channels` category with: `general`, `chat-1`, `chat-2`,
  `getting-new-members`, `youtube`, `rules-1`, `announcements`, `ign`
- Creates a `Voice channels` category with: `General`, `Chilling #1`
- Optionally wipes all existing channels/roles first (`WIPE_EXISTING=true`)

> Note: the "Server Booster" role here is just a cosmetic stand-in.
> Discord auto-manages the real boost role itself once someone boosts —
> it can't be created manually and wired to actual boosts.

**Important:** the bot can only delete roles ranked *below* its own role.
In Server Settings → Roles, drag the bot's role to the top of the list
(above any pre-existing roles like `Owners`) before wiping, or those will
be skipped.

## One-time setup

1. Create a Discord application + bot at
   https://discord.com/developers/applications, copy its **Bot Token**.
2. In Discord, create a new empty server (name doesn't matter, the script
   renames it) and invite the bot with **Administrator** permission.
3. Right-click the server icon -> **Copy Server ID** (enable Developer
   Mode in Discord settings if you don't see this option).
4. Copy `.env.example` to `.env` and fill in `BOT_TOKEN`, `GUILD_ID`, and
   `CLIENT_ID` (the application ID, same page as the bot token).
5. Install deps:

```bash
npm install
```

## Option A — run it yourself from a terminal

```bash
npm run setup
```

Set `WIPE_EXISTING=true` in `.env` first for a clean wipe + rebuild, or
`false` to just add anything missing.

## Option B — run it yourself from Discord with `/setup-server`

This is the "do it myself" path — no terminal needed after the one-time
setup below.

1. Register the slash command (one time, or whenever it changes):

   ```bash
   npm run deploy-commands
   ```

2. Start the bot process and leave it running (e.g. in a terminal, `pm2`,
   or a background service):

   ```bash
   npm run bot
   ```

3. In Discord, as an Administrator, run:

   ```
   /setup-server wipe:true
   ```

   (`wipe:false` to only add what's missing instead of deleting first.)

The bot replies privately with progress and a summary, including a list
of any roles/channels it couldn't delete (almost always the role
hierarchy issue above).
