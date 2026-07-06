// Garage — map fallback (native default resolution).
// Metro serves Map.web.js (real Leaflet) on web. On native this schematic keeps
// device builds working; swap it for `react-native-maps` for production GPS maps.

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS } from "./theme";

export default function MapView({ customer, mechanic, height = 200, navigating = false }) {
  return (
    <View style={[styles.map, { height }]}>
      <View style={styles.gridV} />
      <View style={[styles.gridV, { left: "66%" }]} />
      <View style={styles.gridH} />
      <View style={[styles.gridH, { top: "66%" }]} />

      {mechanic && <View style={[styles.line, navigating && styles.lineActive]} />}
      {mechanic && (
        <View style={[styles.pin, styles.pinMechanic]}>
          <View style={[styles.dot, { backgroundColor: COLORS.sand }]} />
        </View>
      )}
      <View style={[styles.pin, styles.pinCustomer]}>
        <View style={[styles.dot, { backgroundColor: "#fff" }]} />
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {customer ? `${customer.lat.toFixed(4)}, ${customer.lng.toFixed(4)}` : "Locating…"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { borderRadius: RADIUS.card, backgroundColor: COLORS.oceanSoft, overflow: "hidden" },
  gridV: { position: "absolute", top: 0, bottom: 0, left: "33%", width: 1, backgroundColor: "rgba(30,56,89,0.07)" },
  gridH: { position: "absolute", left: 0, right: 0, top: "33%", height: 1, backgroundColor: "rgba(30,56,89,0.07)" },
  line: {
    position: "absolute", width: 5, height: 150, backgroundColor: COLORS.tea, borderRadius: 6,
    left: "42%", top: "16%", transform: [{ rotate: "32deg" }], opacity: 0.55,
  },
  lineActive: { backgroundColor: COLORS.canopy, opacity: 1 },
  pin: { position: "absolute", width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  pinMechanic: { left: "28%", top: "22%", backgroundColor: COLORS.ocean },
  pinCustomer: { right: "24%", bottom: "20%", backgroundColor: COLORS.canopy },
  dot: { width: 9, height: 9, borderRadius: 5 },
  badge: { position: "absolute", left: 12, bottom: 12, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { color: COLORS.ocean, fontWeight: "700", fontSize: 12 },
});
