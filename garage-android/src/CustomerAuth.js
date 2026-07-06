// Garage — customer authentication (sign up + log in).
// Gates the customer portal. On success it calls onAuth(account). Uses the local
// customerStore (mock auth — see customerStore.js for the production caveat).

import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "./theme";
import { VEHICLE_TYPES } from "./data";
import { Chip, Field, PillButton } from "./ui";
import { findAccount, saveAccount } from "./customerStore";

export default function CustomerAuth({ onAuth, showToast }) {
  const [mode, setMode] = useState("signup"); // signup | login
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [vehicle, setVehicle] = useState("Car");
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const digits = (s) => s.replace(/\D/g, "");

  const submit = async () => {
    if (busy) return;
    const phone = digits(form.phone);

    if (mode === "signup") {
      if (form.fullName.trim().length < 3) return showToast("Enter your full name", "danger");
      if (phone.length < 9) return showToast("Enter a valid phone number", "danger");
      if (form.email && !form.email.includes("@")) return showToast("Enter a valid email", "danger");
      if (form.password.length < 4) return showToast("Password must be 4+ characters", "danger");
      if (form.password !== form.confirm) return showToast("Passwords don't match", "danger");

      setBusy(true);
      const existing = await findAccount(phone);
      if (existing) {
        setBusy(false);
        return showToast("Account already exists — log in instead", "danger");
      }
      const account = {
        fullName: form.fullName.trim(),
        phone,
        email: form.email.trim(),
        password: form.password, // local mock store only
        vehicle,
      };
      await saveAccount(account);
      setBusy(false);
      showToast(`Welcome, ${account.fullName.split(" ")[0]}!`, "info");
      onAuth(account);
      return;
    }

    // login
    if (phone.length < 9) return showToast("Enter your phone number", "danger");
    setBusy(true);
    const account = await findAccount(phone);
    setBusy(false);
    if (!account) return showToast("No account found for that number", "danger");
    if (account.password !== form.password) return showToast("Incorrect password", "danger");
    showToast(`Welcome back, ${account.fullName.split(" ")[0]}!`, "info");
    onAuth(account);
  };

  const isSignup = mode === "signup";

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
      <View style={styles.hero}>
        <View style={styles.heroLogo}>
          <Text style={styles.heroLogoText}>G</Text>
        </View>
        <Text style={styles.title}>{isSignup ? "Create your account" : "Welcome back"}</Text>
        <Text style={styles.sub}>
          {isSignup
            ? "Sign up to request roadside mechanics fast."
            : "Log in to request a mechanic."}
        </Text>
      </View>

      {/* mode toggle */}
      <View style={styles.toggle}>
        {[
          ["signup", "Sign up"],
          ["login", "Log in"],
        ].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setMode(key)}
            style={[styles.toggleBtn, mode === key && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, mode === key && styles.toggleTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        {isSignup && (
          <Field
            label="Full name"
            placeholder="Nimal Perera"
            value={form.fullName}
            onChangeText={(t) => set("fullName", t)}
          />
        )}
        <Field
          label="Phone number"
          placeholder="077 123 4567"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(t) => set("phone", t)}
        />
        {isSignup && (
          <Field
            label="Email (optional)"
            placeholder="you@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(t) => set("email", t)}
          />
        )}
        <Field
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          value={form.password}
          onChangeText={(t) => set("password", t)}
        />
        {isSignup && (
          <Field
            label="Confirm password"
            placeholder="••••••••"
            secureTextEntry
            value={form.confirm}
            onChangeText={(t) => set("confirm", t)}
          />
        )}

        {isSignup && (
          <>
            <Text style={styles.group}>Your main vehicle</Text>
            <View style={styles.wrap}>
              {VEHICLE_TYPES.map((v) => (
                <Chip key={v} label={v} active={vehicle === v} onPress={() => setVehicle(v)} />
              ))}
            </View>
          </>
        )}
      </View>

      <PillButton
        label={busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        onPress={submit}
        disabled={busy}
        color={COLORS.canopy}
      />

      <Pressable onPress={() => setMode(isSignup ? "login" : "signup")} style={styles.switchRow}>
        <Text style={styles.switchText}>
          {isSignup ? "Already have an account? " : "New to Garage? "}
          <Text style={styles.switchLink}>{isSignup ? "Log in" : "Create account"}</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 30, gap: 16 },
  hero: { alignItems: "center", marginTop: 6 },
  heroLogo: {
    width: 64, height: 64, borderRadius: 22, backgroundColor: COLORS.ocean,
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  heroLogoText: { color: COLORS.sand, fontSize: 32, fontWeight: "900" },
  title: { color: COLORS.ocean, fontSize: 24, fontWeight: "900", textAlign: "center" },
  sub: { color: COLORS.tea, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 6, maxWidth: 280 },

  toggle: { flexDirection: "row", backgroundColor: COLORS.oceanSoft, borderRadius: 18, padding: 5 },
  toggleBtn: { flex: 1, height: 44, borderRadius: RADIUS.chip, alignItems: "center", justifyContent: "center" },
  toggleBtnActive: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.ocean, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  toggleText: { color: COLORS.tea, fontWeight: "800" },
  toggleTextActive: { color: COLORS.ocean },

  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: 18,
    borderWidth: 1, borderColor: COLORS.line,
  },
  group: { color: COLORS.ocean, fontSize: 14, fontWeight: "800", marginTop: 4, marginBottom: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 9 },

  switchRow: { alignItems: "center", paddingVertical: 6 },
  switchText: { color: COLORS.tea, fontSize: 14, fontWeight: "600" },
  switchLink: { color: COLORS.canopy, fontWeight: "900" },
});
