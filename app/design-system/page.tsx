import { notFound } from "next/navigation";
import { DesignSystemShowcase } from "@/components/design-system/DesignSystemShowcase";
import { isDesignSystemEnabled } from "@/lib/design-system/access";
import { getEnv } from "@/lib/env";

export default function DesignSystemPage() {
  if (!isDesignSystemEnabled(getEnv().APP_ENV)) {
    notFound();
  }

  return <DesignSystemShowcase />;
}
