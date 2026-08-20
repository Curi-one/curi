import React from "react";

export function Panel({ children, className = "" }) {
  return <div className={`rounded-xl border border-border/60 bg-muted/20 p-5 sm:p-6 depth-surface ${className}`}>{children}</div>;
}

export default Panel;
