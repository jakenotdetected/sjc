import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { WARNINGS_FILE } from "./config.js";

function load() {
  if (!existsSync(WARNINGS_FILE)) return {};
  return JSON.parse(readFileSync(WARNINGS_FILE, "utf8"));
}

function save(data) {
  writeFileSync(WARNINGS_FILE, JSON.stringify(data, null, 2));
}

export function addWarning(userId, { moderatorTag, reason }) {
  const data = load();
  data[userId] ??= [];
  data[userId].push({ moderatorTag, reason, at: new Date().toISOString() });
  save(data);
  return data[userId].length;
}

export function getWarnings(userId) {
  return load()[userId] ?? [];
}

export function removeWarning(userId, index) {
  const data = load();
  if (!data[userId]?.[index]) return null;
  const [removed] = data[userId].splice(index, 1);
  save(data);
  return removed;
}

export function clearWarnings(userId) {
  const data = load();
  const count = data[userId]?.length ?? 0;
  delete data[userId];
  save(data);
  return count;
}
