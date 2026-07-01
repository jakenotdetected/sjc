// Role names must exactly match what's set up by the discord-server-setup
// project (../discord-server-setup/build-layout.js). If those roles get
// renamed there, update the matching names here too.

export const STAFF_ROLE_NAMES = [
  "👑 Owner",
  "🔱 Co Owner",
  "⚔️ Administrator",
  "🛡️ In game admin",
];

export const NEW_MEMBER_ROLE_NAME = "🌱 New member";

// Where new-member welcome messages get posted.
export const WELCOME_CHANNEL_NAME = "🆕│getting-new-members";

// Category + channel for the ticket "open a ticket" button panel.
export const TICKET_PANEL_CATEGORY_NAME = "💬 Community";
export const TICKET_PANEL_CHANNEL_NAME = "🎫│open-a-ticket";

// Category that individual ticket channels get created under.
export const TICKET_CATEGORY_NAME = "🎫 Tickets";

// Category + channel for the self-assignable role button panel.
export const SELF_ROLES_CATEGORY_NAME = "💬 Community";
export const SELF_ROLES_CHANNEL_NAME = "📋│self-roles";

// Self-assignable roles. The bot creates these roles automatically if
// they don't exist yet. Add more entries here to add more self-roles.
export const SELF_ROLES = [
  {
    roleName: "🔔 Notifications",
    emoji: "🔔",
    color: 0xDC143C,
    description: "Pinged for announcements & events",
  },
  {
    roleName: "🎮 LFG",
    emoji: "🎮",
    color: 0xFF4500,
    description: "Pinged when someone's looking for a group",
  },
];

// Staff log channel — ticket transcripts and auto-actions are posted here.
export const LOG_CHANNEL_NAME = "📋│staff-logs";

// Where /warn logs are stored on disk.
export const WARNINGS_FILE = new URL("./warnings.json", import.meta.url);
