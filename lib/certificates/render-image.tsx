import { ImageResponse } from "next/og";
import type { TrackCertificate } from "@/lib/certificates/types";
import {
  buildTrackInfoLine,
  formatCertificateDay,
  formatCertificateYear,
} from "@/lib/certificates/format";

const FRAUNCES_ITALIC_300 =
  "https://fonts.gstatic.com/s/fraunces/v38/6NVf8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChJdt9vIVYX9G37lvd9sPEKsxx664UJf1gVTf7W.ttf";
const FRAUNCES_REGULAR_400 =
  "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9EaU0GUd7A.ttf";
const PLUS_JAKARTA_300 =
  "https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff";
const JETBRAINS_400 =
  "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbV2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKy.ttf";

let fontsPromise: Promise<
  {
    name: string;
    data: ArrayBuffer;
    style: "normal" | "italic";
    weight: 300 | 400;
  }[]
> | null = null;

async function loadCertificateFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(FRAUNCES_ITALIC_300).then((r) => r.arrayBuffer()),
      fetch(FRAUNCES_REGULAR_400).then((r) => r.arrayBuffer()),
      fetch(PLUS_JAKARTA_300).then((r) => r.arrayBuffer()),
      fetch(JETBRAINS_400).then((r) => r.arrayBuffer()),
    ]).then(([frauncesItalic, frauncesRegular, plusJakarta, jetbrains]) => [
      {
        name: "Fraunces",
        data: frauncesItalic,
        style: "italic" as const,
        weight: 300 as const,
      },
      {
        name: "Fraunces",
        data: frauncesRegular,
        style: "normal" as const,
        weight: 400 as const,
      },
      {
        name: "Plus Jakarta Sans",
        data: plusJakarta,
        style: "normal" as const,
        weight: 300 as const,
      },
      {
        name: "JetBrains Mono",
        data: jetbrains,
        style: "normal" as const,
        weight: 400 as const,
      },
    ]);
  }
  return fontsPromise;
}

export async function renderTrackCertificateImage(
  certificate: TrackCertificate,
) {
  const fonts = await loadCertificateFonts();
  const trackInfo = buildTrackInfoLine(
    certificate.lessonCount,
    certificate.studyMinutes,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: 880,
          height: 900,
          display: "flex",
          position: "relative",
          background: "#faf9f5",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 12,
            border: "1px solid #d4d0c8",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-52%, -50%)",
            fontFamily: "Fraunces",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: 520,
            lineHeight: 1,
            color: "rgba(10,9,8,0.028)",
          }}
        >
          §
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "100%",
            padding: "72px 96px 80px",
          }}
        >
          <div
            style={{
              fontFamily: "Fraunces",
              fontSize: 28,
              fontWeight: 300,
              color: "#0a0908",
              marginBottom: 4,
            }}
          >
            Cu<span style={{ fontStyle: "italic" }}>ri</span>
          </div>
          <div
            style={{
              width: 72,
              height: 3,
              background: "#c1121f",
              marginBottom: 48,
            }}
          />
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 9,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#9e9b94",
              marginBottom: 16,
            }}
          >
            This certifies that
          </div>
          <div
            style={{
              fontFamily: "Fraunces",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: 64,
              color: "#0a0908",
              marginBottom: 40,
              lineHeight: 1,
            }}
          >
            {certificate.recipientName}
          </div>
          <div
            style={{
              width: "100%",
              height: 1,
              background: "#d4d0c8",
              marginBottom: 40,
            }}
          />
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 9,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#9e9b94",
              marginBottom: 12,
            }}
          >
            Has completed a {certificate.lessonCount}-lesson track in
          </div>
          <div
            style={{
              fontFamily: "Fraunces",
              fontWeight: 400,
              fontSize: 42,
              color: "#0a0908",
              marginBottom: 8,
              lineHeight: 1.05,
            }}
          >
            {certificate.topic}
          </div>
          <div
            style={{
              width: 200,
              height: 3,
              background: "#c1121f",
              margin: "24px auto",
            }}
          />
          <div
            style={{
              fontFamily: "Plus Jakarta Sans",
              fontWeight: 300,
              fontSize: 13,
              color: "#6b6760",
              lineHeight: 1.6,
              marginBottom: 52,
              maxWidth: 640,
            }}
          >
            {trackInfo}
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              borderTop: "1px solid #d4d0c8",
              paddingTop: 32,
            }}
          >
            {[
              {
                label: "Completed",
                value: formatCertificateDay(certificate.completedAt),
                sub: formatCertificateYear(certificate.completedAt),
                mono: false,
              },
              {
                label: "Streak at completion",
                value: `${certificate.streakAtCompletion} days`,
                sub: "unbroken",
                mono: false,
              },
              {
                label: "Certificate ID",
                value: certificate.certificateId,
                sub: "curi.one/verify",
                mono: true,
              },
            ].map((item, index, arr) => (
              <div
                key={item.label}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  borderRight:
                    index < arr.length - 1 ? "1px solid #d4d0c8" : "none",
                  padding: "0 24px",
                }}
              >
                <div
                  style={{
                    fontFamily: "JetBrains Mono",
                    fontSize: 8,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#9e9b94",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: item.mono ? "JetBrains Mono" : "Fraunces",
                    fontStyle: item.mono ? "normal" : "italic",
                    fontWeight: item.mono ? 400 : 300,
                    fontSize: item.mono ? 11 : 18,
                    letterSpacing: item.mono ? "0.08em" : undefined,
                    color: "#0a0908",
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 300,
                    fontSize: 11,
                    color: "#9e9b94",
                  }}
                >
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 880,
      height: 900,
      fonts,
    },
  );
}
