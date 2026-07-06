// Garage — customer account store (LOCAL / MOCK auth, prototype only).
// Accounts + the active session live in local storage. This is NOT production
// auth — there's no server and passwords are stored locally. Replace with a real
// auth backend (e.g. phone OTP or hashed credentials over HTTPS) before shipping.

import { getItem, removeItem, setItem } from "./storage";

const ACCOUNTS = "garage_customer_accounts"; // { [phone]: account }
const SESSION = "garage_customer_session"; // phone of the logged-in customer

export async function loadAccounts() {
  const raw = await getItem(ACCOUNTS);
  return raw ? JSON.parse(raw) : {};
}

export async function findAccount(phone) {
  const all = await loadAccounts();
  return all[phone] || null;
}

// Persist a new/updated account keyed by phone number.
export async function saveAccount(account) {
  const all = await loadAccounts();
  all[account.phone] = account;
  await setItem(ACCOUNTS, JSON.stringify(all));
  return account;
}

export async function setSession(phone) {
  await setItem(SESSION, phone);
}

export async function getSession() {
  return getItem(SESSION);
}

export async function clearSession() {
  await removeItem(SESSION);
}
