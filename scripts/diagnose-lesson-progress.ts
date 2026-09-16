// scripts/diagnose-lesson-progress.ts
/**
 * 📋 LESSON PROGRESS DIAGNOSTIC SCRIPT
 * 
 * Ստուգում է՝
 * 1. Դասերի քանակը և կառուցվածքը
 * 2. Դասի ավարտից հետո հաջորդ դասի բացումը
 * 3. Crowns համակարգի աշխատանքը
 * 4. Lesson completion-ի տրամաբանությունը
 * 5. Retry mechanism-ը
 */

import fs from "fs";
import path from "path";

// ─── TYPES ────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  worldId: string;
  title: any;
  difficulty: string;
  exercises?: any[];
}

interface ProgressData {
  crowns: Record<string, number>;
  completed: string[];
  lastActivity: string;
}

// ─── LOCAL STORAGE MOCK ─────────────────────────────────────────────

class LocalStorageMock {
  private data: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  setItem(key: string, value: string): void {
    this.data[key] = value;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = {};
  }
}

const localStorage = new LocalStorageMock();

// ─── TEST DATA ──────────────────────────────────────────────────────

const TEST_LESSONS: Lesson[] = [
  // World 1 Lessons
  { id: "w1_l1", worldId: "w1", title: "Meeting Someone", difficulty: "A1" },
  { id: "w1_l2", worldId: "w1", title: "Greetings", difficulty: "A1" },
  { id: "w1_l3", worldId: "w1", title: "Introductions", difficulty: "A1" },
  { id: "w1_l4", worldId: "w1", title: "Countries", difficulty: "A1" },
  { id: "w1_l5", worldId: "w1", title: "Nationalities", difficulty: "A1" },
  { id: "w1_l6", worldId: "w1", title: "Languages", difficulty: "A1" },
  { id: "w1_l7", worldId: "w1", title: "Age", difficulty: "A1" },
  { id: "w1_l8", worldId: "w1", title: "Family", difficulty: "A1" },
  { id: "w1_l9", worldId: "w1", title: "Friends", difficulty: "A1" },
  { id: "w1_l10", worldId: "w1", title: "Occupations", difficulty: "A1" },
];

// ─── DIAGNOSTIC FUNCTIONS ───────────────────────────────────────────

function diagnoseLessonStructure() {
  console.log("\n" + "=".repeat(60));
  console.log("📚 1. LESSON STRUCTURE DIAGNOSTIC");
  console.log("=".repeat(60));

  console.log(`\n📊 Total Lessons: ${TEST_LESSONS.length}`);
  console.log(`📊 Worlds: ${[...new Set(TEST_LESSONS.map(l => l.worldId))].join(", ")}`);

  // Check for duplicate IDs
  const ids = TEST_LESSONS.map(l => l.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    console.log(`❌ Duplicate lesson IDs: ${duplicates.join(", ")}`);
  } else {
    console.log("✅ All lesson IDs are unique");
  }

  // Check for missing fields
  TEST_LESSONS.forEach(l => {
    const missing = [];
    if (!l.id) missing.push("id");
    if (!l.worldId) missing.push("worldId");
    if (!l.title) missing.push("title");
    if (missing.length > 0) {
      console.log(`⚠️ Lesson ${l.id || "unknown"} missing: ${missing.join(", ")}`);
    }
  });

  console.log("\n📋 Lesson List:");
  TEST_LESSONS.forEach((l, i) => {
    console.log(`  ${i + 1}. ${l.id} - ${typeof l.title === 'string' ? l.title : l.title?.en || 'N/A'}`);
  });
}

