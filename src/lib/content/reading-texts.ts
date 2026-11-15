// src/lib/content/reading-texts.ts

export interface ReadingPart {
  en: string;
  ru: string;
  hy?: string; // Ապագայում հայերեն թարգմանության համար
}

export interface ReadingText {
  id: string;
  level: "A1" | "A2" | "B1" | "B2";
  topics: string[];
  title: string;
  ru: string;
  hy?: string;
  format: string;
  difficulty: number;
  words: number;
  minutes: number;
  parts: number;
  questions: number;
  vocabulary: string[];
  // Փաստացի տեքստը (քանի որ JSON-ում չկար, սա պետք է լցնել)
  content?: ReadingPart[]; 
}

export const READING_TEXTS: ReadingText[] = [
  {
    id: "trial-a1-day",
    level: "A1",
    topics: ["daily", "relationships"],
    title: "A Free Trial Lesson",
    ru: "Бесплатный пробный урок",
    hy: "Անվճար փորձնական դաս",
    format: "Story",
    difficulty: 1,
    words: 355,
    minutes: 4,
    parts: 5,
    questions: 8,
    vocabulary: ["v-trial-a1-day-0", "v-trial-a1-day-1", "v-trial-a1-day-2"],
    // ✅ Օրինակի համար ավելացված տեքստ (քո JSON-ից)
    content: [
      {
        en: "On Saturday, I get up at eight and open the kitchen window. Anna makes tea, and I put bread, cheese and two cups on the table.",
        ru: "В субботу я встаю в восемь и открываю окно на кухне. Анна заваривает чай, а я ставлю на стол хлеб, сыр и две чашки."
      },
      {
        en: "We have breakfast together and talk about our week.",
        ru: "Мы завтракаем вместе и рассказываем друг другу, как прошла неделя."
      },
      {
        en: "Anna works in a school, and she always has funny stories about her day.",
        ru: "Анна работает в школе, и у неё всегда есть забавные истории о том, как проходит её день."
      },
      {
        en: "I work in a bookshop, so I often tell her about new books.",
        ru: "Я работаю в книжном магазине, поэтому часто рассказываю ей о новых книгах."
      }
    ]
  },
  {
    id: "r01",
    level: "A1",
    topics: ["people", "relationships"],
    title: "The New Neighbour",
    ru: "Новый сосед",
    hy: "Նոր հարևանը",
    format: "Dialogue",
    difficulty: 1,
    words: 62,
    minutes: 1,
    parts: 1,
    questions: 3,
    vocabulary: ["v-r01-0", "v-r01-1", "v-r01-2"],
  },
  // ... մնացած 300+ տեքստերը կարող ես ավելացնել այստեղ
];

export const TOPICS_MAP: Record<string, { en: string; hy: string; ru: string }> = {
  people: { en: "People & Family", hy: "Մարդիկ և Ընտանիք", ru: "Люди и семья" },
  daily: { en: "Daily Life", hy: "Առօրյա Կյանք", ru: "Дом и повседневная жизнь" },
  food: { en: "Food & Shopping", hy: "Ուտելիք և Գնումներ", ru: "Еда и покупки" },
  city: { en: "City & Transport", hy: "Քաղաք և Տրանսպորտ", ru: "Город и транспорт" },
  travel: { en: "Travel", hy: "Ճանապարհորդություն", ru: "Путешествия" },
  work: { en: "Work & Jobs", hy: "Աշխատանք", ru: "Работа и профессии" },
  learning: { en: "Learning", hy: "Ուսուցում", ru: "Учёба и новые навыки" },
  hobbies: { en: "Hobbies", hy: "Հոբբի", ru: "Хобби и свободное время" },
  health: { en: "Health", hy: "Առողջություն", ru: "Здоровье и образ жизни" },
  nature: { en: "Nature", hy: "Բնություն", ru: "Животные и природа" },
  tech: { en: "Tech", hy: "Տեխնոլոգիաներ", ru: "Технологии и интернет" },
  culture: { en: "Culture", hy: "Մշակույթ", ru: "Культура и традиции" },
  stories: { en: "Stories", hy: "Պատմություններ", ru: "Истории и приключения" },
  society: { en: "Society", hy: "Հասարակություն", ru: "Общество и современные вопросы" },
  science: { en: "Science", hy: "Գիտություն", ru: "Наука и открытия" },
  history: { en: "History", hy: "Պատմություն", ru: "История и биографии" },
  money: { en: "Money", hy: "Ֆինանսներ", ru: "Деньги и решения" },
  relationships: { en: "Relationships", hy: "Հարաբերություններ", ru: "Общение и отношения" },
  media: { en: "Media", hy: "Մեդիա", ru: "Медиа и информация" },
};