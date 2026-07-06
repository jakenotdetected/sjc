// Garage — incoming Job Broadcast Ping overlay.
// Drives the full chronological flow for a mechanic receiving a request:
//   State 1  ping        30s countdown + Golden Sand pulse
//   State 2  (same view) mini map centered on the breakdown + job info card
//   State 3  claiming    atomic transactional claim (race-condition safe)
//   State 4  navigating  turn-by-turn route + live price + pre-diagnosis chat

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS, RADIUS } from "./theme";
import { computeEstimate, formatLKR } from "./data";
import { claimJob } from "./mockBackend";
import { PillButton, PulseRing } from "./ui";
import MapView from "./Map";

// Mechanic's own position, derived as a short offset from the breakdown spot.
const mechanicNear = (c) => ({ lat: c.lat + 0.013, lng: c.lng + 0.011 });

const useDriver = Platform.OS !== "web";

const NAV_STEPS = [
  { d: "Head north on Mihintale Road", m: "400 m" },
  { d: "Turn right at the Clock Tower junction", m: "1.2 km" },
  { d: "Continue past the Sacred City", m: "650 m" },
  { d: "Arrive at customer — look for hazard lights", m: "150 m" },
];

export default function BroadcastJob({ job, mechanicId, onClose, onToast }) {
  // phase: "incoming" -> "claiming" -> "navigating"
  const [phase, setPhase] = useState("incoming");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [chatOpen, setChatOpen] = useState(false);

  const estimate = computeEstimate(job.distanceKm, job.breakdownCategory);

  // 30-second ticking countdown — auto-misses the job at zero.
  useEffect(() => {
    if (phase !== "incoming") return;
    if (secondsLeft <= 0) {
      onToast("Request expired — too slow", "danger");
      onClose();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, phase, onClose, onToast]);

  // Smooth fade/scale as the screen morphs between phases.
  const morph = useRef(new Animated.Value(1)).current;
  const morphTo = (next) => {
    Animated.timing(morph, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: useDriver,
    }).start(() => {
      setPhase(next);
      Animated.timing(morph, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: useDriver,
      }).start();
    });
  };

  // State 3 — atomic claim with race-condition handling.
  const onClaim = async () => {
    setPhase("claiming");
    const result = await claimJob(job.id, mechanicId);
    if (result.ok) {
      onToast("Job locked — routing you now", "info");
      morphTo("navigating");
    } else {
      onToast("Job already claimed by another mechanic", "danger");
      onClose();
    }
  };

  const morphStyle = {
    opacity: morph,
    transform: [
      { scale: morph.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
    ],
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.sheet, morphStyle]}>
        {phase === "navigating" ? (
          <NavigatingView
            job={job}
            estimate={estimate}
            steps={NAV_STEPS}
            onClose={onClose}
            chatOpen={chatOpen}
            setChatOpen={setChatOpen}
          />
        ) : (
          <IncomingView
            job={job}
            estimate={estimate}
            secondsLeft={secondsLeft}
            claiming={phase === "claiming"}
            onClaim={onClaim}
            onClose={onClose}
          />
        )}
      </Animated.View>
    </View>
  );
}

// ---- States 1 + 2: ping countdown, map, job info, claim pill ----
function IncomingView({ job, estimate, secondsLeft, claiming, onClaim, onClose }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
      <Text style={styles.eyebrow}>INCOMING REQUEST</Text>

      <View style={styles.timerWrap}>
        <PulseRing size={148} />
        <View style={styles.timerCircle}>
          <Text style={styles.timerNum}>{secondsLeft}</Text>
          <Text style={styles.timerUnit}>sec to claim</Text>
        </View>
      </View>

      <MapView customer={job.coords} height={170} interactive />

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer</Text>
          <Text style={styles.infoValue}>{job.customer}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vehicle</Text>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{job.vehicleType}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Breakdown</Text>
          <Text style={[styles.infoValue, { color: COLORS.danger }]}>{job.breakdown}</Text>
        </View>
        <View style={[styles.infoRow, styles.infoRowLast]}>
          <Text style={styles.infoLabel}>Distance</Text>
          <Text style={styles.infoValue}>{job.distanceKm.toFixed(1)} km away</Text>
        </View>
      </View>

      <PriceCard estimate={estimate} />

      <PillButton
        label={claiming ? "Locking job…" : "Claim this job"}
        onPress={onClaim}
        disabled={claiming}
        color={COLORS.canopy}
        style={{ marginTop: 4 }}
      />
      <Pressable onPress={onClose} style={styles.declineBtn} disabled={claiming}>
        <Text style={styles.declineText}>Decline</Text>
      </Pressable>
    </ScrollView>
  );
}

