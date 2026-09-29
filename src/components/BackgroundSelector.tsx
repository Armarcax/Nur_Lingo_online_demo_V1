// src/components/BackgroundSelector.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Check } from "lucide-react";
import { useTheme, THEME_PRESETS } from "@/lib/hooks/useTheme";
import { useI18n } from "@/hooks/useI18n";

export function BackgroundSelector() {
  const { locale } = useI18n();
  const { themeId, patternEnabled, updateTheme, updatePattern } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const labels = {
    hy: {
      title: "Ֆոնի Տեսք",
      pattern: "Նռան Pattern",
      patternOn: "Միացված",
      patternOff: "Անջատված",
    },
    en: {
      title: "Background Style",
      pattern: "Pomegranate Pattern",
      patternOn: "Enabled",
      patternOff: "Disabled",
    },
    ru: {
      title: "Стиль Фона",
      pattern: "Узор Граната",
      patternOn: "Включён",
      patternOff: "Отключён",
    },
  };

  const L = labels[locale as keyof typeof labels] || labels.hy;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[60] p-2.5 rounded-xl bg-white/40 dark:bg-gray-900/50 backdrop-blur-sm border border-white/20 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/80 transition-all shadow-lg"
        title={L.title}
        aria-label={L.title}
      >
        <Palette size={18} />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700 p-5 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-red-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {L.title}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              {/* Theme List */}
              <div className="space-y-2 mb-4">
                {THEME_PRESETS.map((preset) => {
                  const isActive = themeId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => updateTheme(preset.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        isActive
                          ? "border-red-500 bg-red-500/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      {/* Preview */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <div
                          className="w-10 h-4 rounded-md border border-white/30"
                          style={{
                            background: `linear-gradient(135deg, ${preset.colors.lightFrom} 0%, ${preset.colors.lightTo} 100%)`,
                          }}
                        />
                        <div
                          className="w-10 h-4 rounded-md border border-white/30"
                          style={{
                            background: `linear-gradient(135deg, ${preset.colors.darkFrom} 0%, ${preset.colors.darkTo} 100%)`,
                          }}
                        />
                      </div>

                      {/* Label */}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {preset.label[locale as keyof typeof preset.label] ||
                            preset.label.hy}
                        </p>
                      </div>

                      {/* Check */}
                      {isActive && (
                        <Check size={18} className="text-red-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pattern Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {L.pattern}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {patternEnabled ? L.patternOn : L.patternOff}
                  </p>
                </div>
                <button
                  onClick={() => updatePattern(!patternEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    patternEnabled
                      ? "bg-red-500"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      patternEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BackgroundSelector;