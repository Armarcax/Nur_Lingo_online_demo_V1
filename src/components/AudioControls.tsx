// src/components/AudioControls.tsx

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Settings,
  Mic,
  Check,
} from "lucide-react";
import { useLessonAudio } from "@/lib/hooks/useLessonAudio";
import type { AudioMode, AudioSource } from "@/lib/audio/LessonAudio";
import { useI18n } from "@/hooks/useI18n";

interface AudioControlsProps {
  className?: string;
  compact?: boolean;
}

export function AudioControls({ className = "", compact = false }: AudioControlsProps) {
  const { t } = useI18n();
  const { config, updateConfig, toggleEnabled, isEnabled, isSpeaking } = useLessonAudio();
  const [showSettings, setShowSettings] = useState(false);

  const handleModeChange = useCallback((mode: AudioMode) => {
    updateConfig({ mode });
  }, [updateConfig]);

  const handleSourceChange = useCallback((source: AudioSource) => {
    updateConfig({ source });
  }, [updateConfig]);

  const handleSpeedChange = useCallback((speed: number) => {
    updateConfig({ speed });
  }, [updateConfig]);

  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // ─── COMPACT VERSION ───────────────────────────────────────────────

  if (compact) {
    return (
      <button
        onClick={toggleEnabled}
        className={`p-2 rounded-xl transition-colors ${
          isEnabled
            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            : "bg-white/5 text-white/30 hover:bg-white/10"
        } ${isSpeaking ? "animate-pulse" : ""}`}
        title={isEnabled ? t("audio_controls_disable") : t("audio_controls_enable")}
      >
        {isSpeaking ? (
          <Mic size={16} className="text-blue-400 animate-pulse" />
        ) : isEnabled ? (
          <Volume2 size={16} />
        ) : (
          <VolumeX size={16} />
        )}
      </button>
    );
  }

  // ─── FULL VERSION ──────────────────────────────────────────────────

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1.5">
        {/* Toggle Button */}
        <button
          onClick={toggleEnabled}
          className={`p-2 rounded-lg transition-colors ${
            isEnabled
              ? "bg-blue-500/20 text-blue-400"
              : "bg-white/5 text-white/30"
          } ${isSpeaking ? "animate-pulse" : ""}`}
          title={isEnabled ? t("audio_controls_disable") : t("audio_controls_enable")}
        >
          {isSpeaking ? (
            <Mic size={16} className="text-blue-400 animate-pulse" />
          ) : isEnabled ? (
            <Volume2 size={16} />
          ) : (
            <VolumeX size={16} />
          )}
        </button>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1">
          <div className={`w-1.5 h-1.5 rounded-full ${isEnabled ? "bg-green-500" : "bg-red-500/50"}`} />
          <span className="text-[10px] font-medium text-white/60">
            {isEnabled ? t("audio_controls_on") : t("audio_controls_off")}
          </span>
          {isSpeaking && (
            <span className="text-[8px] text-blue-400 animate-pulse">
              {t("AudioControls__speaking")}
            </span>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={toggleSettings}
          className={`p-1.5 rounded-lg transition-colors ${
            showSettings
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <Settings size={14} />
        </button>
      </div>

      {/* ─── SETTINGS DROPDOWN ─── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 z-50 bg-white/95 dark:bg-gray-900/95 border border-white/20 rounded-xl p-4 min-w-[240px] shadow-2xl backdrop-blur-xl"
          >
            <div className="space-y-4">
              {/* Mode Selection */}
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">
                  {t("audio_controls_mode")}
                </label>
                <div className="flex gap-1">
                  {(["on", "auto", "off"] as AudioMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleModeChange(mode)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        config.mode === mode
                          ? mode === "off"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                          : "bg-white/5 text-white/40 hover:text-white/70"
                      }`}
                    >
                      {mode === "on" && t("audio_controls_mode_on")}
                      {mode === "auto" && t("audio_controls_mode_auto")}
                      {mode === "off" && t("audio_controls_mode_off")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Selection */}
              {config.mode !== "off" && (
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">
                    {t("audio_controls_source")}
                  </label>
                  <div className="flex gap-1">
                    {(["wav", "mp3", "tts"] as AudioSource[]).map((source) => (
                      <button
                        key={source}
                        onClick={() => handleSourceChange(source)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          config.source === source
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-white/5 text-white/40 hover:text-white/70"
                        }`}
                      >
                        {source === "wav" && t("audio_controls_source_wav")}
                        {source === "mp3" && t("audio_controls_source_mp3")}
                        {source === "tts" && t("audio_controls_source_tts")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Speed Control */}
              {config.mode !== "off" && (
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">
                    {t("audio_controls_speed")}: {config.speed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={config.speed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full bg-white/20 appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}

              {/* Auto Play Options */}
              {config.mode !== "off" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block">
                    {t("audio_controls_autoplay")}
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => updateConfig({ autoPlayQuestions: !config.autoPlayQuestions })}
                      className={`py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        config.autoPlayQuestions
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {t("audio_controls_autoplay_questions")} {config.autoPlayQuestions && "✅"}
                    </button>
                    <button
                      onClick={() => updateConfig({ autoPlayAnswers: !config.autoPlayAnswers })}
                      className={`py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        config.autoPlayAnswers
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {t("audio_controls_autoplay_answers")} {config.autoPlayAnswers && "✅"}
                    </button>
                    <button
                      onClick={() => updateConfig({ autoPlayCorrect: !config.autoPlayCorrect })}
                      className={`py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        config.autoPlayCorrect
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {t("audio_controls_autoplay_correct")} {config.autoPlayCorrect && "✅"}
                    </button>
                    <button
                      onClick={() => updateConfig({ autoPlayFeedback: !config.autoPlayFeedback })}
                      className={`py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                        config.autoPlayFeedback
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-white/30"
                      }`}
                    >
                      {t("audio_controls_autoplay_feedback")} {config.autoPlayFeedback && "✅"}
                    </button>
                  </div>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors text-xs font-medium"
              >
                {t("audio_controls_close")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}