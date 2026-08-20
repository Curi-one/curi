import React from "react";

export function AmbientMarks() {
  return (
    <div className="ambient-marks pointer-events-none absolute inset-0 opacity-100">
      <div className="absolute inset-0 bg-card" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-muted/40 to-card" />
    </div>
  );
}

export default AmbientMarks;
