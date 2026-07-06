// Garage — customer portal.
// Full flow: build a breakdown request on a real map -> search nearby mechanics
// -> live-track the assigned mechanic moving toward you, with pricing + chat.

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import {
  SPECIALTIES,
  SPECIALTY_CATEGORIES,
  VEHICLE_TYPES,
  computeEstimate,
  formatLKR,
  haversineKm,
} from "./data";
import { Chip, PillButton, PulseRing } from "./ui";
import MapView from "./Map";
import CustomerAuth from "./CustomerAuth";
import { clearSession, findAccount, getSession, setSession } from "./customerStore";

const useDriver = Platform.OS !== "web";

// Customer's breakdown spot (central Anuradhapura) — movable by tapping the map.
const HOME = { lat: 8.3114, lng: 80.4037 };

const MECHANICS = [
  { name: "Kasun Fernando", rating: 4.8, vehicle: "Car · Three-Wheeler", skill: "Engine & Brakes", start: { lat: 8.3305, lng: 80.4175 } },
  { name: "Ruwan Silva", rating: 4.9, vehicle: "Motorbike · Car", skill: "Electrical & AC", start: { lat: 8.2965, lng: 80.3925 } },
];

// Auth gate: show sign up / log in until a customer account session exists.
export default function CustomerPanel({ showToast }) {
  const [account, setAccount] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const phone = await getSession();
      if (phone) {
        const acc = await findAccount(phone);
        if (alive && acc) setAccount(acc);
      }
      if (alive) setAuthReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!authReady) return <View style={{ flex: 1 }} />;

  if (!account) {
    return (
      <CustomerAuth
        showToast={showToast}
        onAuth={async (acc) => {
          await setSession(acc.phone);
          setAccount(acc);
        }}
      />
    );
  }

  return (
    <CustomerHome
      account={account}
      showToast={showToast}
      onLogout={async () => {
        await clearSession();
        setAccount(null);
      }}
    />
  );
}

const MOCK_GARAGES = [
  { id: 'g1', name: 'Anuradhapura Auto Care', lat: 8.3205, lng: 80.4125, rating: 4.9, reviews: 72, spec: 'Accessories & Brakes' },
  { id: 'g2', name: 'Royal Garage & Repairs', lat: 8.2985, lng: 80.3955, rating: 4.8, reviews: 110, spec: 'AC & Overhauls' },
  { id: 'g3', name: 'Lanka Super Mechanics', lat: 8.3395, lng: 80.4215, rating: 4.7, reviews: 45, spec: 'Electrical & Engine' }
];

const playAudioEffect = (type) => {
  if (Platform.OS !== "web" && typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (type === 'ping') {
      for (let i = 0; i < 2; i++) {
        const delay = i * 0.22;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
        gain.connect(ctx.destination);
        osc.connect(gain);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.18);
      }
    } else if (type === 'success') {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.connect(ctx.destination);
        osc.connect(gain);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.22);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.22);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.connect(ctx.destination);
      osc.connect(gain);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch (e) {}
};

