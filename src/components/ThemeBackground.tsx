// src/components/ThemeBackground.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { useTheme } from "@/lib/hooks/useTheme";

interface ThemeBackgroundProps {
  children: ReactNode;
  className?: string;
  darkImage?: string;
  lightImage?: string;
  showVignette?: boolean;
  showNoise?: boolean;
}

export function ThemeBackground({
  children,
  className = "",
  darkImage,
  lightImage,
  showVignette = false,
  showNoise = false,
}: ThemeBackgroundProps) {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { currentPreset, patternEnabled } = useTheme();

  useEffect(() => {
    setIsMounted(true);
    const checkTheme = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  if (!isMounted) {
    return <div className={className}>{children}</div>;
  }

  const { colors } = currentPreset;
  const from = isDark ? colors.darkFrom : colors.lightFrom;
  const to = isDark ? colors.darkTo : colors.lightTo;
  const bgImage = isDark ? darkImage : lightImage;

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* ─── LAYER 1: GRADIENT BACKGROUND (theme preset) ─── */}
      <div
        className="fixed inset-0 -z-20 transition-all duration-700"
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
      />

      {/* ─── LAYER 2: POMEGRANATE IMAGE OVERLAY ─── */}
      {bgImage && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none transition-opacity duration-700"
          style={{
            backgroundImage: `url("${bgImage}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: isDark ? 0.35 : 0.25,
            mixBlendMode: isDark ? "luminosity" : "multiply",
          }}
        />
      )}

      {/* ─── LAYER 3: PATTERN OVERLAY (very subtle) ─── */}
      {patternEnabled && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            opacity: isDark ? 0.04 : 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDark ? "FFFFFF" : "8B0000"}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* ─── LAYER 4: VIGNETTE (optional) ─── */}
      {showVignette && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)"
              : "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.12) 100%)",
          }}
        />
      )}

      {/* ─── LAYER 5: NOISE (optional) ─── */}
      {showNoise && (
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            opacity: isDark ? 0.06 : 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {children}
    </div>
  );
}