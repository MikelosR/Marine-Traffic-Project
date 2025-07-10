export const detailedStatusMap = {
  0: "under way using engine",
  1: "at anchor",
  2: "not under command",
  3: "restricted manoeuvrability",
  4: "constrained by her draught",
  5: "moored",
  6: "aground",
  7: "engaged in fishing",
  8: "under way sailing",
  9: "reserved for future amendment (DG/HS/MP C, HSC)",
  10: "reserved for future amendment (DG/HS/MP A, WIG)",
  11: "reserved for future use",
  12: "reserved for future use",
  13: "reserved for future use",
  14: "AIS-SART (active)",
  15: "not defined",
  16: "default",
  17: "AIS-SART under test",
};

export const generalStatusMap = {
  0: "underway",
  1: "at anchor",
  2: "restricted",
  3: "restricted",
  4: "restricted",
  5: "moored",
  6: "aground",
  7: "fishing",
  8: "underway",
  9: "restricted",
  10: "restricted",
  11: "unknown",
  12: "unknown",
  13: "unknown",
  14: "unknown",
  15: "unknown",
  16: "unknown",
  17: "unknown",
};

export const detailedStatusReverseMap = Object.entries(
  detailedStatusMap
).reduce((acc, [key, val]) => {
  acc[val] = parseInt(key, 10);
  return acc;
}, {});

export const generalStatusReverseMap = Object.entries(generalStatusMap).reduce(
  (acc, [key, val]) => {
    if (!acc[val]) acc[val] = [];
    acc[val].push(parseInt(key, 10));
    return acc;
  },
  {}
);

export const detailedStatusByGeneral = {
  underway: [0, 8], // "under way using engine" and "under way sailing"
  atanchor: [1],
  restricted: [2, 3, 4, 9, 10], // not under command, restricted manoeuvrability, constrained by draught
  moored: [5],
  aground: [6], // You can add more if you want
  fishing: [7],
  unknown: [11, 12, 13, 14, 15, 1, 17], // not defined
};

// Example usage:
// generalStatusMap[7] === "fishing"
// detailedStatusMap[3] === "restricted manoeuvrability"
// generalStatusReverseMap["restricted"] === [2, 3, 4, 9, 10]
