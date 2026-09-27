// src/components/BackgroundSelector.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, RotateCcw, Image as ImageIcon, Square, Sparkles } from "lucide-react";
import { useBackground, type BackgroundType } from "@/lib/hooks/useBackground";
import { useI18n } from "@/hooks/useI18n";

export function BackgroundSelector() {
  const { t, locale } = useI18n();
  const { settings, updateSettings, resetSettings } = useBackground();
  const [isOpen, setIsOpen] = useState(false);

  const labels = {
    hy: {
      title: "Ֆոնի Ընտրություն",
      image: "Նռան Ֆոն",
      solid: "Միագույն",
      gradient: "Գրադիենտ",
      color: "Գույն",
      from: "Սկիզբ",
      to: "Վերջ",
      reset: "Վերականգնել",
    },
    en: {
      title: "Background",
      image: "Pomegranate",
      solid: "Solid",
      gradient: "Gradient",
      color: "Color",
      from: "From",
      to: "To",
      reset: "Reset",
    },
    ru: {
      title: "Фон",
      image: "Гранат",
      solid: "Однотонный",
      gradient: "Градиент",
      color: "Цвет",
      from: "От",
      to: "До",
      reset: "Сбросить",
    },
  };

  const L = labels[locale as keyof typeof labels] || labels.hy;

  const handleTypeChange = (type: BackgroundType) => {
    updateSettings({ type });
  };

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

              {/* Type Selector */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => handleTypeChange("image")}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    settings.type === "image"
                      ? "border-red-500 bg-red-500/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <ImageIcon size={20} className={settings.type === "image" ? "text-red-500" : "text-gray-500"} />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{L.image}</span>
                </button>

                <button
                  onClick={() => handleTypeChange("solid")}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    settings.type === "solid"
                      ? "border-red-500 bg-red-500/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <Square size={20} className={settings.type === "solid" ? "text-red-500" : "text-gray-500"} />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{L.solid}</span>
                </button>

                <button
                  onClick={() => handleTypeChange("gradient")}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    settings.type === "gradient"
                      ? "border-red-500 bg-red-500/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <Sparkles size={20} className={settings.type === "gradient" ? "text-red-500" : "text-gray-500"} />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{L.gradient}</span>
                </button>
              </div>

              {/* Color Pickers */}
              {settings.type === "solid" && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {L.color}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.solidColor}
                      onChange={(e) => updateSettings({ solidColor: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      value={settings.solidColor}
                      onChange={(e) => updateSettings({ solidColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>
              )}

              {settings.type === "gradient" && (
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      {L.from}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.gradientFrom}
                        onChange={(e) => updateSettings({ gradientFrom: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        value={settings.gradientFrom}
                        onChange={(e) => updateSettings({ gradientFrom: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      {L.to}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.gradientTo}
                        onChange={(e) => updateSettings({ gradientTo: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        value={settings.gradientTo}
                        onChange={(e) => updateSettings({ gradientTo: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Reset */}
              <button
                onClick={resetSettings}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                <RotateCcw size={14} />
                {L.reset}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BackgroundSelector;