function diagnoseProgressSystem() {
  console.log("\n" + "=".repeat(60));
  console.log("🏆 2. PROGRESS SYSTEM DIAGNOSTIC");
  console.log("=".repeat(60));

  // Simulate lesson completions
  let crowns: Record<string, number> = {};
  let completed: string[] = [];

  const completeLesson = (lessonId: string, score: number) => {
    const crownLevel = score >= 0.9 ? 3 : score >= 0.7 ? 2 : score >= 0.5 ? 1 : 0;
    crowns[lessonId] = Math.max(crowns[lessonId] || 0, crownLevel);
    if (crownLevel > 0 && !completed.includes(lessonId)) {
      completed.push(lessonId);
    }
    console.log(`  ✅ Completed: ${lessonId} (Score: ${score}, Crown: ${crownLevel})`);
  };

  const isLessonUnlocked = (lessonIndex: number): boolean => {
    if (lessonIndex === 0) return true;
    const prevLesson = TEST_LESSONS[lessonIndex - 1];
    return (crowns[prevLesson.id] || 0) > 0;
  };

  const getNextLesson = (currentIndex: number): { next: Lesson | null; reason: string } => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= TEST_LESSONS.length) {
      return { next: null, reason: "No more lessons" };
    }
    const nextLesson = TEST_LESSONS[nextIndex];
    const unlocked = isLessonUnlocked(nextIndex);
    if (!unlocked) {
      return { next: null, reason: `Previous lesson (${TEST_LESSONS[nextIndex - 1].id}) not completed` };
    }
    return { next: nextLesson, reason: "Unlocked" };
  };

  console.log("\n📊 Testing progression:");

  // Test 1: Complete first lesson
  console.log("\n🔹 Test 1: Complete w1_l1 (score 0.95)");
  completeLesson("w1_l1", 0.95);
  console.log(`  👑 Crowns: ${JSON.stringify(crowns)}`);
  console.log(`  ✅ Completed: ${completed.join(", ")}`);

  // Test 2: Check if w1_l2 is unlocked
  console.log("\n🔹 Test 2: Check if w1_l2 is unlocked");
  const result = getNextLesson(0);
  console.log(`  📍 Current: w1_l1 (index 0)`);
  console.log(`  ➡️ Next: ${result.next ? result.next.id : "None"}`);
  console.log(`  📝 Reason: ${result.reason}`);
  console.log(`  ${result.next ? "✅" : "❌"} Result: ${result.next ? "Unlocked" : "Locked"}`);

  // Test 3: Complete w1_l2
  console.log("\n🔹 Test 3: Complete w1_l2 (score 0.85)");
  completeLesson("w1_l2", 0.85);
  console.log(`  👑 Crowns: ${JSON.stringify(crowns)}`);
  console.log(`  ✅ Completed: ${completed.join(", ")}`);

  // Test 4: Check if w1_l3 is unlocked
  const result2 = getNextLesson(1);
  console.log("\n🔹 Test 4: Check if w1_l3 is unlocked");
  console.log(`  📍 Current: w1_l2 (index 1)`);
  console.log(`  ➡️ Next: ${result2.next ? result2.next.id : "None"}`);
  console.log(`  📝 Reason: ${result2.reason}`);
  console.log(`  ${result2.next ? "✅" : "❌"} Result: ${result2.next ? "Unlocked" : "Locked"}`);

  // Test 5: Complete all lessons
  console.log("\n🔹 Test 5: Complete all lessons");
  for (let i = 2; i < TEST_LESSONS.length; i++) {
    const score = 0.85 + Math.random() * 0.1;
    completeLesson(TEST_LESSONS[i].id, Math.min(score, 1));
    const nextResult = getNextLesson(i);
    console.log(`  ➡️ Next lesson: ${nextResult.next ? nextResult.next.id : "None"} (${nextResult.reason})`);
  }

  console.log(`\n📊 Final Crowns: ${JSON.stringify(crowns)}`);
  console.log(`📊 Completed: ${completed.length}/${TEST_LESSONS.length} lessons`);

  return { crowns, completed };
}

