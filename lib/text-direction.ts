// Hebrew, Arabic (+ supplement), Syriac, Thaana, NKo, explicit RTL marks,
// and Hebrew/Arabic presentation forms. Built from \u escapes (rather than
// literal characters) so the source file stays plain ASCII and can't be
// mangled by tools/editors that don't round-trip non-ASCII bytes cleanly.
const RTL_CHAR_PATTERN = new RegExp(
  "[\\u0591-\\u07FF\\u200F\\u202B\\u202E\\uFB1D-\\uFDFF\\uFE70-\\uFEFF]",
);
const LTR_CHAR_PATTERN = /[A-Za-z]/;

/**
 * Same "first strong character" heuristic the HTML `dir="auto"` attribute
 * uses internally, exposed here so layout (not just text alignment) can
 * react to it - e.g. mirroring an icon+text row for RTL content.
 */
export function isRtlText(text: string): boolean {
  for (const ch of text) {
    if (RTL_CHAR_PATTERN.test(ch)) return true;
    if (LTR_CHAR_PATTERN.test(ch)) return false;
  }
  return false;
}
