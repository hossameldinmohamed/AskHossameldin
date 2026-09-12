import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <header className="relative overflow-hidden px-6 pb-14 pt-20 text-center sm:pb-20 sm:pt-28">
      <div className="mx-auto flex max-w-2xl flex-col items-center animate-fade-in-up">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-brand text-2xl font-bold text-black shadow-lg shadow-fuchsia-500/20">
          {siteConfig.name.charAt(0)}
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Ask <span className="text-gradient">{siteConfig.name}</span> anything
        </h1>
        <p className="mt-4 max-w-md text-balance text-muted">{siteConfig.tagline}</p>
        <p className="mt-2 text-xs uppercase tracking-wide text-muted/70">
          100% anonymous · no login required
        </p>
      </div>
    </header>
  );
}
