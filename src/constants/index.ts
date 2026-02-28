// ==================== Brand Colors ====================
export const COLORS = {
  primary: "#44ab48",
  primaryHover: "#3a9c3e",
  primaryLight: "#e8f4e5",
  primaryBorder: "rgba(68, 171, 72, 0.2)",
  secondary: "#074c72",
  secondaryHover: "#053a54",
} as const;

// ==================== Validation Constants ====================
export const VALIDATION = {
  // Age constraints
  MIN_AGE: 13,
  MAX_AGE: 120,

  // Phone number
  MIN_PHONE_LENGTH: 10,

  // Graduation year
  MIN_GRADUATION_YEAR: 1900,
  MAX_GRADUATION_YEAR: 2100,

  // Password (Better-Auth requirement)
  MIN_PASSWORD_LENGTH: 8,
} as const;

// ==================== QR Code Configuration ====================
export const QR_CODE = {
  PREFIX: "PICKHACKS",
  ID_LENGTH: 12,
  API_URL: "https://api.qrserver.com/v1/create-qr-code",
  SIZE: 300,
} as const;

// ==================== T-Shirt Sizes ====================
export const TSHIRT_SIZES = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "2XL", label: "2XL" },
  { value: "3XL", label: "3XL" },
] as const;

// ==================== Education Levels ====================
export const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "other", label: "Other" },
] as const;

// ==================== Station Types ====================
export const STATION_TYPES = [
  { value: "checkin", label: "Check-in" },
  { value: "food", label: "Food/Meal" },
  { value: "workshop", label: "Workshop" },
  { value: "prize", label: "Prize" },
] as const;

// Default stations to seed for new events
export const DEFAULT_STATIONS = [
  { name: "Check-in", stationType: "checkin", maxVisitsPerHacker: 1 },
  { name: "Breakfast", stationType: "food", maxVisitsPerHacker: 1 },
  { name: "Lunch", stationType: "food", maxVisitsPerHacker: 1 },
  { name: "Dinner", stationType: "food", maxVisitsPerHacker: 1 },
] as const;

// ==================== Competition Tracks ====================
export const MST_SCHOOL_NAME =
  "Missouri University of Science and Technology";

export const TRACKS = [
  { value: "best_use_of_ai", label: "Best Use of AI", conditional: null },
  { value: "best_security", label: "Best Security", conditional: null },
  {
    value: "best_solo",
    label: "Best Solo",
    conditional: "solo" as const,
  },
  { value: "best_beginner", label: "Best Beginner", conditional: null },
  {
    value: "tip_crystal_ball",
    label: "TIP Crystal Ball",
    conditional: "mst_only" as const,
  },
] as const;

export type TrackValue = (typeof TRACKS)[number]["value"];
