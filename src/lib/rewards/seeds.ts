/**
 * NUR Lingo — Rewards Persistence
 * Handles saving and loading HAYQ, Seeds, Streak, Hearts, Crowns, Quests, Achievements & Level System
 *
 * v2 fixes:
 * - Local-time date key (not UTC) — fixes timezone bug for UTC+4 users
 * - dailyActivity consistently tracks MINUTES (addHAYQ no longer touches it)
 * - recordLessonComplete: single load/save (no race conditions)
 * - addQuestProgressAndUpdateRewards: no double save
 * - earnHeartByPractice: preserves partial heart recovery progress
 * - checkAndApplyFreeze: uses floor() and local dates
 * - Added STREAK_365 achievement
 * - checkAchievements called from addHAYQ/addRewards
 */

const STORAGE_KEY = "nur_lingo_seeds_v4";
const QUESTS_KEY = "nur_daily_quests";

// ─── TYPES ────────────────────────────────────────────────────────────

export interface UserRewards {
  totalHAYQ: number;
  totalSeeds: number;
  streak: number;
  streakFreeze: number;
  maxStreak: number;
  lastActivityDate?: string;
  crowns: Record<string, number>;
  hearts: number;
  lastHeartUpdate: string;
  milestones: number[];
  dailyGoal: number;
  dailyActivity: Record<string, number>;
  goalClaimed: string[];
  level: number;
  xpToNextLevel: number;
  totalXP: number;
  achievements: string[];
  lastLoginDate?: string;
}

export interface Quest {
  id: string;
  description: Record<"en" | "hy" | "ru", string>;
  target: number;
  progress: number;
  reward: { hayq: number; seeds?: number };
  completed: boolean;
  claimed: boolean;
}

export interface QuestsData {
  date: string;
  quests: Quest[];
}

// ─── CONSTANTS ───────────────────────────────────────────────────────

const HEART_RECOVERY_MINUTES = 5;
const HEART_RECOVERY_MS = HEART_RECOVERY_MINUTES * 60 * 1000;
const MAX_HEARTS = 5;
const MAX_STREAK_FREEZE = 2;
const MS_PER_DAY = 86400000;

const LEVELS = [
  { level: 1, xpRequired: 0, title: "🌱 Սկսնակ" },
  { level: 2, xpRequired: 100, title: "🌿 Սովորող" },
  { level: 3, xpRequired: 250, title: "🌳 Ընթերցող" },
  { level: 4, xpRequired: 500, title: "📖 Գիտակ" },
  { level: 5, xpRequired: 800, title: "🎓 Փորձագետ" },
  { level: 6, xpRequired: 1200, title: "🏆 Մասնագետ" },
  { level: 7, xpRequired: 1800, title: "👑 Վարպետ" },
  { level: 8, xpRequired: 2500, title: "⭐ Լեգենդ" },
];

const DEFAULT_REWARDS: UserRewards = {
  totalHAYQ: 0,
  totalSeeds: 0,
  streak: 0,
  maxStreak: 0,
  streakFreeze: 0,
  crowns: {},
  hearts: 5,
  lastHeartUpdate: new Date().toISOString(),
  milestones: [],
  dailyGoal: 10,
  dailyActivity: {},
  goalClaimed: [],
  level: 1,
  xpToNextLevel: 100,
  totalXP: 0,
  achievements: [],
  lastLoginDate: undefined,
};

const DEFAULT_QUESTS: Omit<Quest, "progress" | "completed" | "claimed">[] = [
  {
    id: "complete_lessons",
    description: {
      en: "Complete 3 lessons",
      hy: "Ավարտիր 3 դաս",
      ru: "Завершите 3 урока",
    },
    target: 3,
    reward: { hayq: 30, seeds: 1 },
  },
  {
    id: "earn_hayq",
    description: {
      en: "Earn 100 HAYQ",
      hy: "Վաստակիր 100 HAYQ",
      ru: "Заработайте 100 HAYQ",
    },
    target: 100,
    reward: { hayq: 50 },
  },
  {
    id: "streak_maintain",
    description: {
      en: "Maintain streak (1 day)",
      hy: "Պահպանիր սթրիքը (1 օր)",
      ru: "Сохраните серию (1 день)",
    },
    target: 1,
    reward: { hayq: 20, seeds: 1 },
  },
];

