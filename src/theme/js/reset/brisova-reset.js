module.exports = ({ addBase }) => {
  addBase({
    "*, *::before, *::after": { boxSizing: "border-box" },
  });
};
