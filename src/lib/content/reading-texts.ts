// src/lib/content/reading-texts.ts

export interface ReadingParagraph {
  en: string;
  hy: string;
  ru: string;
}

export interface ReadingVocabulary {
  word: string;
  translation: { en: string; hy: string; ru: string };
}

export interface ReadingQuestion {
  question: { en: string; hy: string; ru: string };
  options: { en: string; hy: string; ru: string }[];
  correctIndex: number;
}

export interface ReadingText {
  id: string;
  level: "A1" | "A2" | "B1" | "B2";
  topics: string[];
  title: { en: string; hy: string; ru: string };
  format: string;
  difficulty: number;
  words: number;
  minutes: number;
  parts: number;
  questionsCount: number;
  paragraphs: ReadingParagraph[];
  vocabulary: ReadingVocabulary[];
  questions: ReadingQuestion[];
}

export const READING_TEXTS: ReadingText[] = [
  // ═══════════════════════════════════════════════════════════════
  // A1 — My Morning Routine
  // ═══════════════════════════════════════════════════════════════
  {
    id: "a1_morning",
    level: "A1",
    topics: ["daily", "relationships"],
    title: { en: "My Morning Routine", hy: "Իմ առավոտյան առօրյան", ru: "Моя утренняя рутина" },
    format: "Story",
    difficulty: 1,
    words: 85,
    minutes: 1,
    parts: 1,
    questionsCount: 3,
    paragraphs: [
      {
        en: "On Saturday, I get up at eight and open the kitchen window. Anna makes tea, and I put bread, cheese and two cups on the table.",
        hy: "Շաբաթ օրը ես արթնանում եմ ժամը ութին և բացում խոհանոցի պատուհանը: Աննան թեյ է պատրաստում, իսկ ես սեղանին դնում եմ հաց, պանիր և երկու բաժակ:",
        ru: "В субботу я встаю в восемь и открываю окно на кухне. Анна заваривает чай, а я ставлю на стол хлеб, сыр и две чашки.",
      },
      {
        en: "We have breakfast together and talk about our week. Anna works in a school, and she always has funny stories about her day.",
        hy: "Մենք միասին նախաճաշում ենք և խոսում մեր շաբաթվա մասին: Աննան աշխատում է դպրոցում և միշտ զվարճալի պատմություններ ունի իր օրվա մասին:",
        ru: "Мы завтракаем вместе и говорим о нашей неделе. Анна работает в школе, и у неё всегда есть забавные истории о своём дне.",
      },
      {
        en: "I work in a bookshop, so I often tell her about new books. We are very good friends.",
        hy: "Ես աշխատում եմ գրախանութում, ուստի հաճախ պատմում եմ նրան նոր գրքերի մասին: Մենք շատ լավ ընկերներ ենք:",
        ru: "Я работаю в книжном магазине, поэтому часто рассказываю ей о новых книгах. Мы очень хорошие друзья.",
      },
    ],
    vocabulary: [
      { word: "get up", translation: { en: "get up", hy: "արթնանալ", ru: "вставать" } },
      { word: "breakfast", translation: { en: "breakfast", hy: "նախաճաշ", ru: "завтрак" } },
      { word: "bookshop", translation: { en: "bookshop", hy: "գրախանութ", ru: "книжный магазин" } },
      { word: "together", translation: { en: "together", hy: "միասին", ru: "вместе" } },
    ],
    questions: [
      {
        question: { en: "What time does the narrator get up?", hy: "Ժամը քանիսի՞ն է արթնանում պատմողը:", ru: "Во сколько встаёт рассказчик?" },
        options: [
          { en: "At seven", hy: "Ժամը յոթին", ru: "В семь" },
          { en: "At eight", hy: "Ժամը ութին", ru: "В восемь" },
          { en: "At nine", hy: "Ժամը իննին", ru: "В девять" },
        ],
        correctIndex: 1,
      },
      {
        question: { en: "Where does Anna work?", hy: "Որտե՞ղ է աշխատում Աննան:", ru: "Где работает Анна?" },
        options: [
          { en: "In a bookshop", hy: "Գրախանութում", ru: "В книжном магазине" },
          { en: "In a school", hy: "Դպրոցում", ru: "В школе" },
          { en: "In a hospital", hy: "Հիվանդանոցում", ru: "В больнице" },
        ],
        correctIndex: 1,
      },
      {
        question: { en: "What does the narrator do?", hy: "Ի՞նչ է անում պատմողը:", ru: "Чем занимается рассказчик?" },
        options: [
          { en: "Works in a bookshop", hy: "Աշխատում է գրախանութում", ru: "Работает в книжном магазине" },
          { en: "Works in a school", hy: "Աշխատում է դպրոցում", ru: "Работает в школе" },
          { en: "Works in a café", hy: "Աշխատում է սրճարանում", ru: "Работает в кафе" },
        ],
        correctIndex: 0,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // A2 — The Lost Phone
  // ═══════════════════════════════════════════════════════════════
  {
    id: "a2_lost_phone",
    level: "A2",
    topics: ["daily", "city"],
    title: { en: "The Lost Phone", hy: "Կորած հեռախոսը", ru: "Потерянный телефон" },
    format: "Story",
    difficulty: 2,
    words: 120,
    minutes: 2,
    parts: 2,
    questionsCount: 3,
    paragraphs: [
      {
        en: "Yesterday, I lost my phone on the bus. I was very worried because all my photos and messages were on it.",
        hy: "Երեկ ես կորցրի իմ հեռախոսը ավտոբուսում: Ես շատ անհանգստացած էի, որովհետև իմ բոլոր լուսանկարներն ու հաղորդագրությունները դրա մեջ էին:",
        ru: "Вчера я потерял свой телефон в автобусе. Я очень волновался, потому что все мои фотографии и сообщения были в нём.",
      },
      {
        en: "I called my number, but nobody answered. Then, I went to the bus station and asked for help.",
        hy: "Ես զանգահարեցի իմ համարին, բայց ոչ ոք չպատասխանեց: Հետո ես գնացի ավտոբուսի կայարան և օգնություն խնդրեցի:",
        ru: "Я позвонил на свой номер, но никто не ответил. Затем я пошёл на автовокзал и попросил помощи.",
      },
      {
        en: "A kind woman found it under a seat. She gave it back to me. I was so happy and thanked her many times.",
        hy: "Մի բարի կին գտել էր այն նստատեղի տակ: Նա վերադարձրեց այն ինձ: Ես այնքան ուրախ էի և շատ անգամներ շնորհակալություն հայտնեցի նրան:",
        ru: "Одна добрая женщина нашла его под сиденьем. Она вернула его мне. Я был так счастлив и много раз поблагодарил её.",
      },
    ],
    vocabulary: [
      { word: "lose", translation: { en: "lose", hy: "կորցնել", ru: "терять" } },
      { word: "worried", translation: { en: "worried", hy: "անհանգստացած", ru: "взволнованный" } },
      { word: "bus station", translation: { en: "bus station", hy: "ավտոբուսի կայարան", ru: "автовокзал" } },
      { word: "kind", translation: { en: "kind", hy: "բարի", ru: "добрый" } },
    ],
    questions: [
      {
        question: { en: "Where did the narrator lose the phone?", hy: "Որտե՞ղ կորցրեց պատմողը հեռախոսը:", ru: "Где рассказчик потерял телефон?" },
        options: [
          { en: "On the bus", hy: "Ավտոբուսում", ru: "В автобусе" },
          { en: "At home", hy: "Տանը", ru: "Дома" },
          { en: "In the park", hy: "Այգում", ru: "В парке" },
        ],
        correctIndex: 0,
      },
      {
        question: { en: "Who found the phone?", hy: "Ո՞վ գտավ հեռախոսը:", ru: "Кто нашёл телефон?" },
        options: [
          { en: "A bus driver", hy: "Ավտոբուսի վարորդը", ru: "Водитель автобуса" },
          { en: "A kind woman", hy: "Մի բարի կին", ru: "Добрая женщина" },
          { en: "A child", hy: "Մի երեխա", ru: "Ребёнок" },
        ],
        correctIndex: 1,
      },
      {
        question: { en: "How did the narrator feel at the end?", hy: "Ինչպե՞ս էր զգում պատմողը վերջում:", ru: "Как рассказчик себя чувствовал в конце?" },
        options: [
          { en: "Sad", hy: "Տխուր", ru: "Грустно" },
          { en: "Angry", hy: "Բարկացած", ru: "Злой" },
          { en: "Happy", hy: "Ուրախ", ru: "Счастливый" },
        ],
        correctIndex: 2,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // B1 — A Small Change in Routine
  // ═══════════════════════════════════════════════════════════════
  {
    id: "b1_routine_change",
    level: "B1",
    topics: ["health", "daily"],
    title: { en: "A Small Change in Routine", hy: "Փոքր փոփոխություն առօրյայում", ru: "Небольшое изменение в рутине" },
    format: "Story",
    difficulty: 2,
    words: 210,
    minutes: 3,
    parts: 3,
    questionsCount: 4,
    paragraphs: [
      {
        en: "For years, I used to start my day by checking my phone immediately after waking up. I would scroll through emails and social media before even getting out of bed.",
        hy: "Տարիներ շարունակ ես սկսում էի իմ օրը՝ անմիջապես արթնանալուց հետո ստուգելով հեռախոսս: Ես թերթում էի էլ. փոստն ու սոցիալական ցանցերը նույնիսկ անկողնուց վեր կենալուց առաջ:",
        ru: "Годами я начинал свой день с того, что сразу после пробуждения проверял телефон. Я просматривал почту и соцсети ещё до того, как вставал с кровати.",
      },
      {
        en: "One day, I decided to make a small change. I left my phone in the kitchen and started my morning with a glass of water and a five-minute stretch instead.",
        hy: "Մի օր ես որոշեցի փոքր փոփոխություն անել: Ես թողեցի հեռախոսս խոհանոցում և առավոտս սկսեցի մի բաժակ ջրով ու հինգ րոպե ձգվող վարժություններով:",
        ru: "Однажды я решил внести небольшое изменение. Я оставил телефон на кухне и начал утро со стакана воды и пятиминутной растяжки.",
      },
      {
        en: "To my surprise, this tiny habit made a huge difference. I felt more focused and less anxious throughout the day. I even started to enjoy my mornings.",
        hy: "Ի զարմանս ինձ, այս փոքրիկ սովորությունը հսկայական տարբերություն ստեղծեց: Ես ավելի կենտրոնացած էի զգում և ավելի քիչ անհանգստացած օրվա ընթացքում: Ես նույնիսկ սկսեցի վայելել իմ առավոտները:",
        ru: "К моему удивлению, эта маленькая привычка имела огромное значение. Я чувствовал себя более сосредоточенным и менее тревожным в течение дня. Я даже начал наслаждаться своими утрами.",
      },
    ],
    vocabulary: [
      { word: "scroll", translation: { en: "scroll", hy: "թերթել", ru: "прокручивать" } },
      { word: "stretch", translation: { en: "stretch", hy: "ձգվել", ru: "растягиваться" } },
      { word: "focused", translation: { en: "focused", hy: "կենտրոնացած", ru: "сосредоточенный" } },
      { word: "anxious", translation: { en: "anxious", hy: "անհանգստացած", ru: "тревожный" } },
    ],
    questions: [
      {
        question: { en: "What did the narrator used to do first thing in the morning?", hy: "Ի՞նչ էր անում պատմողը առավոտյան առաջին բանը:", ru: "Что рассказчик обычно делал первым делом утром?" },
        options: [
          { en: "Drink water", hy: "Ջուր էր խմում", ru: "Пил воду" },
          { en: "Check the phone", hy: "Ստուգում էր հեռախոսը", ru: "Проверял телефон" },
          { en: "Go for a run", hy: "Գնում էր վազքի", ru: "Ходил на пробежку" },
        ],
        correctIndex: 1,
      },
      {
        question: { en: "What change did the narrator make?", hy: "Ի՞նչ փոփոխություն արեց պատմողը:", ru: "Какое изменение внёс рассказчик?" },
        options: [
          { en: "Left the phone in the kitchen", hy: "Թողեց հեռախոսը խոհանոցում", ru: "Оставил телефон на кухне" },
          { en: "Bought a new phone", hy: "Գնեց նոր հեռախոս", ru: "Купил новый телефон" },
          { en: "Stopped using social media", hy: "Դադարեց օգտվել սոցիալական ցանցերից", ru: "Перестал пользоваться соцсетями" },
        ],
        correctIndex: 0,
      },
      {
        question: { en: "How did the narrator feel after the change?", hy: "Ինչպե՞ս էր զգում պատմողը փոփոխությունից հետո:", ru: "Как рассказчик себя чувствовал после изменения?" },
        options: [
          { en: "More tired", hy: "Ավելի հոգնած", ru: "Более уставшим" },
          { en: "More focused", hy: "Ավելի կենտրոնացած", ru: "Более сосредоточенным" },
          { en: "More stressed", hy: "Ավելի սթրեսային", ru: "Более stressed" },
        ],
        correctIndex: 1,
      },
      {
        question: { en: "What is the main idea of the text?", hy: "Ո՞րն է տեքստի հիմնական միտքը:", ru: "Какова основная мысль текста?" },
        options: [
          { en: "Phones are bad", hy: "Հեռախոսները վատ են", ru: "Телефоны — это плохо" },
          { en: "Small habits can make a big difference", hy: "Փոքր սովորությունները կարող են մեծ տարբերություն ստեղծել", ru: "Маленькие привычки могут иметь большое значение" },
          { en: "Morning is the best time of day", hy: "Առավոտը օրվա լավագույն ժամանակն է", ru: "Утро — лучшее время дня" },
        ],
        correctIndex: 1,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // B2 — The Art of Noticing
  // ═══════════════════════════════════════════════════════════════
  {
    id: "b2_noticing",
    level: "B2",
    topics: ["culture", "science"],
    title: { en: "The Art of Noticing", hy: "Նկատելու արվեստը", ru: "Искусство замечать" },
    format: "Essay",
    difficulty: 3,
    words: 280,
    minutes: 4,
    parts: 4,
    questionsCount: 4,
    paragraphs: [
      {
        en: "In our fast-paced world, we often rush from one task to another, barely paying attention to our surroundings. We look but we do not see; we hear but we do not listen.",
        hy: "Մեր արագընթաց աշխարհում մենք հաճախ շտապում ենք մի գործից մյուսը՝ քիչ ուշադրություն դարձնելով մեր շրջապատին: Մենք նայում ենք, բայց չենք տեսնում. լսում ենք, բայց չենք լսում:",
        ru: "В нашем быстро меняющемся мире мы часто спешим от одной задачи к другой, почти не обращая внимания на окружающее. Мы смотрим, но не видим; слышим, но не слушаем.",
      },
      {
        en: "The art of noticing is the practice of deliberately paying attention to the small details of everyday life. It is about slowing down and being present in the moment.",
        hy: "Նկատելու արվեստը առօրյա կյանքի մանրուքներին գիտակցաբար ուշադրություն դարձնելու պրակտիկան է: Դա դանդաղեցնելու և ներկա պահին գտնվելու մասին է:",
        ru: "Искусство замечать — это практика сознательного внимания к мелким деталям повседневной жизни. Это умение замедлиться и быть в настоящем моменте.",
      },
      {
        en: "Research suggests that training ourselves to notice can reduce stress and increase creativity. When we observe the world more carefully, we begin to see connections and possibilities that we otherwise would have missed.",
        hy: "Հետազոտությունները ցույց են տալիս, որ նկատել սովորելը կարող է նվազեցնել սթրեսը և մեծացնել ստեղծարարությունը: Երբ մենք ավելի ուշադիր դիտարկում ենք աշխարհը, սկսում ենք տեսնել կապեր և հնարավորություններ, որոնք այլ կերպ բաց կթողնեինք:",
        ru: "Исследования показывают, что тренировка внимательности может снизить стресс и повысить креативность. Когда мы внимательнее наблюдаем за миром, мы начинаем видеть связи и возможности, которые иначе бы упустили.",
      },
      {
        en: "So, the next time you walk down the street, try to notice five new things. You might be surprised by what you discover.",
        hy: "Այսպիսով, հաջորդ անգամ, երբ փողոցով քայլեք, փորձեք նկատել հինգ նոր բան: Գուցե զարմանաք ձեր հայտնաբերածով:",
        ru: "Так что в следующий раз, когда пойдёте по улице, попробуйте заметить пять новых вещей. Возможно, вы удивитесь тому, что обнаружите.",
      },
    ],
    vocabulary: [
      { word: "fast-paced", translation: { en: "fast-paced", hy: "արագընթաց", ru: "быстротечный" } },
      { word: "deliberately", translation: { en: "deliberately", hy: "գիտակցաբար", ru: "сознательно" } },
      { word: "reduce stress", translation: { en: "reduce stress", hy: "նվազեցնել սթրեսը", ru: "снизить стресс" } },
      { word: "creativity", translation: { en: "creativity", hy: "ստեղծարարություն", ru: "креативность" } },
    ],
    questions: [
      {
        question: { en: "According to the text, what do we often fail to do?", hy: "Ըստ տեքստի՝ ի՞նչ ենք մենք հաճախ չենք անում:", ru: "Согласно тексту, что мы часто не делаем?" },
        options: [
          { en: "Rush from task to task", hy: "Շտապում ենք մի գործից մյուսը", ru: "Спешим от задачи к задаче" },
          { en: "Truly see and listen", hy: "Իսկապես տեսնել և լսել", ru: "По-настоящему видеть и слушать" },
          { en: "Pay attention to our surroundings", hy: "Ուշադրություն դարձնել շրջապատին", ru: "Обращать внимание на окружение" },
        ],
        correctIndex: 1,
      },
      {
        question: { en: "What is the art of noticing?", hy: "Ի՞նչ է նկատելու արվեստը:", ru: "Что такое искусство замечать?" },
        options: [
          { en: "Rushing through life", hy: "Կյանքով շտապելը", ru: "Спешка по жизни" },
          { en: "Deliberately paying attention to details", hy: "Գիտակցաբար ուշադրություն դարձնել մանրուքներին", ru: "Сознательное внимание к деталям" },
          { en: "Ignoring the world around us", hy: "Անտեսել մեզ շրջապատող աշխարհը", ru: "Игнорирование окружающего мира" },
        ],
        correctIndex: 1,
      },
      {
        question: { en: "What benefit of noticing is mentioned in the text?", hy: "Նկատելու ի՞նչ օգուտ է նշված տեքստում:", ru: "Какая польза от внимательности упомянута в тексте?" },
        options: [
          { en: "It makes us faster", hy: "Այն մեզ ավելի արագ է դարձնում", ru: "Это делает нас быстрее" },
          { en: "It reduces stress and increases creativity", hy: "Այն նվազեցնում է սթրեսը և մեծացնում ստեղծարարությունը", ru: "Это снижает стресс и повышает креативность" },
          { en: "It helps us sleep better", hy: "Այն օգնում է ավելի լավ քնել", ru: "Это помогает лучше спать" },
        ],
        correctIndex: 1,
      },
      {
        question: { en: "What practical exercise does the author suggest?", hy: "Ի՞նչ գործնական վարժություն է առաջարկում հեղինակը:", ru: "Какое практическое упражнение предлагает автор?" },
        options: [
          { en: "Walk faster", hy: "Ավելի արագ քայլել", ru: "Ходить быстрее" },
          { en: "Notice five new things on your street", hy: "Նկատել հինգ նոր բան ձեր փողոցում", ru: "Заметить пять новых вещей на вашей улице" },
          { en: "Avoid looking around", hy: "Խուսափել շուրջը նայելուց", ru: "Избегать смотреть по сторонам" },
        ],
        correctIndex: 1,
      },
    ],
  },
];