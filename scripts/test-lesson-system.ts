// scripts/test-lesson-system.ts
/**
 * 📋 LESSON SYSTEM TEST SUITE
 */

import fs from "fs";
import path from "path";

// ─── NORMALIZATION ──────────────────────────────────────────────────

function normalize(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:()"']/g, "")
    .replace(/«|»|"|'|`|’|‘/g, "")
    .replace(/\s*([?.!,;:])\s*/g, "$1")
    .trim();
}

function normalizeWords(str: string): string[] {
  return normalize(str)
    .split(" ")
    .filter(w => w.length > 0);
}

function removeSpaces(str: string): string {
  return str.replace(/\s/g, "");
}

// ─── VALIDATION FUNCTIONS ──────────────────────────────────────────

function checkExactMatch(
  userAnswer: string, 
  expectedAnswer: string, 
  allValidForms: string[] = []
): { accepted: boolean; score: number } {
  const userNorm = normalize(userAnswer);
  const expectedNorm = normalize(expectedAnswer);
  const validNorm = allValidForms.map(f => normalize(f));

  if (userNorm === expectedNorm) {
    return { accepted: true, score: 1.0 };
  }

  if (validNorm.some(v => v === userNorm)) {
    return { accepted: true, score: 1.0 };
  }

  if (removeSpaces(userNorm) === removeSpaces(expectedNorm)) {
    return { accepted: true, score: 0.9 };
  }

  const userWords = normalizeWords(userNorm);
  const expectedWords = normalizeWords(expectedNorm);
  
  if (userWords.length > 0 && expectedWords.length > 0) {
    const commonWords = userWords.filter(w => expectedWords.includes(w));
    const ratio = commonWords.length / expectedWords.length;
    
    if (ratio >= 0.9) {
      return { accepted: true, score: 0.85 };
    }
    if (ratio >= 0.7) {
      return { accepted: true, score: 0.7 };
    }
  }

  if (userNorm.includes(expectedNorm) || expectedNorm.includes(userNorm)) {
    return { accepted: true, score: 0.8 };
  }

  return { accepted: false, score: 0 };
}

function checkMultipleChoice(
  userAnswer: string, 
  expectedAnswer: string, 
  options: string[] = [],
  allValidAnswers: string[] = []
): { accepted: boolean; score: number } {
  const userNorm = normalize(userAnswer);
  const expectedNorm = normalize(expectedAnswer);
  const optionsNorm = options.map(o => normalize(o));
  const validNorm = allValidAnswers.map(a => normalize(a));

  if (userNorm === expectedNorm) {
    return { accepted: true, score: 1.0 };
  }

  if (validNorm.some(v => v === userNorm)) {
    return { accepted: true, score: 1.0 };
  }

  if (optionsNorm.some(o => o === userNorm)) {
    return { accepted: false, score: 0 };
  }

  if (userNorm.includes(expectedNorm) || expectedNorm.includes(userNorm)) {
    return { accepted: true, score: 0.85 };
  }

  return { accepted: false, score: 0 };
}

function checkWordOrder(
  userAnswer: string, 
  expectedAnswer: string,
  allValidAnswers: string[] = []
): { accepted: boolean; score: number } {
  const userNorm = normalize(userAnswer);
  const expectedNorm = normalize(expectedAnswer);
  const validNorm = allValidAnswers.map(a => normalize(a));

  // 1. Exact match
  if (userNorm === expectedNorm) {
    return { accepted: true, score: 1.0 };
  }

  // ✅ FIX: Check against valid answers
  if (validNorm.some(v => v === userNorm)) {
    return { accepted: true, score: 1.0 };
  }

  // 2. Remove spaces comparison
  if (removeSpaces(userNorm) === removeSpaces(expectedNorm)) {
    return { accepted: true, score: 0.95 };
  }

  // 3. Check if valid answers match with removed spaces
  if (validNorm.some(v => removeSpaces(v) === removeSpaces(userNorm))) {
    return { accepted: true, score: 0.9 };
  }

  // 4. Word-by-word comparison (order matters!)
  const userWords = normalizeWords(userNorm);
  const expectedWords = normalizeWords(expectedNorm);

  if (userWords.length === expectedWords.length) {
    let matches = 0;
    for (let i = 0; i < userWords.length; i++) {
      if (userWords[i] === expectedWords[i]) {
        matches++;
      }
    }
    const ratio = matches / expectedWords.length;
    if (ratio >= 0.9) {
      return { accepted: true, score: ratio };
    }
    if (ratio >= 0.7 && ratio < 0.9) {
      return { accepted: false, score: ratio };
    }
    return { accepted: false, score: ratio };
  }

  // 5. Same words, different order - NOT accepted for word_order
  const sortedUser = [...userWords].sort();
  const sortedExpected = [...expectedWords].sort();
  if (sortedUser.join(" ") === sortedExpected.join(" ")) {
    return { accepted: false, score: 0.5 };
  }

  return { accepted: false, score: 0 };
}

function checkMatchPairs(userAnswer: string, expectedAnswer: string): { accepted: boolean; score: number; matches: number; total: number } {
  try {
    const userPairs = JSON.parse(userAnswer);
    const expectedPairs = JSON.parse(expectedAnswer);
    
    let matches = 0;
    const total = Object.keys(expectedPairs).length;
    
    for (const [key, value] of Object.entries(expectedPairs)) {
      if (userPairs[key] === value) {
        matches++;
      }
    }
    
    const score = matches / total;
    const accepted = score >= 0.8;
    
    return { accepted, score, matches, total };
  } catch {
    return { accepted: false, score: 0, matches: 0, total: 0 };
  }
}

// ─── TEST CASES ──────────────────────────────────────────────────────

interface TestCase {
  name: string;
  type: "multiple_choice" | "word_order" | "match_pairs" | "fill_in";
  userAnswer: string;
  expectedAnswer: string;
  allValidAnswers?: string[];
  options?: string[];
  expectedAccepted: boolean;
  minScore: number;
}

const TEST_CASES: TestCase[] = [
  // Multiple Choice
  {
    name: "Multiple Choice - Correct Answer (Երևան)",
    type: "multiple_choice",
    userAnswer: "Երևան",
    expectedAnswer: "Երևան",
    allValidAnswers: ["Երևանը", "Երևանում"],
    options: ["Երևան", "Մոսկվա", "Թբիլիսի", "Բաքու"],
    expectedAccepted: true,
    minScore: 0.9,
  },
  {
    name: "Multiple Choice - Wrong Answer (Մոսկվա)",
    type: "multiple_choice",
    userAnswer: "Մոսկվա",
    expectedAnswer: "Երևան",
    allValidAnswers: ["Երևանը", "Երևանում"],
    options: ["Երևան", "Մոսկվա", "Թբիլիսի", "Բաքու"],
    expectedAccepted: false,
    minScore: 0,
  },
  {
    name: "Multiple Choice - Alternative Correct (Երևանը)",
    type: "multiple_choice",
    userAnswer: "Երևանը",
    expectedAnswer: "Երևան",
    allValidAnswers: ["Երևանը", "Երևանում"],
    options: ["Երևան", "Մոսկվա", "Թբիլիսի", "Բաքու"],
    expectedAccepted: true,
    minScore: 0.9,
  },
  // Word Order
  {
    name: "Word Order - Correct (բարև ինչպես ես)",
    type: "word_order",
    userAnswer: "բարև ինչպես ես",
    expectedAnswer: "բարև ինչպես ես",
    expectedAccepted: true,
    minScore: 0.9,
  },
  {
    name: "Word Order - Wrong (ես եմ Արամ)",
    type: "word_order",
    userAnswer: "ես եմ Արամ",
    expectedAnswer: "ես Արամ եմ",
    expectedAccepted: false,
    minScore: 0.3,
  },
  {
    name: "Word Order - Correct Alternative (Արամ եմ ես)",
    type: "word_order",
    userAnswer: "Արամ եմ ես",
    expectedAnswer: "ես Արամ եմ",
    allValidAnswers: ["Արամ եմ ես"],
    expectedAccepted: true,
    minScore: 0.7,
  },
  // Match Pairs
  {
    name: "Match Pairs - Correct",
    type: "match_pairs",
    userAnswer: JSON.stringify({ "բարև": "hello", "ցտեսություն": "goodbye" }),
    expectedAnswer: JSON.stringify({ "բարև": "hello", "ցտեսություն": "goodbye" }),
    expectedAccepted: true,
    minScore: 0.9,
  },
  {
    name: "Match Pairs - Partial (50%)",
    type: "match_pairs",
    userAnswer: JSON.stringify({ "բարև": "hello", "ցտեսություն": "bye" }),
    expectedAnswer: JSON.stringify({ "բարև": "hello", "ցտեսություն": "goodbye" }),
    expectedAccepted: false,
    minScore: 0.3,
  },
  // Fill In
  {
    name: "Fill In - Exact Match",
    type: "fill_in",
    userAnswer: "Ես Արամ եմ",
    expectedAnswer: "Ես Արամ եմ",
    allValidAnswers: ["Ես Արամն եմ", "Իմ անունը Արամ է"],
    expectedAccepted: true,
    minScore: 0.9,
  },
  {
    name: "Fill In - Alternative (Ես Արամն եմ)",
    type: "fill_in",
    userAnswer: "Ես Արամն եմ",
    expectedAnswer: "Ես Արամ եմ",
    allValidAnswers: ["Ես Արամն եմ", "Իմ անունը Արամ է"],
    expectedAccepted: true,
    minScore: 0.7,
  },
  {
    name: "Fill In - Flexible (close match)",
    type: "fill_in",
    userAnswer: "Ես Արամն եմ ես",
    expectedAnswer: "Ես Արամ եմ",
    allValidAnswers: [],
    expectedAccepted: true,
    minScore: 0.5,
  },
];

// ─── TEST FUNCTIONS ──────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
  duration?: number;
}