function diagnoseRetryMechanism() {
  console.log("\n" + "=".repeat(60));
  console.log("🔄 3. RETRY MECHANISM DIAGNOSTIC");
  console.log("=".repeat(60));

  const mistakes: Record<string, { attempts: number; revealed: boolean }> = {};

  const logMistake = (lessonId: string) => {
    if (!mistakes[lessonId]) {
      mistakes[lessonId] = { attempts: 0, revealed: false };
    }
    mistakes[lessonId].attempts++;
    if (mistakes[lessonId].attempts >= 3) {
      mistakes[lessonId].revealed = true;
    }
    console.log(`  ❌ Mistake logged for ${lessonId} (attempts: ${mistakes[lessonId].attempts})`);
  };

  const getRetryQueue = (): string[] => {
    return Object.keys(mistakes).filter(id => mistakes[id].attempts >= 3 && !mistakes[id].revealed);
  };

  console.log("\n🔹 Simulating mistakes:");
  logMistake("w1_l4");
  logMistake("w1_l4");
  logMistake("w1_l4");
  console.log(`  📋 Retry queue: ${getRetryQueue().join(", ")}`);

  logMistake("w1_l5");
  logMistake("w1_l5");
  console.log(`  📋 Retry queue after w1_l5 mistakes: ${getRetryQueue().join(", ")}`);

  console.log("\n📊 Retry Summary:");
  console.log(`  📋 Total mistakes: ${Object.keys(mistakes).length}`);
  console.log(`  🔄 Retry queue: ${getRetryQueue().length}`);
  console.log(`  📝 Mistakes: ${JSON.stringify(mistakes, null, 2)}`);

  return { mistakes, retryQueue: getRetryQueue() };
}

function diagnoseCrownSystem() {
  console.log("\n" + "=".repeat(60));
  console.log("👑 4. CROWN SYSTEM DIAGNOSTIC");
  console.log("=".repeat(60));

  const crowns: Record<string, number> = {};

  const addCrown = (lessonId: string, score: number) => {
    const level = score >= 0.9 ? 3 : score >= 0.7 ? 2 : score >= 0.5 ? 1 : 0;
    crowns[lessonId] = Math.max(crowns[lessonId] || 0, level);
    console.log(`  👑 ${lessonId}: ${crowns[lessonId]} (score: ${score})`);
  };

  console.log("\n🔹 Testing crown levels:");
  addCrown("w1_l1", 0.95);
  addCrown("w1_l1", 0.85);
  addCrown("w1_l2", 0.75);
  addCrown("w1_l2", 0.55);
  addCrown("w1_l3", 0.45);

  const totalCrowns = Object.values(crowns).reduce((a, b) => a + b, 0);
  console.log(`\n📊 Total Crowns: ${totalCrowns}`);
  console.log(`📊 Crowns: ${JSON.stringify(crowns)}`);

  // Check if lesson is unlocked based on crowns
  const isLessonUnlocked = (lessonIndex: number): boolean => {
    if (lessonIndex === 0) return true;
    const prevLesson = TEST_LESSONS[lessonIndex - 1];
    return (crowns[prevLesson.id] || 0) > 0;
  };

  console.log("\n🔹 Checking unlock status:");
  TEST_LESSONS.forEach((l, i) => {
    const unlocked = isLessonUnlocked(i);
    const hasCrown = crowns[l.id] || 0;
    console.log(`  ${i + 1}. ${l.id}: ${unlocked ? "✅" : "❌"} Unlocked (Crown: ${hasCrown})`);
  });

  return crowns;
}