function CustomerHome({ account, showToast, onLogout }) {
  const [screen, setScreen] = useState("request"); // request | tracking | selfDrive
  const [searching, setSearching] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const [customer, setCustomer] = useState(HOME);
  const [vehicle, setVehicle] = useState(account.vehicle || "Car");
  const [category, setCategory] = useState("Engine");
  const [issue, setIssue] = useState("Tune-ups");
  const [selectedGarage, setSelectedGarage] = useState(MOCK_GARAGES[0]);

  const [mechIndex, setMechIndex] = useState(0);
  const [mechCoords, setMechCoords] = useState(null);
  const [progress, setProgress] = useState(0);

  const mechanic = MECHANICS[mechIndex];

  // Distance: customer to selected garage
  const distanceKm = useMemo(() => {
    return Math.max(0.6, selectedGarage.dist || haversineKm(customer, { lat: selectedGarage.lat, lng: selectedGarage.lng }));
  }, [customer, selectedGarage]);

  const estimate = useMemo(
    () => computeEstimate(distanceKm, category),
    [distanceKm, category]
  );

  const canRequest = vehicle && category && issue;

  // ---- Request -> search -> assign ----
  const requestMechanic = () => {
    playAudioEffect('click');
    setSearching(true);
    // Simulate broadcasting to garages
    setTimeout(() => {
      playAudioEffect('ping');
    }, 200);

    setTimeout(() => {
      const idx = Math.floor(Math.random() * MECHANICS.length);
      setMechIndex(idx);
      setMechCoords(MECHANICS[idx].start);
      setProgress(0);
      setSearching(false);
      setScreen("tracking");
      playAudioEffect('success');
      showToast(`${MECHANICS[idx].name} is on the way`, "info");
    }, 2600);
  };

  // ---- Live mechanic movement toward the customer ----
  useEffect(() => {
    if (screen !== "tracking") return;
    const start = MECHANICS[mechIndex].start;
    const end = customer;
    const STEPS = 44;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      const t = Math.min(i / STEPS, 1);
      setMechCoords({
        lat: start.lat + (end.lat - start.lat) * t,
        lng: start.lng + (end.lng - start.lng) * t,
      });
      setProgress(t);
      if (t >= 1) {
        playAudioEffect('success');
        clearInterval(id);
      }
    }, 230);
    return () => clearInterval(id);
  }, [screen, mechIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancel = () => {
    playAudioEffect('click');
    setScreen("request");
    setMechCoords(null);
    setProgress(0);
    setChatOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <AccountBar name={account.fullName} onLogout={onLogout} />
      {screen === "request" ? (
        <RequestScreen
          name={account.fullName}
          vehicle={vehicle}
          setVehicle={(v) => { playAudioEffect('click'); setVehicle(v); }}
          category={category}
          setCategory={(c) => {
            playAudioEffect('click');
            setCategory(c);
            setIssue(SPECIALTIES[c][0]);
          }}
          issue={issue}
          setIssue={(i) => { playAudioEffect('click'); setIssue(i); }}
          selectedGarage={selectedGarage}
          setSelectedGarage={(g) => { playAudioEffect('click'); setSelectedGarage(g); }}
          estimate={estimate}
          canRequest={canRequest}
          onRequest={requestMechanic}
          onSelfDrive={() => {
            playAudioEffect('click');
            setScreen("selfDrive");
          }}
        />
      ) : screen === "selfDrive" ? (
        <SelfDriveScreen
          garage={selectedGarage}
          customer={customer}
          onEnd={() => {
            playAudioEffect('click');
            setScreen("request");
          }}
        />
      ) : (
        <TrackingScreen
          customer={customer}
          mechCoords={mechCoords}
          mechanic={mechanic}
          progress={progress}
          estimate={estimate}
          distanceKm={distanceKm}
          vehicle={vehicle}
          category={category}
          issue={issue}
          onMessage={() => { playAudioEffect('click'); setChatOpen(true); }}
          onCancel={cancel}
        />
      )}

      {searching && <SearchingOverlay onCancel={() => { playAudioEffect('click'); setSearching(false); }} />}
      <CustomerChat
        open={chatOpen}
        onClose={() => { playAudioEffect('click'); setChatOpen(false); }}
        mechanic={mechanic}
      />
    </View>
  );
}

