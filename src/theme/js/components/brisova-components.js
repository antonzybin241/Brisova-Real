module.exports = ({ addComponents }) => {
  addComponents({
    ".brisova-card-surface": {
      borderRadius: "0.75rem",
      borderWidth: "1px",
      borderColor: "var(--border)",
      backgroundColor: "var(--bg-card)",
      backdropFilter: "blur(12px)",
    },
    ".brisova-glow-ring": {
      boxShadow: "0 0 0 1px rgba(46, 212, 168, 0.2)",
    },
  });
};