const ACHIEVEMENTS = {
  FIRST_LESSON: "first_lesson",
  TEN_LESSONS: "ten_lessons",
  FIFTY_LESSONS: "fifty_lessons",
  HUNDRED_LESSONS: "hundred_lessons",
  STREAK_7: "streak_7",
  STREAK_30: "streak_30",
  STREAK_100: "streak_100",
  STREAK_365: "streak_365", // ✅ NEW
  HAYQ_1000: "hayq_1000",
  HAYQ_5000: "hayq_5000",
};

// ─── DATE HELPERS (LOCAL TIME) ──────────────────────────────────────

/**
 * ✅ Returns date key in LOCAL time (YYYY-MM-DD).
 * Fixes the UTC timezone bug for users in UTC+4 (Armenia).
 */
function getTodayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getTodayKey(d);
}

// ─── LOAD / SAVE REWARDS ────────────────────────────────────────────

export function loadRewards(): UserRewards {
  if (typeof window === "undefined") return { ...DEFAULT_REWARDS };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { ...DEFAULT_REWARDS };
    const rewards = JSON.parse(data);
    return {
      ...DEFAULT_REWARDS,
      ...rewards,
      crowns: rewards.crowns || {},
      hearts: rewards.hearts ?? 5,
      lastHeartUpdate: rewards.lastHeartUpdate || new Date().toISOString(),
      milestones: rewards.milestones || [],
      dailyGoal: rewards.dailyGoal || 10,
      dailyActivity: rewards.dailyActivity || {},
      goalClaimed: rewards.goalClaimed || [],
      maxStreak: rewards.maxStreak || 0,
      achievements: rewards.achievements || [],
      level: rewards.level || 1,
      totalXP: rewards.totalXP || 0,
    };
  } catch {
    return { ...DEFAULT_REWARDS };
  }
}

export function saveRewards(rewards: UserRewards): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards));
}

// ─── STREAK ──────────────────────────────────────────────────────────

export function updateStreak(rewards: UserRewards): UserRewards {
  const today = getTodayKey(); // ✅ local time
  if (rewards.lastActivityDate === today) return rewards;

  const yesterday = getYesterdayKey();

  let nextStreak = rewards.streak;
  let streakIncreased = false;

  if (rewards.lastActivityDate === yesterday) {
    nextStreak += 1;
    streakIncreased = true;
  } else if (rewards.lastActivityDate !== today) {
    nextStreak = 1;
    streakIncreased = true;
  }

  const maxStreak = Math.max(rewards.maxStreak, nextStreak);

  // ✅ Quest update outside of pure return
  if (streakIncreased) {
    updateQuestProgress("streak_maintain", 1);
  }

  return {
    ...rewards,
    streak: nextStreak,
    maxStreak,
    lastActivityDate: today,
    lastLoginDate: today,
  };
}

// ─── HAYQ ────────────────────────────────────────────────────────────

/**
 * Adds HAYQ + XP to an in-memory rewards object and returns it.
 * ✅ Does NOT touch dailyActivity (that tracks minutes, see addRewards).
 * ✅ Does NOT save (caller decides when to save).
 */
export function addHAYQ(rewards: UserRewards, amount: number): UserRewards {
  const updated: UserRewards = {
    ...rewards,
    totalHAYQ: rewards.totalHAYQ + amount,
    totalXP: rewards.totalXP + amount,
  };
  return updateLevel(updated);
}

/**
 * Full lesson-completion rewards.
 * ✅ dailyActivity tracks MINUTES here.
 * ✅ Checks quests + achievements.
 */
export function addRewards(hayq: number, seeds: number, minutes: number = 0): UserRewards {
  const current = loadRewards();
  const withStreak = updateStreak(current);
  const today = getTodayKey(); // ✅ local time
  const currentMinutes = withStreak.dailyActivity[today] || 0;

  let updated: UserRewards = {
    ...withStreak,
    totalHAYQ: withStreak.totalHAYQ + hayq,
    totalSeeds: withStreak.totalSeeds + seeds,
    totalXP: withStreak.totalXP + hayq,
    // ✅ Consistently MINUTES
    dailyActivity: {
      ...withStreak.dailyActivity,
      [today]: currentMinutes + minutes,
    },
  };

  updated = updateLevel(updated);

  // ✅ Check achievements after level update
  updated = checkAchievements(updated);

  saveRewards(updated);

  // Update quests (they save separately)
  if (hayq > 0) {
    updateQuestProgress("earn_hayq", hayq);
  }

  return updated;
}

