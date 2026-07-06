// Garage — mechanic registration form + dashboard.
// The form captures the skills matrix in its categorized shape; the dashboard
// hosts the Go Online/Offline switch and the "incoming job" trigger.

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "./theme";
import {
  SPECIALTIES,
  SPECIALTY_CATEGORIES,
  VEHICLE_TYPES,
  flattenSpecialties,
} from "./data";
import { Chip, Field, OnlineSwitch, PillButton } from "./ui";

// ---- Registration form ----
export function MechanicForm({
  form,
  updateForm,
  vehicleTypes,
  toggleVehicle,
  specialties,
  toggleSpecialty,
  canSubmit,
  onSubmit,
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.h2}>Mechanic profile</Text>
      <Text style={styles.help}>
        Tell customers who you are and exactly what you can repair.
      </Text>

      <Field
        label="Full name"
        placeholder="Kasun Fernando"
        value={form.fullName}
        onChangeText={(t) => updateForm("fullName", t)}
      />
      <Field
        label="Home address (geocoded)"
        placeholder="Street, town, district"
        value={form.address}
        onChangeText={(t) => updateForm("address", t)}
        multiline
      />
      <Field
        label="Phone number"
        placeholder="077 123 4567"
        value={form.phone}
        onChangeText={(t) => updateForm("phone", t)}
        keyboardType="phone-pad"
      />

      <Text style={styles.groupLabel}>Vehicle types you handle</Text>
      <View style={styles.chipWrap}>
        {VEHICLE_TYPES.map((v) => (
          <Chip key={v} label={v} active={vehicleTypes.includes(v)} onPress={() => toggleVehicle(v)} />
        ))}
      </View>

      {SPECIALTY_CATEGORIES.map((category) => (
        <View key={category} style={{ marginTop: 4 }}>
          <Text style={styles.groupLabel}>{category}</Text>
          <View style={styles.chipWrap}>
            {SPECIALTIES[category].map((skill) => (
              <Chip
                key={skill}
                label={skill}
                active={specialties[category].includes(skill)}
                onPress={() => toggleSpecialty(category, skill)}
              />
            ))}
          </View>
        </View>
      ))}

      <PillButton
        label="Create mechanic panel"
        onPress={onSubmit}
        disabled={!canSubmit}
        color={COLORS.canopy}
        style={{ marginTop: 10 }}
      />
    </View>
  );
}

// ---- Dashboard ----
export function MechanicDashboard({
  profile,
  online,
  onToggleOnline,
  onSimulateJob,
  onEdit,
}) {
  const info = profile.mechanic_profile.personal_info;
  const skills = profile.mechanic_profile.skills_matrix;
  const allSkills = flattenSpecialties(skills.specialties);

  return (
    <View style={{ gap: 14 }}>
      {/* Online / offline control */}
      <View style={[styles.card, styles.onlineCard, online && styles.onlineCardActive]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.onlineState, online && { color: COLORS.canopy }]}>
            {online ? "You're online" : "You're offline"}
          </Text>
          <Text style={styles.onlineHint}>
            {online
              ? "Streaming live location · ready for job pings"
              : "Location tracking stopped to save battery"}
          </Text>
        </View>
        <OnlineSwitch online={online} onToggle={onToggleOnline} />
      </View>

      {/* Profile header */}
      <View style={[styles.card, styles.profileCard]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcome}>Good evening,</Text>
          <Text style={styles.name}>{info.full_name}</Text>
          <Text style={styles.meta}>{info.phone_number}</Text>
          <Text style={styles.meta}>{info.home_address}</Text>
        </View>
        <View style={styles.ratingPill}>
          <Text style={styles.ratingText}>4.8</Text>
          <Text style={styles.ratingStar}>★</Text>
        </View>
      </View>

      {/* Simulate incoming broadcast */}
      <View style={[styles.card, styles.broadcastCard]}>
        <Text style={styles.broadcastTitle}>Live job broadcast</Text>
        <Text style={styles.broadcastHint}>
          {online
            ? "A request can ping your device any moment. Tap to simulate one."
            : "Go online to start receiving job pings."}
        </Text>
        <PillButton
          label="Simulate incoming job"
          onPress={onSimulateJob}
          disabled={!online}
          color={COLORS.sand}
          style={{ marginTop: 14 }}
        />
      </View>

      {/* Skills summary */}
      <View style={[styles.card, styles.skillsCard]}>
        <View style={styles.rowBetween}>
          <Text style={styles.h3}>Your skills matrix</Text>
          <Pressable onPress={onEdit} hitSlop={10}>
            <Text style={styles.editLink}>Edit</Text>
          </Pressable>
        </View>
        <Text style={styles.meta}>{skills.vehicle_types.join(" · ")}</Text>
        <View style={styles.tagWrap}>
          {allSkills.map((s) => (
            <View key={s} style={styles.skillTag}>
              <Text style={styles.skillTagText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  h2: { color: COLORS.ocean, fontSize: 22, fontWeight: "900" },
  h3: { color: COLORS.ocean, fontSize: 17, fontWeight: "900" },
  help: { color: COLORS.tea, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  groupLabel: { color: COLORS.ocean, fontSize: 14, fontWeight: "800", marginTop: 12, marginBottom: 10 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 9 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  onlineCard: { flexDirection: "row", alignItems: "center" },
  onlineCardActive: { borderColor: COLORS.canopy, backgroundColor: COLORS.canopySoft },
  onlineState: { color: COLORS.tea, fontSize: 18, fontWeight: "900" },
  onlineHint: { color: COLORS.tea, fontSize: 12, fontWeight: "600", marginTop: 4, maxWidth: 230 },

  profileCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.ocean },
  welcome: { color: "#BcCBD8", fontSize: 13, fontWeight: "700" },
  name: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", marginTop: 4, maxWidth: 220 },
  meta: { color: "#AEB9C6", fontSize: 13, fontWeight: "600", marginTop: 4, maxWidth: 230 },
  ratingPill: {
    backgroundColor: COLORS.sand,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  ratingText: { color: COLORS.ocean, fontSize: 18, fontWeight: "900" },
  ratingStar: { color: COLORS.ocean, fontSize: 12 },

  broadcastCard: { backgroundColor: COLORS.sandSoft, borderColor: COLORS.sand },
  broadcastTitle: { color: COLORS.ocean, fontSize: 17, fontWeight: "900" },
  broadcastHint: { color: COLORS.tea, fontSize: 13, fontWeight: "600", marginTop: 5, lineHeight: 19 },

  skillsCard: {},
  editLink: { color: COLORS.canopy, fontWeight: "900" },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  skillTag: {
    backgroundColor: COLORS.teaSoft,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  skillTagText: { color: COLORS.tea, fontWeight: "700", fontSize: 12 },
});
