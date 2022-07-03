<script lang="ts">
  import { Marker } from "leaflet";
  import SearchIcon from "./searchicon.svelte";
  import Locate from "./locate.svelte";

  import { mapStore, districtsStore } from "../stores";
  import booleanIntersects from "@turf/boolean-intersects";

  import { formatAddress, formatDistrictPopup } from "./format";

  let value;
  let searchResults = [];
  let marker;
  let selectedAddress;

  function onInput() {
    if (value.length > 1) {
      fetch(`https://geosearch.planninglabs.nyc/v1/search?text=${value}`)
        .then((response) => response.json())
        .then(
          (response) =>
            (searchResults = response.features
              .map((feature) => ({
                name: formatAddress(
                  feature.properties.pad_orig_stname,
                  feature.properties.borough,
                  feature.properties.postalcode,
                  feature.properties.housenumber
                ),
                coords: feature.geometry.coordinates,
              }))
              .slice(0, 8))
        );
    } else {
      searchResults = [];
      selectedAddress = null;
      if (marker) marker.remove();
    }
  }

  function onSearch() {
    searchResults = [];

    fetch(`https://geosearch.planninglabs.nyc/v1/search?text=${value}`)
      .then((response) => response.json())
      .then((response) => {
        //use the first address
        if (response.features.length) {
          const { coordinates } = response.features[0].geometry;
          createPopup(coordinates);
        } else {
          //throw error
        }
      });
  }

  function createPopup(coordinates: number[]) {
    console.log(`Going to ${coordinates}`)
    const latlng = coordinates.slice().reverse();
    $mapStore.flyTo(latlng, 14, {animate: false});

    //use booleanIntersects to find underlying district
    const point = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates,
      },
    };
    const intersectingDistrict = $districtsStore.filter((district) =>
      booleanIntersects(district, point)
    );

    //generate content
    let content =
      "<h2 class='text-l mb-2 font-semibold'>No intersecting community district.</h2>";
    if (intersectingDistrict.length) {
      const { borocd, name, website } = intersectingDistrict[0].properties;
      content = formatDistrictPopup(borocd, name, website);
    }

    if (marker) marker.remove();
    marker = new L.Marker(latlng).addTo($mapStore);
    marker.bindPopup(content, {
        offset: [0, 25]
    }).openPopup();
  }

  function onSetLocation(addr) {
    value = addr.name;
    selectedAddress = addr;
    onSearch();
  }

  function onInputFocus(event) {
    (event.target as HTMLInputElement).select();
  }
</script>

<nav class="absolute flex left-3 right-3 top-3 w-11/12">
  <Locate {createPopup} />

  <form on:submit|preventDefault={onSearch} class="relative flex flex-1 mr-2 ">
    <!-- svelte-ignore a11y-autofocus -->
    <input
      id="address"
      placeholder="Search Street Address, Borough"
      type="search"
      name="address"
      bind:value
      autofocus
      autocomplete="off"
      on:focus={onInputFocus}
      on:input={onInput}
      class="block relative py-2 px-3 pl-10 flex-1 shadow-md rounded focus:outline-none focus:ring focus:ring-blue-500"
    />
    <SearchIcon />

    {#if searchResults.length}
      <ul
        class="absolute top-full left-0 right-0 shadow-md rounded mt-1 py-2 bg-white"
      >
        {#each searchResults as addr}
          <li
            on:click={() => onSetLocation(addr)}
            class="cursor-pointer hover:bg-gray-100 px-3 py-1 pl-10"
          >
            {addr.name}
          </li>
        {/each}
      </ul>
    {/if}
    <input type="submit" value="Search" class="hidden" />
  </form>
</nav>

<style>
  nav {
    z-index: 1000;
  }
</style>
