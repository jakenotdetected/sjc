// Garage — minimal cross-platform key/value store.
// Mirrors AsyncStorage's async API. Uses localStorage on web so accounts/sessions
// survive a reload; falls back to in-memory on native (swap for @react-native-
// async-storage/async-storage in a device build for real persistence).

import { Platform } from "react-native";

const mem = new Map();
const hasLS =
  Platform.OS === "web" && typeof window !== "undefined" && !!window.localStorage;

export async function getItem(key) {
  try {
    return hasLS ? window.localStorage.getItem(key) : mem.has(key) ? mem.get(key) : null;
  } catch {
    return null;
  }
}

export async function setItem(key, value) {
  try {
    if (hasLS) window.localStorage.setItem(key, value);
    else mem.set(key, value);
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export async function removeItem(key) {
  try {
    if (hasLS) window.localStorage.removeItem(key);
    else mem.delete(key);
  } catch {
    /* ignore */
  }
}
