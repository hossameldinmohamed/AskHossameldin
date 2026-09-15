import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";

import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";

const ALLOWED_SIZES = [192, 512];

// Generous inner padding so the same image is safe to use as both an
// "any"-purpose and a "maskable"-purpose manifest icon: OS shells that
// crop maskable icons into a circle/squircle won't clip the letter.
const SAFE_ZONE_RATIO = 0.65;

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeParam } = await params;
  const size = Number(sizeParam);

  if (!ALLOWED_SIZES.includes(size)) {
    return NextResponse.json({ error: "Unsupported icon size." }, { status: 404 });
  }

  const glyphSize = Math.round(size * SAFE_ZONE_RATIO * 0.6);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: glyphSize,
          fontWeight: 700,
          color: "#07070c",
          backgroundColor: "#07070c",
          backgroundImage: "linear-gradient(135deg, #818cf8, #e879f9 55%, #fb923c)",
        }}
      >
        {siteConfig.name.charAt(0)}
      </div>
    ),
    { width: size, height: size },
  );
}
