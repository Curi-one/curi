import React from "react";
import { Panel } from "@/components/Panel";
import { Icon } from "@/components/Icon";

export function SmallStat({ icon, label, value }) {
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon name={icon} size={16} /> {label}</div>
      <div className="mt-4 font-serif text-3xl tracking-[-0.03em] text-foreground">{value}</div>
    </Panel>
  );
}

export default SmallStat;