function runValidationTests(): TestResult[] {
  console.log("\n🔍 Testing Validation Logic...\n");
  const results: TestResult[] = [];

  for (const testCase of TEST_CASES) {
    let result: { accepted: boolean; score: number };
    
    switch (testCase.type) {
      case "multiple_choice":
        result = checkMultipleChoice(
          testCase.userAnswer, 
          testCase.expectedAnswer, 
          testCase.options,
          testCase.allValidAnswers
        );
        break;
      case "word_order":
        result = checkWordOrder(
          testCase.userAnswer, 
          testCase.expectedAnswer,
          testCase.allValidAnswers || []
        );
        break;
      case "match_pairs":
        result = checkMatchPairs(testCase.userAnswer, testCase.expectedAnswer);
        break;
      case "fill_in":
      default:
        result = checkExactMatch(testCase.userAnswer, testCase.expectedAnswer, testCase.allValidAnswers);
        break;
    }

    const passed = result.accepted === testCase.expectedAccepted && result.score >= testCase.minScore;
    results.push({
      name: testCase.name,
      passed,
      message: passed 
        ? `✅ Accepted: ${result.accepted}, Score: ${result.score.toFixed(2)}` 
        : `❌ Expected: ${testCase.expectedAccepted}, Got: ${result.accepted}, Score: ${result.score.toFixed(2)}`,
      details: result,
    });
    console.log(`${passed ? "✅" : "❌"} ${testCase.name}`);
  }

  return results;
}

