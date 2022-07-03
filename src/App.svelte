<script lang="ts">
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
  import markerIcon from 'leaflet/dist/images/marker-icon.png'
  import markerShadow from 'leaflet/dist/images/marker-shadow.png'
  //fix for markers not showing up
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
  })
  
  import { mapStore, districtsStore } from "./stores";
  import { onMount } from "svelte";
  import { formatDistrictPopup } from "./lib/format";

  import Search from "./lib/search.svelte";
  import district_centroids from "./assets/cd_centroids.geo.json";

  let map;
  let mapContainer;

  onMount(() => {
    //init map
    map = L.map(mapContainer, {
      maxBounds: [
        [40.4093, -74.5051],
        [41.0016, -73.574],
      ],
      zoomControl: false,
    }).setView([40.69429, -73.99115], 11);

    map.attributionControl.setPrefix("Leaflet");

    L.control
      .zoom({
        position: "bottomleft",
      })
      .addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OSM</a>,
          &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
        subdomains: "abcd",
        maxZoom: 17,
        minZoom: 11,
      }
    ).addTo(map);

    //add districts
    L.geoJSON($districtsStore, {
      style: {
        fillOpacity: 0,
        color: "#6986bb",
        weight: 1,
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.name) {
          const { borocd, name, website, email } = feature.properties;
          const content = formatDistrictPopup(borocd, name, website);
          layer.bindPopup(content);
        }
      },
    }).addTo(map);

    //add district labels
    //https://gis.stackexchange.com/questions/245621/how-to-label-geojson-points-in-leaflet
    L.geoJSON(district_centroids, {
      pointToLayer: function (feature, latlng) {
        const label = String(feature.properties.borocd);
        return new L.CircleMarker(latlng, {
          radius: 0.1,
          opacity: 0,
        })
          .bindTooltip(label, {
            permanent: true,
            direction: "center",
            className: "district-label",
          })
          .openTooltip();
      },
    }).addTo(map);

    //set to store
    mapStore.set(map);
  });
</script>

<Search />

<div bind:this={mapContainer} class="h-screen w-full" />

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  :global(.leaflet-tooltip.district-label) {
    background-color: transparent;
    border: transparent;
    box-shadow: none;
    font-size: 0.75rem;
    font-weight: bold;
    color: #15284e;
  }
</style>
