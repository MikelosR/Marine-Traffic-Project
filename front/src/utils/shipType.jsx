// Mapping from ship type to general ship category
export const vesselTypeMap = {
  // Cargo Types
  cargo: "cargo",
  "cargo-hazarda(major)": "cargo",
  "cargo-hazardb": "cargo",
  "cargo-hazardc(minor)": "cargo",
  "cargo-hazardd(recognizable)": "cargo",

  // Tankers
  tanker: "tanker",
  "tanker-hazarda(major)": "tanker",
  "tanker-hazardb": "tanker",
  "tanker-hazardc(minor)": "tanker",
  "tanker-hazardd(recognizable)": "tanker",

  // Pleasure
  pleasure: "pleasure",
  pleasurecraft: "pleasure",
  sailingvessel: "pleasure",

  // Passenger
  passenger: "passenger",
  "high-speedcraft": "passenger",

  // Fishing
  fishing: "fishing",

  // Special Purpose
  special: "special",
  specialcraft: "special",
  pilotvessel: "special",
  tug: "special",
  sar: "special",
  lawenforce: "special",
  militaryops: "special",
  dredger: "special",
  "anti-pollution": "special",
  wingingrnd: "special",
  divevessel: "special",
  localvessel: "special",

  // Misc category
  other: "misc",
  unknown: "misc",
};

export function getGeneralShipCategory(type) {
  if (type) {
    return vesselTypeMap[type?.toLowerCase()] || "misc";
  } else {
    return "misc";
  }
}
