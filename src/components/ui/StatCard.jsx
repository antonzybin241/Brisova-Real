import React from "react";

export default function StatCard({ label, value, hint, accent, className = "" }) {
  return (
    <div className={`brisova-stat-card brisova-animate-in ${className}`.trim()}>
      <h4>{label}</h4>
      <p className={accent ? "brisova-text-success" : ""}>{value}</p>
      {hint && <span className="brisova-stat-hint">{hint}</span>}
    </div>
  );
}
