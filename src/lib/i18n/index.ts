// src/lib/i18n/index.ts

import React, { useState, useEffect } from 'react';

export type LangCode = "en" | "hy" | "ru";
export type LangPair = "en-hy" | "hy-en" | "ru-hy" | "hy-ru" | "en-ru" | "ru-en";

export interface LangConfig {
  pair: LangPair;
  native: LangCode;
  learning: LangCode;
}

// ─── LANGUAGE NAMES ──────────────────────────────────────────────────

export const LANG_NAMES: Record<LangCode, { en: string; hy: string; ru: string }> = {
  en: { en: "English", hy: "Անգլերեն", ru: "Английский" },
  hy: { en: "Armenian", hy: "Հայերեն", ru: "Армянский" },
  ru: { en: "Russian", hy: "Ռուսերեն", ru: "Русский" },
};

export const LANG_EMOJIS: Record<LangCode, string> = {
  en: "🇬🇧",
  hy: "🇦🇲",
  ru: "🇷🇺",
};

export const LANG_FLAGS: Record<LangCode, string> = {
  en: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  hy: "🇦🇲",
  ru: "🇷🇺",
};

// ─── UI STRINGS ──────────────────────────────────────────────────────

export interface UIStrings {
  loading: string;
  back: string;
  continue: string;
  next: string;
  previous: string;
  done: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  search: string;
  noResults: string;
  error: string;
  success: string;
  welcome: string;
  profile: string;
  settings: string;
  language: string;
  theme: string;
  dark: string;
  light: string;
  system: string;
  lesson: string;
  lessons: string;
  world: string;
  worlds: string;
  dictionary: string;
  dialogues: string;
  curriculum: string;
  progress: string;
  score: string;
  hayq: string;
  seeds: string;
  streak: string;
  crowns: string;
  level: string;
  start: string;
  resume: string;
  completed: string;
  locked: string;
  available: string;
  learn: string;
  practice: string;
  review: string;
  grammar: string;
  vocabulary: string;
  translation: string;
  listening: string;
  speaking: string;
  reading: string;
  writing: string;
  multipleChoice: string;
  fillBlank: string;
  wordOrder: string;
  matching: string;
  errorCorrection: string;
  perfect: string;
  excellent: string;
  good: string;
  partial: string;
  incorrect: string;
  hint: string;
  explanation: string;
  timeLimit: string;
  minutes: string;
  seconds: string;
  hours: string;
  days: string;
  weeks: string;
  months: string;
  years: string;
  today: string;
  yesterday: string;
  tomorrow: string;
  thisWeek: string;
  thisMonth: string;
  allTime: string;
  more: string;
  less: string;
  close: string;
  open: string;
  yes: string;
  no: string;
  ok: string;
  confirm: string;
  reset: string;
  submit: string;
  retry: string;
  // ✅ ՀԱՎԵԼՑՎԱԾ KEY-ԵՐ
  home: string;
  worldNav: string;
  dict: string;
  user: string;
  prog: string;
  dial: string;
  profileNav: string;
  settingsNav: string;
  nurLingo: string;
  footerDescription: string;
  followUs: string;
  stayUpdated: string;
  stayUpdatedDescription: string;
  copyright: string;
  garden: string;
  userDictionary: string;
  languageSameError: string;
  dialogCount: string;
  dialogTurns: string;
  dialogFavorites: string;
  dialogCompleted: string;
  dialogWav: string;
  dialogNuriHappy: string;
  dialogNuriSad: string;
  dialogNuriIdle: string;
  dialogList: string;
  dialogGrid: string;
  dialogCompact: string;
  dialogAutoReveal: string;
  dialogAuto: string;
  dialogManual: string;
  dialogStats: string;
  dialogFilters: string;
  dialogClear: string;
  dialogTotal: string;
  dialogCompletedCount: string;
  dialogInProgress: string;
  dialogTotalTurns: string;
  dialogTotalDuration: string;
  dialogCategories: string;
  dialogDifficulty: string;
  dialogCategory: string;
  dialogSort: string;
  dialogAll: string;
  dialogBeginner: string;
  dialogIntermediate: string;
  dialogAdvanced: string;
  dialogFavoritesList: string;
  dialogDefault: string;
  dialogNewest: string;
  dialogOldest: string;
  dialogAlphabetical: string;
  dialogPopular: string;
  dialogProgressSort: string;
  dialogSearch: string;
  dialogNoResultsQuery: string;
  dialogNoDialogues: string;
  dialogTryDifferent: string;
  dialogComingSoon: string;
  dialogClearFilters: string;
  dialogShowingCount: string;
  dialogCompletedStatus: string;
  dialogRevealAll: string;
  dialogHideAll: string;
  dialogTapToReveal: string;
  dialogGoToLesson: string;
  dialogNormal: string;
  dialogInteractive: string;
  dialogFavorited: string;
  dialogSave: string;
  dialogEmpty: string;
  dialogNoData: string;
  dialogBackToNormal: string;
  dialogInteractivePerfect: string;
  dialogInteractiveGood: string;
  dialogAllRevealed: string;
  dialogAllHidden: string;
  dialogFavoritedBadge: string;
  dialogCompletedBadge: string;
  dialogInteractiveBadge: string;
  dialogTurnsCount: string;
  dialogAudioCount: string;
  dialogDifficultyBeginner: string;
  dialogDifficultyIntermediate: string;
  dialogDifficultyAdvanced: string;
  dialogCategoryDaily: string;
  dialogCategoryTravel: string;
  dialogCategoryFood: string;
  dialogCategoryFamily: string;
  dialogCategoryWork: string;
  dialogCategoryShopping: string;
  dialogCategoryHealth: string;
  dialogCategoryEducation: string;
  dialogCategoryEntertainment: string;
  dialogCategorySocial: string;
}

