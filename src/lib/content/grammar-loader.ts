// src/lib/content/grammar-loader.ts
import type { GrammarUnit } from "./grammar-types";

function normalizeUnits(raw: unknown): GrammarUnit[] {
  if (Array.isArray(raw)) return raw as GrammarUnit[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.units)) return obj.units as GrammarUnit[];
    if (typeof obj.id === "string" && typeof obj.unitNumber === "number") {
      return [obj as unknown as GrammarUnit];
    }
  }
  return [];
}

/**
 * Բեռնում է `grammer-en.json`-ը lazy-ով (142 KB — արժե code-split անել)։
 * Ամեն վերադարձած unit-ից օգտագործում ենք միայն `exercises` կամ `tasks` դաշտը։
 */
export async function loadGrammarUnits(): Promise<GrammarUnit[]> {
  try {
    const mod = await import("@/lib/content/grammer-en.json");
    const raw = (mod as { default?: unknown }).default ?? mod;
    return normalizeUnits(raw);
  } catch (e) {
    console.warn("Failed to load grammer-en.json", e);
    return [];
  }
}

/** Միավորում է `exercises` և `tasks` (եթե երկուսն էլ կան)։ */
export function getUnitExercises(unit: GrammarUnit) {
  return unit.exercises ?? unit.tasks ?? [];
}