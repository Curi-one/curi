import { renderMarkCAppIcon } from "@/lib/brand/app-icon-mark-c";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

/** Favicon — Mark C (section mark on ink with vermilion dot). */
export default async function Icon() {
  return renderMarkCAppIcon(size.width);
}