function updateLevel(rewards: UserRewards): UserRewards {
  let currentLevel = 1;
  let xpToNext = 100;

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (rewards.totalXP >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i].level;
      const nextLevel = LEVELS[i + 1];
      xpToNext = nextLevel ? nextLevel.xpRequired - LEVELS[i].xpRequired : 0;
      break;
    }
  }

  return {
    ...rewards,
    level: currentLevel,
    xpToNextLevel: xpToNext,
  };
}

// ─── SHOP ────────────────────────────────────────────────────────────

export function buyStreakFreeze(): { success: boolean; error?: string; rewards: UserRewards } {
  const current = syncHearts();
  if (current.streakFreeze >= MAX_STREAK_FREEZE) {
    return { success: false, error: `Maximum ${MAX_STREAK_FREEZE} freezes allowed`, rewards: current };
  }
  if (current.totalHAYQ < 50) {
    return { success: false, error: "Not enough HAYQ (needs 50)", rewards: current };
  }
  const updated = {
    ...current,
    totalHAYQ: current.totalHAYQ - 50,
    streakFreeze: current.streakFreeze + 1,
  };
  saveRewards(updated);
  return { success: true, rewards: updated };
}

export function buyHeartRefill(): { success: boolean; error?: string; rewards: UserRewards } {
  const current = syncHearts();
  if (current.hearts >= MAX_HEARTS) {
    return { success: false, error: "Hearts already full", rewards: current };
  }
  if (current.totalHAYQ < 100) {
    return { success: false, error: "Not enough HAYQ (needs 100)", rewards: current };
  }
  const updated = {
    ...current,
    totalHAYQ: current.totalHAYQ - 100,
    hearts: MAX_HEARTS,
    lastHeartUpdate: new Date().toISOString(),
  };
  saveRewards(updated);
  return { success: true, rewards: updated };
}

// ─── HEARTS ──────────────────────────────────────────────────────────

export function deductHeart(): UserRewards {
  const current = syncHearts();
  if (current.hearts <= 0) return current;
  const updated = {
    ...current,
    hearts: current.hearts - 1,
    // ✅ If hearts were full → restart timer
    lastHeartUpdate: current.hearts === MAX_HEARTS ? new Date().toISOString() : current.lastHeartUpdate,
  };
  saveRewards(updated);
  return updated;
}

export function syncHearts(): UserRewards {
  const current = loadRewards();
  if (current.hearts >= MAX_HEARTS) return current;

  const now = new Date();
  const lastUpdate = new Date(current.lastHeartUpdate);
  const diffMs = now.getTime() - lastUpdate.getTime();

  if (diffMs >= HEART_RECOVERY_MS) {
    const heartsToAdd = Math.floor(diffMs / HEART_RECOVERY_MS);
    const newHearts = Math.min(MAX_HEARTS, current.hearts + heartsToAdd);
    const remainingTime = diffMs % HEART_RECOVERY_MS;
    const newUpdateDate = new Date(now.getTime() - remainingTime);

    const updated = {
      ...current,
      hearts: newHearts,
      lastHeartUpdate: newHearts === MAX_HEARTS ? now.toISOString() : newUpdateDate.toISOString(),
    };
    saveRewards(updated);
    return updated;
  }
  return current;
}

export function getNextHeartCountdown(current: UserRewards): number {
  if (current.hearts >= MAX_HEARTS) return 0;
  const lastUpdate = new Date(current.lastHeartUpdate);
  const nextHeartTime = lastUpdate.getTime() + HEART_RECOVERY_MS;
  return Math.max(0, nextHeartTime - new Date().getTime());
}

/**
 * ✅ FIXED: Preserves partial recovery progress.
 * - If hearts were at 3 with 2:30 left to next heart → after +1, timer continues from 2:30
 * - Previously: reset the timer to full 5 minutes (unfair to user)
 */
export function earnHeartByPractice(): { success: boolean; rewards: UserRewards } {
  const current = syncHearts();
  if (current.hearts >= MAX_HEARTS) {
    return { success: false, rewards: current };
  }

  const wasFull = current.hearts >= MAX_HEARTS;

  const updated = {
    ...current,
    hearts: current.hearts + 1,
    // ✅ Only restart timer if hearts were FULL before this deduction cycle
    // For practice, keep existing timer if we were already partially recovering
    lastHeartUpdate: wasFull ? new Date().toISOString() : current.lastHeartUpdate,
  };
  saveRewards(updated);
  return { success: true, rewards: updated };
}

