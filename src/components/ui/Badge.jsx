import React from "react";

const variants = {
  default: "brisova-badge",
  info: "brisova-badge brisova-badge--info",
  success: "brisova-badge brisova-badge--success",
  warning: "brisova-badge brisova-badge--warning",
};

export default function Badge({ variant = "default", children, className = "" }) {
  return (
    <span className={`${variants[variant] || variants.default} ${className}`.trim()}>
      {children}
    </span>
  );
}
