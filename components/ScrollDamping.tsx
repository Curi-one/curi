"use client";

import { useEffect } from "react";
import { installScrollDamping } from "@/lib/ui/scroll-damping";

/** App-wide wheel scroll at 90% of native speed (smoother flow). */
export function ScrollDamping() {
  useEffect(() => installScrollDamping(), []);
  return null;
}
