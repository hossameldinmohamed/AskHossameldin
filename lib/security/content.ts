export const QUESTION_MAX_LENGTH = 1500;
export const QUESTION_MIN_LENGTH = 3;
export const ANSWER_MAX_LENGTH = 3000;

// Matches C0/C1 control characters, excluding tab (U+0009) and newline
// (U+000A). Built from \u escapes (rather than literal bytes) so the source
// file stays plain text and editors/tools don't mangle it.
const CONTROL_CHARS_PATTERN = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F-\\u009F]",
  "g",
);

/**
 * Normalizes user-submitted text: strips control characters, normalizes line
 * endings, and collapses excessive whitespace. React escapes all rendered
 * text by default, so this is about hygiene/abuse-resistance, not XSS.
 */
export function sanitizeText(input: string): string {
  let s = input.normalize("NFC").replace(/\r\n?/g, "\n");
  s = s.replace(CONTROL_CHARS_PATTERN, "");
  s = s.replace(/\n{4,}/g, "\n\n\n");
  s = s.replace(/[ \t]{3,}/g, "  ");
  return s.trim();
}

const URL_PATTERN = /(https?:\/\/|www\.)\S+/gi;

/**
 * Lightweight heuristics to catch obvious spam without a captcha. Not meant
 * to be foolproof — combined with rate limiting and manual moderation.
 */
export function looksLikeSpam(input: string): boolean {
  const urlMatches = input.match(URL_PATTERN);
  if (urlMatches && urlMatches.length > 2) return true;

  if (/(.)\1{14,}/.test(input)) return true; // same char 15+ times in a row

  const letters = input.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 24) {
    const upper = letters.replace(/[^A-Z]/g, "").length;
    if (upper / letters.length > 0.85) return true; // ALL CAPS shouting
  }

  return false;
}
