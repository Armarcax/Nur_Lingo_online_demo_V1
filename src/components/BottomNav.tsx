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
} from "lucide-react";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

interface BottomNavProps {
  /**
   * Show profile and settings tabs (default: false)
   */
  showProfile?: boolean;
  /**
   * Audio test callback
   */
  onTestAudio?: () => void;
  /**
   * Whether offline mode is active
   */
  isOffline?: boolean;
}

export default function BottomNav({ 
  showProfile = false,
  onTestAudio,
  isOffline = false
}: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems: NavItem[] = [
    {
      href: "/",
      labelKey: "BottomNav_home",
      icon: <Home size={20} strokeWidth={1.8} />,
      activeIcon: <Home size={20} strokeWidth={2.5} />,
    },
    {
      href: "/world",
      labelKey: "BottomNav_world",
      icon: <Globe size={20} strokeWidth={1.8} />,
      activeIcon: <Globe size={20} strokeWidth={2.5} />,
    },
    {
      href: "/dictionary",
      labelKey: "BottomNav_dict",
      icon: <BookOpen size={20} strokeWidth={1.8} />,
      activeIcon: <BookOpen size={20} strokeWidth={2.5} />,
    },
    {
      href: "/user-dictionary",
      labelKey: "BottomNav_user",
      icon: <Users size={20} strokeWidth={1.8} />,
      activeIcon: <Users size={20} strokeWidth={2.5} />,
    },
    {
      href: "/curriculum",
      labelKey: "BottomNav_prog_",
      icon: <LayoutGrid size={20} strokeWidth={1.8} />,
      activeIcon: <LayoutGrid size={20} strokeWidth={2.5} />,
    },
    {
      href: "/dialogues",
      labelKey: "BottomNav_dial_",
      icon: <Sparkles size={20} strokeWidth={1.8} />,
      activeIcon: <Sparkles size={20} strokeWidth={2.5} />,
    },
  ];

  // Add profile items if enabled
  if (showProfile) {
    navItems.push(
      {
        href: "/profile",
        labelKey: "BottomNav_profile",
        icon: <User size={20} strokeWidth={1.8} />,
        activeIcon: <User size={20} strokeWidth={2.5} />,
      },
      {
        href: "/settings",
        labelKey: "BottomNav_settings",
        icon: <Settings size={20} strokeWidth={1.8} />,
        activeIcon: <Settings size={20} strokeWidth={2.5} />,
      }
    );
  }

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  // ✅ Test audio handler
  const handleTestAudio = () => {
    console.log('🔊🔊🔊 TEST AUDIO BUTTON CLICKED FROM BOTTOM NAV!');
    
    if (onTestAudio) {
      onTestAudio();
      return;
    }
    
    const testPath = resolveOfflineAudio('greet_hello', 'hy')?.url;
    if (!testPath) {
      console.error('[offline-audio] test key is unresolved', { audioKey: 'greet_hello', language: 'hy' });
      return;
    }
    console.log('🎯 Testing path:', testPath);
    
    const audio = new Audio(testPath);
    audio.play()
      .then(() => {
        console.log('✅ Audio started playing!');
        alert(t('AudioControls__speaking'));
      })
      .catch((err) => {
        console.error('❌ Playback error:', err);
        alert(t('page__audio_playback_failed') + ' ' + err.message);
      });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="relative mx-2 mb-3 md:mx-auto md:max-w-lg">
        {/* Floating theme toggle and test button */}
        <div className="absolute -top-14 right-0 flex items-center gap-2">
          {/* ✅ TEST AUDIO BUTTON */}
          <button
            onClick={handleTestAudio}
            className={`p-2 rounded-xl transition-all duration-200 border ${
              isOffline
                ? 'bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30'
                : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30'
            }`}
            title={isOffline ? t('OfflineIndicator__offline') : t('AudioControls__speaking')}
          >
            <Volume2 size={16} />
          </button>
          
          <ThemeToggle size="sm" />
        </div>
        
        {/* ✅ Glassmorphism BottomNav */}
        <div className="rounded-2xl px-1 py-2 shadow-2xl border border-white/10 bg-background/60 backdrop-blur-xl transition-all duration-300 hover:shadow-glass-lg">
          <div className="flex items-center justify-around gap-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="relative group flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 min-w-0"
                  aria-label={t(item.labelKey)}
                >
                  <div className="relative flex flex-col items-center gap-0.5">
                    <motion.div
                      className="relative"
                      animate={{
                        scale: active ? 1.1 : 1,
                        y: active ? -2 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <span
                        className={`transition-colors duration-200 ${
                          active
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                        }`}
                      >
                        {active ? (item.activeIcon || item.icon) : item.icon}
                      </span>

                      {active && (
                        <motion.div
                          layoutId="activeNavDot"
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.div>

                    <motion.span
                      className={`text-[8px] font-medium tracking-wide transition-colors duration-200 whitespace-nowrap ${
                        active
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                      }`}
                      animate={{
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {t(item.labelKey)}
                    </motion.span>

                    {active && (
                      <motion.div
                        layoutId="activeNavBg"
                        className="absolute inset-0 -z-10 rounded-xl bg-red-500/10 dark:bg-red-500/10"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ✅ Glass glow effect */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-gradient-to-r from-red-500/20 via-red-400/20 to-red-500/20 dark:from-red-500/10 dark:via-red-400/10 dark:to-red-500/10 blur-2xl pointer-events-none -z-10" />
      </div>
    </nav>
  );
}

/**
 * BottomNav with safe area padding for mobile
 */
export function BottomNavWithSafeArea({ 
  showProfile = false,
  onTestAudio,
  isOffline = false
}: BottomNavProps) {
  return (
    <div className="pb-[76px] md:pb-0">
      <BottomNav 
        showProfile={showProfile} 
        onTestAudio={onTestAudio}
        isOffline={isOffline}
      />
    </div>
  );
}