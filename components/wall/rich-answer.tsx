import { LinkIcon } from "@/components/icons";
import { extractLinks } from "@/lib/rich-content";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Renders YouTube links as an embedded player and other links as a chip. */
export function RichAnswer({ text }: { text: string }) {
  const { youtubeIds, otherLinks } = extractLinks(text);

  if (youtubeIds.length === 0 && otherLinks.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-3">
      {youtubeIds.map((id) => (
        <div
          key={id}
          className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black"
        >
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title="Embedded YouTube video"
            className="size-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ))}

      {otherLinks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {otherLinks.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <LinkIcon className="size-3.5" />
              {hostnameOf(url)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