export const UI_STRINGS: Record<LangCode, UIStrings> = {
  en: {
    loading: "Loading...",
    back: "Back",
    continue: "Continue",
    next: "Next",
    previous: "Previous",
    done: "Done",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    noResults: "No results found",
    error: "Error",
    success: "Success",
    welcome: "Welcome",
    profile: "Profile",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    system: "System",
    lesson: "Lesson",
    lessons: "Lessons",
    world: "World",
    worlds: "Worlds",
    dictionary: "Dictionary",
    dialogues: "Dialogues",
    curriculum: "Curriculum",
    progress: "Progress",
    score: "Score",
    hayq: "HAYQ",
    seeds: "Seeds",
    streak: "Streak",
    crowns: "Crowns",
    level: "Level",
    start: "Start",
    resume: "Resume",
    completed: "Completed",
    locked: "Locked",
    available: "Available",
    learn: "Learn",
    practice: "Practice",
    review: "Review",
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    translation: "Translation",
    listening: "Listening",
    speaking: "Speaking",
    reading: "Reading",
    writing: "Writing",
    multipleChoice: "Multiple Choice",
    fillBlank: "Fill in the Blank",
    wordOrder: "Word Order",
    matching: "Matching",
    errorCorrection: "Error Correction",
    perfect: "Perfect",
    excellent: "Excellent",
    good: "Good",
    partial: "Partial",
    incorrect: "Incorrect",
    hint: "Hint",
    explanation: "Explanation",
    timeLimit: "Time Limit",
    minutes: "minutes",
    seconds: "seconds",
    hours: "hours",
    days: "days",
    weeks: "weeks",
    months: "months",
    years: "years",
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    thisWeek: "This Week",
    thisMonth: "This Month",
    allTime: "All Time",
    more: "More",
    less: "Less",
    close: "Close",
    open: "Open",
    yes: "Yes",
    no: "No",
    ok: "OK",
    confirm: "Confirm",
    reset: "Reset",
    submit: "Submit",
    retry: "Retry",
    home: "Home",
    worldNav: "World",
    dict: "Dict",
    user: "User",
    prog: "Prog.",
    dial: "Dial.",
    profileNav: "Profile",
    settingsNav: "Settings",
    nurLingo: "NUR Lingo",
    footerDescription: "Armenian-first multilingual learning with AI, dialogues, and HAYQ rewards.",
    followUs: "Follow us",
    stayUpdated: "Stay updated",
    stayUpdatedDescription: "Get lesson drops, new dialogues, and HAYQ events in your inbox.",
    copyright: "© {year} NUR Lingo. All rights reserved.",
    garden: "Garden",
    userDictionary: "User Dictionary",
    languageSameError: "Native and learning languages cannot be the same",
    dialogCount: "{count} dialogues",
    dialogTurns: "💬 {count} turns",
    dialogFavorites: "⭐ {count} favorites",
    dialogCompleted: "✅ {count} completed",
    dialogWav: "🔊 WAV",
    dialogNuriHappy: "Great dialogue! 🎉",
    dialogNuriSad: "Don't be sad, try again! 💪",
    dialogNuriIdle: "Learn Armenian through conversations! 💬 {count} dialogues",
    dialogList: "List",
    dialogGrid: "Grid",
    dialogCompact: "Compact",
    dialogAutoReveal: "Auto-reveal translations",
    dialogAuto: "Auto",
    dialogManual: "Manual",
    dialogStats: "Statistics",
    dialogFilters: "Filters",
    dialogClear: "Clear",
    dialogTotal: "Total",
    dialogCompletedCount: "Completed",
    dialogInProgress: "In Progress",
    dialogTotalTurns: "Total turns",
    dialogTotalDuration: "Total duration",
    dialogCategories: "Categories",
    dialogDifficulty: "Difficulty",
    dialogCategory: "Category",
    dialogSort: "Sort",
    dialogAll: "All",
    dialogBeginner: "Beginner",
    dialogIntermediate: "Intermediate",
    dialogAdvanced: "Advanced",
    dialogFavoritesList: "Favorites",
    dialogDefault: "Default",
    dialogNewest: "Newest",
    dialogOldest: "Oldest",
    dialogAlphabetical: "Alphabetical",
    dialogPopular: "Popular",
    dialogProgressSort: "Progress",
    dialogSearch: "Search dialogues... (Ctrl+K)",
    dialogNoResultsQuery: "No results for \"{query}\"",
    dialogNoDialogues: "No dialogues found",
    dialogTryDifferent: "Try a different search term",
    dialogComingSoon: "New dialogues coming soon",
    dialogClearFilters: "Clear filters",
    dialogShowingCount: "Showing {count} of {total}",
    dialogCompletedStatus: "{progressPercent}% completed",
    dialogRevealAll: "Reveal all",
    dialogHideAll: "Hide all",
    dialogTapToReveal: "tap to reveal translation",
    dialogGoToLesson: "Go to lesson",
    dialogNormal: "Normal",
    dialogInteractive: "Interactive",
    dialogFavorited: "Favorited",
    dialogSave: "Save",
    dialogEmpty: "Dialogue is empty",
    dialogNoData: "No data",
    dialogBackToNormal: "Back to normal",
    dialogInteractivePerfect: "🎉 Great! {score}/{total} correct answers",
    dialogInteractiveGood: "💪 {score}/{total} correct, keep going",
    dialogAllRevealed: "All translations revealed ✅",
    dialogAllHidden: "👁️ All translations hidden",
    dialogFavoritedBadge: "Favorited",
    dialogCompletedBadge: "Completed",
    dialogInteractiveBadge: "INTERACTIVE",
    dialogTurnsCount: "turns",
    dialogAudioCount: "audio",
    dialogDifficultyBeginner: "Beginner",
    dialogDifficultyIntermediate: "Intermediate",
    dialogDifficultyAdvanced: "Advanced",
    dialogCategoryDaily: "Daily",
    dialogCategoryTravel: "Travel",
    dialogCategoryFood: "Food",
    dialogCategoryFamily: "Family",
    dialogCategoryWork: "Work",
    dialogCategoryShopping: "Shopping",
    dialogCategoryHealth: "Health",
    dialogCategoryEducation: "Education",
    dialogCategoryEntertainment: "Entertainment",
    dialogCategorySocial: "Social",
  },
  hy: {
    loading: "Բեռնում...",
    back: "Հետ",
    continue: "Շարունակել",
    next: "Հաջորդ",
    previous: "Նախորդ",
    done: "Ավարտ",
    cancel: "Չեղարկել",
    save: "Պահել",
    delete: "Ջնջել",
    edit: "Խմբագրել",
    search: "Որոնել",
    noResults: "Արդյունքներ չեն գտնվել",
    error: "Սխալ",
    success: "Հաջողություն",
    welcome: "Բարի գալուստ",
    profile: "Պրոֆիլ",
    settings: "Կարգավորումներ",
    language: "Լեզու",
    theme: "Թեմա",
    dark: "Մուգ",
    light: "Բաց",
    system: "Համակարգային",
    lesson: "Դաս",
    lessons: "Դասեր",
    world: "Աշխարհ",
    worlds: "Աշխարհներ",
    dictionary: "Բառարան",
    dialogues: "Զրույցներ",
    curriculum: "Ծրագիր",
    progress: "Առաջընթաց",
    score: "Միավոր",
    hayq: "HAYQ",
    seeds: "Սերմեր",
    streak: "Շարք",
    crowns: "Պսակներ",
    level: "Մակարդակ",
    start: "Սկսել",
    resume: "Շարունակել",
    completed: "Ավարտված",
    locked: "Փակ",
    available: "Հասանելի",
    learn: "Սովորել",
    practice: "Պարապել",
    review: "Կրկնել",
    grammar: "Քերականություն",
    vocabulary: "Բառապաշար",
    translation: "Թարգմանություն",
    listening: "Լսում",
    speaking: "Խոսում",
    reading: "Ընթերցում",
    writing: "Գրում",
    multipleChoice: "Բազմակի ընտրություն",
    fillBlank: "Լրացնել բաց թողածը",
    wordOrder: "Բառերի դասավորություն",
    matching: "Զուգակցում",
    errorCorrection: "Սխալների ուղղում",
    perfect: "Կատարյալ",
    excellent: "Գերազանց",
    good: "Լավ",
    partial: "Մասնակի",
    incorrect: "Սխալ",
    hint: "Հուշում",
    explanation: "Բացատրություն",
    timeLimit: "Ժամանակի սահման",
    minutes: "րոպե",
    seconds: "վայրկյան",
    hours: "ժամ",
    days: "օր",
    weeks: "շաբաթ",
    months: "ամիս",
    years: "տարի",
    today: "Այսօր",
    yesterday: "Երեկ",
    tomorrow: "Վաղը",
    thisWeek: "Այս շաբաթ",
    thisMonth: "Այս ամիս",
    allTime: "Բոլոր ժամանակները",
    more: "Ավելին",
    less: "Քիչ",
    close: "Փակել",
    open: "Բացել",
    yes: "Այո",
    no: "Ոչ",
    ok: "Լավ",
    confirm: "Հաստատել",
    reset: "Վերականգնել",
    submit: "Ուղարկել",
    retry: "Կրկնել",
    home: "Սկիզբ",
    worldNav: "Դասեր",
    dict: "Բառ.",
    user: "Օգտ.",
    prog: "Ծրագիր",
    dial: "Զրույց",
    profileNav: "Պրոֆիլ",
    settingsNav: "Կարգ.",
    nurLingo: "NUR Lingo",
    footerDescription: "Հայկական առաջին բազմալեզու ուսուցում AI-ով, երկխոսություններով և HAYQ պարգևներով։",
    followUs: "Հետևեք մեզ",
    stayUpdated: "Տեղեկացված մնացեք",
    stayUpdatedDescription: "Ստացեք դասեր, նոր երկխոսություններ և HAYQ իրադարձություններ ձեր փոստում։",
    copyright: "© {year} NUR Lingo. Բոլոր իրավունքները պաշտպանված են։",
    garden: "Պարտեզ",
    userDictionary: "Օգտատիրոջ բառարան",
    languageSameError: "Մայրենին և սովորվողը չեն կարող նույնը լինել",
    dialogCount: "{count} երկխոսություն",
    dialogTurns: "💬 {count} տող",
    dialogFavorites: "⭐ {count} սիրված",
    dialogCompleted: "✅ {count} ավարտված",
    dialogWav: "🔊 WAV",
    dialogNuriHappy: "Հիանալի երկխոսություն! 🎉",
    dialogNuriSad: "Մի տխրիր, նորից փորձիր! 💪",
    dialogNuriIdle: "Սովորիր հայերենը զրույցների միջոցով! 💬 {count} երկխոսություն",
    dialogList: "Ցուցակ",
    dialogGrid: "Ցանց",
    dialogCompact: "Կոմպակտ",
    dialogAutoReveal: "Ավտոմատ ցուցադրել թարգմանությունները",
    dialogAuto: "Ավտո",
    dialogManual: "Ձեռքով",
    dialogStats: "Վիճակագրություն",
    dialogFilters: "Ֆիլտրեր",
    dialogClear: "Մաքրել",
    dialogTotal: "Ընդհանուր",
    dialogCompletedCount: "Ավարտված",
    dialogInProgress: "Ընթացքի մեջ",
    dialogTotalTurns: "Ընդհանուր տողեր",
    dialogTotalDuration: "Ընդհանուր տևողություն",
    dialogCategories: "Կատեգորիաներ",
    dialogDifficulty: "Դժվարություն",
    dialogCategory: "Կատեգորիա",
    dialogSort: "Տեսակավորում",
    dialogAll: "Բոլորը",
    dialogBeginner: "Սկսնակ",
    dialogIntermediate: "Միջին",
    dialogAdvanced: "Առաջադեմ",
    dialogFavoritesList: "Սիրվածներ",
    dialogDefault: "Լռելյայն",
    dialogNewest: "Նորագույն",
    dialogOldest: "Հինագույն",
    dialogAlphabetical: "Այբբենական",
    dialogPopular: "Հանրահայտ",
    dialogProgressSort: "Առաջընթաց",
    dialogSearch: "Փնտրել զրույցներ... (Ctrl+K)",
    dialogNoResultsQuery: "\"{query}\"-ով արդյունք չկա",
    dialogNoDialogues: "Զրույցներ չեն գտնվել",
    dialogTryDifferent: "Փորձեք այլ որոնման բառ",
    dialogComingSoon: "Նոր զրույցները շուտով կավելացվեն",
    dialogClearFilters: "Մաքրել ֆիլտրերը",
    dialogShowingCount: "Ցուցադրված է {count}-ը {total}-ից",
    dialogCompletedStatus: "{progressPercent}% ավարտված",
    dialogRevealAll: "Բոլորը",
    dialogHideAll: "Թաքցնել",
    dialogTapToReveal: "հպեք՝ թարգմանությունը տեսնելու",
    dialogGoToLesson: "Գնալ դասին",
    dialogNormal: "Սովորական",
    dialogInteractive: "Ինտերակտիվ",
    dialogFavorited: "Սիրված",
    dialogSave: "Պահել",
    dialogEmpty: "Զրույցը դատարկ է",
    dialogNoData: "Տվյալներ չկան",
    dialogBackToNormal: "Վերադառնալ սովորական",
    dialogInteractivePerfect: "🎉 Հիանալի! {score}/{total} ճիշտ պատասխան",
    dialogInteractiveGood: "💪 {score}/{total} ճիշտ, շարունակի՛ր",
    dialogAllRevealed: "Բոլոր թարգմանությունները ցուցադրվեցին ✅",
    dialogAllHidden: "👁️ Բոլոր թարգմանությունները թաքցվեցին",
    dialogFavoritedBadge: "Սիրված",
    dialogCompletedBadge: "Ավարտված",
    dialogInteractiveBadge: "ԻՆՏԵՐԱԿՏԻՎ",
    dialogTurnsCount: "տող",
    dialogAudioCount: "աուդիո",
    dialogDifficultyBeginner: "Սկսնակ",
    dialogDifficultyIntermediate: "Միջին",
    dialogDifficultyAdvanced: "Առաջադեմ",
    dialogCategoryDaily: "Առօրյա",
    dialogCategoryTravel: "Ճանապարհորդություն",
    dialogCategoryFood: "Սնունդ",
    dialogCategoryFamily: "Ընտանիք",
    dialogCategoryWork: "Աշխատանք",
    dialogCategoryShopping: "Գնումներ",
    dialogCategoryHealth: "Առողջություն",
    dialogCategoryEducation: "Կրթություն",
    dialogCategoryEntertainment: "Ժամանց",
    dialogCategorySocial: "Հասարակական",
  },
  ru: {
    loading: "Загрузка...",
    back: "Назад",
    continue: "Продолжить",
    next: "Далее",
    previous: "Назад",
    done: "Готово",
    cancel: "Отмена",
    save: "Сохранить",
    delete: "Удалить",
    edit: "Редактировать",
    search: "Поиск",
    noResults: "Результатов не найдено",
    error: "Ошибка",
    success: "Успешно",
    welcome: "Добро пожаловать",
    profile: "Профиль",
    settings: "Настройки",
    language: "Язык",
    theme: "Тема",
    dark: "Тёмная",
    light: "Светлая",
    system: "Системная",
    lesson: "Урок",
    lessons: "Уроки",
    world: "Мир",
    worlds: "Миры",
    dictionary: "Словарь",
    dialogues: "Диалоги",
    curriculum: "Программа",
    progress: "Прогресс",
    score: "Очки",
    hayq: "HAYQ",
    seeds: "Семена",
    streak: "Серия",
    crowns: "Короны",
    level: "Уровень",
    start: "Начать",
    resume: "Продолжить",
    completed: "Завершено",
    locked: "Закрыто",
    available: "Доступно",
    learn: "Учить",
    practice: "Практика",
    review: "Повтор",
    grammar: "Грамматика",
    vocabulary: "Словарный запас",
    translation: "Перевод",
    listening: "Аудирование",
    speaking: "Говорение",
    reading: "Чтение",
    writing: "Письмо",
    multipleChoice: "Множественный выбор",
    fillBlank: "Заполнить пропуск",
    wordOrder: "Порядок слов",
    matching: "Сопоставление",
    errorCorrection: "Исправление ошибок",
    perfect: "Идеально",
    excellent: "Отлично",
    good: "Хорошо",
    partial: "Частично",
    incorrect: "Неправильно",
    hint: "Подсказка",
    explanation: "Объяснение",
    timeLimit: "Лимит времени",
    minutes: "минут",
    seconds: "секунд",
    hours: "часов",
    days: "дней",
    weeks: "недель",
    months: "месяцев",
    years: "лет",
    today: "Сегодня",
    yesterday: "Вчера",
    tomorrow: "Завтра",
    thisWeek: "На этой неделе",
    thisMonth: "В этом месяце",
    allTime: "За всё время",
    more: "Больше",
    less: "Меньше",
    close: "Закрыть",
    open: "Открыть",
    yes: "Да",
    no: "Нет",
    ok: "ОК",
    confirm: "Подтвердить",
    reset: "Сбросить",
    submit: "Отправить",
    retry: "Повторить",
    home: "Главная",
    worldNav: "Мир",
    dict: "Слов.",
    user: "Польз.",
    prog: "Прог.",
    dial: "Диал.",
    profileNav: "Профиль",
    settingsNav: "Настройки",
    nurLingo: "NUR Lingo",
    footerDescription: "Армяно-ориентированное многоязычное обучение с ИИ, диалогами и наградами HAYQ.",
    followUs: "Подписывайтесь",
    stayUpdated: "Будьте в курсе",
    stayUpdatedDescription: "Получайте уроки, новые диалоги и события HAYQ на почту.",
    copyright: "© {year} NUR Lingo. Все права защищены.",
    garden: "Сад",
    userDictionary: "Словарь пользователя",
    languageSameError: "Родной и изучаемый языки не могут совпадать",
    dialogCount: "{count} диалогов",
    dialogTurns: "💬 {count} строк",
    dialogFavorites: "⭐ {count} избранных",
    dialogCompleted: "✅ {count} завершено",
    dialogWav: "🔊 WAV",
    dialogNuriHappy: "Отличный диалог! 🎉",
    dialogNuriSad: "Не грусти, попробуй снова! 💪",
    dialogNuriIdle: "Учи армянский через разговоры! 💬 {count} диалогов",
    dialogList: "Список",
    dialogGrid: "Сетка",
    dialogCompact: "Компактный",
    dialogAutoReveal: "Авто-показ переводов",
    dialogAuto: "Авто",
    dialogManual: "Вручную",
    dialogStats: "Статистика",
    dialogFilters: "Фильтры",
    dialogClear: "Очистить",
    dialogTotal: "Всего",
    dialogCompletedCount: "Завершено",
    dialogInProgress: "В процессе",
    dialogTotalTurns: "Всего строк",
    dialogTotalDuration: "Общая длительность",
    dialogCategories: "Категории",
    dialogDifficulty: "Сложность",
    dialogCategory: "Категория",
    dialogSort: "Сортировка",
    dialogAll: "Все",
    dialogBeginner: "Начинающий",
    dialogIntermediate: "Средний",
    dialogAdvanced: "Продвинутый",
    dialogFavoritesList: "Избранные",
    dialogDefault: "По умолчанию",
    dialogNewest: "Новые",
    dialogOldest: "Старые",
    dialogAlphabetical: "По алфавиту",
    dialogPopular: "Популярные",
    dialogProgressSort: "Прогресс",
    dialogSearch: "Поиск диалогов... (Ctrl+K)",
    dialogNoResultsQuery: "Нет результатов для \"{query}\"",
    dialogNoDialogues: "Диалоги не найдены",
    dialogTryDifferent: "Попробуйте другой поисковый запрос",
    dialogComingSoon: "Новые диалоги скоро появятся",
    dialogClearFilters: "Очистить фильтры",
    dialogShowingCount: "Показано {count} из {total}",
    dialogCompletedStatus: "{progressPercent}% завершено",
    dialogRevealAll: "Показать все",
    dialogHideAll: "Скрыть все",
    dialogTapToReveal: "нажмите, чтобы увидеть перевод",
    dialogGoToLesson: "Перейти к уроку",
    dialogNormal: "Обычный",
    dialogInteractive: "Интерактивный",
    dialogFavorited: "Избранное",
    dialogSave: "Сохранить",
    dialogEmpty: "Диалог пуст",
    dialogNoData: "Нет данных",
    dialogBackToNormal: "Вернуться к обычному",
    dialogInteractivePerfect: "🎉 Отлично! {score}/{total} правильных ответов",
    dialogInteractiveGood: "💪 {score}/{total} правильно, продолжай",
    dialogAllRevealed: "Все переводы показаны ✅",
    dialogAllHidden: "👁️ Все переводы скрыты",
    dialogFavoritedBadge: "Избранное",
    dialogCompletedBadge: "Завершено",
    dialogInteractiveBadge: "ИНТЕРАКТИВНЫЙ",
    dialogTurnsCount: "строк",
    dialogAudioCount: "аудио",
    dialogDifficultyBeginner: "Начинающий",
    dialogDifficultyIntermediate: "Средний",
    dialogDifficultyAdvanced: "Продвинутый",
    dialogCategoryDaily: "Ежедневные",
    dialogCategoryTravel: "Путешествия",
    dialogCategoryFood: "Еда",
    dialogCategoryFamily: "Семья",
    dialogCategoryWork: "Работа",
    dialogCategoryShopping: "Покупки",
    dialogCategoryHealth: "Здоровье",
    dialogCategoryEducation: "Образование",
    dialogCategoryEntertainment: "Развлечения",
    dialogCategorySocial: "Социальные",
  },
} as const;