// ---- Account bar (greeting + logout), shown across customer screens ----
function AccountBar({ name, onLogout }) {
  const initial = (name || "?").trim()[0]?.toUpperCase() || "?";
  return (
    <View style={styles.acctBar}>
      <View style={styles.acctAvatar}>
        <Text style={styles.acctAvatarText}>{initial}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.acctHint}>Signed in as</Text>
        <Text style={styles.acctName} numberOfLines={1}>{name}</Text>
      </View>
      <Pressable onPress={onLogout} hitSlop={10} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

// ---- Screen 1: build the request ----
function RequestScreen({
  name, vehicle, setVehicle, category, setCategory,
  issue, setIssue, selectedGarage, setSelectedGarage,
  estimate, canRequest, onRequest, onSelfDrive,
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
      <Text style={styles.h1}>Hi {name.split(" ")[0]} 👋</Text>
      <Text style={styles.sub}>Need a mechanic? Select your vehicle details and issue to find nearby garages.</Text>

      <Text style={styles.group}>Your vehicle</Text>
      <View style={styles.wrap}>
        {VEHICLE_TYPES.map((v) => (
          <Chip key={v} label={v} active={vehicle === v} onPress={() => setVehicle(v)} />
        ))}
      </View>

      <Text style={styles.group}>What's the problem?</Text>
      <View style={styles.wrap}>
        {SPECIALTY_CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>
      <View style={[styles.wrap, { marginTop: 4 }]}>
        {SPECIALTIES[category].map((s) => (
          <Chip key={s} label={s} active={issue === s} onPress={() => setIssue(s)} />
        ))}
      </View>

      <Text style={styles.group}>Nearby Garages</Text>
      <View style={{ gap: 10 }}>
        {MOCK_GARAGES.map((g) => {
          const isActive = selectedGarage.id === g.id;
          return (
            <Pressable
              key={g.id}
              onPress={() => setSelectedGarage(g)}
              style={({ pressed }) => [
                {
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.card,
                  padding: 12,
                  borderWidth: 1.5,
                  borderColor: isActive ? COLORS.canopy : COLORS.line,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  opacity: pressed ? 0.95 : 1
                },
                isActive && { backgroundColor: COLORS.canopySoft }
              ]}
            >
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.ocean, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: COLORS.sand, fontWeight: "800", fontSize: 16 }}>{g.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.ocean, fontWeight: "800", fontSize: 14 }}>{g.name}</Text>
                <Text style={{ color: COLORS.tea, fontWeight: "600", fontSize: 11, marginTop: 2 }}>{g.spec} · ~{g.dist.toFixed(1)} km away</Text>
                <View style={{ flexDirection: "row", gap: 4, marginTop: 4, alignItems: "center" }}>
                  <View style={{ backgroundColor: COLORS.sand, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 }}>
                    <Text style={{ color: COLORS.ocean, fontWeight: "800", fontSize: 10 }}>{g.rating} ★</Text>
                  </View>
                  <Text style={{ color: COLORS.textMuted, fontSize: 10, fontWeight: "600" }}>({g.reviews} reviews)</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <PriceCard estimate={estimate} />

      {issue === "ACC" ? (
        <PillButton
          label="Get Directions (Self-Drive)"
          onPress={onSelfDrive}
          disabled={!canRequest}
          color={COLORS.ocean}
          style={{ marginTop: 4 }}
        />
      ) : (
        <PillButton
          label="Request Rescue"
          onPress={onRequest}
          disabled={!canRequest}
          color={COLORS.canopy}
          style={{ marginTop: 4 }}
        />
      )}
    </ScrollView>
  );
}

// ---- Screen: Self Drive Directions Path ----
function SelfDriveScreen({ garage, customer, onEnd }) {
  const steps = [
    { text: "Head south-east toward town centre", dist: "200 m" },
    { text: "Turn right at the first cross street", dist: "600 m" },
    { text: "Destination is on your left", dist: "100 m" }
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
      <View style={styles.trackHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>SELF-DRIVE NAVIGATION</Text>
          <Text style={styles.h1}>Drive to {garage.name}</Text>
        </View>
        <View style={[styles.etaPill, { backgroundColor: COLORS.ocean }]}>
          <Text style={styles.etaVal}>{Math.round(garage.dist * 3.5)}</Text>
          <Text style={styles.etaUnit}>min</Text>
        </View>
      </View>

      <MapView
        customer={customer}
        mechanic={{ lat: garage.lat, lng: garage.lng }}
        height={200}
        navigating={true}
        interactive={true}
      />

      <View style={styles.steps}>
        {steps.map((s, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepDot, styles.stepDotOn]} />
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[styles.stepLabel, styles.stepLabelOn, { flex: 1 }]}>{s.text}</Text>
              <Text style={{ color: COLORS.tea, fontSize: 12, fontWeight: "700" }}>{s.dist}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actionRow}>
        <PillButton label="Call Garage" onPress={() => {}} color={COLORS.ocean} style={{ flex: 1 }} />
        <PillButton label="Arrived / End" onPress={onEnd} color={COLORS.danger} style={{ flex: 1 }} />
      </View>
    </ScrollView>
  );
}

// ---- Screen 2: live tracking ----
const STATUS = ["Request accepted", "Mechanic en route", "Almost there", "Arrived"];

function TrackingScreen({
  customer, mechCoords, mechanic, progress, estimate, distanceKm,
  vehicle, category, issue, onMessage, onCancel,
}) {
  const statusIndex = progress >= 1 ? 3 : progress > 0.7 ? 2 : progress > 0.04 ? 1 : 0;
  const etaMin = Math.max(0, Math.round((distanceKm * 3 + 2) * (1 - progress)));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
      <View style={styles.trackHead}>
        <View>
          <Text style={styles.eyebrow}>{STATUS[statusIndex].toUpperCase()}</Text>
          <Text style={styles.h1}>{statusIndex === 3 ? "Mechanic arrived" : "On the way to you"}</Text>
        </View>
        <View style={styles.etaPill}>
          <Text style={styles.etaVal}>{statusIndex === 3 ? "0" : etaMin}</Text>
          <Text style={styles.etaUnit}>min</Text>
        </View>
      </View>

      <MapView customer={customer} mechanic={mechCoords} height={230} navigating interactive />

      {/* progress steps */}
      <View style={styles.steps}>
        {STATUS.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= statusIndex && styles.stepDotOn]} />
            <Text style={[styles.stepLabel, i <= statusIndex && styles.stepLabelOn]}>{s}</Text>
          </View>
        ))}
      </View>

      {/* mechanic card */}
      <View style={styles.mechCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{mechanic.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.mechName}>{mechanic.name}</Text>
          <Text style={styles.mechMeta}>{mechanic.vehicle}</Text>
          <Text style={styles.mechMeta}>{mechanic.skill}</Text>
        </View>
        <View style={styles.ratingPill}>
          <Text style={styles.ratingText}>{mechanic.rating}</Text>
          <Text style={styles.ratingStar}>★</Text>
        </View>
      </View>

      <View style={styles.jobLine}>
        <Text style={styles.jobLineText}>{vehicle} · {category} — {issue}</Text>
      </View>

      <PriceCard estimate={estimate} />

      <View style={styles.actionRow}>
        <PillButton label="Message" onPress={onMessage} color={COLORS.ocean} style={{ flex: 1 }} />
        <PillButton label="Call" onPress={() => {}} color={COLORS.canopy} style={{ flex: 1 }} />
      </View>
      <Pressable onPress={onCancel} style={styles.cancelBtn}>
        <Text style={styles.cancelText}>Cancel request</Text>
      </Pressable>
    </ScrollView>
  );
}

