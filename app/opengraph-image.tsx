import { ImageResponse } from "next/og";

import { getAnsweredCount } from "@/lib/queries/wall";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${siteConfig.title} — Anonymous Q&A`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const answeredCount = await getAnsweredCount();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          padding: "72px",
          backgroundColor: "#07070c",
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(129,140,248,0.35), transparent 55%), radial-gradient(circle at 90% 10%, rgba(232,121,249,0.28), transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 32,
            fontSize: 56,
            fontWeight: 700,
            color: "#07070c",
            backgroundImage: "linear-gradient(135deg, #818cf8, #e879f9 55%, #fb923c)",
          }}
        >
          {siteConfig.name.charAt(0)}
        </div>

        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#f5f5f7" }}>
          Ask {siteConfig.name} anything
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "rgba(245,245,247,0.75)" }}>
          {siteConfig.tagline}
        </div>

        {answeredCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 8,
              padding: "10px 24px",
              borderRadius: 999,
              border: "1px solid rgba(245,245,247,0.15)",
              fontSize: 24,
              color: "rgba(245,245,247,0.6)",
            }}
          >
            {answeredCount} {answeredCount === 1 ? "question" : "questions"} answered
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
