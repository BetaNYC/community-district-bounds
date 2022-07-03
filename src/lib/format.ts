export function formatBoroCD(borocd: number): string {
  const boroLookup = {
    1: "Manhattan",
    2: "Bronx",
    3: "Brooklyn",
    4: "Queens",
    5: "Staten Island",
  };

  const borocdString = String(borocd);
  const boroNumber = Number(borocdString.slice(0, 1));
  const districtNumber = Number(borocdString.slice(1));

  return `${boroLookup[boroNumber]} - ${districtNumber}`;
}

export function formatAddress(
  streetName: string,
  borough: string,
  postalcode?: string,
  houseNumber?: string
) {
  let string = ''

  if (houseNumber) string += `${houseNumber} `
  string += `${streetName}, ${borough}`
  if (postalcode) string += `, ${postalcode}`

  return string
}

export function formatDistrictPopup(
  borocd: number,
  name: string,
  website: string
) {
  return `
  <h2 class='text-xl mb-2 font-semibold'>${formatBoroCD(borocd)}</h2>
  <h4 class='text-sm tracking-tighter leading-3 text-slate-600'>${name}</h4>
  <p><a href='${website}' target='_blank'>go to website</a></p>
  `
}