// src/lib/hayq/events.ts

/**
 * HAYQ Reward Event catalog — central source of truth for all earnable events.
 * Wraps the wallet abstraction so business logic never hardcodes amounts.
 * Plus event tracking for achievements and analytics.
 */

import { wallet, type HayqReason } from "./wallet";

// ─── EVENT TYPES ────────────────────────────────────────────────────────────

export type HayqEventType = "earn" | "spend" | "reward" | "bonus";

export interface HayqEvent {
  type: HayqEventType;
  amount: number;
  reason: string;
  timestamp: number;
  meta?: Record<string, unknown>;
}

export type HayqEventKey = keyof typeof HAYQ_EVENTS;

// ─── EVENT CATALOG ──────────────────────────────────────────────────────────

export const HAYQ_EVENTS = {
  exercise_correct:          { amount: 10,  reason: "exercise_correct" as HayqReason },
  lesson_complete:           { amount: 50,  reason: "lesson_complete" as HayqReason },
  lesson_perfect:            { amount: 100, reason: "lesson_perfect" as HayqReason },
  module_complete:           { amount: 250, reason: "module_complete" as HayqReason },
  daily_lesson:              { amount: 20,  reason: "daily_lesson" as HayqReason },
  perfect_streak:            { amount: 75,  reason: "perfect_streak" as HayqReason },
  review_complete:           { amount: 30,  reason: "review_complete" as HayqReason },
  streak_milestone_7:        { amount: 100, reason: "streak_milestone" as HayqReason },
  streak_milestone_30:       { amount: 500, reason: "streak_milestone" as HayqReason },
  dialogue_complete:         { amount: 100, reason: "dialogue_complete" as HayqReason },
  conversation_milestone:    { amount: 200, reason: "conversation_milestone" as HayqReason },
  first_lesson:              { amount: 50,  reason: "first_lesson" as HayqReason },
  streak_3:                  { amount: 10,  reason: "streak_bonus" as HayqReason },
  streak_7:                  { amount: 30,  reason: "streak_bonus" as HayqReason },
  streak_30:                 { amount: 100, reason: "streak_bonus" as HayqReason },
  unit_complete:             { amount: 200, reason: "unit_complete" as HayqReason },
  perfect_exercise:          { amount: 25,  reason: "perfect_exercise" as HayqReason },
  excellent_exercise:        { amount: 20,  reason: "excellent_exercise" as HayqReason },
  good_exercise:             { amount: 15,  reason: "good_exercise" as HayqReason },
  partial_exercise:          { amount: 5,   reason: "partial_exercise" as HayqReason },
} as const;

// ─── EVENT STORE ────────────────────────────────────────────────────────────

const eventStore: HayqEvent[] = [];
const MAX_STORED_EVENTS = 1000;

// ─── MAIN FUNCTIONS ─────────────────────────────────────────────────────────

/**
 * Award HAYQ for an event and record it
 */
export function award(event: HayqEventKey, meta?: Record<string, unknown>): number {
  const ev = HAYQ_EVENTS[event];
  if (!ev) {
    console.warn(`[HAYQ] Unknown event: ${event}`);
    return 0;
  }

  // Credit to wallet
  const result = wallet.credit(ev.amount, ev.reason, meta);

  // Record event for analytics
  recordEvent({
    type: "earn",
    amount: ev.amount,
    reason: ev.reason,
    timestamp: Date.now(),
    meta,
  });

  return result as any;
}

/**
 * Spend HAYQ (for shop purchases, etc.)
 */
export function spend(amount: number, reason: string, meta?: Record<string, unknown>): boolean {
  const success = wallet.debit(amount, reason as HayqReason, meta);
  if (success) {
    recordEvent({
      type: "spend",
      amount,
      reason,
      timestamp: Date.now(),
      meta,
    });
  }
  return success as any;
}

/**
 * Record any HAYQ event
 */
export function recordEvent(event: HayqEvent): void {
  eventStore.push(event);
  if (eventStore.length > MAX_STORED_EVENTS) {
    eventStore.splice(0, eventStore.length - MAX_STORED_EVENTS);
  }
}

/**
 * Get recent events
 */
export function getRecentEvents(limit: number = 20): HayqEvent[] {
  return [...eventStore].reverse().slice(0, limit);
}

/**
 * Get all events
 */
export function getAllEvents(): HayqEvent[] {
  return [...eventStore];
}

/**
 * Clear all events
 */
export function clearEvents(): void {
  eventStore.length = 0;
}

// ─── STATISTICS ─────────────────────────────────────────────────────────────

/**
 * Get total HAYQ earned today
 */
export function getTotalEarnedToday(): number {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  return eventStore
    .filter(e => e.type === "earn" && e.timestamp >= todayStart)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Get total HAYQ earned this week
 */
export function getTotalEarnedThisWeek(): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  return eventStore
    .filter(e => e.type === "earn" && e.timestamp >= weekStart.getTime())
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Get total HAYQ earned this month
 */
export function getTotalEarnedThisMonth(): number {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  return eventStore
    .filter(e => e.type === "earn" && e.timestamp >= monthStart.getTime())
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Get total HAYQ by event type
 */
export function getTotalByReason(reason: string): number {
  return eventStore
    .filter(e => e.reason === reason)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Get event counts by type
 */
export function getEventStats(): {
  totalEvents: number;
  totalEarned: number;
  totalSpent: number;
  byType: Record<HayqEventType, number>;
  byReason: Record<string, number>;
} {
  const byType: Record<HayqEventType, number> = {
    earn: 0,
    spend: 0,
    reward: 0,
    bonus: 0,
  };
  const byReason: Record<string, number> = {};
  let totalEarned = 0;
  let totalSpent = 0;

  for (const e of eventStore) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    byReason[e.reason] = (byReason[e.reason] || 0) + e.amount;
    if (e.type === "earn" || e.type === "reward" || e.type === "bonus") {
      totalEarned += e.amount;
    } else if (e.type === "spend") {
      totalSpent += e.amount;
    }
  }

  return {
    totalEvents: eventStore.length,
    totalEarned,
    totalSpent,
    byType,
    byReason,
  };
}

// ─── WALLET SYNC ────────────────────────────────────────────────────────────

/**
 * Sync wallet with event store (reconcile)
 */
export function syncWalletFromEvents(): number {
  const totalEarned = eventStore
    .filter(e => e.type === "earn" || e.type === "reward" || e.type === "bonus")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalSpent = eventStore
    .filter(e => e.type === "spend")
    .reduce((sum, e) => sum + e.amount, 0);
  
  return totalEarned - totalSpent;
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export default {
  HAYQ_EVENTS,
  award,
  spend,
  recordEvent,
  getRecentEvents,
  getAllEvents,
  clearEvents,
  getTotalEarnedToday,
  getTotalEarnedThisWeek,
  getTotalEarnedThisMonth,
  getTotalByReason,
  getEventStats,
  syncWalletFromEvents,
};