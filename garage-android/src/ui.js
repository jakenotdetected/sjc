// Garage — shared UI primitives.
// Small, reusable, themed building blocks so screens stay declarative.

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS, RADIUS } from "./theme";

// Native driver is unsupported on react-native-web; gate it to avoid warnings.
const useDriver = Platform.OS !== "web";

// ---- Pill button (active pills use the strict 30.dp radius) ----
export function PillButton({ label, onPress, color = COLORS.canopy, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: color },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

// ---- Selectable chip ----
export function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ---- Labeled text input ----
export function Field({ label, ...props }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={COLORS.textMuted}
        {...props}
        style={[styles.input, props.multiline && styles.inputMultiline]}
      />
    </View>
  );
}

// ---- Animated Go Online / Offline switch ----
export function OnlineSwitch({ online, onToggle }) {
  const anim = useRef(new Animated.Value(online ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: online ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animating colors needs the JS driver
    }).start();
  }, [online, anim]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.oceanSoft, COLORS.canopy],
  });
  const knobX = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 31] });

  return (
    <Pressable onPress={onToggle} hitSlop={8}>
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX: knobX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

// ---- Soft pulsing ring (Golden Sand) for live/urgent elements ----
export function PulseRing({ size = 150, color = COLORS.sand }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: useDriver,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

// ---- Lightweight cross-platform toast ----
export function Toast({ message, tone = "danger" }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: useDriver,
    }).start();
  }, [message, anim]);

  if (!message) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const bg = tone === "danger" ? COLORS.danger : COLORS.ocean;

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor: bg, opacity: anim, transform: [{ translateY }] }]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

// ---- Stylized mini map ----
// react-native-maps can't render on web; this is a clean schematic stand-in
// that shows the route line, the mechanic + customer pins, and the coordinates.
export function MiniMap({ coords, label, height = 190, navigating = false }) {
  return (
    <View style={[styles.map, { height }]}>
      <View style={styles.mapGridV} />
      <View style={[styles.mapGridV, { left: "66%" }]} />
      <View style={styles.mapGridH} />
      <View style={[styles.mapGridH, { top: "66%" }]} />

      <View style={[styles.routeLine, navigating && styles.routeLineActive]} />
      <View style={[styles.pin, styles.pinMechanic]}>
        <View style={styles.pinDotLight} />
      </View>
      <View style={[styles.pin, styles.pinCustomer]}>
        <View style={styles.pinDotSand} />
      </View>

      <View style={styles.mapBadge}>
        <Text style={styles.mapBadgeText}>
          {label}
          {coords ? `  •  ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : ""}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 56,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  pillText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },

  chip: {
    borderRadius: RADIUS.chip,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  chipActive: { backgroundColor: COLORS.sandSoft, borderColor: COLORS.sand },
  chipText: { color: COLORS.tea, fontWeight: "700", fontSize: 13 },
  chipTextActive: { color: COLORS.ocean },

  fieldBlock: { marginBottom: 14 },
  fieldLabel: { color: COLORS.ocean, fontSize: 13, fontWeight: "800", marginBottom: 7 },
  input: {
    minHeight: 52,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
    color: COLORS.ocean,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  inputMultiline: { minHeight: 80, paddingTop: 13, textAlignVertical: "top" },

  track: {
    width: 58,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
  },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 28,
    borderRadius: RADIUS.input,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    zIndex: 50,
  },
  toastText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14, textAlign: "center" },

  map: {
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.oceanSoft,
    overflow: "hidden",
    position: "relative",
  },
  mapGridV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "33%",
    width: 1,
    backgroundColor: "rgba(30,56,89,0.07)",
  },
  mapGridH: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "33%",
    height: 1,
    backgroundColor: "rgba(30,56,89,0.07)",
  },
  routeLine: {
    position: "absolute",
    width: 5,
    height: 150,
    backgroundColor: COLORS.tea,
    borderRadius: 6,
    left: "42%",
    top: "16%",
    transform: [{ rotate: "32deg" }],
    opacity: 0.55,
  },
  routeLineActive: { backgroundColor: COLORS.canopy, opacity: 1 },
  pin: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  pinMechanic: { left: "28%", top: "22%", backgroundColor: COLORS.ocean },
  pinCustomer: { right: "24%", bottom: "20%", backgroundColor: COLORS.canopy },
  pinDotLight: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#FFFFFF" },
  pinDotSand: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.sand },
  mapBadge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapBadgeText: { color: COLORS.ocean, fontWeight: "700", fontSize: 12 },
});
