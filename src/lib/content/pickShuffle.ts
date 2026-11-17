// src/lib/content/pickShuffle.ts

export interface RenderedPickItem {
  seedKey: string;
  /** displayIndex → originalIndex */
  map: number[];
  /** ցուցադրման պատճեն (JSON-ի o-ն չի mutation-վում) */
  options: string[];
  originalCorrectIndex: number;
}

function hashSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic permutation: same seedKey → same order. */
export function buildDisplayMap(n: number, seedKey: string): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  const rng = mulberry32(hashSeed(seedKey));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/**
 * Կանչիր ՄԵԿ անգամ յուրաքանչյուր attempt-ի համար (useMemo-ով)։
 * `shuffle=false` դեպքում վերադարձնում է identity map (սկզբնական հերթականություն)։
 */
export function renderPickItem(
  exerciseId: string,
  item: { o: string[]; a: number },
  itemIdx: number,
  attemptId: string,
  shuffle: boolean
): RenderedPickItem {
  const seedKey = `${exerciseId}:${itemIdx}:${attemptId}`;
  if (!shuffle) {
    return {
      seedKey,
      map: item.o.map((_, i) => i),
      options: [...item.o],
      originalCorrectIndex: item.a,
    };
  }
  const map = buildDisplayMap(item.o.length, seedKey);
  return {
    seedKey,
    map,
    options: map.map((origIdx) => item.o[origIdx]),
    originalCorrectIndex: item.a,
  };
}

export function checkPickAnswer(rendered: RenderedPickItem, displaySelected: number) {
  const originalSelected = rendered.map[displaySelected];
  const isCorrect = originalSelected === rendered.originalCorrectIndex;
  return {
    isCorrect,
    originalSelected,
    wrongFeedbackKey: isCorrect ? null : String(originalSelected),
  };
}

/** `no`/`byOption` բանալիները JSON-ում keyed են ՍԿԶԲՆԱԿԱՆ ինդեքսով։ */
export function resolveWrongFeedback(
  item: { no?: Record<string, unknown>; byOption?: Record<string, unknown> },
  wrongFeedbackKey: string | null
): unknown {
  if (!wrongFeedbackKey) return null;
  return item.no?.[wrongFeedbackKey] ?? item.byOption?.[wrongFeedbackKey] ?? null;
}