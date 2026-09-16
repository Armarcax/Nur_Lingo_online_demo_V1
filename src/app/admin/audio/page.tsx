"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useI18n } from "@/hooks/useI18n";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TextEntry {
  id: string;
  hy: string;
  en: string;
  ru: string;
  type: string;
}

interface Progress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  current: string;
}

export default function AudioGeneratorPage() {
  const { t } = useI18n();
  const [texts, setTexts] = useState<TextEntry[]>([]);
  const [progress, setProgress] = useState<Progress>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    current: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [batchSize, setBatchSize] = useState(10);
  const [lang, setLang] = useState<"hy" | "en" | "ru" | "all">("hy");

  const addLog = (message: string) => {
    setLogs((prev) => [...prev.slice(-99), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Fetch texts from the content database
  useEffect(() => {
    async function fetchTexts() {
      try {
        const response = await fetch("/api/lexicon/full");
        if (response.ok) {
          const data = await response.json();
          setTexts(data.texts || []);
          setProgress((p) => ({ ...p, total: data.texts?.length || 0 }));
        }
      } catch (err) {
        addLog(t("admin_audio_fetch_failed"));
      }
    }
    fetchTexts();
  }, [t]);

  // Generate single audio via Edge Function
  const generateAudio = useCallback(
    async (entry: TextEntry, language: string): Promise<boolean> => {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/tts-generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            text: entry[language as keyof TextEntry],
            lang: language,
            id: entry.id,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: "Unknown" }));
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        const audioBlob = await response.blob();

        if (audioBlob.size > 500) {
          addLog(`✅ ${entry.id}.${language}: ${t("admin_audio_generated")} (${audioBlob.size} ${t("admin_audio_bytes")})`);
          return true;
        } else {
          throw new Error(t("admin_audio_too_small"));
        }
      } catch (err) {
        addLog(`❌ ${entry.id}.${language}: ${(err as Error).message}`);
        return false;
      }
    },
    [supabaseUrl, supabaseAnonKey, t]
  );

  // Download and save audio file to public/audio
  const saveAudioFile = useCallback(
    async (entry: TextEntry, language: string): Promise<boolean> => {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/tts-generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            text: entry[language as keyof TextEntry],
            lang: language,
            id: entry.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const audioBlob = await response.blob();

        const paddedId = entry.id.padStart(6, "0");
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${paddedId}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        await new Promise((r) => setTimeout(r, 100));

        return true;
      } catch (err) {
        return false;
      }
    },
    [supabaseUrl, supabaseAnonKey]
  );

  // Start batch generation
  const startGeneration = useCallback(async () => {
    if (isGenerating || texts.length === 0) return;

    setIsGenerating(true);
    setProgress((p) => ({ ...p, processed: 0, success: 0, failed: 0 }));
    addLog(t("admin_audio_starting", { count: texts.length }));

    const langsToProcess = lang === "all" ? ["hy", "en", "ru"] : [lang];
    let processed = 0;
    let success = 0;
    let failed = 0;

    for (const entry of texts) {
      for (const language of langsToProcess) {
        const text = entry[language as keyof TextEntry];
        if (!text) continue;

        setProgress((p) => ({
          ...p,
          current: `${entry.id}.${language}: ${text.substring(0, 30)}...`,
        }));

        const ok = await generateAudio(entry, language);
        if (ok) {
          success++;
        } else {
          failed++;
        }

        processed++;
        setProgress((p) => ({ ...p, processed, success, failed }));

        await new Promise((r) => setTimeout(r, 200));
      }

      if (!isGenerating) break;
    }

    setIsGenerating(false);
    addLog(t("admin_audio_complete", { success, failed }));
  }, [texts, lang, isGenerating, generateAudio, t]);

  // Stop generation
  const stopGeneration = useCallback(() => {
    setIsGenerating(false);
    addLog(t("admin_audio_stopped"));
  }, [t]);

  // Test a single entry
  const testSingle = useCallback(
    async (entry: TextEntry, language: string) => {
      addLog(t("admin_audio_testing", { id: entry.id, lang: language }));
      await generateAudio(entry, language);
    },
    [generateAudio, t]
  );

  // Play audio for testing
  const playAudio = useCallback(async (entry: TextEntry, language: string) => {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/tts-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          text: entry[language as keyof TextEntry],
          lang: language,
          id: entry.id,
        }),
      });

      if (!response.ok) throw new Error(t("admin_audio_generation_failed"));

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => URL.revokeObjectURL(audioUrl);
      audio.play();
    } catch (err) {
      addLog(`${t("admin_audio_play_failed")}: ${(err as Error).message}`);
    }
  }, [supabaseUrl, supabaseAnonKey, t]);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t("admin_audio_title")}</h1>
        <p className="text-gray-400 mb-6">{t("admin_audio_subtitle")}</p>

        {/* Controls */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400">{t("admin_audio_language")}</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="w-full bg-gray-800 rounded p-2 mt-1"
              >
                <option value="hy">{t("admin_audio_armenian")}</option>
                <option value="en">{t("admin_audio_english")}</option>
                <option value="ru">{t("admin_audio_russian")}</option>
                <option value="all">{t("admin_audio_all_languages")}</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">{t("admin_audio_batch_size")}</label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
                className="w-full bg-gray-800 rounded p-2 mt-1"
                min="1"
                max="100"
              />
            </div>
            <div className="col-span-2 flex items-end gap-2">
              <button
                onClick={isGenerating ? stopGeneration : startGeneration}
                className={`flex-1 py-2 px-4 rounded font-bold ${
                  isGenerating
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isGenerating ? t("admin_audio_stop") : t("admin_audio_start")}
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("admin_audio_progress", { processed: progress.processed, total: progress.total })}</span>
              <span className="text-emerald-400">✅ {progress.success}</span>
              <span className="text-red-400">❌ {progress.failed}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${(progress.processed / progress.total) * 100}%` }}
              />
            </div>
            {progress.current && (
              <p className="text-xs text-gray-500 truncate">{progress.current}</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h2 className="font-bold mb-2">{t("admin_audio_how_it_works")}</h2>
          <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
            <li>{t("admin_audio_step_1")}</li>
            <li>{t("admin_audio_step_2")}</li>
            <li>{t("admin_audio_step_3")}</li>
            <li>{t("admin_audio_step_4")}</li>
          </ol>
        </div>

        {/* Sample Texts */}
        <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
          <div className="p-3 bg-gray-800 border-b border-gray-700">
            <h2 className="font-bold">{t("admin_audio_sample_texts", { count: texts.length })}</h2>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 sticky top-0">
                <tr>
                  <th className="text-left p-2">{t("admin_audio_id")}</th>
                  <th className="text-left p-2">{t("admin_audio_armenian")}</th>
                  <th className="text-left p-2">{t("admin_audio_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {texts.slice(0, 20).map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="p-2 font-mono text-xs">{entry.id}</td>
                    <td className="p-2">{entry.hy}</td>
                    <td className="p-2">
                      <button
                        onClick={() => playAudio(entry, "hy")}
                        className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded mr-1"
                      >
                        {t("admin_audio_play")}
                      </button>
                      <button
                        onClick={() => testSingle(entry, "hy")}
                        className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
                      >
                        {t("admin_audio_test")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between">
            <h2 className="font-bold">{t("admin_audio_logs")}</h2>
            <button
              onClick={() => setLogs([])}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            >
              {t("admin_audio_clear")}
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto p-3 font-mono text-xs text-gray-400">
            {logs.length === 0 ? (
              <p className="text-gray-600">{t("admin_audio_no_logs")}</p>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          {t("admin_audio_footer")}
        </p>
      </div>
    </main>
  );
}