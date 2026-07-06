// Garage — data layer.
// Skills matrix definitions, profile (de)serialization to the canonical JSON
// shape, the breakdown-category rate table, and the live price computation.

// ---- Skills matrix taxonomy (single source of truth for the form) ----

export const VEHICLE_TYPES = [
  "Motorbike",
  "Three-Wheeler",
  "Car",
  "Van",
  "SUV",
];

export const SPECIALTIES = {
  Accessories: ["Wiring", "Lighting", "Audio Systems", "ACC"],
  Engine: ["Tune-ups", "Overhauls", "Sensors", "Oil/Filters"],
  Other: ["Brakes", "Suspension", "Transmission", "AC Repair"],
};

export const SPECIALTY_CATEGORIES = Object.keys(SPECIALTIES);

// Empty selection map shaped like SPECIALTIES, e.g. { Accessories: [], ... }.
export const emptySpecialties = () =>
  SPECIALTY_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: [] }), {});

// ---- Profile mapping ----

// Map the flat form + selection state into the canonical mechanic_profile JSON.
export function buildMechanicProfile(form, vehicleTypes, specialties) {
  return {
    mechanic_profile: {
      personal_info: {
        full_name: form.fullName.trim(),
        home_address: form.address.trim(),
        phone_number: form.phone.trim(),
      },
      skills_matrix: {
        vehicle_types: vehicleTypes,
        specialties,
      },
    },
  };
}

// Reverse: hydrate form + selection state from a stored profile JSON.
export function parseMechanicProfile(json) {
  const p = json?.mechanic_profile ?? {};
  const info = p.personal_info ?? {};
  const skills = p.skills_matrix ?? {};
  return {
    form: {
      fullName: info.full_name ?? "",
      address: info.home_address ?? "",
      phone: info.phone_number ?? "",
    },
    vehicleTypes: skills.vehicle_types ?? [],
    specialties: { ...emptySpecialties(), ...(skills.specialties ?? {}) },
  };
}

// Flatten the selected specialties map into a single list of skill labels.
export const flattenSpecialties = (specialties) =>
  Object.values(specialties).flat();

// ---- Pricing engine ----

// Base call-out fee model: a fixed dispatch fee + a per-km distance-matrix rate.
const CALLOUT_BASE_FEE = 350; // LKR — fixed dispatch fee
const RATE_PER_KM = 120; // LKR per km from the distance matrix

// Category-specific repair base rates keyed by the broadcast breakdown category.
export const REPAIR_BASE_RATES = {
  Accessories: 1500,
  Engine: 4500,
  Other: 2200,
};

// Compute a live dynamic estimate for an incoming job.
// Returns the broken-down figures so the UI can show the math transparently.
export function computeEstimate(distanceKm, category) {
  const distanceFee = Math.round(distanceKm * RATE_PER_KM);
  const calloutFee = CALLOUT_BASE_FEE + distanceFee;
  const repairBase = REPAIR_BASE_RATES[category] ?? REPAIR_BASE_RATES.Other;
  return {
    calloutBase: CALLOUT_BASE_FEE,
    distanceFee,
    calloutFee,
    repairBase,
    total: calloutFee + repairBase,
  };
}

export const formatLKR = (n) =>
  "LKR " + Math.round(n).toLocaleString("en-US");

// Great-circle distance between two {lat,lng} points, in km.
export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// ---- Sample incoming jobs (would arrive via WebSocket / FCM) ----

export const SAMPLE_JOBS = [
  {
    id: "job_8842",
    customer: "Nimal Perera",
    vehicleType: "Three-Wheeler",
    breakdownCategory: "Engine",
    breakdown: "Engine - Overheats",
    place: "Mihintale Road, Anuradhapura",
    distanceKm: 2.4,
    coords: { lat: 8.3372, lng: 80.4108 },
  },
  {
    id: "job_8857",
    customer: "Sahan Wijesinghe",
    vehicleType: "Car",
    breakdownCategory: "Other",
    breakdown: "Other - Brake failure",
    place: "Stage 1, Anuradhapura New Town",
    distanceKm: 4.1,
    coords: { lat: 8.3219, lng: 80.4036 },
  },
  {
    id: "job_8861",
    customer: "Dilani Rathnayake",
    vehicleType: "Motorbike",
    breakdownCategory: "Accessories",
    breakdown: "Accessories - Headlight wiring",
    place: "Jaya Mawatha, Anuradhapura",
    distanceKm: 1.3,
    coords: { lat: 8.3461, lng: 80.4189 },
  },
];
