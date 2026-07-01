import { AttachmentBuilder } from "discord.js";
import { fileURLToPath } from "node:url";

const LOGO_PATH = fileURLToPath(new URL("./assets/logo.png", import.meta.url));
const LOGO_ATTACHMENT_NAME = "logo.png";
export const LOGO_URL = `attachment://${LOGO_ATTACHMENT_NAME}`;

export function logoAttachment() {
  return new AttachmentBuilder(LOGO_PATH, { name: LOGO_ATTACHMENT_NAME });
}
