// Garage — phone simulation frame (web only).
// Wraps the whole app in a realistic device bezel on a dark studio backdrop so
// the web preview reads as a real phone. On native it's a transparent passthrough.

import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { COLORS } from "./theme";

export const PHONE_W = 390;
export const PHONE_H = 820;

export default function PhoneFrame({ children }) {
  if (Platform.OS !== "web") return children;

  return (
    <View style={styles.backdrop}>
      <View style={styles.device}>
        {/* screen */}
        <View style={styles.screen}>
          {children}
          {/* notch island floats above the app content */}
          <View style={styles.notch} pointerEvents="none" />
          {/* home indicator */}
          <View style={styles.homeBar} pointerEvents="none" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "#0E1722",
  },
  device: {
    width: PHONE_W,
    height: PHONE_H,
    borderRadius: 52,
    backgroundColor: "#05080C",
    padding: 11,
    shadowColor: "#000",
    shadowOpacity: 0.55,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 24 },
  },
  screen: {
    flex: 1,
    borderRadius: 42,
    overflow: "hidden",
    backgroundColor: COLORS.background,
    position: "relative",
  },
  notch: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    left: "50%",
    marginLeft: -52,
    width: 104,
    height: 28,
    borderRadius: 16,
    backgroundColor: "#05080C",
    zIndex: 60,
  },
  homeBar: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    left: "50%",
    marginLeft: -67,
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(30,56,89,0.35)",
    zIndex: 60,
  },
});
