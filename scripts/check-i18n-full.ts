import fs from "fs";
import path from "path";
import {
  Node,
  Project,
  SyntaxKind,
  SourceFile,
  CallExpression,
  StringLiteral,
  NoSubstitutionTemplateLiteral,
} from "ts-morph";

// ============================================================
// NUR Lingo — Production i18n Audit
// AST-based validator
// ============================================================

console.log("\n🔍 NUR Lingo — Full i18n audit\n");

const ROOT = process.cwd();

const CONFIG = {
  sourceDir: path.join(ROOT, "src"),
  translationsFile: path.join(
    ROOT,
    "src/lib/i18n/translations.json"
  ),

  correctUseI18nImport: "@/hooks/useI18n",

  excludedDirectories: new Set([
    "node_modules",
    ".next",
    "dist",
    "build",
    "coverage",
    "__tests__",
    "__mocks__",
  ]),

  extensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
  ],
};

// ============================================================
// TYPES
// ============================================================

type Severity = "error" | "warning" | "info";

type IssueType =
  | "missing_key"
  | "invalid_key"
  | "missing_import"
  | "wrong_import"
  | "api_use_i18n"
  | "undefined_t"
  | "hardcoded_text"
  | "translation_structure";

interface Issue {
  file: string;
  line: number;
  column: number;
  type: IssueType;
  severity: Severity;
  message: string;
  suggestion?: string;
}

// ============================================================
// TRANSLATIONS
// ============================================================

interface TranslationData {
  hy: Record<string, unknown>;
  en: Record<string, unknown>;
  ru: Record<string, unknown>;
}

function loadTranslations(): TranslationData {
  if (!fs.existsSync(CONFIG.translationsFile)) {
    console.error(
      `❌ translations.json not found:\n${CONFIG.translationsFile}`
    );

    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(
      CONFIG.translationsFile,
      "utf8"
    );

    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "❌ Failed to parse translations.json",
      error
    );

    process.exit(1);
  }
}

function getKeys(
  translations: TranslationData
): Set<string> {
  const keys = new Set<string>();

  for (const lang of ["hy", "en", "ru"] as const) {
    const dictionary = translations[lang];

    if (!dictionary || typeof dictionary !== "object") {
      continue;
    }

    for (const key of Object.keys(dictionary)) {
      keys.add(key);
    }
  }

  return keys;
}

// ============================================================
// TRANSLATION STRUCTURE AUDIT
// ============================================================

function auditTranslationStructure(
  translations: TranslationData
): Issue[] {
  const issues: Issue[] = [];

  const languages = ["hy", "en", "ru"] as const;

  for (const lang of languages) {
    if (!translations[lang]) {
      issues.push({
        file: CONFIG.translationsFile,
        line: 1,
        column: 1,
        type: "translation_structure",
        severity: "error",
        message: `Missing language dictionary: ${lang}`,
        suggestion:
          `Add the "${lang}" translation dictionary.`,
      });
    }
  }

  const allKeys = new Set<string>();

  for (const lang of languages) {
    const dictionary = translations[lang];

    if (!dictionary) continue;

    for (const key of Object.keys(dictionary)) {
      allKeys.add(key);
    }
  }

  for (const key of allKeys) {
    for (const lang of languages) {
      if (!translations[lang]?.[key]) {
        issues.push({
          file: CONFIG.translationsFile,
          line: 1,
          column: 1,
          type: "translation_structure",
          severity: "error",
          message:
            `Translation key "${key}" is missing in ${lang}.`,
          suggestion:
            `Add "${key}" to the ${lang} dictionary.`,
        });
      }
    }
  }

  return issues;
}

// ============================================================
// FILE HELPERS
// ============================================================

function isExcluded(
  directoryName: string
): boolean {
  return CONFIG.excludedDirectories.has(
    directoryName
  );
}

function getAllSourceFiles(
  directory: string
): string[] {
  const result: string[] = [];

  if (!fs.existsSync(directory)) {
    return result;
  }

  const entries = fs.readdirSync(
    directory,
    { withFileTypes: true }
  );

  for (const entry of entries) {
    if (isExcluded(entry.name)) {
      continue;
    }

    const fullPath = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      result.push(
        ...getAllSourceFiles(fullPath)
      );
      continue;
    }

    const extension = path.extname(
      entry.name
    ).replace(".", "");

    if (
      CONFIG.extensions.includes(
        extension
      )
    ) {
      result.push(fullPath);
    }
  }

  return result;
}