function diagnoseLessonCompletion() {
  console.log("\n" + "=".repeat(60));
  console.log("✅ 5. LESSON COMPLETION DIAGNOSTIC");
  console.log("=".repeat(60));

  const completions: { lessonId: string; score: number; timestamp: string }[] = [];

  const completeLesson = (lessonId: string, score: number) => {
    completions.push({
      lessonId,
      score,
      timestamp: new Date().toISOString(),
    });
    console.log(`  ✅ Completed: ${lessonId} (score: ${score})`);
  };

  console.log("\n🔹 Simulating lesson completions:");
  completeLesson("w1_l1", 0.95);
  completeLesson("w1_l2", 0.85);
  completeLesson("w1_l3", 0.70);
  completeLesson("w1_l4", 0.60);
  completeLesson("w1_l5", 0.90);

  // Check completion order
  console.log("\n📊 Completion Order:");
  completions.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.lessonId} (${c.score})`);
  });

  // Check for missing completions
  const allIds = TEST_LESSONS.map(l => l.id);
  const completedIds = completions.map(c => c.lessonId);
  const missing = allIds.filter(id => !completedIds.includes(id));

  if (missing.length > 0) {
    console.log(`\n⚠️ Missing completions: ${missing.join(", ")}`);
  } else {
    console.log("\n✅ All lessons completed!");
  }

  return { completions, missing };
}

function diagnoseTransitionIssue() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 6. TRANSITION ISSUE DIAGNOSTIC");
  console.log("=".repeat(60));

  // Simulate the issue: last lesson doesn't transition
  console.log("\n🔹 Testing transition from last lesson:");

  let crowns: Record<string, number> = {};

  // Complete all lessons except the last one
  console.log("\n📊 Completing all lessons except last:");
  for (let i = 0; i < TEST_LESSONS.length - 1; i++) {
    const lesson = TEST_LESSONS[i];
    crowns[lesson.id] = 3;
    console.log(`  ✅ ${lesson.id} completed (crown: 3)`);
  }

  const lastLesson = TEST_LESSONS[TEST_LESSONS.length - 1];
  console.log(`\n📊 Last lesson: ${lastLesson.id}`);

  // Check if last lesson is unlocked
  const isUnlocked = crowns[TEST_LESSONS[TEST_LESSONS.length - 2].id] > 0;
  console.log(`  🔓 Last lesson unlocked: ${isUnlocked ? "✅" : "❌"}`);

  // Check if there's a next lesson after last
  const nextLesson = TEST_LESSONS[TEST_LESSONS.length];
  console.log(`  ➡️ Next lesson after last: ${nextLesson ? nextLesson.id : "None"}`);

  if (!nextLesson) {
    console.log("\n⚠️ ISSUE DETECTED: No next lesson after last lesson!");
    console.log("  📝 This means the last lesson won't transition anywhere.");
    console.log("  🔧 Solution: Redirect to completion screen or world page.");
  }

  // Check the retry queue
  const retryQueue: string[] = [];
  const mistakes = ["w1_l4", "w1_l5", "w1_l6"];
  mistakes.forEach(id => {
    if (!retryQueue.includes(id)) retryQueue.push(id);
  });

  if (retryQueue.length > 0) {
    console.log(`\n🔄 Retry queue contains: ${retryQueue.join(", ")}`);
    console.log("  📝 These lessons will be retried after last lesson.");
  }

  console.log("\n📊 Transition Flow:");
  console.log(`  1. Start → w1_l1 → w1_l2 → ... → ${lastLesson.id}`);
  console.log(`  2. After ${lastLesson.id} → ${nextLesson ? `❌ ${nextLesson.id}` : "🏁 COMPLETE"}`);
  console.log(`  3. ${retryQueue.length > 0 ? `🔄 Retry: ${retryQueue.join(", ")}` : "✅ No retries"}`);
}

// ─── MAIN ────────────────────────────────────────────────────────────

function runDiagnostic() {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 LESSON PROGRESS DIAGNOSTIC TOOL");
  console.log("=".repeat(60));

  diagnoseLessonStructure();
  diagnoseProgressSystem();
  diagnoseRetryMechanism();
  diagnoseCrownSystem();
  diagnoseLessonCompletion();
  diagnoseTransitionIssue();

  console.log("\n" + "=".repeat(60));
  console.log("📋 DIAGNOSTIC SUMMARY");
  console.log("=".repeat(60));

  console.log("\n✅ Check these in your code:");
  console.log("  1. Does `next()` correctly handle last exercise?");
  console.log("  2. Does `completeLesson()` redirect to world/completion?");
  console.log("  3. Does `buildRetryQueue()` correctly add retries?");
  console.log("  4. Does the `phase` change from 'main' to 'retry'?");
  console.log("  5. Does `crowns[lessonId]` get set on completion?");

  console.log("\n🔧 Common fixes:");
  console.log("  - Add `if (ex.index >= totalExercises - 1)` check");
  console.log("  - Set `phase` to 'retry' when retry queue exists");
  console.log("  - Call `completeLesson()` when no retries");
  console.log("  - Redirect to `/world` after completion");

  console.log("\n" + "=".repeat(60));
  console.log("✅ Diagnostic complete!");
  console.log("=".repeat(60));
}

runDiagnostic();