// ---- Searching overlay (radar) ----
function SearchingOverlay({ onCancel }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: useDriver })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.searchOverlay}>
      <View style={styles.radarWrap}>
        <PulseRing size={170} />
        <PulseRing size={120} />
        <Animated.View style={[styles.radarSweep, { transform: [{ rotate }] }]} />
        <View style={styles.radarCore}>
          <Text style={styles.radarG}>G</Text>
        </View>
      </View>
      <Text style={styles.searchTitle}>Finding nearby mechanics…</Text>
      <Text style={styles.searchSub}>Broadcasting your request to mechanics around you</Text>
      <Pressable onPress={onCancel} style={styles.searchCancel}>
        <Text style={styles.searchCancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

// ---- Shared price card ----
function PriceCard({ estimate }) {
  return (
    <View style={styles.priceCard}>
      <Text style={styles.priceTitle}>Live estimate</Text>
      <Row label="Call-out base" value={formatLKR(estimate.calloutBase)} />
      <Row label="Distance (matrix)" value={formatLKR(estimate.distanceFee)} />
      <Row label="Repair base rate" value={formatLKR(estimate.repairBase)} />
      <View style={styles.priceDivider} />
      <View style={styles.priceTotalRow}>
        <Text style={styles.priceTotalLabel}>Estimated total</Text>
        <Text style={styles.priceTotalValue}>{formatLKR(estimate.total)}</Text>
      </View>
    </View>
  );
}
function Row({ label, value }) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceRowLabel}>{label}</Text>
      <Text style={styles.priceRowValue}>{value}</Text>
    </View>
  );
}

