// Garage — central design tokens.
// Strict Sri-Lankan palette + corner-radius system shared across every screen.

export const COLORS = {
  // Temple Lotus — clean off-white app background.
  background: "#F7F5F2",
  // Indian Ocean Blue — primary brand, headers, nav, currency totals.
  ocean: "#1E3859",
  // Ceylon Tea — secondary text / subtexts.
  tea: "#8C5C3D",
  // Golden Sand — accents + pulsing live elements.
  sand: "#FFC936",
  // Lush Canopy — action buttons + online / success state.
  canopy: "#2C6B56",

  // Neutral support tones derived from the core five.
  surface: "#FFFFFF",
  oceanSoft: "#E9EDF2",
  sandSoft: "#FFF4D6",
  canopySoft: "#E2EFE9",
  teaSoft: "#F1E9E2",
  line: "#E7E2DB",
  textMuted: "#9B9088",
  danger: "#C0492F",
};

// Corner radius system (STRICT): 24 for cards/containers, 30 for active pills.
export const RADIUS = {
  card: 24,
  pill: 30,
  chip: 16,
  input: 16,
};

export const SPACING = {
  screen: 20,
  gap: 14,
};
