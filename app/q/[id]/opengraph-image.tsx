import { ImageResponse } from "next/og";

import { getQuestionById } from "@/lib/queries/wall";
import { stripUrls } from "@/lib/rich-content";
import { siteConfig } from "@/lib/site";
import { isRtlText } from "@/lib/text-direction";

export const runtime = "nodejs";
export const alt = `${siteConfig.title} — Q&A`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Satori (the engine behind next/og's ImageResponse) doesn't apply the
// Unicode bidi algorithm on its own, so Arabic/Hebrew text renders with its
// words in the wrong visual order unless `direction`/`textAlign` are set
// explicitly per text block.
function textStyle(text: string) {
  return isRtlText(text)
    ? { direction: "rtl" as const, textAlign: "right" as const }
    : { direction: "ltr" as const, textAlign: "left" as const };
}

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await getQuestionById(id);

  // Links (e.g. a YouTube URL) are meaningful inline on the actual page
  // (rendered as an embed/chip there) but just wrap awkwardly as raw text
  // in a static preview image, so they're stripped here only.
  const questionText = question ? truncate(stripUrls(question.content), 140) : "Ask me anything";
  const answerText = question?.answer ? truncate(stripUrls(question.answer), 200) : siteConfig.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#07070c",
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(129,140,248,0.35), transparent 55%), radial-gradient(circle at 90% 10%, rgba(232,121,249,0.28), transparent 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 20,
              fontSize: 32,
              fontWeight: 700,
              color: "#07070c",
              backgroundImage: "linear-gradient(135deg, #818cf8, #e879f9 55%, #fb923c)",
            }}
          >
            {siteConfig.name.charAt(0)}
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: "#f5f5f7" }}>
            {siteConfig.title}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: 46,
              fontWeight: 700,
              color: "#f5f5f7",
              lineHeight: 1.25,
              ...textStyle(questionText),
            }}
          >
            {questionText}
          </div>
          {question?.answer && (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "rgba(245,245,247,0.75)",
                lineHeight: 1.4,
                ...textStyle(answerText),
              }}
            >
              {answerText}
            </div>
          )}
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "rgba(245,245,247,0.5)" }}>
          Ask anonymously · no login required
        </div>
      </div>
    ),
    // Explicit (matches the library default) so emoji in questions/answers
    // render as actual colorful glyphs instead of missing-glyph boxes.
    { ...size, emoji: "twemoji" },
  );
}
