import type { DepthSlug } from "@/lib/api/schemas";
import { DEPTH_OPTIONS } from "@/lib/ui/constants";

export type DepthOption = {
  slug: DepthSlug;
  label: string;
  subcopy: string;
};

const LANGUAGE_TOPIC_RE =
  /^(learn\s+)?(mandarin|spanish|french|german|italian|portuguese|japanese|korean|arabic|hindi|russian|dutch|swedish|norwegian|danish|polish|turkish|vietnamese|thai|hebrew|greek|latin|swahili|cantonese|taiwanese|indonesian|malay|finnish|czech|hungarian|romanian|ukrainian|persian|farsi|urdu)\b/i;

const LANGUAGE_LABELS: DepthOption[] = [
  {
    slug: "essentials",
    label: "Survival phrases",
    subcopy: "Core phrases · about a week",
  },
  {
    slug: "fluent",
    label: "Conversational basics",
    subcopy: "Everyday exchanges · about two weeks",
  },
  {
    slug: "thorough",
    label: "Structured foundation",
    subcopy: "Grammar + patterns · about a month",
  },
];

/** Heuristic depth labels when clarify JSON omits depthOptions. */
export function fallbackDepthOptions(topic: string): DepthOption[] {
  const normalized = topic.trim();
  if (LANGUAGE_TOPIC_RE.test(normalized)) {
    return LANGUAGE_LABELS.map((opt) => ({ ...opt }));
  }
  return DEPTH_OPTIONS.map((opt) => ({ ...opt }));
}