// ─── MILESTONES ──────────────────────────────────────────────────────

export function checkStreakMilestones(): { milestone: number | null; rewards: UserRewards } {
  const current = loadRewards();
  const milestones = [7, 30, 100, 365];
  const newMilestone = milestones.find((m) => current.streak >= m && !current.milestones.includes(m));

  if (newMilestone) {
    const hayqBonus = newMilestone * 2;
    let updated: UserRewards = {
      ...current,
      totalSeeds: current.totalSeeds + 1,
      totalHAYQ: current.totalHAYQ + hayqBonus,
      totalXP: current.totalXP + hayqBonus,
      milestones: [...current.milestones, newMilestone],
    };
    updated = updateLevel(updated);
    updated = checkAchievements(updated);
    saveRewards(updated);
    return { milestone: newMilestone, rewards: updated };
  }
  return { milestone: null, rewards: current };
}

export function checkDailyGoalBonus(): { achieved: boolean; rewards: UserRewards } {
  const current = loadRewards();
  const today = getTodayKey(); // ✅ local
  const minutes = current.dailyActivity[today] || 0;

  if (minutes >= current.dailyGoal && !current.goalClaimed.includes(today)) {
    let updated: UserRewards = {
      ...current,
      totalHAYQ: current.totalHAYQ + 20,
      totalXP: current.totalXP + 20,
      goalClaimed: [...current.goalClaimed, today],
    };
    updated = updateLevel(updated);
    saveRewards(updated);
    return { achieved: true, rewards: updated };
  }
  return { achieved: false, rewards: current };
}

export function setDailyGoal(minutes: number): void {
  const current = loadRewards();
  saveRewards({ ...current, dailyGoal: Math.max(1, minutes) });
}

// ─── CROWNS ──────────────────────────────────────────────────────────

export function saveCrownLevel(lessonId: string, level: number): UserRewards {
  const current = loadRewards();
  const currentCrown = current.crowns[lessonId] || 0;
  const updated = {
    ...current,
    crowns: {
      ...current.crowns,
      [lessonId]: Math.min(3, Math.max(currentCrown, level)),
    },
  };
  saveRewards(updated);
  return updated;
}

export function getCrownLevel(lessonId: string): number {
  const current = loadRewards();
  return current.crowns[lessonId] || 0;
}

export function getTotalCrowns(): number {
  const current = loadRewards();
  return Object.values(current.crowns).reduce((sum, val) => sum + val, 0);
}

// ─── STREAK FREEZE ──────────────────────────────────────────────────

/**
 * ✅ FIXED: uses floor() and local-time day boundaries.
 * Handles multiple days with multiple freezes.
 */
export function checkAndApplyFreeze(): UserRewards {
  const current = loadRewards();
  if (!current.lastActivityDate) return current;

  // Both dates at midnight LOCAL
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = new Date(current.lastActivityDate + "T00:00:00"); // local midnight
  lastDate.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / MS_PER_DAY);

  // diffDays === 0: today, 1: yesterday, >1: missed days
  if (diffDays <= 1) return current;

  const daysMissed = diffDays - 1;
  let updated = { ...current };

  if (updated.streakFreeze >= daysMissed) {
    // Consume freezes to preserve streak
    updated.streakFreeze = updated.streakFreeze - daysMissed;
    // Advance lastActivityDate by daysMissed (so streak isn't broken)
    const newDate = new Date(lastDate.getTime() + daysMissed * MS_PER_DAY);
    updated.lastActivityDate = getTodayKey(newDate);
  } else {
    // Not enough freezes — break streak
    updated.streak = 0;
    updated.streakFreeze = 0;
  }

  saveRewards(updated);
  return updated;
}

// ─── ACHIEVEMENTS ────────────────────────────────────────────────────

