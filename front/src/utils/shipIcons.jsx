import L from "leaflet";
import { getGeneralShipCategory } from "./shipType";

export function getShipIcon(type) {
  const generalCategory = getGeneralShipCategory(type);

  // const basePath = "/icons/";
  const fallback = "misc.png";
  let fileName = generalCategory
    ? `${generalCategory.toLowerCase()}.png`
    : fallback;

  return new L.Icon({
    iconUrl: `/icons/${fileName}`,
    iconSize: [18, 27],
    iconAnchor: [12, 12],
    popupAnchor: [0, -10],
  });
}
