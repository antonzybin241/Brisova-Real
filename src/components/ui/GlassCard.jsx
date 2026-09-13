import React from "react";

export default function GlassCard({ className = "", children, ...props }) {
  return (
    <div className={`glass-card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
