// src/lib/hooks/useAudioRecorder.ts
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { addToUserDictionary, isInBaseDictionary } from "@/lib/dictionary";
import { WavASRProvider } from "@/lib/audio/WavASRProvider";
import { getWavClient } from "@/lib/audio/WavClient";
import { useI18n } from "@/hooks/useI18n";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioURL: string | null;
  error: string | null;
  isSaving: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  saveRecording: (key: string, word?: string) => Promise<void>;
  saveRecordingSimple: (key: string) => Promise<void>;
  getRecording: (key: string) => string | null;
  playRecording: (key: string) => void;
  deleteRecording: (key: string) => void;
  generateKey: (prefix?: string) => string;
  revokeAudioURL: () => void;
  checkWordInBase: (word: string) => boolean;
  getAllRecordings: () => Record<string, string>;
  // ✅ NEW: WAV ASR methods
  transcribeWithWAV: (audioBlob: Blob, language?: "hy" | "ru" | "en") => Promise<string>;
  validateWithWAV: (audioBlob: Blob, expectedText: string, language?: "hy" | "ru" | "en") => Promise<{
    accepted: boolean;
    confidence: number;
    transcription: string;
  }>;
  speakWithWAV: (text: string, voice?: string) => Promise<void>;
  isWAVAvailable: boolean;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const { t } = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isWAVAvailable, setIsWAVAvailable] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ✅ Check WAV availability
  useEffect(() => {
    const checkWAV = async () => {
      try {
        const client = getWavClient();
        setIsWAVAvailable(!!client);
      } catch {
        setIsWAVAvailable(false);
      }
    };
    checkWAV();
  }, []);

  const revokeAudioURL = useCallback((): void => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
  }, [audioURL]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {
          // ignore
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      revokeAudioURL();
    };
  }, [isRecording, revokeAudioURL]);

  const startRecording = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Միկրոֆոնի հասանելիություն չի ստացվել";
      setError(message);
    }
  }, []);

  const stopRecording = useCallback((): void => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        setError("Ձայնագրությունը դադարեցնելիս սխալ տեղի ունեցավ");
      } finally {
        setIsRecording(false);
      }
    }
  }, [isRecording]);

  const saveRecording = useCallback(
    async (key: string, word?: string): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        if (chunksRef.current.length === 0) {
          const errMsg = "Ձայնագրության տվյալներ չկան";
          setError(errMsg);
          reject(new Error(errMsg));
          return;
        }

        setIsSaving(true);
        setError(null);

        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const reader = new FileReader();

          reader.onloadend = () => {
            try {
              const base64 = reader.result as string;
              const recordings = JSON.parse(
                localStorage.getItem("userAudioRecordings") || "{}"
              );
              recordings[key] = base64;
              localStorage.setItem(
                "userAudioRecordings",
                JSON.stringify(recordings)
              );

              if (word && !isInBaseDictionary(word)) {
                const existing = addToUserDictionary(word, word, word, "user");
                if (existing) {
                  console.log(`✅ "${word}" ավելացվել է օգտատերերի բառարանում`);
                }
              }

              chunksRef.current = [];
              revokeAudioURL();
              setIsSaving(false);
              resolve();
            } catch (err) {
              const msg =
                err instanceof Error ? err.message : "Պահպանման սխալ";
              setError(msg);
              setIsSaving(false);
              reject(err);
            }
          };

          reader.onerror = () => {
            const msg = "Ֆայլի ընթերցման սխալ";
            setError(msg);
            setIsSaving(false);
            reject(new Error(msg));
          };

          reader.readAsDataURL(blob);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Անհայտ սխալ";
          setError(msg);
          setIsSaving(false);
          reject(err);
        }
      });
    },
    [revokeAudioURL]
  );

  const saveRecordingSimple = useCallback(
    (key: string): Promise<void> => {
      return saveRecording(key, undefined);
    },
    [saveRecording]
  );

  const getRecording = useCallback((key: string): string | null => {
    try {
      const recordings = JSON.parse(
        localStorage.getItem("userAudioRecordings") || "{}"
      );
      const result = recordings[key];
      if (typeof result === 'string' && result.length > 0) {
        return result as any;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const playRecording = useCallback(
    (key: string): void => {
      const base64 = getRecording(key);
      if (!base64) {
        setError("Ձայնագրությունը չի գտնվել");
        return;
      }
      try {
        const audio = new Audio(base64);
        audio.play().catch(() => {
          setError("Նվագարկման սխալ");
        });
      } catch {
        setError("Աուդիո ստեղծման սխալ");
      }
    },
    [getRecording]
  );

  const deleteRecording = useCallback(
    (key: string): void => {
      try {
        const recordings = JSON.parse(
          localStorage.getItem("userAudioRecordings") || "{}"
        );
        delete recordings[key];
        localStorage.setItem(
          "userAudioRecordings",
          JSON.stringify(recordings)
        );
        revokeAudioURL();
      } catch {
        setError("Ջնջման սխալ");
      }
    },
    [revokeAudioURL]
  );

  const generateKey = useCallback((prefix = "recording"): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }, []);

  const checkWordInBase = useCallback((word: string): boolean => {
    return isInBaseDictionary(word);
  }, []);

  const getAllRecordings = useCallback((): Record<string, string> => {
    try {
      return JSON.parse(
        localStorage.getItem("userAudioRecordings") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  // ─── WAV.am ASR METHODS ────────────────────────────────────────────

  const transcribeWithWAV = useCallback(
    async (audioBlob: Blob, language: "hy" | "ru" | "en" = "hy"): Promise<string> => {
      try {
        const provider = new WavASRProvider();
        // @ts-ignore - transcribe method exists in WavASRProvider
        return await provider.transcribe(audioBlob);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "WAV ASR սխալ";
        setError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  const validateWithWAV = useCallback(
    async (
      audioBlob: Blob,
      expectedText: string,
      language: "hy" | "ru" | "en" = "hy"
    ): Promise<{
      accepted: boolean;
      confidence: number;
      transcription: string;
    }> => {
      try {
        const provider = new WavASRProvider();
        // @ts-ignore - validateRecording method exists in WavASRProvider
        const result = await provider.validateRecording(audioBlob, expectedText, language);
        return result as any;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "WAV վավերացման սխալ";
        setError(msg);
        return {
          accepted: false,
          confidence: 0,
          transcription: "",
        };
      }
    },
    []
  );

  const speakWithWAV = useCallback(
    async (text: string, voice: string = "Ավետ"): Promise<void> => {
      try {
        const client = getWavClient();
        if (!client) {
          throw new Error("WAV client not available");
        }
        await client.playGeneratedAudio(text, voice);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "WAV TTS սխալ";
        setError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  return {
    isRecording,
    audioURL,
    error,
    isSaving,
    startRecording,
    stopRecording,
    saveRecording,
    saveRecordingSimple,
    getRecording,
    playRecording,
    deleteRecording,
    generateKey,
    revokeAudioURL,
    checkWordInBase,
    getAllRecordings,
    // ✅ NEW WAV methods
    transcribeWithWAV,
    validateWithWAV,
    speakWithWAV,
    isWAVAvailable,
  };
}