import { ImageResponse } from "next/og";
import { getSiteBySlug } from "@/lib/siteStore";

export const runtime = "nodejs";
export const alt = "Silk — generated site preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: { slug: string } }) {
  const site = await getSiteBySlug(params.slug);
  const palette = site?.spec.theme.palette ?? {
    bg: "#F6F1EA",
    fg: "#1A1A1A",
    muted: "#8B857C",
    accent: "#7C8B72",
  };
  const title = site?.spec.meta.title ?? "Silk";
  const description = site?.spec.meta.description ?? "Prompt → animated site.";
  const slug = site?.slug ?? "silk";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: palette.bg,
          color: palette.fg,
          padding: "72px 80px",
          fontFamily: "ui-serif, Georgia, serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: "ui-sans-serif, system-ui",
            fontSize: 18,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: palette.muted,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: palette.accent,
            }}
          />
          <span>Silk · /s/{slug}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.02,
              letterSpacing: -2,
              fontWeight: 500,
              color: palette.fg,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: palette.muted,
              fontFamily: "ui-sans-serif, system-ui",
              maxWidth: 900,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "ui-sans-serif, system-ui",
            fontSize: 20,
            color: palette.muted,
          }}
        >
          <span style={{ letterSpacing: 2, textTransform: "uppercase" }}>
            Generated with Silk
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: palette.accent,
              }}
            />
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: palette.accent2 ?? palette.fg,
              }}
            />
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: palette.fg,
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