// ---- State 4: turn-by-turn navigation + slide-up chat ----
function NavigatingView({ job, estimate, steps, onClose, chatOpen, setChatOpen }) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
        <View style={styles.navHeader}>
          <View>
            <Text style={styles.eyebrow}>NAVIGATING TO</Text>
            <Text style={styles.navCustomer}>{job.customer}</Text>
            <Text style={styles.navPlace}>{job.place}</Text>
          </View>
          <View style={styles.etaPill}>
            <Text style={styles.etaValue}>{Math.round(job.distanceKm * 3 + 4)}</Text>
            <Text style={styles.etaUnit}>min</Text>
          </View>
        </View>

        <MapView customer={job.coords} mechanic={mechanicNear(job.coords)} height={190} navigating interactive />

        <View style={styles.stepsCard}>
          {steps.map((s, i) => (
            <View key={i} style={[styles.stepRow, i === steps.length - 1 && styles.stepRowLast]}>
              <View style={[styles.stepBullet, i === 0 && styles.stepBulletActive]}>
                <Text style={styles.stepBulletText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s.d}</Text>
              <Text style={styles.stepDist}>{s.m}</Text>
            </View>
          ))}
        </View>

        <PriceCard estimate={estimate} />

        <PillButton label="Message customer" onPress={() => setChatOpen(true)} color={COLORS.ocean} />
        <Pressable onPress={onClose} style={styles.declineBtn}>
          <Text style={styles.declineText}>End job</Text>
        </Pressable>
      </ScrollView>

      <PreDiagnosisChat job={job} open={chatOpen} onClose={() => setChatOpen(false)} />
    </View>
  );
}

// ---- Live pricing computation card (currency totals in Ocean Blue) ----
function PriceCard({ estimate }) {
  return (
    <View style={styles.priceCard}>
      <Text style={styles.priceTitle}>Live estimate</Text>
      <PriceRow label="Call-out base" value={formatLKR(estimate.calloutBase)} />
      <PriceRow label="Distance (matrix)" value={formatLKR(estimate.distanceFee)} />
      <PriceRow label="Repair base rate" value={formatLKR(estimate.repairBase)} />
      <View style={styles.priceDivider} />
      <View style={styles.priceTotalRow}>
        <Text style={styles.priceTotalLabel}>Estimated total</Text>
        <Text style={styles.priceTotalValue}>{formatLKR(estimate.total)}</Text>
      </View>
    </View>
  );
}

function PriceRow({ label, value }) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceRowLabel}>{label}</Text>
      <Text style={styles.priceRowValue}>{value}</Text>
    </View>
  );
}

// ---- Slide-up pre-diagnosis messaging (only after a confirmed booking) ----
const QUICK_REPLIES = [
  "On my way — 10 min",
  "Please keep hazard lights on",
  "Can you start the engine for me?",
  "Send me a photo of the issue",
];

