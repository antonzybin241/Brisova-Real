import React from "react";
import { Link } from "react-router-dom";
import GlassCard from "./GlassCard";

export default function EmptyState({
  message,
  actionLabel,
  actionTo,
  onAction,
  className = "",
}) {
  return (
    <GlassCard
      className={`brisova-empty-state p-5 text-center brisova-animate-in ${className}`.trim()}
    >
      <p className="brisova-empty-state__message">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="brisova-btn brisova-btn--primary">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button type="button" className="brisova-btn brisova-btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </GlassCard>
  );
}
