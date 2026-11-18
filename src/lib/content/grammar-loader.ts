import type {
  GrammarCard,
  GrammarCommonError,
  GrammarExercise,
  GrammarExample,
  GrammarFeedback,
  GrammarItem,
  GrammarMatchItem,
  GrammarOrderItem,
  GrammarPickItem,
  GrammarRule,
  GrammarTextItem,
  GrammarUnit,
  LocalizedText,
} from "./grammar-types";

type DataObject = Record<string, unknown>;

function object(value: unknown): DataObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as DataObject
    : {};
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === "string");
  if (typeof value === "string") return [value];
  return [];
}

function localized(value: unknown): LocalizedText {
  if (typeof value === "string") return { hy: value, ru: value, en: value };
  const raw = object(value);
  return {
    ...(typeof raw.hy === "string" ? { hy: raw.hy } : {}),
    ...(typeof raw.ru === "string" ? { ru: raw.ru } : {}),
    ...(typeof raw.en === "string" ? { en: raw.en } : {}),
  };
}

function promptText(value: unknown): string | LocalizedText {
  if (typeof value === "string") return value;
  const raw = object(value);
  if ([raw.hy, raw.ru, raw.en].some((entry) => typeof entry === "string")) return localized(raw);
  return text(value);
}

function feedback(value: unknown): GrammarFeedback | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = object(value);
  const legacyOptions = object(raw.byOption);
  const legacyIndexes = Object.keys(legacyOptions).map(Number).filter(Number.isInteger);
  const options = Array.isArray(raw.options)
    ? raw.options.map((entry) => entry == null ? null : localized(entry))
    : legacyIndexes.length
      ? Array.from({ length: Math.max(...legacyIndexes) + 1 }, (_, index) =>
          legacyOptions[index] == null ? null : localized(legacyOptions[index]))
      : undefined;
  const targetedRaw = object(raw.targeted);
  const targeted = Object.keys(targetedRaw).length
    ? Object.fromEntries(Object.entries(targetedRaw).map(([key, entry]) => [
        key,
        typeof entry === "string" ? entry : localized(entry),
      ]))
    : undefined;
  return {
    ...(raw.correct ? { correct: localized(raw.correct) } : {}),
    ...(options ? { options } : {}),
    ...(targeted ? { targeted } : {}),
  };
}

function mapItem(value: unknown, type: string, index: number): GrammarItem | null {
  const raw = object(value);
  const id = text(raw.id, `item-${index + 1}`);
  const itemFeedback = feedback(raw.feedback);

  if (type === "pick") {
    const options = strings(raw.options ?? raw.o ?? raw.opts);
    const correctIndex = typeof raw.correctIndex === "number"
      ? raw.correctIndex
      : typeof raw.a === "number" ? raw.a : -1;
    if (!options.length || correctIndex < 0 || correctIndex >= options.length) return null;
    const item: GrammarPickItem = {
      id,
      prompt: promptText(raw.stem ?? raw.prompt ?? raw.s),
      options,
      correctIndex,
      feedback: itemFeedback,
    };
    return item;
  }

  if (type === "match") {
    const answer = text(raw.answer);
    if (!answer) return null;
    const item: GrammarMatchItem = {
      id,
      prompt: promptText(raw.prompt ?? raw.question ?? raw.stem ?? raw.s),
      answer,
      feedback: itemFeedback,
    };
    return item;
  }

  if (type === "order") {
    const words = strings(raw.words ?? raw.w);
    const accepted = strings(raw.accepted ?? raw.a);
    if (!words.length || !accepted.length) return null;
    const item: GrammarOrderItem = { id, words, accepted, feedback: itemFeedback };
    return item;
  }

  if (["gap", "write", "fix"].includes(type)) {
    const accepted = strings(raw.accepted ?? raw.a);
    if (!accepted.length) return null;
    const item: GrammarTextItem = {
      id,
      prompt: promptText(raw.stem ?? raw.prompt ?? raw.s ?? raw.p),
      accepted,
      exact: raw.exact === true,
      feedback: itemFeedback,
    };
    return item;
  }

  return null;
}

function mapExercise(value: unknown, index: number): GrammarExercise | null {
  const raw = object(value);
  const rawType = text(raw.type);
  const supported = ["pick", "gap", "write", "order", "fix", "match"].includes(rawType);
  const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
  const items = itemsRaw
    .map((item, itemIndex) => mapItem(item, rawType, itemIndex))
    .filter((item): item is GrammarItem => item !== null);
  if (!items.length && supported) return null;

  return {
    id: text(raw.id, `task-${index + 1}`),
    type: supported ? rawType as GrammarExercise["type"] : "unsupported",
    order: typeof raw.order === "number" ? raw.order : index + 1,
    difficulty: typeof raw.difficulty === "number" || typeof raw.difficulty === "string"
      ? raw.difficulty
      : undefined,
    cardIds: strings(raw.cardIds),
    shuffleOptions: raw.shuffleOptions === true,
    exact: raw.exact === true,
    instruction: localized(raw.instructions ?? raw.instruction),
    example: text(raw.example),
    box: strings(raw.box),
    options: strings(raw.options),
    unusedOptionFeedback: raw.unusedOptionFeedback ? localized(raw.unusedOptionFeedback) : undefined,
    items,
  };
}

