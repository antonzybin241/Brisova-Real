/** Selectable Brisova color themes (data-theme on <html>). */
export const DEFAULT_THEME_ID = "ivory-sage";

export const BRISOVA_THEMES = [
  {
    "id": "ivory-sage",
    "label": "Ivory Sage",
    "description": "Default Brisova — ivory silk, sage, and brass",
    "mode": "light"
  },
  {
    "id": "harbor-navy",
    "label": "Harbor Navy",
    "description": "Coastal navy with cool linen and steel blue",
    "mode": "light"
  },
  {
    "id": "cedar-forest",
    "label": "Cedar Forest",
    "description": "Deep cedar green on misted moss linen",
    "mode": "light"
  },
  {
    "id": "limestone",
    "label": "Limestone",
    "description": "Pale stone architecture with charcoal ink",
    "mode": "light"
  },
  {
    "id": "graphite",
    "label": "Graphite",
    "description": "Cool graphite surfaces with silver accent",
    "mode": "light"
  },
  {
    "id": "sandstone",
    "label": "Sandstone",
    "description": "Desert sandstone with sun-baked clay accent",
    "mode": "light"
  },
  {
    "id": "emerald-court",
    "label": "Emerald Court",
    "description": "Jewel emerald on cool mint parchment",
    "mode": "light"
  },
  {
    "id": "copper-rooftop",
    "label": "Copper Rooftop",
    "description": "Aged copper accents on warm parchment",
    "mode": "light"
  },
  {
    "id": "arctic-linen",
    "label": "Arctic Linen",
    "description": "Crisp arctic white with icy teal accent",
    "mode": "light"
  },
  {
    "id": "ink-slate",
    "label": "Ink Slate",
    "description": "Quiet dark slate for evening browsing",
    "mode": "dark"
  },
  {
    "id": "olive-estate",
    "label": "Olive Estate",
    "description": "Mediterranean olive grove and clay tile",
    "mode": "light"
  },
  {
    "id": "rose-marble",
    "label": "Rose Marble",
    "description": "Soft rose marble with muted berry accent",
    "mode": "light"
  },
  {
    "id": "champagne",
    "label": "Champagne",
    "description": "Champagne gold on soft ivory fields",
    "mode": "light"
  },
  {
    "id": "dusk-blue",
    "label": "Dusk Blue",
    "description": "Twilight blue with soft periwinkle metal",
    "mode": "light"
  },
  {
    "id": "teak-warm",
    "label": "Teak Warm",
    "description": "Warm teak wood tones with amber brass",
    "mode": "light"
  }
];

export function getTheme(id) {
  return BRISOVA_THEMES.find((t) => t.id === id) || BRISOVA_THEMES[0];
}

export function applyTheme(id = DEFAULT_THEME_ID) {
  const theme = getTheme(id);
  if (typeof document === "undefined") return theme;
  document.documentElement.setAttribute("data-theme", theme.id);
  document.documentElement.style.colorScheme = theme.mode;
  try {
    localStorage.setItem("brisova-theme", theme.id);
  } catch {
    /* ignore */
  }
  return theme;
}

export function initTheme() {
  let id = DEFAULT_THEME_ID;
  try {
    id = localStorage.getItem("brisova-theme") || DEFAULT_THEME_ID;
  } catch {
    /* ignore */
  }
  return applyTheme(id);
}
