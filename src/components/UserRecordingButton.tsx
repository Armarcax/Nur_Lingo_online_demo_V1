// src/components/UserRecordingButton.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Play, Pause, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAudioRecorder } from "@/lib/hooks/useAudioRecorder";
import { useI18n } from "@/hooks/useI18n";

interface UserRecordingButtonProps {
  wordId: string;
  word: string;
  onRecordingChange?: (hasRecording: boolean) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  autoPlay?: boolean;
}

export function UserRecordingButton({
  wordId,
  word,
  onRecordingChange,
  className = "",
  size = "md",
  autoPlay = false,
}: UserRecordingButtonProps) {
  const { t } = useI18n();

  // ✅ Remove isPlaying from destructuring – it doesn't exist on the hook
  const {
    isRecording,
    startRecording,
    stopRecording,
    saveRecording,
    getRecording,
    playRecording,
    deleteRecording,
  } = useAudioRecorder();

  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if recording exists on mount
  useEffect(() => {
    const exists = !!getRecording(wordId);
    setHasRecording(exists);
    if (exists && autoPlay) {
      handlePlay();
    }
  }, [wordId, getRecording, autoPlay]);

  // Update parent on recording change
  useEffect(() => {
    onRecordingChange?.(hasRecording);
  }, [hasRecording, onRecordingChange]);

  // Cleanup timers and audio on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ─── HANDLERS ──────────────────────────────────────────────────────

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingDuration(0);

      // Save recording after a short delay
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        saveRecording(wordId);
        setHasRecording(true);
        setError(null);
        // Auto-play after recording
        setTimeout(() => handlePlay(), 500);
      } catch (err) {
        setError(t("user_recording_save_error"));
        console.error("Save recording error:", err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Start recording
    setError(null);
    setRecordingDuration(0);
    try {
      await startRecording();
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError(t("user_recording_start_error"));
      console.error("Start recording error:", err);
    }
  }, [isRecording, stopRecording, saveRecording, wordId, startRecording, t]);

  const handlePlay = useCallback(async () => {
    // If already playing, we can't stop because hook doesn't provide stop
    if (isPlaying) {
      // Optionally, we could try to pause by reloading or something, but for simplicity we ignore.
      return;
    }

    const audioData = getRecording(wordId);
    if (!audioData) {
      setError(t("user_recording_not_found"));
      return;
    }

    setIsPlaying(true);
    setError(null);

    try {
      await playRecording(wordId);
      // We don't know when playback ends, so set a timeout based on duration.
      // If we have recordingDuration (when saved), we could use that, but we don't store it.
      // Default to 5 seconds.
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      playTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
        playTimeoutRef.current = null;
      }, 5000);
    } catch (err) {
      setError(t("user_recording_play_error"));
      console.error("Play recording error:", err);
      setIsPlaying(false);
    }
  }, [isPlaying, getRecording, wordId, playRecording, t]);

  const handleDelete = useCallback(async () => {
    if (!hasRecording) return;

    if (!confirm(t("user_recording_delete_confirm"))) return;

    setIsLoading(true);
    try {
      deleteRecording(wordId);
      setHasRecording(false);
      setIsPlaying(false);
      setError(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
        playTimeoutRef.current = null;
      }
    } catch (err) {
      setError(t("user_recording_delete_error"));
      console.error("Delete recording error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [hasRecording, deleteRecording, wordId, t]);

  // ─── SIZE CLASSES ─────────────────────────────────────────────────

  const sizeClasses = {
    sm: {
      button: "w-8 h-8 text-xs",
      icon: 14,
    },
    md: {
      button: "w-10 h-10 text-sm",
      icon: 18,
    },
    lg: {
      button: "w-12 h-12 text-base",
      icon: 22,
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // ─── RENDER ──────────────────────────────────────────────────────

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Record Button */}
      <button
        onClick={handleRecord}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isLoading}
        className={`
          ${currentSize.button}
          rounded-full flex items-center justify-center
          transition-all duration-200
          ${
            isRecording
              ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
              : hasRecording && isHovered
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : hasRecording
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-white/20 dark:border-gray-700"
          }
          ${isLoading ? "opacity-50 cursor-wait" : "hover:scale-105 active:scale-95"}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={
          isRecording
            ? t("user_recording_stop")
            : hasRecording
            ? t("user_recording_rerecord")
            : t("user_recording_record")
        }
      >
        {isLoading ? (
          <Loader2 size={currentSize.icon} className="animate-spin" />
        ) : isRecording ? (
          <span className="relative">
            <MicOff size={currentSize.icon} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping" />
          </span>
        ) : hasRecording ? (
          <Mic size={currentSize.icon} />
        ) : (
          <Mic size={currentSize.icon} />
        )}
      </button>

      {/* Recording duration indicator */}
      {isRecording && (
        <span className="text-xs font-mono text-red-400 animate-pulse">
          {formatDuration(recordingDuration)}
        </span>
      )}

      {/* Play Button (only if recording exists) */}
      {hasRecording && !isRecording && (
        <button
          onClick={handlePlay}
          disabled={isLoading || isPlaying}
          className={`
            ${currentSize.button}
            rounded-full flex items-center justify-center
            transition-all duration-200
            ${
              isPlaying
                ? "bg-blue-500/30 text-blue-400 border border-blue-500/30 animate-pulse"
                : "bg-white/20 dark:bg-gray-800/80 hover:bg-white/30 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-white/20 dark:border-gray-700"
            }
            hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={isPlaying ? t("user_recording_stop") : t("user_recording_play")}
        >
          {isLoading ? (
            <Loader2 size={currentSize.icon} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={currentSize.icon} />
          ) : (
            <Play size={currentSize.icon} className="ml-0.5" />
          )}
        </button>
      )}

      {/* Delete Button (only if recording exists) */}
      {hasRecording && !isRecording && (
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className={`
            ${currentSize.button}
            rounded-full flex items-center justify-center
            transition-all duration-200
            bg-white/20 dark:bg-gray-800/80 hover:bg-red-500/20
            text-gray-400 hover:text-red-400
            border border-white/20 dark:border-gray-700 hover:border-red-500/30
            hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={t("user_recording_delete")}
        >
          {isLoading ? (
            <Loader2 size={currentSize.icon} className="animate-spin" />
          ) : (
            <Trash2 size={currentSize.icon} />
          )}
        </button>
      )}

      {/* Status icons */}
      {hasRecording && !isRecording && !isPlaying && (
        <span title={t("user_recording_saved")}>
          <CheckCircle size={14} className="text-emerald-500" />
        </span>
      )}

      {error && (
        <div className="text-xs text-red-400 flex items-center gap-1">
          <XCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
}

export default UserRecordingButton;