function mapUnit(value: unknown): GrammarUnit | null {
  const raw = object(value);
  if (typeof raw.id !== "string" || typeof raw.unitNumber !== "number") return null;

  const cards = (Array.isArray(raw.cards) ? raw.cards : [])
    .map((entry, index): GrammarCard | null => {
      const card = object(entry);
      if (typeof card.id !== "string") return null;
      return {
        id: card.id,
        kind: text(card.kind ?? card.type, "rule"),
        order: typeof card.order === "number" ? card.order : index + 1,
        title: localized(card.title),
        body: localized(card.body),
        formula: text(card.formula) || undefined,
        targetText: text(card.targetText) || undefined,
        example: text(card.example) || undefined,
      };
    })
    .filter((entry): entry is GrammarCard => entry !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const rules = (Array.isArray(raw.rules) ? raw.rules : [])
    .map((entry, index): GrammarRule => {
      const rule = object(entry);
      return {
        id: text(rule.id, `rule-${index + 1}`),
        formula: text(rule.formula) || undefined,
        statement: localized(rule.statement),
        targetText: text(rule.targetText) || undefined,
      };
    });

  const examples = (Array.isArray(raw.examples) ? raw.examples : [])
    .map((entry, index): GrammarExample => {
      const example = object(entry);
      return {
        id: text(example.id, `example-${index + 1}`),
        targetText: text(example.targetText),
        translation: localized(example.translation),
      };
    });

  const commonErrors = (Array.isArray(raw.commonErrors) ? raw.commonErrors : [])
    .map((entry, index): GrammarCommonError => {
      const error = object(entry);
      return {
        id: text(error.id, `error-${index + 1}`),
        wrong: text(error.wrong),
        correct: text(error.correct),
        explanation: localized(error.explanation),
      };
    });

  const exerciseSource = Array.isArray(raw.exercises) ? raw.exercises : raw.tasks;
  const exercises = (Array.isArray(exerciseSource) ? exerciseSource : [])
    .map((entry, index) => mapExercise(entry, index))
    .filter((entry): entry is GrammarExercise => entry !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const objectives = (Array.isArray(raw.learningObjectives) ? raw.learningObjectives : [])
    .map(localized);
  const reviewCards = (Array.isArray(raw.reviewCards) ? raw.reviewCards : [])
    .map((entry, index) => {
      const review = object(entry);
      return {
        id: text(review.id, `review-${index + 1}`),
        type: text(review.type, "recall"),
        prompt: localized(review.prompt),
        answer: text(review.answer),
      };
    });
  const directions = strings(raw.supportedDirections);

  return {
    id: raw.id,
    bookId: text(raw.bookId) || undefined,
    targetLanguage: "en",
    supportedDirections: directions.length ? directions : ["hy-en", "ru-en"],
    cefr: typeof raw.cefr === "string" ? raw.cefr : null,
    level: raw.level ? localized(raw.level) : undefined,
    sectionId: text(raw.sectionId) || undefined,
    section: raw.section ? localized(raw.section) : undefined,
    unitNumber: raw.unitNumber,
    title: localized(raw.title),
    explanation: localized(raw.explanation),
    learningObjectives: objectives,
    rules,
    examples,
    commonErrors,
    cards,
    exercises,
    reviewCards,
    needsReview: raw.needsReview === true,
  };
}

function normalizeUnits(raw: unknown): GrammarUnit[] {
  const data = Array.isArray(raw)
    ? raw
    : Array.isArray(object(raw).units)
      ? object(raw).units as unknown[]
      : [raw];
  const selected = new Map<string, GrammarUnit>();
  const duplicates = new Set<string>();

  for (const entry of data) {
    const unit = mapUnit(entry);
    if (!unit) continue;
    if (selected.has(unit.id)) duplicates.add(unit.id);
    // When the JSON contains duplicate IDs, the later record is treated as the current revision.
    selected.set(unit.id, unit);
  }

  if (duplicates.size && process.env.NODE_ENV !== "production") {
    console.warn("Duplicate grammar unit IDs found; using the last record for each ID:", [...duplicates]);
  }
  return [...selected.values()];
}

export async function loadGrammarUnits(): Promise<GrammarUnit[]> {
  try {
    const mod = await import("@/lib/content/grammer-en.json");
    const raw = (mod as { default?: unknown }).default ?? mod;
    return normalizeUnits(raw);
  } catch (error) {
    console.warn("Failed to load grammer-en.json", error);
    return [];
  }
}

export function getUnitExercises(unit: GrammarUnit): GrammarExercise[] {
  return unit.exercises;
}
