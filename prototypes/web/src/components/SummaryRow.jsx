import React from "react";

export function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default SummaryRow;