function isApiRoute(
  filePath: string
): boolean {
  const normalized = filePath
    .replace(/\\/g, "/");

  return (
    normalized.includes("/app/api/") ||
    normalized.includes("/pages/api/")
  );
}

function isClientComponent(
  sourceFile: SourceFile
): boolean {
  const firstStatements =
    sourceFile
      .getStatements()
      .slice(0, 3);

  return firstStatements.some(
    statement =>
      statement
        .getText()
        .trim() ===
      `"use client";` ||
      statement
        .getText()
        .trim() ===
      `'use client';`
  );
}

// ============================================================
// IMPORT ANALYSIS
// ============================================================

function hasUseI18nImport(
  sourceFile: SourceFile
): boolean {
  return sourceFile
    .getImportDeclarations()
    .some(importDeclaration => {
      const moduleSpecifier =
        importDeclaration
          .getModuleSpecifierValue();

      if (
        moduleSpecifier !==
        CONFIG.correctUseI18nImport
      ) {
        return false;
      }

      return importDeclaration
        .getNamedImports()
        .some(
          named =>
            named.getName() ===
            "useI18n"
        );
    });
}

function hasWrongUseI18nImport(
  sourceFile: SourceFile
): boolean {
  return sourceFile
    .getImportDeclarations()
    .some(importDeclaration => {
      const moduleSpecifier =
        importDeclaration
          .getModuleSpecifierValue();

      if (
        !moduleSpecifier
          .toLowerCase()
          .includes("usei18n")
      ) {
        return false;
      }

      return (
        moduleSpecifier !==
        CONFIG.correctUseI18nImport
      );
    });
}

// ============================================================
// t() ANALYSIS
// ============================================================

interface TranslationCall {
  call: CallExpression;
  key?: string;
  dynamic: boolean;
}

function getTranslationCalls(
  sourceFile: SourceFile
): TranslationCall[] {
  const calls: TranslationCall[] = [];

  for (const call of sourceFile
    .getDescendantsOfKind(
      SyntaxKind.CallExpression
    )) {

    const expression =
      call.getExpression();

    if (
      !Node.isIdentifier(expression) ||
      expression.getText() !== "t"
    ) {
      continue;
    }

    const args = call.getArguments();

    if (args.length === 0) {
      calls.push({
        call,
        dynamic: true,
      });

      continue;
    }

    const first = args[0];

    if (
      Node.isStringLiteral(first) ||
      Node.isNoSubstitutionTemplateLiteral(first)
    ) {
      calls.push({
        call,
        key: first.getLiteralText(),
        dynamic: false,
      });

      continue;
    }

    // Dynamic translation key.
    calls.push({
      call,
      dynamic: true,
    });
  }

  return calls;
}

// ============================================================
// KEY VALIDATION
// ============================================================

function isTechnicalString(
  key: string
): boolean {
  const technical = new Set([
    "hy",
    "en",
    "ru",
    "id",
    "true",
    "false",
    "null",
    "undefined",
    "audio",
    "wav",
    "mp3",
    "tts",
    "authorization",
    "unit",
    "speaker",
    "yes",
    "no",
    "ok",
    "on",
    "off",
  ]);

  if (technical.has(key)) {
    return true;
  }

  if (
    key.startsWith("@/") ||
    key.startsWith("./") ||
    key.startsWith("../")
  ) {
    return true;
  }

  if (
    key.includes("/") ||
    key.includes("\\")
  ) {
    return true;
  }

  if (
    key.includes(".") &&
    !key.startsWith("page.")
  ) {
    return true;
  }

  if (
    /^[A-Za-z]$/.test(key)
  ) {
    return true;
  }

  if (
    /^[0-9]+$/.test(key)
  ) {
    return true;
  }

  if (
    /^[*+\-=/<>]+$/.test(key)
  ) {
    return true;
  }

  return false;
}

// ============================================================
// HARD CODED JSX ANALYSIS
// ============================================================

