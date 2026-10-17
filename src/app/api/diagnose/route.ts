// src/app/api/diagnose/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ─── FORCE NODE.JS RUNTIME (needed for fs) ─────────────────────────
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
    summary: {},
  };

  // ─── 1. CHECK AUDIO DIRECTORIES ──────────────────────────────────

  const audioPaths = [
    'public/audio/offline/hy_Ani',
    'public/audio/offline/en_female',
    'public/audio/offline/ru_female',
    'public/audio/offline_dictionary/Avet',
    'public/audio/hy_wav',
  ];

  results.checks.directories = {};
  for (const dirPath of audioPaths) {
    const fullPath = path.join(process.cwd(), dirPath);
    const exists = fs.existsSync(fullPath);
    let fileCount = 0;
    let sampleFiles: string[] = [];

    if (exists) {
      try {
        const files = fs.readdirSync(fullPath);
        const mp3s = files.filter((f) => f.endsWith('.mp3'));
        fileCount = mp3s.length;
        sampleFiles = mp3s.slice(0, 5);
      } catch {
        // ignore read errors
      }
    }

    results.checks.directories[dirPath] = {
      exists,
      fileCount,
      sampleFiles,
      fullPath,
    };

    if (!exists) {
      results.warnings.push(`📁 Պանակը գոյություն չունի: ${dirPath}`);
    } else if (fileCount === 0) {
      results.warnings.push(`📁 Պանակը դատարկ է: ${dirPath}`);
    } else {
      results.summary[`${dirPath.replace(/\//g, '_')}_files`] = fileCount;
    }
  }

  // ─── 2. CHECK MANIFEST FILES ─────────────────────────────────────

  const manifestFiles = [
    'src/lib/content/mappings/audio-num-hy-mapping.json',
    'src/lib/content/mappings/audio-num-en-mapping.json',
    'src/lib/content/mappings/audio-num-ru-mapping.json',
    'src/lib/content/exercise-to-audio.json',
  ];

  results.checks.manifests = {};
  for (const filePath of manifestFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    const exists = fs.existsSync(fullPath);
    let keyCount = 0;
    let sampleKeys: string[] = [];

    if (exists) {
      try {
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        if (typeof content === 'object' && content !== null) {
          keyCount = Object.keys(content).length;
          sampleKeys = Object.keys(content).slice(0, 5);
        }
      } catch {
        results.errors.push(`❌ Manifest-ը չի կարող բեռնվել: ${filePath}`);
      }
    }

    results.checks.manifests[filePath] = {
      exists,
      keyCount,
      sampleKeys,
    };

    if (!exists) {
      results.errors.push(`❌ Manifest ֆայլը գոյություն չունի: ${filePath}`);
    }
  }

  // ─── 3. CLIENT ENGINES — SKIPPED (require browser) ───────────────

  results.checks.offlineManager = {
    initialized: false,
    note: 'Client-side only (IndexedDB, localStorage) — cannot test on server',
  };
  results.checks.lessonEngine = {
    initialized: false,
    note: 'Client-side only (IndexedDB, localStorage) — cannot test on server',
  };
  results.checks.wavClient = {
    available: false,
    note: 'Client-side only (AudioContext) — cannot test on server',
  };

  results.warnings.push(
    '⚠️ OfflineAudioManager / OfflineLessonEngine / WavClient-ը client-side են — ստուգվում են միայն բրաուզերում'
  );

  // ─── 4. AUDIO RESOLUTION TEST ────────────────────────────────────

  try {
    const { resolveOfflineAudio } = await import(
      '@/lib/offline/offline-audio-resolver'
    );

    const testKeys = [
      { key: 'greet_hello', lang: 'hy' },
      { key: 'greet_hello', lang: 'en' },
      { key: 'greet_hello', lang: 'ru' },
      { key: 'w1_l1_mc_0', lang: 'hy' },
      { key: 'w1_l1_mc_0', lang: 'en' },
      { key: 'w1_l1_mc_0', lang: 'ru' },
      { key: 'w1_l1_tr_0', lang: 'hy' },
      { key: 'w1_l1_e0', lang: 'hy' },
      { key: 'hello', lang: 'hy' },
      { key: 'hello', lang: 'en' },
    ];

    results.checks.audioResolution = {};
    for (const test of testKeys) {
      try {
        const result = resolveOfflineAudio(test.key, test.lang as any);
        results.checks.audioResolution[`${test.key}_${test.lang}`] = {
          key: test.key,
          lang: test.lang,
          found: !!result,
          url: result?.url || null,
          resolvedKey: result?.key || null,
          source: result?.source || null,
        };

        if (!result) {
          results.warnings.push(
            `⚠️ Աուդիո չի գտնվել: "${test.key}" (${test.lang})`
          );
        }
      } catch (e: any) {
        results.checks.audioResolution[`${test.key}_${test.lang}`] = {
          key: test.key,
          lang: test.lang,
          error: e.message,
        };
        results.errors.push(
          `❌ Սխալ աուդիո որոնման ժամանակ: "${test.key}" (${test.lang})`
        );
      }
    }
  } catch (e: any) {
    results.errors.push(`❌ offline-audio-resolver import error: ${e.message}`);
  }

  // ─── 5. SPECIFIC AUDIO FILE COUNTS ──────────────────────────────

  const langPaths = [
    { key: 'hyAudioCount', path: 'public/audio/offline/hy_Ani' },
    { key: 'enAudioCount', path: 'public/audio/offline/en_female' },
    { key: 'ruAudioCount', path: 'public/audio/offline/ru_female' },
  ];

  for (const { key, path: dirPath } of langPaths) {
    const fullPath = path.join(process.cwd(), dirPath);
    if (fs.existsSync(fullPath)) {
      try {
        const files = fs.readdirSync(fullPath);
        const mp3s = files.filter((f) => f.endsWith('.mp3'));
        results.checks[key] = {
          count: mp3s.length,
          sample: mp3s.slice(0, 10),
        };
        results.summary[key] = mp3s.length;
      } catch {
        // ignore
      }
    }
  }

  // ─── 6. EXERCISE-TO-AUDIO MAPPING ───────────────────────────────

  try {
    const exerciseToAudioPath = path.join(
      process.cwd(),
      'src/lib/content/exercise-to-audio.json'
    );
    if (fs.existsSync(exerciseToAudioPath)) {
      const content = JSON.parse(
        fs.readFileSync(exerciseToAudioPath, 'utf-8')
      );
      const entries = Object.entries(content);

      const specificExercises = ['w1_l1_mc_0', 'w1_l1_tr_0', 'w1_l1_e0'];
      const exerciseCheck: Record<string, boolean> = {};
      for (const ex of specificExercises) {
        exerciseCheck[ex] = !!content[ex];
      }

      results.checks.exerciseMapping = {
        totalEntries: entries.length,
        sampleEntries: entries.slice(0, 10),
        specificExercises: exerciseCheck,
        hasW1L1: entries.some(([k]) => k.startsWith('w1_l1_')),
      };

      if (!results.checks.exerciseMapping.hasW1L1) {
        results.errors.push(
          '❌ w1_l1_* վարժությունները բացակայում են exercise-to-audio.json-ում'
        );
      }
    } else {
      results.errors.push('❌ exercise-to-audio.json ֆայլը գոյություն չունի');
    }
  } catch (e: any) {
    results.errors.push(`❌ exercise-to-audio.json բեռնման սխալ: ${e.message}`);
  }

  // ─── 7. SUMMARY ─────────────────────────────────────────────────

  results.summary.totalErrors = results.errors.length;
  results.summary.totalWarnings = results.warnings.length;
  results.summary.status =
    results.errors.length === 0 ? '✅ OK' : '❌ HAS ERRORS';

  return NextResponse.json(results, { status: 200 });
}