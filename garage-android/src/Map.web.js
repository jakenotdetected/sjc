// Garage — real interactive map (web).
// Uses Leaflet + OpenStreetMap tiles (no API key). Renders a real draggable map
// with custom customer/mechanic pins and a live route line. On web, react-native-web
// runs on react-dom, so a raw <div> is a valid host element to mount Leaflet into.

import React, { useEffect, useRef } from "react";
import { COLORS, RADIUS } from "./theme";

// Lazily inject Leaflet's CSS + JS from CDN exactly once.
let leafletPromise = null;
function loadLeaflet() {
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload = () => resolve(window.L);
    document.head.appendChild(js);
  });
  return leafletPromise;
}

const pinIcon = (L, color, ring) =>
  L.divIcon({
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};
      border:4px solid ${ring};box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  });

export default function MapView({
  customer,
  mechanic,
  height = 200,
  interactive = false,
  navigating = false,
  onPick,
}) {
  const elRef = useRef(null);
  const map = useRef(null);
  const refs = useRef({ customer: null, mechanic: null, line: null, fitted: false });

  // Init once.
  useEffect(() => {
    let alive = true;
    loadLeaflet().then((L) => {
      if (!alive || !elRef.current || map.current) return;
      const m = L.map(elRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: false,
        doubleClickZoom: interactive,
        touchZoom: interactive,
        keyboard: false,
      }).setView([customer.lat, customer.lng], 14);
      map.current = m;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(m);
      if (onPick) m.on("click", (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }));
      setTimeout(() => m.invalidateSize(), 60);
      setTimeout(() => m.invalidateSize(), 350);
      draw(L, m);
    });
    return () => {
      alive = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
        refs.current = { customer: null, mechanic: null, line: null, fitted: false };
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw markers/route when coordinates change.
  useEffect(() => {
    if (window.L && map.current) draw(window.L, map.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, mechanic, navigating]);

  function draw(L, m) {
    const r = refs.current;

    // Customer pin.
    if (customer) {
      const pos = [customer.lat, customer.lng];
      if (!r.customer) r.customer = L.marker(pos, { icon: pinIcon(L, COLORS.canopy, "#fff") }).addTo(m);
      else r.customer.setLatLng(pos);
    }

    // Mechanic pin (optional).
    if (mechanic) {
      const pos = [mechanic.lat, mechanic.lng];
      if (!r.mechanic) r.mechanic = L.marker(pos, { icon: pinIcon(L, COLORS.ocean, COLORS.sand) }).addTo(m);
      else r.mechanic.setLatLng(pos);
    } else if (r.mechanic) {
      m.removeLayer(r.mechanic);
      r.mechanic = null;
    }

    // Route line between the two.
    if (customer && mechanic) {
      const path = [
        [mechanic.lat, mechanic.lng],
        [customer.lat, customer.lng],
      ];
      const color = navigating ? COLORS.canopy : COLORS.tea;
      if (!r.line) r.line = L.polyline(path, { color, weight: 5, opacity: 0.85 }).addTo(m);
      else r.line.setLatLngs(path).setStyle({ color });
      m.fitBounds(r.line.getBounds().pad(0.45), { animate: false, maxZoom: 15 });
    } else if (r.line) {
      m.removeLayer(r.line);
      r.line = null;
    }
  }

  return (
    <div
      ref={elRef}
      style={{
        height,
        width: "100%",
        borderRadius: RADIUS.card,
        overflow: "hidden",
        background: COLORS.oceanSoft,
      }}
    />
  );
}
