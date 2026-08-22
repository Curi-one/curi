import { renderMarkCAppIcon } from "@/lib/brand/app-icon-mark-c";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

/** Home-screen icon — Mark C at iOS touch size. */
export default async function AppleIcon() {
  return renderMarkCAppIcon(size.width);
}
