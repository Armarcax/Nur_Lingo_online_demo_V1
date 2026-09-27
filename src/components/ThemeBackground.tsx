// src/components/ThemeBackground.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { useBackground } from "@/lib/hooks/useBackground";

interface ThemeBackgroundProps {
  children: ReactNode;
  className?: string;
  darkImage?: string;
  lightImage?: string;
  showNoise?: boolean;
  showVignette?: boolean;
  showOverlay?: boolean;
  imageOpacity?: number;
}

export function ThemeBackground({
  children,
  className = "",
  darkImage = "/images/pomegranate-dark.jpg",
  lightImage = "/images/pomegranate-light.jpg",
  showNoise = true,
  showVignette = true,
  showOverlay = true,
  imageOpacity = 1,
}: ThemeBackgroundProps) {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { settings } = useBackground();

  useEffect(() => {
    setIsMounted(true);
    const checkTheme = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (!isMounted) {
    return <div className={className}>{children}</div>;
  }

  // ─── BACKGROUND STYLE (based on type) ────────────────────────────

  let backgroundStyle: React.CSSProperties = {};
  let backgroundClassName = "fixed inset-0 -z-10 transition-all duration-500";

  if (settings.type === "image") {
    backgroundClassName += " bg-cover bg-center bg-no-repeat";
    backgroundStyle = {
      backgroundImage: `url(${isDark ? darkImage : lightImage})`,
      opacity: imageOpacity,
    };
  } else if (settings.type === "solid") {
    backgroundStyle = {
      backgroundColor: settings.solidColor,
    };
  } else if (settings.type === "gradient") {
    backgroundStyle = {
      background: `linear-gradient(135deg, ${settings.gradientFrom} 0%, ${settings.gradientTo} 100%)`,
    };
  }

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* ─── LAYER 1: BACKGROUND ─── */}
      <div className={backgroundClassName} style={backgroundStyle} />

      {/* ─── LAYER 2: OVERLAY (only for image) ─── */}
      {settings.type === "image" && showOverlay && (
        <div
          className="fixed inset-0 -z-10 transition-opacity duration-500"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(13,13,20,0.3) 0%, rgba(13,13,20,0.5) 100%)"
              : "linear-gradient(180deg, rgba(250,248,246,0.2) 0%, rgba(250,248,246,0.4) 100%)",
          }}
        />
      )}

      {/* ─── LAYER 3: GLASS LAYER (only for image) ─── */}
      {settings.type === "image" && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: isDark
              ? "rgba(13,13,20,0.15)"
              : "rgba(255,255,255,0.1)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ─── LAYER 4: NOISE ─── */}
      {showNoise && (
        <div
          className="fixed inset-0 -z-10 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }}
        />
      )}

      {/* ─── LAYER 5: VIGNETTE (only for image) ─── */}
      {settings.type === "image" && showVignette && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)"
              : "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.06) 100%)",
          }}
        />
      )}

      {children}
    </div>
  );
}