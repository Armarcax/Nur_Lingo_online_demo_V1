// src/components/BottomNav.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { resolveOfflineAudio } from "@/lib/offline/offline-audio-resolver";
import { useI18n } from "@/hooks/useI18n";
import {
  Home,
  Globe,
  BookOpen,
  LayoutGrid,
  Sparkles,
  Settings,
  User,
  Users,
  Volume2,
  Car,
  ShieldAlert,
} from "lucide-react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  fallbackLabel?: string;
}

interface BottomNavProps {
  showProfile?: boolean;
  onTestAudio?: () => void;
  isOffline?: boolean;
}

export default function BottomNav({
  showProfile = false,
  onTestAudio,
  isOffline = false,
}: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  const safeT = (key: string, fallback: string): string => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  const navItems: NavItem[] = [
    {
      href: "/",
      labelKey: "BottomNav_home",
      icon: <Home size={20} strokeWidth={2} />,
      activeIcon: <Home size={20} strokeWidth={2.5} />,
      fallbackLabel: "Սկիզբ",
    },
    {
      href: "/world",
      labelKey: "BottomNav_world",
      icon: <Globe size={20} strokeWidth={2} />,
      activeIcon: <Globe size={20} strokeWidth={2.5} />,
      fallbackLabel: "Լեզու",
    },
    {
      href: "/drive-test",
      labelKey: "BottomNav_drive",
      icon: <Car size={20} strokeWidth={2} />,
      activeIcon: <Car size={20} strokeWidth={2.5} />,
      fallbackLabel: "Վարորդ.",
    },
    {
      href: "/world/qaghaqpashtpanutyun",
      labelKey: "BottomNav_civil",
      icon: <ShieldAlert size={20} strokeWidth={2} />,
      activeIcon: <ShieldAlert size={20} strokeWidth={2.5} />,
      fallbackLabel: "Քաղ.",
    },
    {
      href: "/dictionary",
      labelKey: "BottomNav_dict",
      icon: <BookOpen size={20} strokeWidth={2} />,
      activeIcon: <BookOpen size={20} strokeWidth={2.5} />,
      fallbackLabel: "Բառ.",
    },
    {
      href: "/user-dictionary",
      labelKey: "BottomNav_user",
      icon: <Users size={20} strokeWidth={2} />,
      activeIcon: <Users size={20} strokeWidth={2.5} />,
      fallbackLabel: "Օգտ.",
    },
    {
      href: "/curriculum",
      labelKey: "BottomNav_prog_",
      icon: <LayoutGrid size={20} strokeWidth={2} />,
      activeIcon: <LayoutGrid size={20} strokeWidth={2.5} />,
      fallbackLabel: "Ծրագիր",
    },
    {
      href: "/dialogues",
      labelKey: "BottomNav_dial_",
      icon: <Sparkles size={20} strokeWidth={2} />,
      activeIcon: <Sparkles size={20} strokeWidth={2.5} />,
      fallbackLabel: "Զրույց",
    },
  ];

  if (showProfile) {
    navItems.push(
      {
        href: "/profile",
        labelKey: "BottomNav_profile",
        icon: <User size={20} strokeWidth={2} />,
        activeIcon: <User size={20} strokeWidth={2.5} />,
        fallbackLabel: "Պրոֆիլ",
      },
      {
        href: "/settings",
        labelKey: "BottomNav_settings",
        icon: <Settings size={20} strokeWidth={2} />,
        activeIcon: <Settings size={20} strokeWidth={2.5} />,
        fallbackLabel: "Կարգ.",
      }
    );
  }

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleTestAudio = () => {
    if (onTestAudio) {
      onTestAudio();
      return;
    }
    const testPath = resolveOfflineAudio("greet_hello", "hy")?.url;
    if (!testPath) return;
    const audio = new Audio(testPath);
    audio.play().catch((err) => console.error("❌ Playback error:", err));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="relative mx-2 mb-2 md:mx-auto md:max-w-3xl">
        <div className="absolute -top-14 right-0 flex items-center gap-2">
          <button
            onClick={handleTestAudio}
            className={`p-2.5 rounded-xl transition-all duration-200 border shadow-sm active:translate-y-1 ${
              isOffline
                ? "bg-green-500/20 text-green-600 border-green-500/30"
                : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
            }`}
            aria-label={isOffline ? "Offline audio" : "Test audio"}
          >
            <Volume2 size={18} />
          </button>
          <ThemeToggle size="sm" />
        </div>

        {/* 3D Glass BottomNav */}
        <div className="rounded-2xl px-1 py-2 shadow-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
          <div className="flex items-center justify-around gap-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const label = safeT(item.labelKey, item.fallbackLabel || item.labelKey);

              return (
                <motion.button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  whileTap={{ scale: 0.9, y: 2 }}
                  className={`relative group flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 min-w-0 min-h-[48px] ${
                    active
                      ? "bg-red-500/10 dark:bg-red-500/20"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  aria-label={label}
                >
                  <div className="relative flex flex-col items-center gap-0.5">
                    <motion.div
                      animate={{ scale: active ? 1.1 : 1, y: active ? -2 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <span
                        className={`transition-colors duration-200 ${
                          active
                            ? "text-red-600 dark:text-red-400 drop-shadow-md"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {active ? item.activeIcon || item.icon : item.icon}
                      </span>
                    </motion.div>

                    <span
                      className={`text-[8px] font-bold tracking-wide transition-colors duration-200 whitespace-nowrap ${
                        active
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-gradient-to-r from-red-500/20 via-red-400/20 to-red-500/20 dark:from-red-500/10 dark:via-red-400/10 dark:to-red-500/10 blur-2xl pointer-events-none -z-10" />
      </div>
    </nav>
  );
}

export function BottomNavWithSafeArea(props: BottomNavProps) {
  return (
    <div className="pb-[76px] md:pb-0">
      <BottomNav {...props} />
    </div>
  );
}