"use client";

import { useRouter } from "next/navigation";
import { postDevPersona } from "@/lib/api/client";

export function DevPersonaToggle() {
  const router = useRouter();

  if (process.env.NODE_ENV !== "development") return null;

  async function setPersona(persona: "guest" | "member") {
    await postDevPersona(persona);
    router.refresh();
  }

  return (
    <div className="fixed right-3 top-3 z-[100] flex gap-1 rounded-none border border-border bg-paper px-2 py-1 text-xs">
      <span className="px-1 text-ink-muted">Dev:</span>
      <button
        type="button"
        onClick={() => void setPersona("guest")}
        className="px-2 py-1"
      >
        Guest
      </button>
      <button
        type="button"
        onClick={() => void setPersona("member")}
        className="px-2 py-1"
      >
        Member
      </button>
    </div>
  );
}