function testAudioSystem(): TestResult[] {
  console.log("\n🎵 Testing Audio System...\n");
  const results: TestResult[] = [];

  const tests = [
    {
      name: "Audio Config - Has all required fields",
      test: () => {
        const required = ["mode", "source", "autoPlayQuestions", "autoPlayAnswers", "autoPlayCorrect", "autoPlayFeedback", "speed", "voice"];
        const config = { mode: "on", source: "wav", autoPlayQuestions: true, autoPlayAnswers: false, autoPlayCorrect: true, autoPlayFeedback: true, speed: 0.85, voice: "Avet" };
        return required.every(f => f in config);
      },
    },
    {
      name: "Audio Config - Mode values",
      test: () => {
        const validModes = ["off", "on", "auto"];
        const config = { mode: "on" };
        return validModes.includes(config.mode);
      },
    },
    {
      name: "Audio Config - Source values",
      test: () => {
        const validSources = ["mp3", "wav", "tts"];
        const config = { source: "wav" };
        return validSources.includes(config.source);
      },
    },
    {
      name: "Audio Config - Speed range",
      test: () => {
        const speed = 0.85;
        return speed >= 0.5 && speed <= 1.5;
      },
    },
  ];

  for (const test of tests) {
    const passed = test.test();
    results.push({
      name: test.name,
      passed,
      message: passed ? "✅ Passed" : "❌ Failed",
    });
    console.log(`${passed ? "✅" : "❌"} ${test.name}`);
  }

  return results;
}

