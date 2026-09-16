// src/lib/curriculum/topics.ts

import type { TopicSpec } from "./types";

export const TOPICS: TopicSpec[] = [
  {
    id: "social_communication",
    icon: "👋",
    title: { en: "Social Communication", hy: "Հաղորդակցություն", ru: "Общение" },
    words: ["hello", "goodbye", "yes", "no", "please", "thanks", "sorry", "name", "friend", "people"],
    phrases: [
      { id: "p_hi", text: { en: "Hello, how are you?", hy: "Բարև, ինչպե՞ս ես։", ru: "Привет, как дела?" } },
      { id: "p_name", text: { en: "My name is Nuri.", hy: "Իմ անունը Նուրի է։", ru: "Меня зовут Нури." } },
    ],
  },
  {
    id: "numbers_time",
    icon: "🔢",
    title: { en: "Numbers & Time", hy: "Թվեր և Ժամանակ", ru: "Числа и Время" },
    words: ["one", "two", "three", "four", "five", "day", "night", "morning", "year", "time", "hour", "month"],
  },
  {
    id: "school_education",
    icon: "🎓",
    title: { en: "School & Education", hy: "Դպրոց", ru: "Школа" },
    words: ["school", "book", "teacher", "student", "class", "learn", "read", "write", "study", "lesson"],
  },
  {
    id: "science_nature",
    icon: "🌿",
    title: { en: "Science & Nature", hy: "Բնություն", ru: "Природа" },
    words: ["water", "fire", "earth", "air", "sun", "moon", "star", "tree", "river", "mountain", "sea"],
  },
  {
    id: "family",
    icon: "👨‍👩‍👧",
    title: { en: "Family & Relationships", hy: "Ընտանիք", ru: "Семья" },
    words: ["mother", "father", "brother", "sister", "child", "family", "friend", "love", "wife", "husband"],
  },
  {
    id: "clothing",
    icon: "👕",
    title: { en: "Clothing", hy: "Հագուստ", ru: "Одежда" },
    words: ["shirt", "shoe", "hat", "coat", "dress", "pants", "wear", "clothes"],
  },
  {
    id: "home",
    icon: "🏠",
    title: { en: "Home", hy: "Տուն", ru: "Дом" },
    words: ["house", "door", "window", "room", "bed", "chair", "table", "kitchen", "wall", "floor"],
  },
  {
    id: "food_dining",
    icon: "🍎",
    title: { en: "Food & Dining", hy: "Սնունդ", ru: "Еда" },
    words: ["apple", "bread", "water", "milk", "meat", "fish", "rice", "egg", "salt", "sugar", "eat", "drink"],
  },
  {
    id: "shopping",
    icon: "🛒",
    title: { en: "Shopping", hy: "Գնումներ", ru: "Покупки" },
    words: ["money", "buy", "sell", "price", "shop", "market", "pay", "cost"],
  },
  {
    id: "transport",
    icon: "🚗",
    title: { en: "Transportation", hy: "Տրանսպորտ", ru: "Транспорт" },
    words: ["car", "bus", "train", "road", "go", "stop", "drive", "airport", "ticket"],
  },
  {
    id: "health",
    icon: "🩺",
    title: { en: "Health", hy: "Առողջություն", ru: "Здоровье" },
    words: ["doctor", "head", "hand", "arm", "leg", "eye", "ear", "sick", "pain", "help"],
  },
  {
    id: "travel",
    icon: "✈️",
    title: { en: "Travel & Hospitality", hy: "Ճանապարհորդություն", ru: "Путешествия" },
    words: ["hotel", "airport", "ticket", "map", "city", "country", "travel", "go"],
  },
  {
    id: "work",
    icon: "💼",
    title: { en: "Work & Careers", hy: "Աշխատանք", ru: "Работа" },
    words: ["work", "job", "office", "money", "boss", "team", "task", "meet"],
  },
  {
    id: "technology",
    icon: "💻",
    title: { en: "Technology", hy: "Տեխնոլոգիա", ru: "Технологии" },
    words: ["phone", "computer", "internet", "email", "message", "screen", "data"],
  },
  {
    id: "daily_language",
    icon: "💬",
    title: { en: "Daily Language", hy: "Ամենօրյա խոսք", ru: "Повседневный язык" },
    words: ["good", "bad", "big", "small", "new", "old", "happy", "sad", "now", "today", "tomorrow", "yesterday"],
  },
];