// ─── LANGUAGE CONFIG ─────────────────────────────────────────────────

const STORAGE_KEYS = {
  config: "nur_language_config",
  native: "nur_source_lang",
  learning: "nur_target_lang",
  pair: "nur_lang_pair",
  preference: "nur_language_preference",
} as const;

export function loadLangConfig(): LangConfig | null {
  if (typeof window === "undefined") return null;
  
  try {
    const unified = localStorage.getItem(STORAGE_KEYS.config);
    if (unified) {
      const parsed = JSON.parse(unified);
      if (parsed?.native && parsed?.learning) {
        const native = parsed.native as LangCode;
        const learning = parsed.learning as LangCode;
        if (['en', 'hy', 'ru'].includes(native) && ['en', 'hy', 'ru'].includes(learning)) {
          return {
            native,
            learning,
            pair: `${native}-${learning}` as LangPair,
          };
        }
      }
    }

    const source = localStorage.getItem(STORAGE_KEYS.native) as LangCode;
    const target = localStorage.getItem(STORAGE_KEYS.learning) as LangCode;
    if (source && target && ['en', 'hy', 'ru'].includes(source) && ['en', 'hy', 'ru'].includes(target)) {
      return { native: source, learning: target, pair: `${source}-${target}` as LangPair };
    }

    const pref = localStorage.getItem(STORAGE_KEYS.preference) as LangCode;
    if (pref && ['en', 'hy', 'ru'].includes(pref)) {
      const native = pref;
      const learning = native === 'hy' ? 'en' : 'hy';
      return { native, learning, pair: `${native}-${learning}` as LangPair };
    }

    return null;
  } catch {
    return null;
  }
}

