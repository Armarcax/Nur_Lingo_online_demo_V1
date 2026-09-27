#!/usr/bin/env node
/**
 * Check missing i18n keys between hy, en, ru blocks.
 */

const d = require('../src/lib/i18n/translations.json');

const hyKeys = new Set(Object.keys(d.hy));
const enKeys = new Set(Object.keys(d.en));
const ruKeys = new Set(Object.keys(d.ru));

const missingInHy = [...enKeys].filter((k) => !hyKeys.has(k));
const missingInEn = [...hyKeys].filter((k) => !enKeys.has(k));
const missingInRu = [...hyKeys].filter((k) => !ruKeys.has(k));

console.log('=== Keys missing in HY block ===');
if (missingInHy.length === 0) {
  console.log('(none)');
} else {
  missingInHy.forEach((k) => {
    console.log(`  ${k}`);
    console.log(`    hy: ${d.hy[k]}`);
    console.log(`    en: ${d.en[k]}`);
    console.log(`    ru: ${d.ru[k]}`);
  });
}

console.log('');
console.log('=== Keys missing in EN block ===');
if (missingInEn.length === 0) {
  console.log('(none)');
} else {
  missingInEn.forEach((k) => console.log(`  ${k}`));
}

console.log('');
console.log('=== Keys missing in RU block ===');
if (missingInRu.length === 0) {
  console.log('(none)');
} else {
  missingInRu.forEach((k) => console.log(`  ${k}`));
}

console.log('');
console.log('=== Summary ===');
console.log(`hy: ${hyKeys.size} keys`);
console.log(`en: ${enKeys.size} keys`);
console.log(`ru: ${ruKeys.size} keys`);