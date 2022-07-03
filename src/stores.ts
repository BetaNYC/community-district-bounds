import { readable, writable } from "svelte/store";
import type leaflet from "leaflet";

import district_polygons from "./assets/nycd.geo.json";
import district_info from "./assets/cd_info.json";

//join data to get extra into
const districts = district_polygons.features.map((feature) => {
  const { borocd } = feature.properties;
  //find a match, then merge info
  const matching_info = district_info.find((info) => info.borocd === borocd);
  if (matching_info) {
    feature.properties = { ...feature.properties, ...matching_info };
  }
  return feature;
});

export const mapStore = writable<leaflet.Map>(null);
export const districtsStore = readable<any>(districts);
