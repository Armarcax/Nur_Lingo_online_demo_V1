// src/lib/content/visual-lessons.ts

export interface VisualItem {
  id: string;
  en: string;
  hy: string;
  ru: string;
  emoji?: string;
  highlightWord?: string;
  example_en?: string;
  example_hy?: string;
  example_ru?: string;
}

export interface VisualLesson {
  id: string;
  title: { en: string; hy: string; ru: string };
  category: "Grammar" | "Vocabulary" | "Phrases";
  icon: string;
  gradient: string;
  items: VisualItem[];
}

export const VISUAL_LESSONS: VisualLesson[] = [
  // 🟢 ՄՈԴՈՒԼ 1: ԱՌԱՋԻՆ ՔԱՅԼԵՐԸ (Basics & Greetings)
  {
    id: "greetings",
    title: { en: "Daily Greetings", hy: "Ամենօրյա Ողջույններ", ru: "Ежедневные Приветствия" },
    category: "Phrases",
    icon: "👋",
    gradient: "from-blue-500 to-cyan-400",
    items: [
      { id: "g1", en: "Hello!", hy: "Բարև:", ru: "Привет!", emoji: "🙋‍♂️" },
      { id: "g2", en: "How are you?", hy: "Ինչպե՞ս ես:", ru: "Как дела?", emoji: "🤔" },
      { id: "g3", en: "I'm fine, thank you!", hy: "Լավ եմ, շնորհակալություն:", ru: "Хорошо, спасибо!", emoji: "👍" },
      { id: "g4", en: "And you?", hy: "Իսկ դու՞:", ru: "А ты?", emoji: "👉" },
      { id: "g5", en: "I'm good!", hy: "Լավ եմ:", ru: "Я в порядке!", emoji: "😊" },
      { id: "g6", en: "I'm tired.", hy: "Ես հոգնած եմ:", ru: "Я устал.", emoji: "😴" },
      { id: "g7", en: "I'm hungry.", hy: "Ես քաղցած եմ:", ru: "Я голоден.", emoji: "🍔" },
      { id: "g8", en: "I'm thirsty.", hy: "Ես ծարավ եմ:", ru: "Я хочу пить.", emoji: "🥤" },
      { id: "g9", en: "I'm happy!", hy: "Ես երջանիկ եմ:", ru: "Я счастлив!", emoji: "🥳" },
      { id: "g10", en: "I'm cold.", hy: "Ես մրսում եմ:", ru: "Мне холодно.", emoji: "🥶" },
      { id: "g11", en: "I'm hot.", hy: "Ես շոգում եմ:", ru: "Мне жарко.", emoji: "🥵" },
      { id: "g12", en: "Bye!", hy: "Ցտեսություն:", ru: "Пока!", emoji: "👋" },
    ],
  },
  {
    id: "basic_words",
    title: { en: "Basic Words", hy: "Հիմնական Բառեր", ru: "Базовые Слова" },
    category: "Vocabulary",
    icon: "🔤",
    gradient: "from-cyan-500 to-blue-500",
    items: [
      { id: "bw1", en: "I", hy: "Ես", ru: "Я", emoji: "🙋‍♂️" },
      { id: "bw2", en: "You", hy: "Դու", ru: "Ты", emoji: "👉" },
      { id: "bw3", en: "We", hy: "Մենք", ru: "Мы", emoji: "👨‍👩‍👧" },
      { id: "bw4", en: "This", hy: "Սա", ru: "Это", emoji: "👇" },
      { id: "bw5", en: "That", hy: "Այն", ru: "То", emoji: "👉" },
      { id: "bw6", en: "Friend", hy: "Ընկեր", ru: "Друг", emoji: "🤝" },
      { id: "bw7", en: "Book", hy: "Գիրք", ru: "Книга", emoji: "📖" },
      { id: "bw8", en: "Home", hy: "Տուն", ru: "Дом", emoji: "🏠" },
    ],
  },

  // 🟡 ՄՈԴՈՒԼ 2: ԱՌՕՐՅԱ ԿՅԱՆՔ (Daily Life & Routines)
  {
    id: "morning_routine",
    title: { en: "Morning Routine", hy: "Առավոտյան Առօրյա", ru: "Утренняя Рутина" },
    category: "Vocabulary",
    icon: "🌅",
    gradient: "from-amber-400 to-orange-500",
    items: [
      { id: "m1", en: "I wake up early.", hy: "Ես շուտ եմ արթնանում:", ru: "Я рано просыпаюсь.", emoji: "⏰", highlightWord: "wake up" },
      { id: "m2", en: "I get out of bed.", hy: "Ես վեր եմ կենում անկողնուց:", ru: "Я встаю с кровати.", emoji: "🛏️", highlightWord: "get out" },
      { id: "m3", en: "I make my bed.", hy: "Ես հարթում եմ անկողինը:", ru: "Я заправляю кровать.", emoji: "🧹", highlightWord: "make" },
      { id: "m4", en: "I open the window.", hy: "Ես բացում եմ պատուհանը:", ru: "Я открываю окно.", emoji: "🪟", highlightWord: "open" },
      { id: "m5", en: "I wash my face.", hy: "Ես լվանում եմ երեսս:", ru: "Я умываюсь.", emoji: "🧼", highlightWord: "wash" },
      { id: "m6", en: "I brush my teeth.", hy: "Ես լվանում եմ ատամներս:", ru: "Я чищу зубы.", emoji: "🪥", highlightWord: "brush" },
      { id: "m7", en: "I take a shower.", hy: "Ես ցնցուղ եմ ընդունում:", ru: "Я принимаю душ.", emoji: "🚿", highlightWord: "take" },
      { id: "m8", en: "I get dressed.", hy: "Ես հագնվում եմ:", ru: "Я одеваюсь.", emoji: "👕", highlightWord: "get dressed" },
      { id: "m9", en: "I eat breakfast.", hy: "Ես նախաճաշում եմ:", ru: "Я завтракаю.", emoji: "🍳", highlightWord: "eat" },
    ],
  },
  {
    id: "cleaning",
    title: { en: "Washing & Cleaning", hy: "Մաքրություն", ru: "Уборка" },
    category: "Vocabulary",
    icon: "🧽",
    gradient: "from-orange-400 to-amber-500",
    items: [
      { id: "c1", en: "I'm washing my hands.", hy: "Ես լվանում եմ ձեռքերս:", ru: "Я мою руки.", emoji: "🧼" },
      { id: "c2", en: "I'm washing my hair.", hy: "Ես լվանում եմ մազերս:", ru: "Я мою волосы.", emoji: "🚿" },
      { id: "c3", en: "I'm washing the dishes.", hy: "Ես լվանում եմ ամանները:", ru: "Я мою посуду.", emoji: "🍽️" },
      { id: "c4", en: "I'm cleaning the car.", hy: "Ես մաքրում եմ մեքենան:", ru: "Я мою машину.", emoji: "🚗" },
      { id: "c5", en: "I'm cleaning my shoes.", hy: "Ես մաքրում եմ կոշիկներս:", ru: "Я чищу обувь.", emoji: "👟" },
      { id: "c6", en: "I'm cleaning the kitchen.", hy: "Ես մաքրում եմ խոհանոցը:", ru: "Я убираю на кухне.", emoji: "🧹" },
    ],
  },

  // 🔵 ՄՈԴՈՒԼ 3: ՀԻՄՆԱԿԱՆ ՔԵՐԱԿԱՆՈՒԹՅՈՒՆ (Core Grammar)
  {
    id: "am_is_are",
    title: { en: "Am / Is / Are", hy: "Լինել (Am/Is/Are)", ru: "Быть (Am/Is/Are)" },
    category: "Grammar",
    icon: "🔤",
    gradient: "from-emerald-500 to-teal-400",
    items: [
      { id: "a1", en: "I am a student.", hy: "Ես աշակերտ եմ:", ru: "Я студент.", emoji: "🧑‍🎓", highlightWord: "am" },
      { id: "a2", en: "She is my friend.", hy: "Նա իմ ընկերուհին է:", ru: "Она моя подруга.", emoji: "👩", highlightWord: "is" },
      { id: "a3", en: "He is a teacher.", hy: "Նա ուսուցիչ է:", ru: "Он учитель.", emoji: "👨‍🏫", highlightWord: "is" },
      { id: "a4", en: "You are very kind.", hy: "Դու շատ բարի ես:", ru: "Ты очень добрый.", emoji: "🤝", highlightWord: "are" },
      { id: "a5", en: "We are ready.", hy: "Մենք պատրաստ ենք:", ru: "Мы готовы.", emoji: "✅", highlightWord: "are" },
      { id: "a6", en: "They are at home.", hy: "Նրանք տանն են:", ru: "Они дома.", emoji: "🏠", highlightWord: "are" },
    ],
  },
  {
    id: "have_has",
    title: { en: "Have or Has?", hy: "Ունենալ (Have/Has)", ru: "Иметь (Have/Has)" },
    category: "Grammar",
    icon: "📝",
    gradient: "from-purple-500 to-pink-500",
    items: [
      { id: "h1", en: "I have a new watch.", hy: "Ես նոր ժամացույց ունեմ:", ru: "У меня есть новые часы.", emoji: "⌚", highlightWord: "have" },
      { id: "h2", en: "You have a good idea.", hy: "Դու լավ միտք ունես:", ru: "У тебя хорошая идея.", emoji: "💡", highlightWord: "have" },
      { id: "h3", en: "He has a black jacket.", hy: "Նա սև բաճկոն ունի:", ru: "У него черная куртка.", emoji: "🧥", highlightWord: "has" },
      { id: "h4", en: "She has a cute puppy.", hy: "Նա սիրուն շնիկ ունի:", ru: "У нее милый щенок.", emoji: "🐶", highlightWord: "has" },
      { id: "h5", en: "They have a big house.", hy: "Նրանք մեծ տուն ունեն:", ru: "У них большой дом.", emoji: "🏠", highlightWord: "have" },
      { id: "h6", en: "It has a long tail.", hy: "Այն երկար պոչ ունի:", ru: "У него длинный хвост.", emoji: "🐈", highlightWord: "has" },
    ],
  },

  // 🟣 ՄՈԴՈՒԼ 4: ՀԱՐՑԵՐ ԵՎ ՊԱՏԱՍԽԱՆՆԵՐ (Questions & Answers)
  {
    id: "question_words",
    title: { en: "Question Words", hy: "Հարցական Բառեր", ru: "Вопросительные Слова" },
    category: "Grammar",
    icon: "❓",
    gradient: "from-indigo-500 to-blue-500",
    items: [
      { id: "q1", en: "How", hy: "Ինչպե՞ս", ru: "Как", emoji: "⚙️" },
      { id: "q2", en: "When", hy: "Ե՞րբ", ru: "Когда", emoji: "⏳" },
      { id: "q3", en: "Where", hy: "Որտե՞ղ", ru: "Где", emoji: "📍" },
      { id: "q4", en: "What", hy: "Ի՞նչ", ru: "Что", emoji: "🤷‍♂️" },
      { id: "q5", en: "Who", hy: "Ո՞վ", ru: "Кто", emoji: "🧑" },
      { id: "q6", en: "Why", hy: "Ինչո՞ւ", ru: "Почему", emoji: "🤔" },
    ],
  },
  {
    id: "do_you_questions",
    title: { en: "Do you...?", hy: "Do you...? (Հարցեր)", ru: "Вопросы с Do you...?" },
    category: "Phrases",
    icon: "🗣️",
    gradient: "from-blue-600 to-indigo-500",
    items: [
      { id: "dq1", en: "Do you know?", hy: "Գիտե՞ս:", ru: "Ты знаешь?", emoji: "🤔" },
      { id: "dq2", en: "Do you agree?", hy: "Համաձա՞յն ես:", ru: "Ты согласен?", emoji: "🤝" },
      { id: "dq3", en: "Do you like it?", hy: "Հավանո՞ւմ ես:", ru: "Тебе нравится?", emoji: "❤️" },
      { id: "dq4", en: "Do you speak English?", hy: "Անգլերեն խոսո՞ւմ ես:", ru: "Ты говоришь по-английски?", emoji: "🇬🇧" },
      { id: "dq5", en: "Yes, I do.", hy: "Այո, այո:", ru: "Да, я делаю.", emoji: "✅" },
      { id: "dq6", en: "No, I don't.", hy: "Ոչ, չեմ:", ru: "Нет, я не делаю.", emoji: "❌" },
    ],
  },

  // 🟠 ՄՈԴՈՒԼ 5: ՆԱԽԴԻՐՆԵՐ (Prepositions)
  {
    id: "prepositions",
    title: { en: "Prepositions", hy: "Նախդիրներ", ru: "Предлоги" },
    category: "Grammar",
    icon: "📦",
    gradient: "from-rose-500 to-red-500",
    items: [
      { id: "p1", en: "in", hy: "մեջ", ru: "в", example_en: "The cat is in the box.", example_hy: "Կատուն տուփի մեջ է:", example_ru: "Кошка в коробке.", emoji: "📦" },
      { id: "p2", en: "on", hy: "վրա", ru: "на", example_en: "The cat is on the table.", example_hy: "Կատուն սեղանի վրա է:", example_ru: "Кошка на столе.", emoji: "🪑" },
      { id: "p3", en: "under", hy: "տակ", ru: "под", example_en: "The cat is under the table.", example_hy: "Կատուն սեղանի տակ է:", example_ru: "Кошка под столом.", emoji: "🔽" },
      { id: "p4", en: "behind", hy: "հետևում", ru: "за", example_en: "The cat is behind the bush.", example_hy: "Կատուն թփի հետևում է:", example_ru: "Кошка за кустом.", emoji: "🌳" },
      { id: "p5", en: "next to", hy: "կողքին", ru: "рядом", example_en: "The cat is next to the plant.", example_hy: "Կատուն բույսի կողքին է:", example_ru: "Кошка рядом с растением.", emoji: "🌿" },
    ],
  },

  // 🔴 ՄՈԴՈՒԼ 6: ԲԱՅԵՐ ԵՎ ԳՈՐԾՈՂՈՒԹՅՈՒՆՆԵՐ (Verbs)
  {
    id: "action_verbs",
    title: { en: "Action Verbs", hy: "Գործողության Բայեր", ru: "Глаголы Действия" },
    category: "Vocabulary",
    icon: "🏃",
    gradient: "from-red-500 to-rose-400",
    items: [
      { id: "v1", en: "Eat", hy: "Ուտել", ru: "Кушать", emoji: "🍔" },
      { id: "v2", en: "Drink", hy: "Խմել", ru: "Пить", emoji: "🥤" },
      { id: "v3", en: "Go", hy: "Գնալ", ru: "Идти", emoji: "🚶" },
      { id: "v4", en: "Come", hy: "Գալ", ru: "Приходить", emoji: "🏃" },
      { id: "v5", en: "See", hy: "Տեսնել", ru: "Видеть", emoji: "👀" },
      { id: "v6", en: "Read", hy: "Կարդալ", ru: "Читать", emoji: "📖" },
      { id: "v7", en: "Write", hy: "Գրել", ru: "Писать", emoji: "✍️" },
      { id: "v8", en: "Speak", hy: "Խոսել", ru: "Говорить", emoji: "🗣️" },
    ],
  },
  {
    id: "go_phrasal",
    title: { en: "Go Phrases", hy: "Go Բայի Արտահայտություններ", ru: "Фразы с Go" },
    category: "Vocabulary",
    icon: "🚶",
    gradient: "from-pink-500 to-rose-500",
    items: [
      { id: "gp1", en: "Go on", hy: "Շարունակել", ru: "Продолжать", emoji: "➡️" },
      { id: "gp2", en: "Go up", hy: "Բարձրանալ", ru: "Подниматься", emoji: "⬆️" },
      { id: "gp3", en: "Go down", hy: "Իջնել", ru: "Спускаться", emoji: "⬇️" },
      { id: "gp4", en: "Go out", hy: "Դուրս գալ", ru: "Выходить", emoji: "🚪" },
      { id: "gp5", en: "Go back", hy: "Վերադառնալ", ru: "Возвращаться", emoji: "🔙" },
    ],
  },

  // 🟤 ՄՈԴՈՒԼ 7: ԹԵՄԱՏԻԿ ԲԱՌԱՊԱՇԱՐ (Thematic Vocab)
  {
    id: "colors",
    title: { en: "Colors", hy: "Գույներ", ru: "Цвета" },
    category: "Vocabulary",
    icon: "🎨",
    gradient: "from-fuchsia-500 to-pink-500",
    items: [
      { id: "col1", en: "Red", hy: "Կարմիր", ru: "Красный", emoji: "🍎" },
      { id: "col2", en: "Blue", hy: "Կապույտ", ru: "Синий", emoji: "🚙" },
      { id: "col3", en: "Green", hy: "Կանաչ", ru: "Зеленый", emoji: "🍃" },
      { id: "col4", en: "Yellow", hy: "Դեղին", ru: "Желтый", emoji: "☀️" },
      { id: "col5", en: "Black", hy: "Սև", ru: "Черный", emoji: "🐈‍⬛" },
      { id: "col6", en: "White", hy: "Սպիտակ", ru: "Белый", emoji: "🐇" },
    ],
  },
  {
    id: "fruits",
    title: { en: "Fruits", hy: "Մրգեր", ru: "Фрукты" },
    category: "Vocabulary",
    icon: "🍎",
    gradient: "from-red-400 to-orange-400",
    items: [
      { id: "f1", en: "Apple", hy: "Խնձոր", ru: "Яблоко", emoji: "🍎" },
      { id: "f2", en: "Banana", hy: "Բանան", ru: "Банан", emoji: "🍌" },
      { id: "f3", en: "Orange", hy: "Նարինջ", ru: "Апельсин", emoji: "🍊" },
      { id: "f4", en: "Grapes", hy: "Խաղող", ru: "Виноград", emoji: "🍇" },
      { id: "f5", en: "Strawberry", hy: "Ելակ", ru: "Клубника", emoji: "🍓" },
      { id: "f6", en: "Watermelon", hy: "Ձմերուկ", ru: "Арбуз", emoji: "🍉" },
    ],
  },
  {
    id: "vegetables",
    title: { en: "Vegetables", hy: "Բանջարեղեն", ru: "Овощи" },
    category: "Vocabulary",
    icon: "🥕",
    gradient: "from-green-500 to-lime-400",
    items: [
      { id: "veg1", en: "Carrot", hy: "Գազար", ru: "Морковь", emoji: "🥕" },
      { id: "veg2", en: "Potato", hy: "Կարտոֆիլ", ru: "Картофель", emoji: "🥔" },
      { id: "veg3", en: "Tomato", hy: "Լոլիկ", ru: "Помидор", emoji: "🍅" },
      { id: "veg4", en: "Onion", hy: "Սոխ", ru: "Лук", emoji: "🧅" },
      { id: "veg5", en: "Cucumber", hy: "Վարունգ", ru: "Огурец", emoji: "🥒" },
      { id: "veg6", en: "Garlic", hy: "Սխտոր", ru: "Чеснок", emoji: "🧄" },
    ],
  },
  {
    id: "animals",
    title: { en: "Animals", hy: "Կենդանիներ", ru: "Животные" },
    category: "Vocabulary",
    icon: "🐾",
    gradient: "from-yellow-500 to-amber-400",
    items: [
      { id: "an1", en: "Cat", hy: "Կատու", ru: "Кошка", emoji: "🐈" },
      { id: "an2", en: "Dog", hy: "Շուն", ru: "Собака", emoji: "🐕" },
      { id: "an3", en: "Rabbit", hy: "Նապաստակ", ru: "Кролик", emoji: "🐇" },
      { id: "an4", en: "Lion", hy: "Առյուծ", ru: "Лев", emoji: "🦁" },
      { id: "an5", en: "Tiger", hy: "Վագր", ru: "Тигр", emoji: "🐅" },
      { id: "an6", en: "Elephant", hy: "Փիղ", ru: "Слон", emoji: "🐘" },
    ],
  },
  {
    id: "jobs",
    title: { en: "Jobs", hy: "Մասնագիտություններ", ru: "Профессии" },
    category: "Vocabulary",
    icon: "👷",
    gradient: "from-slate-600 to-gray-500",
    items: [
      { id: "j1", en: "Teacher", hy: "Ուսուցիչ", ru: "Учитель", emoji: "👨‍🏫" },
      { id: "j2", en: "Doctor", hy: "Բժիշկ", ru: "Врач", emoji: "👨‍⚕️" },
      { id: "j3", en: "Engineer", hy: "Ինժեներ", ru: "Инженер", emoji: "👷‍♂️" },
      { id: "j4", en: "Police Officer", hy: "Ոստիկան", ru: "Полицейский", emoji: "👮‍♂️" },
      { id: "j5", en: "Chef", hy: "Խոհարար", ru: "Повар", emoji: "👨‍🍳" },
      { id: "j6", en: "Driver", hy: "Վարորդ", ru: "Водитель", emoji: "🚗" },
    ],
  },

  // ⚫ ՄՈԴՈՒԼ 8: ԿԵՆԴԱՆԻ ԽՈՍԱԿՑՈՒԹՅՈՒՆ (Real-Life Phrases)
  {
    id: "warnings",
    title: { en: "Warnings", hy: "Նախազգուշացումներ", ru: "Предупреждения" },
    category: "Phrases",
    icon: "⚠️",
    gradient: "from-red-600 to-orange-500",
    items: [
      { id: "w1", en: "Be careful!", hy: "Զգույշ եղիր:", ru: "Будь осторожен!", emoji: "⚠️" },
      { id: "w2", en: "Look out!", hy: "Ուշադիր եղիր:", ru: "Осторожно!", emoji: "👀" },
      { id: "w3", en: "Stop that!", hy: "Դադարիր դա անել:", ru: "Прекрати это!", emoji: "🛑" },
      { id: "w4", en: "Don't touch!", hy: "Մի՛ դիպչիր:", ru: "Не трогай!", emoji: "🚫" },
      { id: "w5", en: "Slow down!", hy: "Դանդաղեցրու:", ru: "Помедленнее!", emoji: "🐌" },
      { id: "w6", en: "Calm down!", hy: "Հանգստացիր:", ru: "Успокойся!", emoji: "🧘" },
    ],
  },
  {
    id: "small_talk",
    title: { en: "Small Talk", hy: "Փոքրիկ Խոսակցություն", ru: "Светская Беседа" },
    category: "Phrases",
    icon: "💬",
    gradient: "from-blue-400 to-indigo-400",
    items: [
      { id: "s1", en: "Are you busy?", hy: "Զբաղվա՞ծ ես:", ru: "Ты занят?", emoji: "🤔" },
      { id: "s2", en: "Not really.", hy: "Այնքան էլ չէ:", ru: "Не особо.", emoji: "🤷‍♂️" },
      { id: "s3", en: "What happened?", hy: "Ի՞նչ պատահեց:", ru: "Что случилось?", emoji: "😲" },
      { id: "s4", en: "Good idea!", hy: "Լավ միտք է:", ru: "Хорошая идея!", emoji: "💡" },
      { id: "s5", en: "I agree.", hy: "Ես համաձայն եմ:", ru: "Я согласен.", emoji: "🤝" },
      { id: "s6", en: "I hope so.", hy: "Հուսով եմ՝ այո:", ru: "Надеюсь на это.", emoji: "🤞" },
    ],
  },
];