export function saveLangConfig(config: LangConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify({
      native: config.native,
      learning: config.learning,
    }));
    
    localStorage.setItem(STORAGE_KEYS.native, config.native);
    localStorage.setItem(STORAGE_KEYS.learning, config.learning);
    localStorage.setItem(STORAGE_KEYS.pair, config.pair);
    localStorage.setItem(STORAGE_KEYS.preference, config.native);
    
    window.dispatchEvent(new CustomEvent("langchange", { detail: config }));
  } catch {
    // localStorage unavailable
  }
}

export function getDefaultLangConfig(): LangConfig {
  if (typeof window === "undefined") {
    return { pair: "hy-en", native: "hy", learning: "en" };
  }
  
  const stored = loadLangConfig();
  if (stored) return stored;
  
  try {
    const browserLang = navigator.language.split("-")[0] as LangCode;
    if (browserLang === "hy") {
      return { pair: "hy-en", native: "hy", learning: "en" };
    }
    if (browserLang === "ru") {
      return { pair: "ru-en", native: "ru", learning: "en" };
    }
  } catch {}
  
  return { pair: "hy-en", native: "hy", learning: "en" };
}

// ─── HELPERS ─────────────────────────────────────────────────────────

export function getLangName(code: LangCode, lang: LangCode = "en"): string {
  return LANG_NAMES[code]?.[lang] ?? code;
}

