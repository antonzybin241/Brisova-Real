import { REAL_ESTATE_IMAGES } from "./propertyImages";

export const APP_NAME = "Brisova";
export const APP_FULL_NAME = "Brisova Markets";
export const APP_TAGLINE =
  "Institutional access to tokenized real estate, with fractional ownership and documented rental distributions.";

export const BRISOVA_FEATURES = [
  {
    icon: "lock",
    title: "Secure Settlement",
    desc: "Smart-contract escrow with independently verifiable ownership records.",
  },
  {
    icon: "pieChart",
    title: "Fractional Ownership",
    desc: "Allocate capital to institutional assets with a lower minimum commitment.",
  },
  {
    icon: "shield",
    title: "Investor Verification",
    desc: "Identity review is completed before any subscription is accepted.",
  },
];

/** Hero & login showcase imagery — CDN fallbacks aligned with seed galleries */
export const BRISOVA_SHOWCASE_PROPERTIES = [
  {
    city: "Dubai Marina",
    country: "UAE",
    type: "Luxury Residential",
    yield: "7.4%",
    price: "$2.4M",
    featured: true,
    image: REAL_ESTATE_IMAGES.glassVilla,
  },
  {
    city: "Manhattan",
    country: "USA",
    type: "Premium Condo",
    yield: "5.8%",
    price: "$4.1M",
    image: REAL_ESTATE_IMAGES.cityBlock,
  },
  {
    city: "London Canary Wharf",
    country: "UK",
    type: "Commercial Tower",
    yield: "6.1%",
    price: "$8.5M",
    image: REAL_ESTATE_IMAGES.womanSwimmingPool,
  },
  {
    city: "Miami Beach",
    country: "USA",
    type: "Waterfront Villa",
    yield: "6.9%",
    price: "$3.2M",
    image: REAL_ESTATE_IMAGES.desertVilla,
  },
  {
    city: "Paris",
    country: "France",
    type: "Haussmann Flat",
    yield: "4.5%",
    price: "$1.9M",
    image: REAL_ESTATE_IMAGES.cityApt,
  },
  {
    city: "Sydney Harbour",
    country: "Australia",
    type: "Harbour Residence",
    yield: "5.2%",
    price: "$2.8M",
    image: REAL_ESTATE_IMAGES.womanInVilla,
  },
  {
    city: "Barcelona",
    country: "Spain",
    type: "Boutique Hotel",
    yield: "6.4%",
    price: "$5.1M",
    image: REAL_ESTATE_IMAGES.womanHotelRoom,
  },
];

export const BRISOVA_HERO_IMAGES = {
  primary: REAL_ESTATE_IMAGES.gardenVilla,
  secondary: REAL_ESTATE_IMAGES.womanInVilla,
  tertiary: REAL_ESTATE_IMAGES.whiteModern,
  interior: REAL_ESTATE_IMAGES.womanKitchen,
};

export const BRISOVA_LOGIN_COPY = {
  eyebrow: "Institutional Real Estate · Digital Ownership",
  headline: "Invest in global property with institutional transparency",
  subhead:
    "Brisova presents residential, commercial, and hospitality assets as tokenized interests. Qualified investors receive proportional income and a complete ownership record.",
  highlights: [
    { label: "Minimum allocation", value: "$100" },
    { label: "Average net yield", value: "6.2%" },
    { label: "Markets covered", value: "50+" },
  ],
  showcaseTitle: "Selected investment opportunities",
  showcaseDesc:
    "A cross-section of residential, commercial, and mixed-use assets currently available to qualified investors.",
};

export const PROPERTY_TYPES = [
  { value: "", label: "All Types" },
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "LAND", label: "Land" },
  { value: "MIXED_USE", label: "Mixed Use" },
];
