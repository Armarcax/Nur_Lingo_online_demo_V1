// src/lib/hayq/wallet.ts

/**
 * NUR Lingo — HAYQ Wallet & Ledger Abstraction
 *
 * Thin abstraction layered on top of `src/lib/rewards/seeds.ts`.
 * - Provides a single audited entry point for every HAYQ mutation.
 * - Persists an append-only ledger (last 200 entries) for transparency.
 * - Future-proof: swap localStorage backend for a server wallet without
 *   touching call sites.
 *
 * NOTE: This is additive. Existing rewards logic still works as-is.
 *       New code should prefer `wallet.credit()` / `wallet.debit()`.
 */

import { loadRewards, saveRewards, addHAYQ, type UserRewards } from "../rewards/seeds";

const LEDGER_KEY = "nur_hayq_ledger_v1";
const MAX_ENTRIES = 200;

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type HayqReason =
  | "exercise_correct"
  | "lesson_perfect"
  | "lesson_complete"
  | "module_complete"
  | "daily_lesson"
  | "perfect_streak"
  | "review_complete"
  | "streak_milestone"
  | "dialogue_complete"
  | "conversation_milestone"
  | "world_complete"
  | "streak_bonus"
  | "daily_goal"
  | "purchase_heart_refill"
  | "purchase_streak_freeze"
  | "transfer"
  | "manual_adjust"
  | "first_lesson"
  | "unit_complete"
  | "perfect_exercise"
  | "excellent_exercise"
  | "good_exercise"
  | "partial_exercise"
  | "streak_bonus"
  | "daily_bonus";

export interface LedgerEntry {
  id: string;
  ts: number;
  delta: number;        // positive = credit, negative = debit
  reason: HayqReason;
  balanceAfter: number;
  meta?: Record<string, unknown>;
}

export interface Wallet {
  balance: number;
  add(amount: number, reason?: HayqReason): void;
  spend(amount: number, reason?: HayqReason): boolean;
  getBalance(): number;
  history(limit?: number): LedgerEntry[];
  clearHistory(): void;
}

// ─── LEDGER FUNCTIONS ──────────────────────────────────────────────────────

function readLedger(): LedgerEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    return raw ? (JSON.parse(raw) as LedgerEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLedger(entries: LedgerEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = entries.slice(-MAX_ENTRIES);
    localStorage.setItem(LEDGER_KEY, JSON.stringify(trimmed));
  } catch {}
}

function appendEntry(
  delta: number,
  reason: HayqReason,
  balanceAfter: number,
  meta?: Record<string, unknown>
): LedgerEntry {
  const entry: LedgerEntry = {
    id: `hayq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    delta,
    reason,
    balanceAfter,
    meta,
  };
  const all = readLedger();
  all.push(entry);
  writeLedger(all);
  return entry;
}

// ─── SIMPLE WALLET (Backward compatible) ──────────────────────────────────

export function getWallet(): Wallet {
  const rewards = loadRewards();
  return {
    balance: rewards.totalHAYQ,
    add(amount: number, reason: HayqReason = "manual_adjust") {
      const updated = addHAYQ(loadRewards(), amount);
      saveRewards(updated);
      this.balance = updated.totalHAYQ;
      appendEntry(amount, reason, updated.totalHAYQ);
    },
    spend(amount: number, reason: HayqReason = "manual_adjust") {
      if (this.balance < amount) return false;
      const rewards = loadRewards();
      rewards.totalHAYQ -= amount;
      saveRewards(rewards);
      this.balance = rewards.totalHAYQ;
      appendEntry(-amount, reason, rewards.totalHAYQ);
      return true;
    },
    getBalance(): number {
      return loadRewards().totalHAYQ;
    },
    history(limit = 50): LedgerEntry[] {
      return readLedger().slice(-limit).reverse();
    },
    clearHistory(): void {
      writeLedger([]);
    },
  };
}

// ─── ADVANCED WALLET (New API) ────────────────────────────────────────────

export const wallet = {
  balance(): number {
    return loadRewards().totalHAYQ;
  },

  credit(amount: number, reason: HayqReason, meta?: Record<string, unknown>): UserRewards {
    if (amount <= 0) return loadRewards();
    const current = loadRewards();
    const updated: UserRewards = { ...current, totalHAYQ: current.totalHAYQ + amount };
    saveRewards(updated);
    appendEntry(amount, reason, updated.totalHAYQ, meta);
    return updated;
  },

  debit(
    amount: number,
    reason: HayqReason,
    meta?: Record<string, unknown>
  ): { ok: boolean; rewards: UserRewards; error?: string } {
    if (amount <= 0) return { ok: true, rewards: loadRewards() };
    const current = loadRewards();
    if (current.totalHAYQ < amount) {
      return { ok: false, rewards: current, error: "Insufficient HAYQ balance" };
    }
    const updated: UserRewards = { ...current, totalHAYQ: current.totalHAYQ - amount };
    saveRewards(updated);
    appendEntry(-amount, reason, updated.totalHAYQ, meta);
    return { ok: true, rewards: updated };
  },

  history(limit = 50): LedgerEntry[] {
    return readLedger().slice(-limit).reverse();
  },

  clearHistory(): void {
    writeLedger([]);
  },

  // Helper: get ledger entry by id
  getEntry(id: string): LedgerEntry | undefined {
    return readLedger().find(e => e.id === id);
  },

  // Helper: get total by reason
  getTotalByReason(reason: HayqReason): number {
    return readLedger()
      .filter(e => e.reason === reason)
      .reduce((sum, e) => sum + e.delta, 0);
  },

  // Helper: get daily total
  getDailyTotal(): number {
    const todayStart = new Date().setHours(0, 0, 0, 0);
    return readLedger()
      .filter(e => e.ts >= todayStart)
      .reduce((sum, e) => sum + e.delta, 0);
  },
};

// ─── COMPATIBILITY HELPERS ─────────────────────────────────────────────────

/**
 * Get current balance (simple)
 */
export function getBalance(): number {
  return loadRewards().totalHAYQ;
}

/**
 * Simple add (backward compatible)
 */
export function addToWallet(amount: number, reason: HayqReason = "manual_adjust"): UserRewards {
  return wallet.credit(amount, reason);
}

/**
 * Simple spend (backward compatible)
 */
export function spendFromWallet(amount: number, reason: HayqReason = "manual_adjust"): boolean {
  const result = wallet.debit(amount, reason);
  return result.ok;
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export default {
  wallet,
  getWallet,
  getBalance,
  addToWallet,
  spendFromWallet,
};