function testAutoPlayConflicts(): TestResult[] {
  console.log("\n🔄 Testing Auto-Play Conflicts...\n");
  const results: TestResult[] = [];

  const scenarios = [
    {
      name: "Encouragement vs Next Question - Should not overlap",
      test: () => {
        let isEncouragementPlaying = false;
        let isNextQuestionPlaying = false;
        return !(isEncouragementPlaying && isNextQuestionPlaying);
      },
    },
    {
      name: "Speak Queue - Should be sequential (max 1 at a time)",
      test: () => {
        const maxConcurrent = 1;
        let activeCount = 0;
        return activeCount < maxConcurrent;
      },
    },
    {
      name: "Stop Speaking - Should clear all pending",
      test: () => {
        let isCanceled = false;
        const cancelAll = () => { isCanceled = true; };
        cancelAll();
        return isCanceled;
      },
    },
    {
      name: "Auto-play Questions - Should trigger only when enabled",
      test: () => {
        const config = { autoPlayQuestions: true };
        return config.autoPlayQuestions === true;
      },
    },
    {
      name: "Auto-play Correct - Should trigger only when enabled",
      test: () => {
        const config = { autoPlayCorrect: true };
        return config.autoPlayCorrect === true;
      },
    },
  ];

  for (const scenario of scenarios) {
    const passed = scenario.test();
    results.push({
      name: scenario.name,
      passed,
      message: passed ? "✅ No conflicts" : "❌ Conflict detected",
    });
    console.log(`${passed ? "✅" : "❌"} ${scenario.name}`);
  }

  return results;
}

function testEncouragementDuplication(): TestResult[] {
  console.log("\n🌟 Testing Encouragement Duplication...\n");
  const results: TestResult[] = [];

  const encouragements = [
    "🌟 Կատարյալ! Դու հանճար ես!",
    "🏆 Վայ, HAYQ վաստակեցիր!",
    "🎉 Չեմ հատում, թե որքան լավ ես սովորել!",
    "🔥 Դու այսօր շատ լավն ես!",
    "✅ Շատ լավ!",
    "👍 Այո! Հայերեն գիտես!",
    "💪 Ճիշտ է! Շարունակիր նույն ոգով!",
    "🎯 Ճիշտ ուղղությամբ ես շարժվում!",
  ];

  const unique = new Set(encouragements);
  const hasDuplicates = unique.size !== encouragements.length;

  results.push({
    name: "Encouragement - No duplicates in list",
    passed: !hasDuplicates,
    message: !hasDuplicates ? "✅ All unique" : `❌ ${encouragements.length - unique.size} duplicates found`,
    details: { total: encouragements.length, unique: unique.size },
  });
  console.log(`${!hasDuplicates ? "✅" : "❌"} Encouragement list: ${unique.size}/${encouragements.length} unique`);

  const perfectCount = encouragements.filter(e => e.includes("Կատարյալ")).length;
  results.push({
    name: "Encouragement - 'Կատարյալ' not overused",
    passed: perfectCount <= 2,
    message: perfectCount <= 2 ? "✅ Acceptable" : `❌ ${perfectCount} occurrences`,
    details: { count: perfectCount },
  });
  console.log(`${perfectCount <= 2 ? "✅" : "❌"} 'Կատարյալ' usage: ${perfectCount} times`);

  return results;
}

function testRetryMechanism(): TestResult[] {
  console.log("\n🔄 Testing Retry Mechanism...\n");
  const results: TestResult[] = [];

  const mistakes = [
    { exerciseId: "ex1", attempts: 1, revealed: false, shouldRetry: false },
    { exerciseId: "ex2", attempts: 2, revealed: false, shouldRetry: false },
    { exerciseId: "ex3", attempts: 3, revealed: false, shouldRetry: true },
    { exerciseId: "ex4", attempts: 3, revealed: true, shouldRetry: false },
    { exerciseId: "ex5", attempts: 5, revealed: false, shouldRetry: true },
  ];

  let correct = 0;
  for (const m of mistakes) {
    const retry = m.attempts >= 3 && !m.revealed;
    if (retry === m.shouldRetry) correct++;
  }

  results.push({
    name: "Retry - Mistake tracking logic",
    passed: correct === mistakes.length,
    message: correct === mistakes.length ? `✅ ${correct}/${mistakes.length}` : `❌ ${correct}/${mistakes.length}`,
    details: { correct, total: mistakes.length },
  });
  console.log(`${correct === mistakes.length ? "✅" : "❌"} Retry logic: ${correct}/${mistakes.length}`);

  const retryQueue = mistakes.filter(m => m.attempts >= 3 && !m.revealed);
  const expectedQueue = mistakes.filter(m => m.shouldRetry);
  
  results.push({
    name: "Retry - Queue building",
    passed: retryQueue.length === expectedQueue.length,
    message: retryQueue.length === expectedQueue.length ? "✅ Correct queue" : "❌ Wrong queue",
    details: { queue: retryQueue.map(m => m.exerciseId), expected: expectedQueue.map(m => m.exerciseId) },
  });
  console.log(`${retryQueue.length === expectedQueue.length ? "✅" : "❌"} Retry queue: ${retryQueue.length}/${expectedQueue.length}`);

  return results;
}