function looksLikeUserFacingText(
  text: string
): boolean {
  const value = text.trim();

  if (!value) {
    return false;
  }

  if (value.length < 2) {
    return false;
  }

  // Numbers
  if (/^[0-9\s.,:%+-]+$/.test(value)) {
    return false;
  }

  // URLs / paths
  if (
    /^https?:\/\//i.test(value) ||
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.startsWith("../")
  ) {
    return false;
  }

  // CSS / technical
  if (
    /^(flex|grid|block|inline|hidden|relative|absolute|fixed|sticky|auto|pointer|none)$/i.test(
      value
    )
  ) {
    return false;
  }

  // Tailwind-like values
  if (
    /^(w|h|p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr|text|bg|border|rounded|gap|space|items|justify|content|top|left|right|bottom|z)-/i.test(
      value
    )
  ) {
    return false;
  }

  // Brand names
  if (
    /^(NUR|Nuri|Nurik|Lingo|HAYQ|NUR Lingo)$/i.test(
      value
    )
  ) {
    return false;
  }

  // Pure emoji
  if (
    /^[\p{Emoji}\s]+$/u.test(value)
  ) {
    return false;
  }

  return true;
}

// ============================================================
// JSX TEXT SCANNER
// ============================================================

function scanHardcodedJSX(
  sourceFile: SourceFile
): Issue[] {
  const issues: Issue[] = [];

  if (
    !sourceFile
      .getFilePath()
      .match(/\.(tsx|jsx)$/)
  ) {
    return issues;
  }

  for (const jsxText of sourceFile
    .getDescendantsOfKind(
      SyntaxKind.JsxText
    )) {

    const text =
      jsxText.getText().trim();

    if (
      !looksLikeUserFacingText(text)
    ) {
      continue;
    }

    const parent =
      jsxText.getParent();

    // Ignore comments / formatting-only JSX.
    if (
      !parent ||
      !Node.isJsxElement(parent) &&
      !Node.isJsxFragment(parent)
    ) {
      continue;
    }

    const start =
      jsxText.getStartLineNumber();

    issues.push({
      file: sourceFile.getFilePath(),
      line: start,
      column:
        jsxText.getStartLinePos() + 1,
      type: "hardcoded_text",
      severity: "warning",
      message:
        `Possible hardcoded UI text: "${text}"`,
      suggestion:
        `Use t("...") for user-facing text if this text should be localized.`,
    });
  }

  return issues;
}

// ============================================================
// FILE AUDIT
// ============================================================

