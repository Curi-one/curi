import React from "react";
import { Icon } from "@/components/Icon";

export function SectionLabel({ icon, label }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/90">
      {icon ? <Icon name={icon} size={14} className="shrink-0 text-muted-foreground/55" /> : null}
      <span>{label}</span>
    </div>
  );
}

export default SectionLabel;
