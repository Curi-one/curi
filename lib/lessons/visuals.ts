export type LessonVisual = {
  imageTitle: string;
  imageCaption: string;
};

const visuals: Record<string, LessonVisual> = {
  "Unit Economics": {
    imageTitle: "Contribution before scale",
    imageCaption:
      "Revenue growth without unit contribution is just a more expensive way to fail. The unit is the real story.",
  },
  "Venture Capital": {
    imageTitle: "Power law in one glance",
    imageCaption:
      "Most returns come from a handful of outcomes. That pressure shapes every term you will see.",
  },
  "Term Sheets": {
    imageTitle: "Clauses as incentives",
    imageCaption:
      "Every clause looks standard until you map who gains if the company underperforms.",
  },
  default: {
    imageTitle: "A decision map for the concept",
    imageCaption:
      "Every business concept has a definition on the surface and a decision, incentive, or trade-off underneath.",
  },
};

export function getLessonVisual(topic: string): LessonVisual {
  return visuals[topic] ?? visuals.default;
}
