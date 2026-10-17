// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import {
  Inter,
  Space_Mono,
  Noto_Sans_Armenian,
  Noto_Serif_Armenian,
} from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { NuriProvider } from "@/components/NuriProvider";
import { ThemeBackground } from "@/components/ThemeBackground";
import { I18nProvider } from "@/components/I18nProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

// ─── FONTS ────────────────────────────────────────────────────────────

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ["armenian", "latin"],
  variable: "--font-armenian",
  display: "swap",
});

const notoSerifArmenian = Noto_Serif_Armenian({
  subsets: ["armenian", "latin"],
  variable: "--font-armenian-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "700"],
});

// ─── METADATA ─────────────────────────────────────────────────────────

const SITE_URL = "https://nurlingo.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NUR Lingo — Հայկական AI Լեզվի Հարթակ",
    template: "%s | NUR Lingo",
  },
  description:
    "Learn Armenian, English, and Russian with an AI-native platform. Interactive lessons, real dialogues, and HAYQ rewards with Nuri.",
  keywords: [
    "Armenian", "հայերեն", "language learning", "AI", "HAYQ", "NLP",
    "Armenia", "NUR Lingo", "semantic engine", "language education",
  ],
  authors: [{ name: "NUR Lingo Team", url: SITE_URL }],
  creator: "NUR Lingo",
  publisher: "NUR Lingo",
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: {
    canonical: SITE_URL,
    languages: { "hy-AM": SITE_URL, "en-US": `${SITE_URL}/en`, "ru-RU": `${SITE_URL}/ru` },
  },
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/logo.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website", locale: "hy_AM", alternateLocale: ["en_US", "ru_RU"], url: SITE_URL,
    title: "NUR Lingo — Հայկական AI Լեզվի Հարթակ",
    description: "Սովորիր հայերեն, անգլերեն կամ ռուսերեն AI-ի հետ — интерактивные դասեր, երկխոսություններ, HAYQ պարգևներ։",
    siteName: "NUR Lingo",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NUR Lingo — Learn Armenian with AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUR Lingo — Հայկական AI Լեզվի Հարթակ",
    description: "Սովորիր հայերեն AI-ի հետ — interactive lessons, real dialogues, HAYQ rewards",
    images: ["/og-image.jpg"], site: "@nurlingo", creator: "@nurlingo",
  },
  category: "education",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5, userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c12" },
  ],
};

// ─── INLINE BOOT SCRIPT ──────────────────────────────────────────────
// Runs before paint to prevent FOUC of theme, language, font, and color.

const BOOT_SCRIPT = `
(function () {
  var root = document.documentElement;
  try {
    // ─── THEME ───
    var storedTheme = localStorage.getItem('nurlingo_theme');
    var isDark;
    if (storedTheme === 'dark') isDark = true;
    else if (storedTheme === 'light') isDark = false;
    else isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    // ─── LANGUAGE ───
    try {
      var cfg = localStorage.getItem('nur_lang_config');
      if (cfg) {
        var parsed = JSON.parse(cfg);
        var lang = parsed && parsed.native;
        if (lang === 'hy' || lang === 'en' || lang === 'ru') {
          root.setAttribute('lang', lang);
        }
      }
    } catch (_) { /* ignore */ }

    // ─── FONT & COLOR PALETTE ───
    try {
      var font = localStorage.getItem('nur_font') || 'sans';
      var color = localStorage.getItem('nur_color') || 'red';
      root.setAttribute('data-font', font);
      root.setAttribute('data-color', color);
    } catch (_) { /* ignore */ }

  } catch (_) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }
})();
`;

// ─── LAYOUT ───────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="hy"
      dir="ltr"
      data-font="sans"
      data-color="red"
      className={`${notoSansArmenian.variable} ${notoSerifArmenian.variable} ${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>

      <body className="min-h-screen antialiased bg-transparent">
        <I18nProvider>
          <NuriProvider>
            <ThemeBackground showSelector>
              <div className="relative z-10 container-main">{children}</div>
              <ServiceWorkerRegister />
            </ThemeBackground>
          </NuriProvider>
        </I18nProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}