import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  // ─── FROM OLD: Try dictionary JSON files first ───
  const jsonPaths = [
    path.join(process.cwd(), "data", "dictionaries", "unified-dictionary.json"),
    path.join(process.cwd(), "src", "lib", "lexicon", "master-dictionary.json"),
  ];

  for (const p of jsonPaths) {
    try {
      const d = JSON.parse(fs.readFileSync(p, "utf-8"));
      const data = Array.isArray(d) ? d : Object.values(d);
      return NextResponse.json(data);
    } catch {
      // Continue to next path
    }
  }

  // ─── FROM NEW: If JSON files not found, parse database.ts ───
  try {
    const databasePath = path.join(process.cwd(), "src", "lib", "content", "database.ts");
    const content = fs.readFileSync(databasePath, "utf8");
    const texts: Array<{
      id: string;
      hy: string;
      en: string;
      ru: string;
      type: string;
    }> = [];
    let nextId = 1;

    const formatId = () => String(nextId).padStart(6, "0");

    // Pattern 1: v("id", "hy", "en", "ru") - vocabulary
    const vocabRegex = /v\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
    let match;
    while ((match = vocabRegex.exec(content)) !== null) {
      texts.push({
        id: formatId(),
        type: "vocab",
        hy: match[2],
        en: match[3],
        ru: match[4],
      });
      nextId++;
    }

    // Pattern 2: p("id", "hy", "en", "ru", ...) - phrases
    const phraseRegex = /p\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g;
    while ((match = phraseRegex.exec(content)) !== null) {
      texts.push({
        id: formatId(),
        type: "phrase",
        hy: match[2],
        en: match[3],
        ru: match[4],
      });
      nextId++;
    }

    // Pattern 3: t("speaker", "hy", "en", "ru") - dialogue turns
    const turnRegex = /t\s*\(\s*["'](?:nurik|user)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
    while ((match = turnRegex.exec(content)) !== null) {
      texts.push({
        id: formatId(),
        type: "dialogue",
        hy: match[1],
        en: match[2],
        ru: match[3],
      });
      nextId++;
    }

    // Pattern 4: e("id", "hy", "en", "ru", ...) - exercises
    const exerciseRegex = /e\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g;
    while ((match = exerciseRegex.exec(content)) !== null) {
      texts.push({
        id: formatId(),
        type: "exercise",
        hy: match[2],
        en: match[3],
        ru: match[4],
      });
      nextId++;
    }

    return NextResponse.json({
      total: texts.length,
      texts,
    });
  } catch (error) {
    console.error("Error reading database:", error);
    return NextResponse.json(
      { error: "Failed to read content database" },
      { status: 500 }
    );
  }
}