/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "!./src/theme/js/**",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brisova: {
          mint: "#3a5c4e",
          brass: "#b08a5a",
          ink: "#1b1916",
          elevated: "#fffdf8",
          surface: "#fffdf8",
          muted: "#7a7166",
          primary: "#3a5c4e",
          accent: "#3a5c4e",
          dark: "#1b1916",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "serif"],
        sans: ['"Manrope"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      boxShadow: {
        brisova: "0 14px 36px rgba(46, 212, 168, 0.16)",
        "brisova-ring": "0 0 0 1px rgba(46, 212, 168, 0.28)",
      },
      backgroundImage: {
        "brisova-hero":
          "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(46, 212, 168, 0.42), transparent 58%)",
      },
    },
  },
  plugins: [
    require("./src/theme/js/reset/brisova-reset.js"),
    require("./src/theme/js/tokens/brisova-tokens.js"),
    require("./src/theme/js/utilities/brisova-utilities.js"),
    require("./src/theme/js/context/brisova-context.js"),
    require("./src/theme/js/components/brisova-components.js"),
    require("./src/theme/js/forms/brisova-forms.js"),
    require("./src/theme/js/layout/brisova-layout.js"),
    require("./src/theme/js/a11y/brisova-a11y.js"),
    require("tailwindcss-animate"),
  ],
};