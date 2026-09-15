import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";

import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { siteConfig } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Geist has no Arabic glyphs, so questions/answers written in Arabic would
// otherwise fall back to whatever generic font the OS picks. Loading this
// explicitly keeps Arabic text on-brand instead of looking inconsistent.
const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url),
  title: {
    default: `${siteConfig.title} — Anonymous Q&A`,
    template: `%s — ${siteConfig.title}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.title} — Anonymous Q&A`,
    description: siteConfig.description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.title} — Anonymous Q&A`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.title,
    statusBarStyle: "black-translucent",
  },
  other: {
    // Next only emits the modern unprefixed "mobile-web-app-capable" tag;
    // older iOS versions specifically look for this prefixed one.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070c",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
