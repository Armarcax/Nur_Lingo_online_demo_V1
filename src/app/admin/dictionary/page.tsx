// src/app/admin/dictionary/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/hooks/useI18n";

interface DictEntry {
  id?: string;
  word_id: string;
  hy: string;
  en: string;
  ru: string;
  category: string;
  part_of_speech: string;
  difficulty: number;
  notes: string;
  tags: string[];
  audio_id: string;
  image_url: string;
  source: string;
  isUserAdded?: boolean;
}

const BLANK: DictEntry = {
  word_id: "", hy: "", en: "", ru: "",
  category: "", part_of_speech: "noun",
  difficulty: 1, notes: "", tags: [],
  audio_id: "", image_url: "", source: "custom",
};

const POS_OPTIONS = ["noun","verb","adjective","adverb","pronoun","numeral","interjection","particle","phrase"];
const CATEGORY_OPTIONS = [
  "greetings_politeness","family_relationships","food_drink","home_living",
  "daily_routine","education_learning","work_profession","city_transport",
  "nature_environment","colors_appearance","numbers_math","health_body",
  "emotions_feelings","technology","shopping","adjectives_basic",
];

type SortField = "word_id" | "hy" | "en" | "ru" | "difficulty";
type SortDir = "asc" | "desc";

// ─── LOCAL STORAGE KEYS ─────────────────────────────────────────────

const STORAGE_KEYS = {
  USER_WORDS: "nurlingo_user_dictionary",
  USER_MANIFEST: "nurlingo_user_manifest",
};

