import React from "react";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="brisova-page-header d-flex flex-wrap justify-content-between align-items-end gap-3">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