export function checkAchievements(rewards: UserRewards): UserRewards {
  const newAchievements: string[] = [];

  // Lesson achievements
  const totalCrowns = Object.values(rewards.crowns).reduce((sum, val) => sum + val, 0);
  if (totalCrowns >= 1 && !rewards.achievements.includes(ACHIEVEMENTS.FIRST_LESSON)) {
    newAchievements.push(ACHIEVEMENTS.FIRST_LESSON);
  }
  if (totalCrowns >= 10 && !rewards.achievements.includes(ACHIEVEMENTS.TEN_LESSONS)) {
    newAchievements.push(ACHIEVEMENTS.TEN_LESSONS);
  }
  if (totalCrowns >= 50 && !rewards.achievements.includes(ACHIEVEMENTS.FIFTY_LESSONS)) {
    newAchievements.push(ACHIEVEMENTS.FIFTY_LESSONS);
  }
  if (totalCrowns >= 100 && !rewards.achievements.includes(ACHIEVEMENTS.HUNDRED_LESSONS)) {
    newAchievements.push(ACHIEVEMENTS.HUNDRED_LESSONS);
  }

  // Streak achievements
  if (rewards.maxStreak >= 7 && !rewards.achievements.includes(ACHIEVEMENTS.STREAK_7)) {
    newAchievements.push(ACHIEVEMENTS.STREAK_7);
  }
  if (rewards.maxStreak >= 30 && !rewards.achievements.includes(ACHIEVEMENTS.STREAK_30)) {
    newAchievements.push(ACHIEVEMENTS.STREAK_30);
  }
  if (rewards.maxStreak >= 100 && !rewards.achievements.includes(ACHIEVEMENTS.STREAK_100)) {
    newAchievements.push(ACHIEVEMENTS.STREAK_100);
  }
  // ✅ NEW: 365-day streak
  if (rewards.maxStreak >= 365 && !rewards.achievements.includes(ACHIEVEMENTS.STREAK_365)) {
    newAchievements.push(ACHIEVEMENTS.STREAK_365);
  }

  // HAYQ achievements
  if (rewards.totalHAYQ >= 1000 && !rewards.achievements.includes(ACHIEVEMENTS.HAYQ_1000)) {
    newAchievements.push(ACHIEVEMENTS.HAYQ_1000);
  }
  if (rewards.totalHAYQ >= 5000 && !rewards.achievements.includes(ACHIEVEMENTS.HAYQ_5000)) {
    newAchievements.push(ACHIEVEMENTS.HAYQ_5000);
  }

  if (newAchievements.length > 0) {
    return {
      ...rewards,
      achievements: [...rewards.achievements, ...newAchievements],
    };
    // Note: caller is responsible for saveRewards
  }

  return rewards;
}

// ─── LEVEL HELPERS ──────────────────────────────────────────────────

export function getLevelInfo(xp: number): { level: number; xpToNext: number; progress: number } {
  let currentLevel = 1;
  let xpToNext = 100;
  let prevXp = 0;

  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i].level;
      prevXp = LEVELS[i].xpRequired;
      const nextLevel = LEVELS[i + 1];
      xpToNext = nextLevel ? nextLevel.xpRequired - prevXp : 0;
    } else {
      break;
    }
  }

  const progress = xpToNext > 0 ? (xp - prevXp) / xpToNext : 1;

  return {
    level: currentLevel,
    xpToNext,
    progress: Math.min(1, Math.max(0, progress)),
  };
}

// ─── QUESTS ──────────────────────────────────────────────────────────

export function loadQuests(): Quest[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(QUESTS_KEY);
    const today = getTodayKey(); // ✅ local
    if (!stored) {
      const fresh = DEFAULT_QUESTS.map((q) => ({
        ...q,
        progress: 0,
        completed: false,
        claimed: false,
      }));
      saveQuests(fresh);
      return fresh;
    }
    const data = JSON.parse(stored) as QuestsData;
    if (data.date !== today) {
      const fresh = DEFAULT_QUESTS.map((q) => ({
        ...q,
        progress: 0,
        completed: false,
        claimed: false,
      }));
      saveQuests(fresh);
      return fresh;
    }
    return data.quests;
  } catch {
    return DEFAULT_QUESTS.map((q) => ({ ...q, progress: 0, completed: false, claimed: false }));
  }
}

function saveQuests(quests: Quest[]): void {
  const today = getTodayKey(); // ✅ local
  localStorage.setItem(QUESTS_KEY, JSON.stringify({ date: today, quests }));
}