export function getLangEmoji(code: LangCode): string {
  return LANG_EMOJIS[code] ?? "🌐";
}

export function getLangFlag(code: LangCode): string {
  return LANG_FLAGS[code] ?? "🏳️";
}

export function getUIString(key: keyof UIStrings, lang: LangCode = "en"): string {
  return UI_STRINGS[lang]?.[key] ?? UI_STRINGS.en[key] ?? key;
}

export function getOppositeLang(code: LangCode): LangCode {
  const opposites: Record<LangCode, LangCode> = {
    en: "hy",
    hy: "en",
    ru: "en",
  };
  return opposites[code] ?? "en";
}

export function getAllPairs(): LangPair[] {
  return ["en-hy", "hy-en", "ru-hy", "hy-ru", "en-ru", "ru-en"];
}

export function isValidPair(pair: string): pair is LangPair {
  return getAllPairs().includes(pair as LangPair);
}

export function getPairFromCodes(native: LangCode, learning: LangCode): LangPair {
  return `${native}-${learning}` as LangPair;
}

export function getCodesFromPair(pair: LangPair): { native: LangCode; learning: LangCode } {
  const [native, learning] = pair.split("-") as [LangCode, LangCode];
  return { native, learning };
}

// ─── TRANSLATION HELPERS ─────────────────────────────────────────────

