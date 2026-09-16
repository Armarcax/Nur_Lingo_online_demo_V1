// src/lib/content/worlds.ts

import type { World } from "./types";

export const WORLDS: World[] = [
  {
    id: "w1",
    title: { en: "First Contact", hy: "Առաջին Հանդիպում", ru: "Первый Контакт" },
    description: {
      en: "Meet people, introduce yourself, talk about who you are.",
      hy: "Ծանոթացիր, ներկայացիր, պատմիր քո մասին։",
      ru: "Знакомьтесь, представляйтесь, рассказывайте о себе.",
    },
    iconEmoji: "👋",
    colorFrom: "#D90012",
    colorTo: "#8b0000",
    lessons: ["w1_l1", "w1_l2", "w1_l3", "w1_l4", "w1_l5", "w1_l6", "w1_l7", "w1_l8", "w1_l9", "w1_l10"],
  },
  {
    id: "w2",
    title: { en: "Daily Life", hy: "Ամենօրյա Կյանք", ru: "Повседневная Жизнь" },
    description: {
      en: "Home, food, shopping, time, weather.",
      hy: "Տուն, սնունդ, գնումներ, ժամանակ, եղանակ։",
      ru: "Дом, еда, покупки, время, погода.",
    },
    iconEmoji: "🏠",
    colorFrom: "#0033A0",
    colorTo: "#001a6b",
    lessons: ["w2_l1", "w2_l2", "w2_l3", "w2_l4", "w2_l5", "w2_l6", "w2_l7", "w2_l8", "w2_l9", "w2_l10"],
  },
  {
    id: "w3",
    title: { en: "Travel", hy: "Ճամփորդություն", ru: "Путешествия" },
    description: {
      en: "Airports, hotels, directions, emergencies.",
      hy: "Օդանավակայաններ, հյուրանոցներ, ուղղություններ, արտակարգ իրավիճակներ։",
      ru: "Аэропорты, отели, маршруты, экстренные ситуации.",
    },
    iconEmoji: "✈️",
    colorFrom: "#F2A800",
    colorTo: "#b07800",
    lessons: ["w3_l1", "w3_l2", "w3_l3", "w3_l4", "w3_l5", "w3_l6", "w3_l7", "w3_l8"],
  },
  {
    id: "w4",
    title: { en: "Education & Work", hy: "Կրթություն և Աշխատանք", ru: "Учёба и Работа" },
    description: {
      en: "School, university, office, professions, tech.",
      hy: "Դպրոց, համալսարան, գրասենյակ, մասնագիտություններ, տեխնոլոգիա։",
      ru: "Школа, университет, офис, профессии, технологии.",
    },
    iconEmoji: "📚",
    colorFrom: "#7C3AED",
    colorTo: "#4C1D95",
    lessons: ["w4_l1", "w4_l2", "w4_l3", "w4_l4", "w4_l5", "w4_l6"],
  },
  {
    id: "w5",
    title: { en: "Advanced Communication", hy: "Բարձր Մակարդակի Հաղորդակցում", ru: "Продвинутое Общение" },
    description: {
      en: "Opinions, emotions, storytelling, negotiation, culture.",
      hy: "Կարծիքներ, զգացմունքներ, պատմություն, բանակցություն, մշակույթ։",
      ru: "Мнения, эмоции, истории, переговоры, культура.",
    },
    iconEmoji: "💬",
    colorFrom: "#059669",
    colorTo: "#064E3B",
    lessons: ["w5_l1", "w5_l2", "w5_l3", "w5_l4", "w5_l5", "w5_l6"],
  },
  {
    id: "w6",
    title: { en: "Hobbies & Entertainment", hy: "Հոբբիներ և Ժամանց", ru: "Хобби и Развлечения" },
    description: {
      en: "Free time, sports, games, cinema.",
      hy: "Ազատ ժամանակ, սպորտ, խաղեր, կինո։",
      ru: "Свободное время, спорт, игры, кино.",
    },
    iconEmoji: "🎮",
    colorFrom: "#E91E63",
    colorTo: "#AD1457",
    lessons: ["w6_l1", "w6_l2", "w6_l3", "w6_l4", "w6_l5", "w6_l6", "w6_l7", "w6_l8", "w6_l9", "w6_l10"],
  },
  {
    id: "w7",
    title: { en: "Technology & Digital Life", hy: "Տեխնոլոգիա և Թվային Կյանք", ru: "Технологии и Цифровая Жизнь" },
    description: {
      en: "Computers, internet, social media, AI.",
      hy: "Համակարգիչներ, ինտերնետ, սոցցանցեր, AI։",
      ru: "Компьютеры, интернет, соцсети, ИИ.",
    },
    iconEmoji: "📱",
    colorFrom: "#2196F3",
    colorTo: "#0D47A1",
    lessons: ["w7_l1", "w7_l2", "w7_l3", "w7_l4", "w7_l5", "w7_l6", "w7_l7", "w7_l8", "w7_l9", "w7_l10"],
  },
  {
    id: "w8",
    title: { en: "Environment & Ecology", hy: "Շրջակա Միջավայր և Էկոլոգիա", ru: "Окружающая Среда и Экология" },
    description: {
      en: "Nature, climate, recycling, animals.",
      hy: "Բնություն, կլիմա, վերամշակում, կենդանիներ։",
      ru: "Природа, климат, переработка, животные.",
    },
    iconEmoji: "🌱",
    colorFrom: "#4CAF50",
    colorTo: "#1B5E20",
    lessons: ["w8_l1", "w8_l2", "w8_l3", "w8_l4", "w8_l5", "w8_l6", "w8_l7", "w8_l8", "w8_l9", "w8_l10"],
  },
  {
    id: "w9",
    title: { en: "Business & Finance", hy: "Բիզնես և Ֆինանսներ", ru: "Бизнес и Финансы" },
    description: {
      en: "Money, banking, negotiations, marketing.",
      hy: "Փող, բանկային գործ, բանակցություններ, մարքեթինգ։",
      ru: "Деньги, банковское дело, переговоры, маркетинг.",
    },
    iconEmoji: "💼",
    colorFrom: "#FF9800",
    colorTo: "#E65100",
    lessons: ["w9_l1", "w9_l2", "w9_l3", "w9_l4", "w9_l5", "w9_l6", "w9_l7", "w9_l8", "w9_l9", "w9_l10"],
  },
  {
    id: "w10",
    title: { en: "Art & Literature", hy: "Արվեստ և Գրականություն", ru: "Искусство и Литература" },
    description: {
      en: "Painting, music, books, poetry.",
      hy: "Նկարչություն, երաժշտություն, գրքեր, պոեզիա։",
      ru: "Живопись, музыка, книги, поэзия.",
    },
    iconEmoji: "🎨",
    colorFrom: "#9C27B0",
    colorTo: "#4A148C",
    lessons: ["w10_l1", "w10_l2", "w10_l3", "w10_l4", "w10_l5", "w10_l6", "w10_l7", "w10_l8", "w10_l9", "w10_l10"],
  },
];

export const getWorlds = () => WORLDS;
export const getWorldById = (id: string) => WORLDS.find((w) => w.id === id);