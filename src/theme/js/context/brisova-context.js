/**
 * Tailwind PostCSS plugin — runs in Node when CSS is built, not in the browser.
 * Any console.log here appears in the terminal (next dev), not in Chrome DevTools.
 */
module.exports = ({ addBase }) => {
  if (process.env.NODE_ENV === "development") {

  }
addBase({
  "*, ::before, ::after": { boxSizing: "border-box" },
})
}