function scanFile(
  sourceFile: SourceFile,
  translationKeys: Set<string>
): Issue[] {

  const issues: Issue[] = [];

  const filePath =
    sourceFile.getFilePath();

  const api =
    isApiRoute(filePath);

  const client =
    isClientComponent(sourceFile);

  const hasImport =
    hasUseI18nImport(sourceFile);

  const wrongImport =
    hasWrongUseI18nImport(sourceFile);

  // ----------------------------------------------------------
  // API + useI18n
  // ----------------------------------------------------------

  if (
    api &&
    (
      hasImport ||
      sourceFile.getText().includes("useI18n")
    )
  ) {

    const node =
      sourceFile
        .getDescendantsOfKind(
          SyntaxKind.Identifier
        )
        .find(
          identifier =>
            identifier.getText() ===
            "useI18n"
        );

    issues.push({
      file: filePath,
      line:
        node?.getStartLineNumber() ?? 1,
      column:
        node?.getStartLinePos() ?? 1,
      type: "api_use_i18n",
      severity: "error",
      message:
        "React useI18n() must not be used inside API/server routes.",
      suggestion:
        "Use a server-safe translation function if server-side localization is required.",
    });
  }

  // ----------------------------------------------------------
  // Wrong import
  // ----------------------------------------------------------

  if (wrongImport) {

    const declaration =
      sourceFile
        .getImportDeclarations()
        .find(
          declaration =>
            declaration
              .getModuleSpecifierValue()
              .toLowerCase()
              .includes("usei18n") &&
            declaration
              .getModuleSpecifierValue() !==
              CONFIG.correctUseI18nImport
        );

    issues.push({
      file: filePath,
      line:
        declaration?.getStartLineNumber() ?? 1,
      column: 1,
      type: "wrong_import",
      severity: "error",
      message:
        "Incorrect useI18n import path.",
      suggestion:
        `Use: import { useI18n } from "${CONFIG.correctUseI18nImport}"`,
    });
  }

  // ----------------------------------------------------------
  // t() calls
  // ----------------------------------------------------------

  const translationCalls =
    getTranslationCalls(sourceFile);

  if (
    translationCalls.length > 0 &&
    !api &&
    !hasImport
  ) {

    // Only enforce useI18n import for client components.
    // Server files must not receive a React hook.
    if (client) {

      const call =
        translationCalls[0].call;

      issues.push({
        file: filePath,
        line:
          call.getStartLineNumber(),
        column:
          call.getStartLinePos() + 1,
        type: "missing_import",
        severity: "error",
        message:
          "t() is used in a client component without importing useI18n.",
        suggestion:
          `Add: import { useI18n } from "${CONFIG.correctUseI18nImport}"`,
      });
    }
  }

  // ----------------------------------------------------------
  // useI18n imported but t not used
  // ----------------------------------------------------------

  if (hasImport) {

    const text =
      sourceFile.getText();

    const hasT =
      translationCalls.length > 0;

    const hasDestructure =
      /const\s*\{\s*t\s*\}\s*=\s*useI18n\s*\(\s*\)/.test(
        text
      ) ||
      /const\s*\{\s*[^}]*\bt\b[^}]*\}\s*=\s*useI18n\s*\(\s*\)/.test(
        text
      );

    if (
      !hasT &&
      !hasDestructure
    ) {

      issues.push({
        file: filePath,
        line: 1,
        column: 1,
        type: "undefined_t",
        severity: "info",
        message:
          "useI18n is imported but no t() call was detected.",
        suggestion:
          "Remove the import if it is not needed.",
      });
    }
  }

  // ----------------------------------------------------------
  // Translation key validation
  // ----------------------------------------------------------

  for (const translationCall of translationCalls) {

    if (translationCall.dynamic) {
      continue;
    }

    const key =
      translationCall.key;

    if (!key) {
      continue;
    }

    // Technical false-positive
    if (isTechnicalString(key)) {
      continue;
    }

    if (!translationKeys.has(key)) {

      issues.push({
        file: filePath,
        line:
          translationCall
            .call
            .getStartLineNumber(),
        column:
          translationCall
            .call
            .getStartLinePos() + 1,
        type: "missing_key",
        severity: "error",
        message:
          `Translation key "${key}" does not exist in translations.json.`,
        suggestion:
          `Add "${key}" to hy/en/ru only if it is a real user-facing translation key.`,
      });
    }
  }

  // ----------------------------------------------------------
  // JSX hardcoded UI
  // ----------------------------------------------------------

  if (!api) {
    issues.push(
      ...scanHardcodedJSX(sourceFile)
    );
  }

  return issues;
}

// ============================================================
// PROJECT SETUP
// ============================================================

const translations =
  loadTranslations();

const translationKeys =
  getKeys(translations);

console.log(
  `📚 Translation keys: ${translationKeys.size}`
);

console.log(
  `   HY: ${Object.keys(translations.hy || {}).length}`
);

console.log(
  `   EN: ${Object.keys(translations.en || {}).length}`
);

console.log(
  `   RU: ${Object.keys(translations.ru || {}).length}`
);

console.log("");

const project =
  new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
      jsx: 4,
      target: 99,
      module: 99,
      moduleResolution: 2,
    },
  });

const sourceFiles =
  getAllSourceFiles(
    CONFIG.sourceDir
  );

for (const file of sourceFiles) {
  project.addSourceFileAtPath(file);
}

console.log(
  `📁 Files scanned: ${sourceFiles.length}`
);

console.log("");

// ============================================================
// RUN AUDIT
// ============================================================

const issues: Issue[] = [];

issues.push(
  ...auditTranslationStructure(
    translations
  )
);

for (const sourceFile of project.getSourceFiles()) {
  issues.push(
    ...scanFile(
      sourceFile,
      translationKeys
    )
  );
}

// ============================================================
// STATISTICS
// ============================================================

const errors =
  issues.filter(
    issue =>
      issue.severity === "error"
  );

const warnings =
  issues.filter(
    issue =>
      issue.severity === "warning"
  );

const infos =
  issues.filter(
    issue =>
      issue.severity === "info"
  );

const countByType =
  (type: IssueType) =>
    issues.filter(
      issue =>
        issue.type === type
    ).length;