function PreDiagnosisChat({ job, open, onClose }) {
  const slide = useRef(new Animated.Value(0)).current;
  const [messages, setMessages] = useState([
    { from: "customer", text: `Hi, my ${job.vehicleType.toLowerCase()} — ${job.breakdown.toLowerCase()}.` },
  ]);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: open ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: useDriver,
    }).start();
  }, [open, slide]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });
  const send = (text) => setMessages((m) => [...m, { from: "mechanic", text }]);

  return (
    <Animated.View
      pointerEvents={open ? "auto" : "none"}
      style={[styles.chatPanel, { transform: [{ translateY }] }]}
    >
      <View style={styles.chatHandle} />
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Pre-diagnosis chat</Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.chatClose}>Close</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.chatScroll} contentContainerStyle={{ paddingVertical: 8 }}>
        {messages.map((m, i) => (
          <View
            key={i}
            style={[styles.bubble, m.from === "mechanic" ? styles.bubbleMine : styles.bubbleTheirs]}
          >
            <Text style={[styles.bubbleText, m.from === "mechanic" && styles.bubbleTextMine]}>
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.quickLabel}>Quick replies</Text>
      <View style={styles.quickWrap}>
        {QUICK_REPLIES.map((q) => (
          <Pressable key={q} onPress={() => send(q)} style={styles.quickChip}>
            <Text style={styles.quickChipText}>{q}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30,56,89,0.45)",
    justifyContent: "flex-end",
    zIndex: 40,
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    maxHeight: "94%",
    overflow: "hidden",
  },
  sheetBody: { padding: 20, paddingBottom: 28, gap: 14 },

  eyebrow: { color: COLORS.tea, fontSize: 12, fontWeight: "800", letterSpacing: 1.4 },

  timerWrap: { alignItems: "center", justifyContent: "center", height: 168, marginTop: 4 },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    borderWidth: 4,
    borderColor: COLORS.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  timerNum: { color: COLORS.ocean, fontSize: 46, fontWeight: "900", lineHeight: 50 },
  timerUnit: { color: COLORS.tea, fontSize: 12, fontWeight: "700", marginTop: 2 },

  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { color: COLORS.tea, fontSize: 13, fontWeight: "700" },
  infoValue: { color: COLORS.ocean, fontSize: 15, fontWeight: "800" },
  tag: {
    backgroundColor: COLORS.oceanSoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { color: COLORS.ocean, fontWeight: "800", fontSize: 13 },

  declineBtn: { alignItems: "center", paddingVertical: 14 },
  declineText: { color: COLORS.tea, fontWeight: "800", fontSize: 15 },

  // pricing
  priceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  priceTitle: { color: COLORS.ocean, fontSize: 16, fontWeight: "900", marginBottom: 10 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  priceRowLabel: { color: COLORS.tea, fontSize: 14, fontWeight: "600" },
  priceRowValue: { color: COLORS.ocean, fontSize: 14, fontWeight: "700" },
  priceDivider: { height: 1, backgroundColor: COLORS.line, marginVertical: 10 },
  priceTotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceTotalLabel: { color: COLORS.ocean, fontSize: 15, fontWeight: "800" },
  priceTotalValue: { color: COLORS.ocean, fontSize: 22, fontWeight: "900" },

  // navigating
  navHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  navCustomer: { color: COLORS.ocean, fontSize: 24, fontWeight: "900", marginTop: 4 },
  navPlace: { color: COLORS.tea, fontSize: 13, fontWeight: "600", marginTop: 3, maxWidth: 230 },
  etaPill: {
    backgroundColor: COLORS.canopy,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: "center",
  },
  etaValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", lineHeight: 24 },
  etaUnit: { color: "#FFFFFF", fontSize: 11, fontWeight: "700", opacity: 0.85 },

  stepsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  stepRowLast: { borderBottomWidth: 0 },
  stepBullet: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.oceanSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepBulletActive: { backgroundColor: COLORS.sand },
  stepBulletText: { color: COLORS.ocean, fontWeight: "900", fontSize: 13 },
  stepText: { flex: 1, color: COLORS.ocean, fontSize: 14, fontWeight: "600" },
  stepDist: { color: COLORS.tea, fontSize: 12, fontWeight: "700", marginLeft: 8 },

  // chat
  chatPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
    height: 420,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 14,
  },
  chatHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.line,
    marginBottom: 12,
  },
  chatHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatTitle: { color: COLORS.ocean, fontSize: 17, fontWeight: "900" },
  chatClose: { color: COLORS.tea, fontWeight: "800" },
  chatScroll: { flex: 1, marginTop: 8 },
  bubble: { maxWidth: "82%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginVertical: 4 },
  bubbleTheirs: { alignSelf: "flex-start", backgroundColor: COLORS.oceanSoft },
  bubbleMine: { alignSelf: "flex-end", backgroundColor: COLORS.canopy },
  bubbleText: { color: COLORS.ocean, fontSize: 14, fontWeight: "600" },
  bubbleTextMine: { color: "#FFFFFF" },
  quickLabel: { color: COLORS.tea, fontSize: 12, fontWeight: "800", letterSpacing: 0.6, marginTop: 8 },
  quickWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  quickChip: {
    backgroundColor: COLORS.sandSoft,
    borderRadius: RADIUS.chip,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.sand,
  },
  quickChipText: { color: COLORS.ocean, fontWeight: "700", fontSize: 13 },
});