// ---- Customer chat ----
const QUICK = ["I'm next to a blue van", "It won't start at all", "How long will you take?", "Thank you!"];

function CustomerChat({ open, onClose, mechanic }) {
  const slide = useRef(new Animated.Value(0)).current;
  const [messages, setMessages] = useState([
    { from: "mechanic", text: "Hi, I've accepted your request — on my way now." },
  ]);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: open ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: useDriver,
    }).start();
  }, [open, slide]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [620, 0] });

  return (
    <Animated.View
      pointerEvents={open ? "auto" : "none"}
      style={[styles.chatPanel, { transform: [{ translateY }] }]}
    >
      <View style={styles.chatHandle} />
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>{mechanic.name}</Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.chatClose}>Close</Text>
        </Pressable>
      </View>
      <ScrollView style={{ flex: 1, marginTop: 8 }} contentContainerStyle={{ paddingVertical: 8 }}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.from === "me" ? styles.bMine : styles.bTheirs]}>
            <Text style={[styles.bText, m.from === "me" && styles.bTextMine]}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.quickLabel}>Quick replies</Text>
      <View style={styles.quickWrap}>
        {QUICK.map((q) => (
          <Pressable key={q} onPress={() => setMessages((m) => [...m, { from: "me", text: q }])} style={styles.quickChip}>
            <Text style={styles.quickChipText}>{q}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  acctBar: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.line, backgroundColor: COLORS.background,
  },
  acctAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.ocean, alignItems: "center", justifyContent: "center" },
  acctAvatarText: { color: COLORS.sand, fontWeight: "900", fontSize: 17 },
  acctHint: { color: COLORS.tea, fontSize: 11, fontWeight: "700" },
  acctName: { color: COLORS.ocean, fontSize: 15, fontWeight: "800" },
  logoutBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.line },
  logoutText: { color: COLORS.tea, fontWeight: "800", fontSize: 13 },

  body: { padding: 20, paddingBottom: 30, gap: 14 },
  h1: { color: COLORS.ocean, fontSize: 24, fontWeight: "900" },
  sub: { color: COLORS.tea, fontSize: 14, lineHeight: 20, marginTop: -6 },
  eyebrow: { color: COLORS.tea, fontSize: 12, fontWeight: "800", letterSpacing: 1.2 },
  group: { color: COLORS.ocean, fontSize: 14, fontWeight: "800", marginTop: 4 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 9 },

  locCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: 16,
    borderWidth: 1, borderColor: COLORS.line,
  },
  locDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.canopy, borderWidth: 3, borderColor: COLORS.canopySoft },
  locLabel: { color: COLORS.tea, fontSize: 12, fontWeight: "700" },
  locValue: { color: COLORS.ocean, fontSize: 14, fontWeight: "800", marginTop: 2 },
  locHint: { color: COLORS.sand, fontSize: 12, fontWeight: "800", backgroundColor: COLORS.ocean, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, overflow: "hidden" },

  // tracking
  trackHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  etaPill: { backgroundColor: COLORS.canopy, borderRadius: RADIUS.pill, paddingHorizontal: 18, paddingVertical: 10, alignItems: "center" },
  etaVal: { color: "#fff", fontSize: 22, fontWeight: "900", lineHeight: 24 },
  etaUnit: { color: "#fff", fontSize: 11, fontWeight: "700", opacity: 0.85 },

  steps: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: 16, borderWidth: 1, borderColor: COLORS.line, gap: 12 },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.oceanSoft },
  stepDotOn: { backgroundColor: COLORS.canopy },
  stepLabel: { color: COLORS.textMuted, fontSize: 14, fontWeight: "700" },
  stepLabelOn: { color: COLORS.ocean, fontWeight: "800" },

  mechCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.ocean, borderRadius: RADIUS.card, padding: 18 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.sand, alignItems: "center", justifyContent: "center" },
  avatarText: { color: COLORS.ocean, fontWeight: "900", fontSize: 22 },
  mechName: { color: "#fff", fontSize: 18, fontWeight: "900" },
  mechMeta: { color: "#AEB9C6", fontSize: 12, fontWeight: "600", marginTop: 2 },
  ratingPill: { backgroundColor: COLORS.sand, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, alignItems: "center" },
  ratingText: { color: COLORS.ocean, fontWeight: "900", fontSize: 15 },
  ratingStar: { color: COLORS.ocean, fontSize: 11 },

  jobLine: { backgroundColor: COLORS.teaSoft, borderRadius: RADIUS.chip, paddingHorizontal: 14, paddingVertical: 12 },
  jobLineText: { color: COLORS.tea, fontWeight: "800", fontSize: 13 },

  actionRow: { flexDirection: "row", gap: 12 },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelText: { color: COLORS.danger, fontWeight: "800", fontSize: 15 },

  // searching overlay
  searchOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.background,
    alignItems: "center", justifyContent: "center", padding: 30, zIndex: 30,
  },
  radarWrap: { width: 180, height: 180, alignItems: "center", justifyContent: "center", marginBottom: 30 },
  radarSweep: {
    position: "absolute", width: 150, height: 150, borderRadius: 75,
    borderWidth: 3, borderColor: COLORS.sand, borderRightColor: "transparent", borderBottomColor: "transparent",
  },
  radarCore: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.ocean, alignItems: "center", justifyContent: "center" },
  radarG: { color: COLORS.sand, fontSize: 30, fontWeight: "900" },
  searchTitle: { color: COLORS.ocean, fontSize: 20, fontWeight: "900", textAlign: "center" },
  searchSub: { color: COLORS.tea, fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20, maxWidth: 260 },
  searchCancel: { marginTop: 26, paddingHorizontal: 30, paddingVertical: 12, borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.line },
  searchCancelText: { color: COLORS.tea, fontWeight: "800" },

  // price
  priceCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: 18, borderWidth: 1, borderColor: COLORS.line },
  priceTitle: { color: COLORS.ocean, fontSize: 16, fontWeight: "900", marginBottom: 10 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  priceRowLabel: { color: COLORS.tea, fontSize: 14, fontWeight: "600" },
  priceRowValue: { color: COLORS.ocean, fontSize: 14, fontWeight: "700" },
  priceDivider: { height: 1, backgroundColor: COLORS.line, marginVertical: 10 },
  priceTotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceTotalLabel: { color: COLORS.ocean, fontSize: 15, fontWeight: "800" },
  priceTotalValue: { color: COLORS.ocean, fontSize: 22, fontWeight: "900" },

  // chat
  chatPanel: {
    position: "absolute", left: 0, right: 0, bottom: 0, height: 420,
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.card, borderTopRightRadius: RADIUS.card,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: -6 }, elevation: 14, zIndex: 40,
  },
  chatHandle: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: COLORS.line, marginBottom: 12 },
  chatHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatTitle: { color: COLORS.ocean, fontSize: 17, fontWeight: "900" },
  chatClose: { color: COLORS.tea, fontWeight: "800" },
  bubble: { maxWidth: "82%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginVertical: 4 },
  bTheirs: { alignSelf: "flex-start", backgroundColor: COLORS.oceanSoft },
  bMine: { alignSelf: "flex-end", backgroundColor: COLORS.canopy },
  bText: { color: COLORS.ocean, fontSize: 14, fontWeight: "600" },
  bTextMine: { color: "#fff" },
  quickLabel: { color: COLORS.tea, fontSize: 12, fontWeight: "800", letterSpacing: 0.6, marginTop: 8 },
  quickWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  quickChip: { backgroundColor: COLORS.sandSoft, borderRadius: RADIUS.chip, paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1, borderColor: COLORS.sand },
  quickChipText: { color: COLORS.ocean, fontWeight: "700", fontSize: 13 },
});