export default function DictionaryAdminPage() {
  const { t } = useI18n();
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [userEntries, setUserEntries] = useState<DictEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("word_id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterPos, setFilterPos] = useState("");
  const [editEntry, setEditEntry] = useState<DictEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);
  const [showUserWords, setShowUserWords] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load User Words from Local Storage ─────────────────────────────────────

  const loadUserWordsFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_WORDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserEntries(parsed.map((w: any) => ({
          ...w,
          word_id: w.id,
          source: "user",
          isUserAdded: true,
        })));
      }
    } catch {
      // Ignore
    }
  }, []);

  // ── Save User Words to Local Storage ──────────────────────────────────────

  const saveUserWordsToStorage = useCallback((words: DictEntry[]) => {
    try {
      const toSave = words.map(w => ({
        id: w.word_id,
        hy: w.hy,
        en: w.en,
        ru: w.ru,
        type: "user",
        isUserAdded: true,
        audio: {
          hy: `/audio/hy_user/${w.word_id}.mp3`,
          en: `/audio/en_user/${w.word_id}.mp3`,
          ru: `/audio/ru_user/${w.word_id}.mp3`,
        }
      }));
      localStorage.setItem(STORAGE_KEYS.USER_WORDS, JSON.stringify(toSave));
      
      const manifest = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MANIFEST) || '{"entries":{}}');
      for (const word of toSave) {
        manifest.entries[word.id] = {
          hy: `/audio/hy_user/${word.id}.mp3`,
          en: `/audio/en_user/${word.id}.mp3`,
          ru: `/audio/ru_user/${word.id}.mp3`,
        };
      }
      localStorage.setItem(STORAGE_KEYS.USER_MANIFEST, JSON.stringify(manifest));
    } catch {
      // Ignore
    }
  }, []);

  // ── Check Supabase config ─────────────────────────────────────────────────

  useEffect(() => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!url || url === 'https://your-project-id.supabase.co') {
        setIsSupabaseConfigured(false);
      }
    } catch {
      setIsSupabaseConfigured(false);
    }
  }, []);

  // ── Load from Supabase ──────────────────────────────────────────────────────

  const loadEntries = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("dictionary_entries" as any)
          .select("*")
          .eq("is_active", true)
          .order("word_id");
        if (!error && data) {
          setEntries(data as DictEntry[]);
        }
      }
      loadUserWordsFromStorage();
    } catch (e) {
      console.error('Load error:', e);
    }
    setLoading(false);
  };

  useEffect(() => { 
    loadEntries();
  }, [isSupabaseConfigured, loadUserWordsFromStorage]);

  // ── Filtered + sorted view ─────────────────────────────────────────────────

  const allEntries = useMemo(() => {
    const base = [...entries];
    if (showUserWords) {
      return [...base, ...userEntries];
    }
    return base;
  }, [entries, userEntries, showUserWords]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allEntries
      .filter((e) =>
        (!q || e.hy?.includes(q) || e.en?.toLowerCase().includes(q) || e.ru?.includes(q) || e.word_id?.includes(q)) &&
        (!filterPos || e.part_of_speech === filterPos)
      )
      .sort((a, b) => {
        const av = String(a[sortField as keyof DictEntry] ?? "");
        const bv = String(b[sortField as keyof DictEntry] ?? "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [allEntries, search, sortField, sortDir, filterPos]);

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!editEntry) return;
    if (!editEntry.hy || !editEntry.en || !editEntry.ru) {
      showToast(t("admin_dict_fill_all_langs"), false);
      return;
    }

    setSaving(true);
    const wordId = editEntry.word_id || `900${String(Date.now()).slice(-4)}`;
    const isUserWord = editEntry.source === "user" || editEntry.isUserAdded;

    try {
      if (!isUserWord && isSupabaseConfigured) {
        const payload = { ...editEntry, word_id: wordId, is_active: true };
        const { error } = isNew
          ? await supabase.from("dictionary_entries" as any).insert(payload)
          : await supabase.from("dictionary_entries" as any).update(payload).eq("word_id", editEntry.word_id);

        if (error) {
          showToast(`${t("admin_dict_error")}: ${error.message}`, false);
          setSaving(false);
          return;
        }
      }

      const updatedUserWords = [...userEntries];
      const existingIndex = updatedUserWords.findIndex(w => w.word_id === wordId);
      
      const newEntry: DictEntry = {
        word_id: wordId,
        hy: editEntry.hy,
        en: editEntry.en,
        ru: editEntry.ru,
        category: editEntry.category || "",
        part_of_speech: editEntry.part_of_speech || "noun",
        difficulty: editEntry.difficulty || 1,
        notes: "",
        tags: [],
        audio_id: "",
        image_url: "",
        source: "user",
        isUserAdded: true,
      };

      if (existingIndex >= 0) {
        updatedUserWords[existingIndex] = newEntry;
      } else {
        updatedUserWords.push(newEntry);
      }

      setUserEntries(updatedUserWords);
      saveUserWordsToStorage(updatedUserWords);

      showToast(isNew ? t("admin_dict_added_success") : t("admin_dict_updated_success"));
      setEditEntry(null);
      loadEntries();

    } catch (e) {
      showToast(t("admin_dict_network_error"), false);
    }
    setSaving(false);
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (wordId: string) => {
    const updated = userEntries.filter(w => w.word_id !== wordId);
    setUserEntries(updated);
    saveUserWordsToStorage(updated);
    
    if (isSupabaseConfigured) {
      await supabase.from("dictionary_entries" as any).update({ is_active: false }).eq("word_id", wordId);
    }
    
    setEntries((prev) => prev.filter((e) => e.word_id !== wordId));
    setConfirmDelete(null);
    showToast(t("admin_dict_deleted"));
  };

  // ── Bulk delete ─────────────────────────────────────────────────────────────

  const handleBulkDelete = async () => {
    const toDelete = allEntries.filter(e => selected.has(e.word_id));
    const userToDelete = toDelete.filter(e => e.isUserAdded || e.source === "user");
    const supabaseToDelete = toDelete.filter(e => !e.isUserAdded && e.source !== "user");

    if (userToDelete.length > 0) {
      const userWordIds = new Set(userToDelete.map(w => w.word_id));
      const updated = userEntries.filter(w => !userWordIds.has(w.word_id));
      setUserEntries(updated);
      saveUserWordsToStorage(updated);
    }

    if (supabaseToDelete.length > 0 && isSupabaseConfigured) {
      for (const id of selected) {
        await supabase.from("dictionary_entries" as any).update({ is_active: false }).eq("word_id", id);
      }
    }

    setEntries((prev) => prev.filter((e) => !selected.has(e.word_id)));
    setSelected(new Set());
    showToast(t("admin_dict_bulk_deleted", { count: selected.size }));
  };

  // ── Duplicate ───────────────────────────────────────────────────────────────

  const handleDuplicate = (entry: DictEntry) => {
    setEditEntry({ 
      ...entry, 
      id: undefined, 
      word_id: `copy_${entry.word_id || Date.now()}`,
      source: "user",
      isUserAdded: true,
    });
    setIsNew(true);
  };

  // ── Export JSON ─────────────────────────────────────────────────────────────

  const handleExport = () => {
    const exportData = allEntries.map(e => ({
      id: e.word_id,
      hy: e.hy,
      en: e.en,
      ru: e.ru,
      type: e.isUserAdded ? "user" : "vocab",
      isUserAdded: e.isUserAdded || false,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nurlingo_dictionary_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import JSON ─────────────────────────────────────────────────────────────

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const imported: DictEntry[] = JSON.parse(text);
      let count = 0;
      const newUserWords = [...userEntries];
      
      for (const entry of imported) {
        if (!entry.hy || !entry.en || !entry.ru) continue;
        const wordId = entry.word_id || `900${String(Date.now()).slice(-4)}${count}`;
        const newEntry: DictEntry = {
          word_id: wordId,
          hy: entry.hy,
          en: entry.en,
          ru: entry.ru,
          category: entry.category || "",
          part_of_speech: entry.part_of_speech || "noun",
          difficulty: entry.difficulty || 1,
          notes: "",
          tags: [],
          audio_id: "",
          image_url: "",
          source: "user",
          isUserAdded: true,
        };
        newUserWords.push(newEntry);
        count++;
      }

      setUserEntries(newUserWords);
      saveUserWordsToStorage(newUserWords);
      showToast(t("admin_dict_imported", { count }));
      loadEntries();
    } catch {
      showToast(t("admin_dict_import_error"), false);
    }
    e.target.value = "";
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-gray-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-transparent dark:bg-gray-900/80 backdrop-blur-none border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center gap-4">
        <Link href="/dictionary" className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-xl">←</Link>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900 dark:text-white">{t("admin_dict_title")}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {entries.length} {t("admin_dict_main")} • {userEntries.length} {t("admin_dict_added")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowUserWords(!showUserWords)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              showUserWords 
                ? "bg-yellow-500/30 text-yellow-500" 
                : "bg-transparent dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            }`}
          >
            👤 {userEntries.length}
          </button>
          <label className="cursor-pointer px-4 py-2 bg-transparent dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-transparent rounded-lg text-sm font-bold transition text-gray-900 dark:text-white">
            {t("admin_dict_import")}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button onClick={handleExport} className="px-4 py-2 bg-transparent dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-transparent rounded-lg text-sm font-bold transition text-gray-900 dark:text-white">
            {t("admin_dict_export")}
          </button>
          <button
            onClick={() => { 
              setEditEntry({ ...BLANK, source: "user", isUserAdded: true }); 
              setIsNew(true); 
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-black transition text-white"
          >
            + {t("admin_dict_add")}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin_dict_search")}
            className="flex-1 min-w-[200px] bg-transparent dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <select
            value={filterPos}
            onChange={(e) => setFilterPos(e.target.value)}
            className="bg-transparent dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none text-gray-900 dark:text-white"
          >
            <option value="" className="text-gray-900 dark:text-white">{t("admin_dict_all")}</option>
            {POS_OPTIONS.map((p) => <option key={p} value={p} className="text-gray-900 dark:text-white">{p}</option>)}
          </select>
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-xl text-sm font-bold transition text-white"
            >
              🗑️ {t("admin_dict_delete_selected", { count: selected.size })}
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">{t("admin_dict_loading")}</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-transparent dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
                <tr>
                  <th className="px-3 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelected(e.target.checked ? new Set(filtered.map((f) => f.word_id)) : new Set())
                      }
                      checked={selected.size === filtered.length && filtered.length > 0}
                      className="accent-red-600"
                    />
                  </th>
                  <th className="px-3 py-3 text-left cursor-pointer hover:text-gray-900 dark:hover:text-white text-gray-700 dark:text-gray-300" onClick={() => toggleSort("hy")}>
                    🇦🇲 {t("admin_dict_hy")}{sortIndicator("hy")}
                  </th>
                  <th className="px-3 py-3 text-left cursor-pointer hover:text-gray-900 dark:hover:text-white text-gray-700 dark:text-gray-300" onClick={() => toggleSort("en")}>
                    🇬🇧 {t("admin_dict_en")}{sortIndicator("en")}
                  </th>
                  <th className="px-3 py-3 text-left cursor-pointer hover:text-gray-900 dark:hover:text-white text-gray-700 dark:text-gray-300" onClick={() => toggleSort("ru")}>
                    🇷🇺 {t("admin_dict_ru")}{sortIndicator("ru")}
                  </th>
                  <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300">{t("admin_dict_category")}</th>
                  <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300">{t("admin_dict_part_of_speech")}</th>
                  <th className="px-3 py-3 text-left text-gray-700 dark:text-gray-300">{t("admin_dict_source")}</th>
                  <th className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">{t("admin_dict_action")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-500 dark:text-gray-400">
                      {allEntries.length === 0
                        ? t("admin_dict_no_words")
                        : t("admin_dict_no_results")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry) => {
                    const isUser = entry.isUserAdded || entry.source === "user";
                    return (
                      <tr
                        key={entry.word_id}
                        className={`border-b border-gray-200 dark:border-gray-700 hover:bg-transparent dark:hover:bg-transparent transition ${
                          isUser ? "border-yellow-500/30" : ""
                        }`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selected.has(entry.word_id)}
                            onChange={(e) => {
                              const s = new Set(selected);
                              e.target.checked ? s.add(entry.word_id) : s.delete(entry.word_id);
                              setSelected(s);
                            }}
                            className="accent-red-600"
                          />
                        </td>
                        <td className="px-3 py-2 font-bold text-red-600 dark:text-red-400">{entry.hy}</td>
                        <td className="px-3 py-2 text-gray-900 dark:text-white">{entry.en}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{entry.ru}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{entry.category?.replace(/_/g, " ") || "—"}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400 text-xs">{entry.part_of_speech || "—"}</td>
                        <td className="px-3 py-2">
                          {isUser ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">👤 {t("admin_dict_user")}</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">📚 {t("admin_dict_main")}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => { setEditEntry({ ...entry }); setIsNew(false); }}
                              className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/60 rounded text-xs transition text-white"
                              title={t("admin_dict_edit")}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDuplicate(entry)}
                              className="px-2 py-1 bg-green-600/30 hover:bg-green-600/60 rounded text-xs transition text-white"
                              title={t("admin_dict_duplicate")}
                            >
                              📋
                            </button>
                            <button
                              onClick={() => setConfirmDelete(entry.word_id)}
                              className="px-2 py-1 bg-red-600/30 hover:bg-red-600/60 rounded text-xs transition text-white"
                              title={t("admin_dict_delete")}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          {t("admin_dict_showing", { count: filtered.length, total: allEntries.length })}
        </p>
      </div>

      {/* ─── Edit/Add Modal ──────────────────────────────────────────────────── */}
      {editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-none">
          <div className="bg-transparent dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-transparent dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {isNew ? t("admin_dict_add_modal") : t("admin_dict_edit_modal")}
                <span className="text-xs font-normal text-yellow-500 ml-2">({t("admin_dict_user_word")})</span>
              </h2>
              <button onClick={() => setEditEntry(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">🇦🇲 {t("admin_dict_hy")} *</label>
                <input
                  value={editEntry.hy}
                  onChange={(e) => setEditEntry({ ...editEntry, hy: e.target.value })}
                  className="w-full bg-transparent dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white text-lg placeholder-gray-400"
                  placeholder={t("admin_dict_hy_placeholder")}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">🇬🇧 {t("admin_dict_en")} *</label>
                <input
                  value={editEntry.en}
                  onChange={(e) => setEditEntry({ ...editEntry, en: e.target.value })}
                  className="w-full bg-transparent dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                  placeholder={t("admin_dict_en_placeholder")}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">🇷🇺 {t("admin_dict_ru")} *</label>
                <input
                  value={editEntry.ru}
                  onChange={(e) => setEditEntry({ ...editEntry, ru: e.target.value })}
                  className="w-full bg-transparent dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder-gray-400"
                  placeholder={t("admin_dict_ru_placeholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t("admin_dict_category")}</label>
                  <select
                    value={editEntry.category}
                    onChange={(e) => setEditEntry({ ...editEntry, category: e.target.value })}
                    className="w-full bg-transparent dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">—</option>
                    {CATEGORY_OPTIONS.map((c) => <option key={c} value={c} className="text-gray-900 dark:text-white">{c.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t("admin_dict_part_of_speech")}</label>
                  <select
                    value={editEntry.part_of_speech}
                    onChange={(e) => setEditEntry({ ...editEntry, part_of_speech: e.target.value })}
                    className="w-full bg-transparent dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white text-sm"
                  >
                    {POS_OPTIONS.map((p) => <option key={p} value={p} className="text-gray-900 dark:text-white">{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl font-black transition text-white"
                >
                  {saving ? t("admin_dict_saving") : isNew ? t("admin_dict_add_modal") : t("admin_dict_save")}
                </button>
                <button
                  onClick={() => setEditEntry(null)}
                  className="px-6 py-3 bg-transparent dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-transparent rounded-xl font-bold transition text-gray-900 dark:text-white"
                >
                  {t("admin_dict_cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ──────────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-none">
          <div className="bg-transparent dark:bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("admin_dict_confirm_delete")}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t("admin_dict_irreversible")}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-3 bg-red-700 hover:bg-red-600 rounded-xl font-black transition text-white"
              >
                {t("admin_dict_yes_delete")}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 bg-transparent dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-transparent rounded-xl font-bold transition text-gray-900 dark:text-white"
              >
                {t("admin_dict_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast notification ────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all ${
          toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}