// ============================================================
// REPORT
// ============================================================

console.log(
  "\n" +
  "=".repeat(72)
);

console.log(
  "📊 NUR LINGO — I18N AUDIT RESULTS"
);

console.log(
  "=".repeat(72)
);

console.log("");

console.log(
  `📁 Files scanned: ${sourceFiles.length}`
);

console.log(
  `🔑 Translation keys: ${translationKeys.size}`
);

console.log("");

console.log(
  "LANGUAGES"
);

console.log(
  `  ${Object.keys(translations.hy || {}).length === Object.keys(translations.en || {}).length ? "✓" : "❌"} Armenian: ${Object.keys(translations.hy || {}).length}`
);

console.log(
  `  ${Object.keys(translations.en || {}).length === Object.keys(translations.ru || {}).length ? "✓" : "❌"} English: ${Object.keys(translations.en || {}).length}`
);

console.log(
  `  ${Object.keys(translations.ru || {}).length === Object.keys(translations.hy || {}).length ? "✓" : "❌"} Russian: ${Object.keys(translations.ru || {}).length}`
);

console.log("");

console.log(
  "ISSUES"
);

console.log(
  `  ❌ Errors:   ${errors.length}`
);

console.log(
  `  ⚠️ Warnings: ${warnings.length}`
);

console.log(
  `  💡 Info:     ${infos.length}`
);

console.log("");

console.log(
  "BY TYPE"
);

console.log(
  `  missing_key:          ${countByType("missing_key")}`
);

console.log(
  `  missing_import:       ${countByType("missing_import")}`
);

console.log(
  `  wrong_import:         ${countByType("wrong_import")}`
);

console.log(
  `  api_use_i18n:         ${countByType("api_use_i18n")}`
);

console.log(
  `  undefined_t:          ${countByType("undefined_t")}`
);

console.log(
  `  hardcoded_text:       ${countByType("hardcoded_text")}`
);

console.log(
  `  translation_structure:${countByType("translation_structure")}`
);

console.log("");

// ============================================================
// GROUP ISSUES BY FILE
// ============================================================

const grouped =
  new Map<string, Issue[]>();

for (const issue of issues) {

  if (!grouped.has(issue.file)) {
    grouped.set(
      issue.file,
      []
    );
  }

  grouped
    .get(issue.file)!
    .push(issue);
}

if (grouped.size > 0) {

  console.log(
    "=".repeat(72)
  );

  console.log(
    "🔍 DETAILS"
  );

  console.log(
    "=".repeat(72)
  );

  for (
    const [file, fileIssues]
    of grouped
  ) {

    const relative =
      path.relative(
        ROOT,
        file
      );

    console.log(
      `\n📄 ${relative}`
    );

    for (
      const issue
      of fileIssues.slice(0, 10)
    ) {

      const icon =
        issue.severity === "error"
          ? "❌"
          : issue.severity === "warning"
            ? "⚠️"
            : "💡";

      console.log(
        `  ${icon} Line ${issue.line} [${issue.type}]`
      );

      console.log(
        `     ${issue.message}`
      );

      if (issue.suggestion) {
        console.log(
          `     → ${issue.suggestion}`
        );
      }
    }

    if (fileIssues.length > 10) {
      console.log(
        `     ... ${fileIssues.length - 10} more`
      );
    }
  }
}

// ============================================================
// FINAL RESULT
// ============================================================

console.log(
  "\n" +
  "=".repeat(72)
);

if (errors.length === 0) {

  console.log(
    "✅ I18N AUDIT PASSED"
  );

  console.log("");

  console.log(
    "No real i18n errors were detected."
  );

  if (warnings.length > 0) {
    console.log(
      `⚠️ ${warnings.length} warnings should be reviewed.`
    );
  }

  console.log("");

  console.log(
    "RESULT: I18N SYSTEM HEALTHY"
  );

} else {

  console.log(
    "❌ I18N AUDIT FAILED"
  );

  console.log("");

  console.log(
    `${errors.length} real error(s) require attention.`
  );

  console.log("");

  console.log(
    "RESULT: I18N SYSTEM NEEDS FIXES"
  );

}

console.log(
  "=".repeat(72)
);

process.exit(
  errors.length > 0
    ? 1
    : 0
);