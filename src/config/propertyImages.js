/** Curated Unsplash real-estate photos used across listings, hero, and fallbacks. */
const u = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const REAL_ESTATE_IMAGES = {
  modernHouse: u("photo-1600596542815-ffad4c1539a9"),
  glassVilla: u("photo-1582268611958-ebfd161ef9cf"),
  cityApt: u("photo-1502672023488-70e25813eb80"),
  gardenVilla: u("photo-1600566753190-17f0baa2a6c3"),
  whiteModern: u("photo-1600585154526-990dced4db0d"),
  desertVilla: u("photo-1599809275671-b5942cabc7a2"),
  cityBlock: u("photo-1515263487990-61b07816b324"),
  womanInVilla: u("photo-1762425430465-0d9f08d64147"),
  womanKitchen: u("photo-1556912173-46c336c7fd55"),
  womanHotelRoom: u("photo-1513745405825-efaf9a49315f"),
  womanSwimmingPool: u("photo-1703135387362-4b749023e1e1"),
};

export const DEFAULT_PROPERTY_IMAGE = REAL_ESTATE_IMAGES.modernHouse;
