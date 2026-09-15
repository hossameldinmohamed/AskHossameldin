import reshaper from "arabic-reshaper";

// Arabic script only (not the broader RTL range in text-direction.ts, which
// also covers Hebrew/Syriac/etc - those don't need this). Built from \u
// escapes rather than literal characters so the source file stays plain
// ASCII and can't be mangled by tools/editors that don't round-trip
// non-ASCII bytes cleanly.
const ARABIC_SCRIPT_PATTERN = new RegExp(
  "[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]",
);

/**
 * Pre-shapes Arabic text into its Presentation-Forms glyphs (the correct
 * initial/medial/final/isolated letter shapes) before handing it to
 * next/og's ImageResponse. Satori (the engine behind ImageResponse) has no
 * built-in Arabic contextual shaping, so without this every letter renders
 * in its isolated form instead of properly joined cursive script.
 */
export function shapeArabicText(text: string): string {
  if (!ARABIC_SCRIPT_PATTERN.test(text)) return text;
  try {
    return reshaper.convertArabic(text);
  } catch {
    return text;
  }
}