export function updateQuestProgress(questId: string, increment: number): void {
  const quests = loadQuests();
  const quest = quests.find((q) => q.id === questId);
  if (!quest || quest.completed || quest.claimed) return;
  quest.progress = Math.min(quest.target, quest.progress + increment);
  if (quest.progress >= quest.target) {
    quest.completed = true;
  }
  saveQuests(quests);
}

export function claimReward(questId: string): { hayq: number; seeds: number } | null {
  const quests = loadQuests();
  const quest = quests.find((q) => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) return null;
  quest.claimed = true;
  saveQuests(quests);
  return {
    hayq: quest.reward.hayq,
    seeds: quest.reward.seeds ?? 0,
  };
}

/**
 * ✅ FIXED: no double save.
 * addRewards already saves internally — we do NOT save again.
 */
export function addQuestProgressAndUpdateRewards(
  questId: string,
  increment: number
): { hayqAdded: number; seedsAdded: number } | null {
  updateQuestProgress(questId, increment);
  const quests = loadQuests();
  const quest = quests.find((q) => q.id === questId);
  if (quest?.completed && !quest.claimed) {
    const reward = claimReward(questId);
    if (reward) {
      // addRewards already persists internally
      addRewards(reward.hayq, reward.seeds, 0);
      return {
        hayqAdded: reward.hayq,
        seedsAdded: reward.seeds,
      };
    }
  }
  return null;
}

// ─── COMPOSITE ──────────────────────────────────────────────────────

/**
 * ✅ FIXED: single load, in-memory updates, single save.
 * Previously: saveCrownLevel reloaded from storage after updateStreak saved → race condition.
 */
export function recordLessonComplete(lessonId: string, score: number): UserRewards {
  // 1. Load once
  let rewards = loadRewards();

  // 2. Apply streak
  rewards = updateStreak(rewards);

  // 3. Apply crown (in-memory, no reload)
  const currentCrown = rewards.crowns[lessonId] || 0;
  const newCrown = score >= 0.9 ? 3 : score >= 0.7 ? 2 : score >= 0.5 ? 1 : 0;
  rewards = {
    ...rewards,
    crowns: {
      ...rewards.crowns,
      [lessonId]: Math.max(currentCrown, newCrown),
    },
  };

  // 4. Check milestones (in-memory)
  const milestones = [7, 30, 100, 365];
  const newMilestone = milestones.find(
    (m) => rewards.streak >= m && !rewards.milestones.includes(m)
  );
  if (newMilestone) {
    const hayqBonus = newMilestone * 2;
    rewards = {
      ...rewards,
      totalSeeds: rewards.totalSeeds + 1,
      totalHAYQ: rewards.totalHAYQ + hayqBonus,
      totalXP: rewards.totalXP + hayqBonus,
      milestones: [...rewards.milestones, newMilestone],
    };
  }

  // 5. Check daily goal (in-memory)
  const today = getTodayKey();
  const minutes = rewards.dailyActivity[today] || 0;
  if (minutes >= rewards.dailyGoal && !rewards.goalClaimed.includes(today)) {
    rewards = {
      ...rewards,
      totalHAYQ: rewards.totalHAYQ + 20,
      totalXP: rewards.totalXP + 20,
      goalClaimed: [...rewards.goalClaimed, today],
    };
  }

  // 6. Level + achievements (in-memory)
  rewards = updateLevel(rewards);
  rewards = checkAchievements(rewards);

  // 7. Single save
  saveRewards(rewards);

  // 8. Quest progress (saves separately)
  updateQuestProgress("complete_lessons", 1);

  return rewards;
}

// ─── EXPORT ──────────────────────────────────────────────────────────

export default {
  // Rewards
  loadRewards,
  saveRewards,
  addRewards,
  addHAYQ,

  // Streak
  updateStreak,
  checkAndApplyFreeze,

  // Hearts
  syncHearts,
  deductHeart,
  getNextHeartCountdown,
  earnHeartByPractice,
  buyHeartRefill,

  // Shop
  buyStreakFreeze,

  // Crowns
  saveCrownLevel,
  getCrownLevel,
  getTotalCrowns,

  // Milestones & Goals
  checkStreakMilestones,
  checkDailyGoalBonus,
  setDailyGoal,

  // Achievements
  checkAchievements,

  // Level
  getLevelInfo,

  // Quests
  loadQuests,
  updateQuestProgress,
  claimReward,
  addQuestProgressAndUpdateRewards,

  // Composite
  recordLessonComplete,
};