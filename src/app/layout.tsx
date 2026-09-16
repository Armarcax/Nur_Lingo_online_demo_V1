// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, Playfair_Display, Space_Mono } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
// ❌ REMOVED: import { OfflineIndicatorAuto } from "@/components/OfflineIndicator";
import { NuriProvider } from "@/components/NuriProvider";
import { NuriFloating } from "@/components/NuriFloating";
import { ThemeBackground } from "@/components/ThemeBackground";
import { NuriRain } from "@/components/NuriRain";
import { I18nProvider } from "@/components/I18nProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nurlingo.app"),
  title: {
    default: "NUR Lingo — Հայկական AI Լեզվի Հարթակ",
    template: "%s | NUR Lingo",
  },
  description:
    "AI-native Armenian ↔ English language learning platform. Semantic understanding, HAYQ rewards, interactive lessons with Nuri mascot.",
  keywords: [
    "Armenian",
    "հայերեն",
    "language learning",
    "AI",
    "HAYQ",
    "NLP",
    "Armenia",
    "NUR Lingo",
    "semantic engine",
    "language education",
  ],
  authors: [{ name: "NUR Lingo Team", url: "https://nurlingo.app" }],
  creator: "NUR Lingo",
  publisher: "NUR Lingo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/logo.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "hy_AM",
    alternateLocale: ["en_US", "ru_RU"],
    url: "https://nurlingo.app",
    title: "NUR Lingo — Հայկական AI Լեզվի Հարթակ",
    description:
      "Սովորիր հայերեն AI-ի հետ — semantic understanding, HAYQ reward system, interactive lessons",
    siteName: "NUR Lingo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NUR Lingo — Learn Armenian with AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUR Lingo — Հայկական AI Լեզվի Հարթակ",
    description: "Սովորիր հայերեն AI-ի հետ — semantic understanding, HAYQ rewards",
    images: ["/og-image.jpg"],
    site: "@nurlingo",
    creator: "@nurlingo",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  category: "education",
  classification: "language learning, AI education, Armenian language",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c12" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="hy"
      dir="ltr"
      className={`${inter.variable} ${playfair.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Armenian:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@600;700;800&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('nur_theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (isDark) {
                      document.documentElement.classList.add('dark');
                      document.documentElement.setAttribute('data-theme', 'dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.setAttribute('data-theme', 'light');
                    }
                    localStorage.setItem('nur_theme', isDark ? 'dark' : 'light');
                  }
                } catch (_) {
                  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                }
              })();
            `,
          }}
        />
        
        {/* ✅ CACHE BUSTING */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* ✅ BASE STYLES FOR BACKGROUND VISIBILITY */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Ensure background image is visible */
            body {
              background-color: transparent !important;
            }
            .layer-image {
              opacity: 1 !important;
            }
          `
        }} />
      </head>

      <body className="min-h-screen font-sans antialiased transition-colors duration-300 bg-transparent">
        {/* ✅ I18n Provider - Must be at the top level */}
        <I18nProvider>
          {/* ✅ Nuri Provider - Full Emotion Engine */}
          <NuriProvider>
            {/* ✅ Theme Background - Pomegranate images with .jpg extension */}
            <ThemeBackground
              darkImage="/images/pomegranate-dark.jpg"
              lightImage="/images/pomegranate-light.jpg"
              showVignette={true}
              showNoise={true}
            >
              {/* ✅ Background layers for visibility */}
              <div className="fixed inset-0 -z-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 dark:to-black/20" />
              </div>

              {/* ✅ Language rain — Armenian, English, Russian letters falling together */}
              <NuriRain />

              {/* ✅ Service Worker Register - Offline support */}
              <ServiceWorkerRegister />

              {/* ❌ REMOVED: OfflineIndicatorAuto - now managed by useLessonAudio hook */}

              {/* Content */}
              <div className="relative z-10 container-main">
                {children}
              </div>
              
              {/* ✅ Nuri Floating - Appears on all pages */}
              <NuriFloating size={72} position="bottom-right" />
            </ThemeBackground>
          </NuriProvider>
        </I18nProvider>
      </body>
    </html>
  );
}