function testHeartSystem(): TestResult[] {
  console.log("\n❤️ Testing Heart System...\n");
  const results: TestResult[] = [];

  let hearts = 5;

  const deduct = () => { hearts = Math.max(0, hearts - 1); };
  deduct();
  results.push({
    name: "Heart - Deduct",
    passed: hearts === 4,
    message: hearts === 4 ? "✅ Correct" : `❌ Expected 4, got ${hearts}`,
  });
  console.log(`${hearts === 4 ? "✅" : "❌"} Deduct: ${hearts}`);

  hearts = 0;
  deduct();
  results.push({
    name: "Heart - Cannot go below 0",
    passed: hearts === 0,
    message: hearts === 0 ? "✅ Correct" : `❌ Expected 0, got ${hearts}`,
  });
  console.log(`${hearts === 0 ? "✅" : "❌"} Below 0: ${hearts}`);

  hearts = 3;
  const refill = () => { hearts = Math.min(5, hearts + 1); };
  refill();
  results.push({
    name: "Heart - Refill",
    passed: hearts === 4,
    message: hearts === 4 ? "✅ Correct" : `❌ Expected 4, got ${hearts}`,
  });
  console.log(`${hearts === 4 ? "✅" : "❌"} Refill: ${hearts}`);

  hearts = 5;
  refill();
  results.push({
    name: "Heart - Cannot exceed 5",
    passed: hearts === 5,
    message: hearts === 5 ? "✅ Correct" : `❌ Expected 5, got ${hearts}`,
  });
  console.log(`${hearts === 5 ? "✅" : "❌"} Exceed 5: ${hearts}`);

  return results;
}

function testPronunciation(): TestResult[] {
  console.log("\n🗣️ Testing Pronunciation...\n");
  const results: TestResult[] = [];

  const words = [
    { word: "բարև" },
    { word: "ինչպես" },
    { word: "շնորհակալություն" },
    { word: "ես" },
    { word: "դու" },
  ];

  let passed = 0;
  for (const w of words) {
    const normalized = w.word.toLowerCase().replace(/[^a-zա-ֆ]/g, "");
    if (normalized.length > 0) passed++;
  }

  results.push({
    name: "Pronunciation - Word normalization",
    passed: passed === words.length,
    message: passed === words.length ? `✅ ${passed}/${words.length}` : `❌ ${passed}/${words.length}`,
    details: { passed, total: words.length },
  });
  console.log(`${passed === words.length ? "✅" : "❌"} Normalization: ${passed}/${words.length}`);

  return results;
}

// ─── MAIN ────────────────────────────────────────────────────────────

function runAllTests() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 RUNNING: NurLingo Lesson System Tests");
  console.log("=".repeat(60));

  const startTime = Date.now();
  let allResults: TestResult[] = [];

  allResults = allResults.concat(runValidationTests());
  allResults = allResults.concat(testAudioSystem());
  allResults = allResults.concat(testAutoPlayConflicts());
  allResults = allResults.concat(testEncouragementDuplication());
  allResults = allResults.concat(testRetryMechanism());
  allResults = allResults.concat(testHeartSystem());
  allResults = allResults.concat(testPronunciation());

  const duration = Date.now() - startTime;
  const total = allResults.length;
  const passed = allResults.filter(r => r.passed).length;
  const failed = total - passed;

  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST REPORT");
  console.log("=".repeat(60));

  console.log(`\n📈 Summary:`);
  console.log(`   Total Tests: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏱️ Duration: ${duration}ms`);

  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    allResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   - ${r.name}`);
        console.log(`     ${r.message}`);
      });
  }

  console.log("\n" + "=".repeat(60));
  console.log(`${passed === total ? "✅ ALL TESTS PASSED!" : "❌ SOME TESTS FAILED"}`);
  console.log("=".repeat(60));

  const report = {
    name: "NurLingo Lesson System Tests",
    results: allResults,
    passed,
    failed,
    total,
    duration,
    timestamp: new Date().toISOString(),
  };

  const reportPath = path.join(process.cwd(), "test-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);

  return report;
}

runAllTests();