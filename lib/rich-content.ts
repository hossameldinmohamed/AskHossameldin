const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/gi;

const YOUTUBE_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

export interface ExtractedLinks {
  youtubeIds: string[];
  otherLinks: string[];
}

/**
 * Pulls URLs out of free-form answer text for rich rendering. The original
 * text is always rendered as-is alongside these - this only decides what
 * extra previews/embeds to show underneath it.
 */
export function extractLinks(text: string): ExtractedLinks {
  const matches = text.match(URL_PATTERN) ?? [];
  const youtubeIds: string[] = [];
  const otherLinks: string[] = [];

  for (const raw of matches) {
    // Trim common trailing punctuation that isn't part of the URL.
    const url = raw.replace(/[),.!?;:]+$/, "");

    const youtubeMatch = url.match(YOUTUBE_PATTERN);
    if (youtubeMatch?.[1]) {
      if (!youtubeIds.includes(youtubeMatch[1])) youtubeIds.push(youtubeMatch[1]);
      continue;
    }

    try {
      // Validate it actually parses as a URL before offering it as a link.
      new URL(url);
      if (!otherLinks.includes(url)) otherLinks.push(url);
    } catch {
      // Not a real URL - ignore.
    }
  }

  return { youtubeIds, otherLinks: otherLinks.slice(0, 5) };
}
