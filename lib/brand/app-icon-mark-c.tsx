import { ImageResponse } from "next/og";

/** Mark C — ink field, Fraunces §, vermilion accent dot (brand icon exploration). */
export const APP_ICON_INK = "#0a0908";
export const APP_ICON_PAPER = "#faf9f5";
export const APP_ICON_ACCENT = "#c1121f";

const FRAUNCES_ITALIC_300_URL =
  "https://fonts.gstatic.com/s/fraunces/v38/6NVf8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChJdt9vIVYX9G37lvd9sPEKsxx664UJf1gVTf7W.ttf";

let fontCache: ArrayBuffer | null = null;

async function loadFrauncesItalic300(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const res = await fetch(FRAUNCES_ITALIC_300_URL);
  if (!res.ok) {
    throw new Error("Failed to load Fraunces font for app icon");
  }
  fontCache = await res.arrayBuffer();
  return fontCache;
}

/** Proportions from the 256px Mark C reference in curi-app-icon.html. */
export function markCMetrics(size: number) {
  const scale = size / 256;
  return {
    glyphSize: Math.round(172 * scale),
    dotSize: Math.round(18 * scale),
    dotInset: Math.round(18 * scale),
  };
}

export function MarkCIcon({ size }: { size: number }) {
  const { glyphSize, dotSize, dotInset } = markCMetrics(size);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: APP_ICON_INK,
        position: "relative",
      }}
    >
      <span
        style={{
          fontFamily: "Fraunces",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: glyphSize,
          color: APP_ICON_PAPER,
          lineHeight: 1,
        }}
      >
        §
      </span>
      <div
        style={{
          position: "absolute",
          bottom: dotInset,
          right: dotInset,
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: APP_ICON_ACCENT,
        }}
      />
    </div>
  );
}

export async function renderMarkCAppIcon(size: number) {
  const fontData = await loadFrauncesItalic300();

  return new ImageResponse(<MarkCIcon size={size} />, {
    width: size,
    height: size,
    fonts: [
      {
        name: "Fraunces",
        data: fontData,
        style: "italic",
        weight: 300,
      },
    ],
  });
}
