// src/app/api/diagnose/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { offlineAudioManager } from '@/lib/offline/OfflineAudioManager';
import { offlineLessonEngine } from '@/lib/offline/OfflineLessonEngine';
import { resolveOfflineAudio } from '@/lib/offline/offline-audio-resolver';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
    summary: {}
  };

  // ─── 1. ՍՏՈՒԳԵԼ ԱՈՒԴԻՈ ՊԱՆԱԿՆԵՐԸ ──────────────────────────────

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
        fileCount = files.filter(f => f.endsWith('.mp3')).length;
        sampleFiles = files.filter(f => f.endsWith('.mp3')).slice(0, 5);
      } catch (e) {
        // ignore
      }
    }
    
    results.checks.directories[dirPath] = {
      exists,
      fileCount,
      sampleFiles,
      fullPath
    };
    
    if (!exists) {
      results.warnings.push(`📁 Պանակը գոյություն չունի: ${dirPath}`);
    } else if (fileCount === 0) {
      results.warnings.push(`📁 Պանակը դատարկ է: ${dirPath}`);
    } else {
      results.summary[`${dirPath.replace(/\//g, '_')}_files`] = fileCount;
    }
  }

  // ─── 2. ՍՏՈՒԳԵԼ MANIFEST ՖԱՅԼԵՐԸ ──────────────────────────────

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
      } catch (e) {
        results.errors.push(`❌ Manifest-ը չի կարող բեռնվել: ${filePath}`);
      }
    }
    
    results.checks.manifests[filePath] = {
      exists,
      keyCount,
      sampleKeys
    };
    
    if (!exists) {
      results.errors.push(`❌ Manifest ֆայլը գոյություն չունի: ${filePath}`);
    }
  }

  // ─── 3. ՍՏՈՒԳԵԼ OFFLINE AUDIO MANAGER ──────────────────────────

  try {
    await offlineAudioManager.init();
    const stats = offlineAudioManager.getStats();
    const sampleKeys = (offlineAudioManager as any).getSampleKeys?.(10) || [];
    
    results.checks.offlineManager = {
      initialized: true,
      stats,
      sampleKeys,
      isPlaying: offlineAudioManager.isPlaying()
    };
    
    results.summary.managerTotal = stats.totalEntries || 0;
    
  } catch (e: any) {
    results.checks.offlineManager = {
      initialized: false,
      error: e.message
    };
    results.errors.push(`❌ OfflineAudioManager-ը չի աշխատում: ${e.message}`);
  }

  // ─── 4. ՍՏՈՒԳԵԼ OFFLINE LESSON ENGINE ──────────────────────────

  try {
    await offlineLessonEngine.init();
    const lessonCount = (offlineLessonEngine as any).getLessonCount?.() || 0;
    const audioEntries = (offlineLessonEngine as any).getAudioEntries?.() || 0;
    
    results.checks.lessonEngine = {
      initialized: true,
      lessonCount,
      audioEntries
    };
    
    results.summary.lessonCount = lessonCount;
    results.summary.lessonAudioEntries = audioEntries;
    
  } catch (e: any) {
    results.checks.lessonEngine = {
      initialized: false,
      error: e.message
    };
    results.errors.push(`❌ OfflineLessonEngine-ը չի աշխատում: ${e.message}`);
  }

  // ─── 5. ՍՏՈՒԳԵԼ ԱՈՒԴԻՈ ՈՐՈՆՈՒՄԸ ────────────────────────────

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
        source: result?.source || null
      };
      
      if (!result) {
        results.warnings.push(`⚠️ Աուդիո չի գտնվել: "${test.key}" (${test.lang})`);
      }
    } catch (e: any) {
      results.checks.audioResolution[`${test.key}_${test.lang}`] = {
        key: test.key,
        lang: test.lang,
        error: e.message
      };
      results.errors.push(`❌ Սխալ աուդիո որոնման ժամանակ: "${test.key}" (${test.lang})`);
    }
  }

  // ─── 6. ՍՏՈՒԳԵԼ ԳՐԱՆՑՎԱԾ ԱՈՒԴԻՈ ՖԱՅԼԵՐԸ ────────────────

  const hyPath = path.join(process.cwd(), 'public/audio/offline/hy_Ani');
  if (fs.existsSync(hyPath)) {
    try {
      const files = fs.readdirSync(hyPath);
      const mp3Files = files.filter(f => f.endsWith('.mp3'));
      results.checks.hyAudioFiles = {
        count: mp3Files.length,
        sample: mp3Files.slice(0, 10)
      };
      results.summary.hyAudioCount = mp3Files.length;
    } catch (e) {
      // ignore
    }
  }

  const enPath = path.join(process.cwd(), 'public/audio/offline/en_female');
  if (fs.existsSync(enPath)) {
    try {
      const files = fs.readdirSync(enPath);
      const mp3Files = files.filter(f => f.endsWith('.mp3'));
      results.checks.enAudioFiles = {
        count: mp3Files.length,
        sample: mp3Files.slice(0, 10)
      };
      results.summary.enAudioCount = mp3Files.length;
    } catch (e) {
      // ignore
    }
  }

  const ruPath = path.join(process.cwd(), 'public/audio/offline/ru_female');
  if (fs.existsSync(ruPath)) {
    try {
      const files = fs.readdirSync(ruPath);
      const mp3Files = files.filter(f => f.endsWith('.mp3'));
      results.checks.ruAudioFiles = {
        count: mp3Files.length,
        sample: mp3Files.slice(0, 10)
      };
      results.summary.ruAudioCount = mp3Files.length;
    } catch (e) {
      // ignore
    }
  }

  // ─── 7. ՍՏՈՒԳԵԼ EXERCISE-TO-AUDIO ՄԱՊԻՆԳԸ ──────────────────

  try {
    const exerciseToAudioPath = path.join(process.cwd(), 'src/lib/content/exercise-to-audio.json');
    if (fs.existsSync(exerciseToAudioPath)) {
      const content = JSON.parse(fs.readFileSync(exerciseToAudioPath, 'utf-8'));
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
        hasW1L1: entries.some(([k]) => k.startsWith('w1_l1_'))
      };
      
      if (!results.checks.exerciseMapping.hasW1L1) {
        results.errors.push('❌ w1_l1_* վարժությունները բացակայում են exercise-to-audio.json-ում');
      }
    } else {
      results.errors.push('❌ exercise-to-audio.json ֆայլը գոյություն չունի');
    }
  } catch (e: any) {
    results.errors.push(`❌ exercise-to-audio.json բեռնման սխալ: ${e.message}`);
  }

  // ─── 8. ՍՏՈՒԳԵԼ WavClient-ի ԱՇԽԱՏԱՆՔԸ ──────────────────────

  try {
    const { getWavClient } = await import('@/lib/audio/WavClient');
    const wavClient = getWavClient();
    results.checks.wavClient = {
      available: !!wavClient,
      hasGenerateFunction: typeof wavClient?.generateAudio === 'function',
      hasPlayFunction: typeof wavClient?.playGeneratedAudio === 'function'
    };
  } catch (e: any) {
    results.checks.wavClient = {
      available: false,
      error: e.message
    };
    results.errors.push(`❌ WavClient-ը չի աշխատում: ${e.message}`);
  }

  // ─── 9. ԱՄՓՈՓՈՒՄ ──────────────────────────────────────────────

  results.summary.totalErrors = results.errors.length;
  results.summary.totalWarnings = results.warnings.length;
  results.summary.status = results.errors.length === 0 ? '✅ OK' : '❌ HAS ERRORS';

  return NextResponse.json(results, { status: 200 });
}