export interface Translation {
  en: string;
  hy: string;
  ru: string;
}

export function getTranslation(translation: Translation, lang: LangCode): string {
  return translation[lang] ?? translation.en;
}

// ─── REACT HOOK ──────────────────────────────────────────────────────

export function useLang() {
  const [config, setConfig] = useState<LangConfig | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cfg = loadLangConfig();
    setConfig(cfg || getDefaultLangConfig());
  }, []);

  const setLanguage = (native: LangCode, learning: LangCode) => {
    const newConfig = { pair: getPairFromCodes(native, learning), native, learning };
    saveLangConfig(newConfig);
    setConfig(newConfig);
  };

  const t = (key: keyof UIStrings): string => {
    const lang = config?.native || "en";
    return getUIString(key, lang);
  };

  return {
    config,
    native: config?.native || "en",
    learning: config?.learning || "hy",
    setLanguage,
    t,
    mounted,
  };
}

// ─── EXPORT ──────────────────────────────────────────────────────────

export default {
  LANG_NAMES,
  LANG_EMOJIS,
  LANG_FLAGS,
  UI_STRINGS,
  loadLangConfig,
  saveLangConfig,
  getDefaultLangConfig,
  getLangName,
  getLangEmoji,
  getLangFlag,
  getUIString,
  getOppositeLang,
  getAllPairs,
  isValidPair,
  getPairFromCodes,
  getCodesFromPair,
  getTranslation,
  useLang,
};