import React from "react";
import GlassCard from "../ui/GlassCard";

export default function PropertyMap({ latitude, longitude, title }) {
  if (!latitude || !longitude) {
    return (
      <GlassCard className="p-4">
        <p className="text-muted mb-0">Map unavailable for this property.</p>
      </GlassCard>
    );
  }

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${
    longitude - 0.02
  }%2C${latitude - 0.01}%2C${longitude + 0.02}%2C${
    latitude + 0.01
  }&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <GlassCard className="brisova-map overflow-hidden">
      <iframe title={title || "Property location"} src={src} loading="lazy" className="brisova-map__frame" />
    </GlassCard>
  );
}
