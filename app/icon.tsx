import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 700,
          color: "#07070c",
          backgroundImage: "linear-gradient(135deg, #818cf8, #e879f9 55%, #fb923c)",
        }}
      >
        {siteConfig.name.charAt(0)}
      </div>
    ),
    { ...size },
  );
}
