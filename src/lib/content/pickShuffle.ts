export interface RenderedPickItem {
  seedKey: string;
  map: number[];
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

export function buildDisplayMap(n: number, seedKey: string): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  if (n === 0) return idx;
  const rng = mulberry32(hashSeed(seedKey));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export function renderPickItem(
  exerciseId: string,
  item: any,
  itemIdx: number,
  attemptId: string,
  shuffle: boolean
): RenderedPickItem {
  const seedKey = `${exerciseId}:${itemIdx}:${attemptId}`;
  const rawOptions = item?.o || item?.options || item?.opts;
  const options = Array.isArray(rawOptions) ? rawOptions : [];
  const correctIndex = typeof item?.a === 'number' ? item.a : 0;

  if (!shuffle || options.length === 0) {
    return {
      seedKey,
      map: options.map((_, i) => i),
      options: [...options],
      originalCorrectIndex: correctIndex,
    };
  }

  const map = buildDisplayMap(options.length, seedKey);
  return {
    seedKey,
    map,
    options: map.map((origIdx) => options[origIdx]),
    originalCorrectIndex: correctIndex,
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

export function resolveWrongFeedback(
  item: any,
  wrongFeedbackKey: string | null
): unknown {
  if (!wrongFeedbackKey) return null;
  return item?.no?.[wrongFeedbackKey] ?? item?.byOption?.[wrongFeedbackKey] ?? null;
}