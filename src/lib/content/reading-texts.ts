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
  // 1. PEOPLE & RELATIONSHIPS
  {
    id: "people_neighbor",
    level: "A2",
    topics: ["people", "relationships"],
    title: { en: "The Helpful Neighbor", hy: "Օգնող հարևանը", ru: "Помогающий сосед" },
    format: "Story",
    difficulty: 1,
    words: 75,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Mr. Smith is an old man who lives next door. Every morning, he waters his beautiful flowers. Yesterday, I was sick and couldn't go to the store. Mr. Smith knocked on my door and gave me some bread and milk.",
        hy: "Պարոն Սմիթը տարեց մարդ է, ով ապրում է հարևանությամբ: Ամեն առավոտ նա ջրում է իր գեղեցիկ ծաղիկները: Երեկ ես հիվանդ էի և չէի կարողանում գնալ խանութ: Պարոն Սմիթը թակեց իմ դուռը և ինձ հաց ու կաթ տվեց:",
        ru: "Мистер Смит — пожилой мужчина, который живёт по соседству. Каждое утро он поливает свои красивые цветы. Вчера я заболел и не мог пойти в магазин. Мистер Смит постучал в мою дверь и дал мне хлеб и молоко."
      }
    ],
    vocabulary: [
      { word: "neighbor", translation: { en: "neighbor", hy: "հարևան", ru: "сосед" } },
      { word: "water (verb)", translation: { en: "water", hy: "ջրել", ru: "поливать" } },
      { word: "sick", translation: { en: "sick", hy: "հիվանդ", ru: "больной" } }
    ],
    questions: [
      {
        question: { en: "What does Mr. Smith do every morning?", hy: "Ի՞նչ է անում պարոն Սմիթը ամեն առավոտ:", ru: "Что мистер Смит делает каждое утро?" },
        options: [
          { en: "Reads the newspaper", hy: "Կարդում է թերթը", ru: "Читает газету" },
          { en: "Waters his flowers", hy: "Ջրում է իր ծաղիկները", ru: "Поливает свои цветы" },
          { en: "Goes to the store", hy: "Գնում է խանութ", ru: "Ходит в магазин" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Why did Mr. Smith give bread and milk?", hy: "Ինչո՞ւ պարոն Սմիթը հաց ու կաթ տվեց:", ru: "Почему мистер Смит дал хлеб и молоко?" },
        options: [
          { en: "Because the narrator was sick", hy: "Որովհետև պատմողը հիվանդ էր", ru: "Потому что рассказчик был болен" },
          { en: "Because he had too much food", hy: "Որովհետև նա շատ ուտելիք ուներ", ru: "Потому что у него было много еды" },
          { en: "Because it was a holiday", hy: "Որովհետև տոն էր", ru: "Потому что был праздник" }
        ],
        correctIndex: 0
      }
    ]
  },

  // 2. DAILY LIFE
  {
    id: "daily_routine",
    level: "A1",
    topics: ["daily"],
    title: { en: "My Morning Routine", hy: "Իմ առավոտյան առօրյան", ru: "Моя утренняя рутина" },
    format: "Story",
    difficulty: 1,
    words: 80,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "On Saturday, I get up at eight and open the kitchen window. Anna makes tea, and I put bread, cheese and two cups on the table. We have breakfast together and talk about our week.",
        hy: "Շաբաթ օրը ես արթնանում եմ ժամը ութին և բացում խոհանոցի պատուհանը: Աննան թեյ է պատրաստում, իսկ ես սեղանին դնում եմ հաց, պանիր և երկու բաժակ: Մենք միասին նախաճաշում ենք և խոսում մեր շաբաթվա մասին:",
        ru: "В субботу я встаю в восемь и открываю окно на кухне. Анна заваривает чай, а я ставлю на стол хлеб, сыр и две чашки. Мы завтракаем вместе и говорим о нашей неделе."
      }
    ],
    vocabulary: [
      { word: "get up", translation: { en: "get up", hy: "արթնանալ", ru: "вставать" } },
      { word: "breakfast", translation: { en: "breakfast", hy: "նախաճաշ", ru: "завтрак" } },
      { word: "together", translation: { en: "together", hy: "միասին", ru: "вместе" } }
    ],
    questions: [
      {
        question: { en: "What time does the narrator get up?", hy: "Ժամը քանիսի՞ն է արթնանում պատմողը:", ru: "Во сколько встаёт рассказчик?" },
        options: [
          { en: "At seven", hy: "Ժամը յոթին", ru: "В семь" },
          { en: "At eight", hy: "Ժամը ութին", ru: "В восемь" },
          { en: "At nine", hy: "Ժամը իննին", ru: "В девять" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What do they drink?", hy: "Ի՞նչ են նրանք խմում:", ru: "Что они пьют?" },
        options: [
          { en: "Coffee", hy: "Սուրճ", ru: "Кофе" },
          { en: "Milk", hy: "Կաթ", ru: "Молоко" },
          { en: "Tea", hy: "Թեյ", ru: "Чай" }
        ],
        correctIndex: 2
      }
    ]
  },

  // 3. FOOD
  {
    id: "food_dinner",
    level: "A2",
    topics: ["food"],
    title: { en: "A Special Dinner", hy: "Հատուկ ընթրիք", ru: "Особенный ужин" },
    format: "Story",
    difficulty: 1,
    words: 85,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Last night, my family and I went to a new Italian restaurant. I ordered pizza with mushrooms and cheese, and my sister had pasta with tomatoes. The food was delicious, but the dessert was the best part. We ate chocolate cake and ice cream.",
        hy: "Անցած գիշեր իմ ընտանիքը և ես գնացինք նոր իտալական ռեստորան: Ես պատվիրեցի պիցցա սնկով և պանիրով, իսկ քույրս ուներ մակարոն լոլիկով: Ուտելիքը համեղ էր, բայց աղանդերը լավագույն մասն էր: Մենք կերանք շոկոլադե տորթ և պաղպաղակ:",
        ru: "Вчера вечером мы с семьёй пошли в новый итальянский ресторан. Я заказал пиццу с грибами и сыром, а моя сестра взяла пасту с томатами. Еда была вкусной, но десерт был лучшей частью. Мы ели шоколадный торт и мороженое."
      }
    ],
    vocabulary: [
      { word: "restaurant", translation: { en: "restaurant", hy: "ռեստորան", ru: "ресторан" } },
      { word: "delicious", translation: { en: "delicious", hy: "համեղ", ru: "вкусный" } },
      { word: "dessert", translation: { en: "dessert", hy: "աղանդեր", ru: "десерт" } }
    ],
    questions: [
      {
        question: { en: "What did the narrator order?", hy: "Ի՞նչ պատվիրեց պատմողը:", ru: "Что заказал рассказчик?" },
        options: [
          { en: "Pasta", hy: "Մակարոն", ru: "Пасту" },
          { en: "Pizza", hy: "Պիցցա", ru: "Пиццу" },
          { en: "Salad", hy: "Աղցան", ru: "Салат" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What was the best part of the meal?", hy: "Ո՞րն էր ուտելիքի լավագույն մասը:", ru: "Что было лучшей частью еды?" },
        options: [
          { en: "The pizza", hy: "Պիցցան", ru: "Пицца" },
          { en: "The pasta", hy: "Մակարոնը", ru: "Паста" },
          { en: "The dessert", hy: "Աղանդերը", ru: "Десерт" }
        ],
        correctIndex: 2
      }
    ]
  },

  // 4. CITY
  {
    id: "city_lost_phone",
    level: "A2",
    topics: ["city"],
    title: { en: "The Lost Phone", hy: "Կորած հեռախոսը", ru: "Потерянный телефон" },
    format: "Story",
    difficulty: 2,
    words: 90,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Yesterday, I lost my phone on the bus. I was very worried because all my photos and messages were on it. A kind woman found it under a seat and gave it back to me. I was so happy and thanked her many times.",
        hy: "Երեկ ես կորցրի իմ հեռախոսը ավտոբուսում: Ես շատ անհանգստացած էի, որովհետև իմ բոլոր լուսանկարներն ու հաղորդագրությունները դրա մեջ էին: Մի բարի կին գտավ այն նստատեղի տակ և վերադարձրեց ինձ: Ես այնքան ուրախ էի և շատ անգամներ շնորհակալություն հայտնեցի նրան:",
        ru: "Вчера я потерял свой телефон в автобусе. Я очень волновался, потому что все мои фотографии и сообщения были в нём. Одна добрая женщина нашла его под сиденьем и вернула мне. Я был так счастлив и много раз поблагодарил её."
      }
    ],
    vocabulary: [
      { word: "lose", translation: { en: "lose", hy: "կորցնել", ru: "терять" } },
      { word: "worried", translation: { en: "worried", hy: "անհանգստացած", ru: "взволнованный" } },
      { word: "kind", translation: { en: "kind", hy: "բարի", ru: "добрый" } }
    ],
    questions: [
      {
        question: { en: "Where did the narrator lose the phone?", hy: "Որտե՞ղ կորցրեց պատմողը հեռախոսը:", ru: "Где рассказчик потерял телефон?" },
        options: [
          { en: "On the bus", hy: "Ավտոբուսում", ru: "В автобусе" },
          { en: "At home", hy: "Տանը", ru: "Дома" },
          { en: "In the park", hy: "Այգում", ru: "В парке" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Who found the phone?", hy: "Ո՞վ գտավ հեռախոսը:", ru: "Кто нашёл телефон?" },
        options: [
          { word: "A bus driver", en: "A bus driver", hy: "Ավտոբուսի վարորդը", ru: "Водитель автобуса" },
          { en: "A kind woman", hy: "Մի բարի կին", ru: "Добрая женщина" },
          { en: "A child", hy: "Մի երեխա", ru: "Ребёнок" }
        ] as any,
        correctIndex: 1
      }
    ]
  },

  // 5. TRAVEL
  {
    id: "travel_mountains",
    level: "B1",
    topics: ["travel"],
    title: { en: "A Weekend in the Mountains", hy: "Հանգստյան օրերը լեռներում", ru: "Выходные в горах" },
    format: "Story",
    difficulty: 2,
    words: 95,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Last summer, my friends and I decided to go hiking in the mountains. We packed our backpacks with food, water, and warm clothes. The journey was difficult, but the view from the top was amazing. We saw green valleys, small rivers, and flying eagles. It was an unforgettable experience.",
        hy: "Անցած ամառ ես և իմ ընկերները որոշեցինք գնալ լեռնային արշավի: Մենք մեր ուսապարկերը լցրեցինք ուտելիքով, ջրով և տաք հագուստով: Ճանապարհը դժվար էր, բայց գագաթից տեսարանը զարմանալի էր: Մենք տեսանք կանաչ հովիտներ, փոքրիկ գետեր և թռչող արծիվներ: Դա անմոռանալի փորձ էր:",
        ru: "Прошлым летом мы с друзьями решили отправиться в поход в горы. Мы собрали рюкзаки с едой, водой и тёплой одеждой. Путь был трудным, но вид с вершины был потрясающим. Мы видели зелёные долины, маленькие реки и летающих орлов. Это был незабываемый опыт."
      }
    ],
    vocabulary: [
      { word: "hiking", translation: { en: "hiking", hy: "արշավ", ru: "поход" } },
      { word: "backpack", translation: { en: "backpack", hy: "ուսապարկ", ru: "рюкзак" } },
      { word: "unforgettable", translation: { en: "unforgettable", hy: "անմոռանալի", ru: "незабываемый" } }
    ],
    questions: [
      {
        question: { en: "What did they pack?", hy: "Ի՞նչ էին նրանք վերցրել:", ru: "Что они взяли с собой?" },
        options: [
          { en: "Books and games", hy: "Գրքեր և խաղեր", ru: "Книги и игры" },
          { en: "Food, water, and warm clothes", hy: "Ուտելիք, ջուր և տաք հագուստ", ru: "Еду, воду и тёплую одежду" },
          { en: "Tents and sleeping bags", hy: "Վրաններ և քնապարկեր", ru: "Палатки и спальные мешки" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What did they see from the top?", hy: "Ի՞նչ տեսան նրանք գագաթից:", ru: "Что они увидели с вершины?" },
        options: [
          { en: "The sea", hy: "Ծովը", ru: "Море" },
          { en: "Green valleys and eagles", hy: "Կանաչ հովիտներ և արծիվներ", ru: "Зелёные долины и орлов" },
          { en: "A big city", hy: "Մեծ քաղաք", ru: "Большой город" }
        ],
        correctIndex: 1
      }
    ]
  },

  // 6. WORK
  {
    id: "work_new_job",
    level: "B1",
    topics: ["work"],
    title: { en: "The New Job", hy: "Նոր աշխատանքը", ru: "Новая работа" },
    format: "Story",
    difficulty: 2,
    words: 85,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Today was my first day at my new job. I was very nervous, but my colleagues were very friendly. They showed me the office and explained my tasks. I have to answer emails, organize meetings, and help customers. I think I will like working here.",
        hy: "Այսօր իմ առաջին օրն էր նոր աշխատանքում: Ես շատ նյարդային էի, բայց իմ գործընկերները շատ բարեկամական էին: Նրանք ցույց տվեցին ինձ գրասենյակը և բացատրեցին իմ առաջադրանքները: Ես պետք է պատասխանեմ էլ. նամակներին, կազմակերպեմ հանդիպումներ և օգնեմ հաճախորդներին: Կարծում եմ՝ ինձ դուր կգա աշխատել այստեղ:",
        ru: "Сегодня был мой первый день на новой работе. Я очень нервничал, но мои коллеги были очень дружелюбными. Они показали мне офис и объяснили мои задачи. Я должен отвечать на письма, организовывать встречи и помогать клиентам. Думаю, мне понравится здесь работать."
      }
    ],
    vocabulary: [
      { word: "nervous", translation: { en: "nervous", hy: "նյարդային", ru: "нервный" } },
      { word: "colleague", translation: { en: "colleague", hy: "գործընկեր", ru: "коллега" } },
      { word: "task", translation: { en: "task", hy: "առաջադրանք", ru: "задача" } }
    ],
    questions: [
      {
        question: { en: "How did the narrator feel on the first day?", hy: "Ինչպե՞ս էր զգում պատմողը առաջին օրը:", ru: "Как рассказчик себя чувствовал в первый день?" },
        options: [
          { en: "Excited", hy: "Ոգևորված", ru: "Взволнованным" },
          { en: "Nervous", hy: "Նյարդային", ru: "Нервным" },
          { en: "Bored", hy: "Ձանձրացած", ru: "Скучающим" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What is one of the narrator's tasks?", hy: "Ո՞րն է պատմողի առաջադրանքներից մեկը:", ru: "Какова одна из задач рассказчика?" },
        options: [
          { en: "Cooking lunch", hy: "Ճաշ պատրաստել", ru: "Готовить обед" },
          { en: "Answering emails", hy: "Պատասխանել էլ. նամակներին", ru: "Отвечать на письма" },
          { en: "Driving a car", hy: "Մեքենա վարել", ru: "Водить машину" }
        ],
        correctIndex: 1
      }
    ]
  },

  // 7. LEARNING
  {
    id: "learning_language",
    level: "B1",
    topics: ["learning"],
    title: { en: "Learning a New Language", hy: "Նոր լեզու սովորելը", ru: "Изучение нового языка" },
    format: "Essay",
    difficulty: 2,
    words: 90,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Learning a new language is a great adventure. At first, it can be difficult to understand new words and grammar. But if you practice every day, you will see progress. Reading books, watching movies, and talking to native speakers are excellent ways to improve your skills.",
        hy: "Նոր լեզու սովորելը հիանալի արկած է: Սկզբում կարող է դժվար լինել հասկանալ նոր բառերն ու քերականությունը: Բայց եթե ամեն օր պարապես, կտեսնես առաջընթաց: Գրքեր կարդալը, ֆիլմեր դիտելը և մայրենի խոսողների հետ խոսելը ձեր հմտությունները բարելավելու գերազանց միջոցներ են:",
        ru: "Изучение нового языка — это большое приключение. Поначалу может быть трудно понимать новые слова и грамматику. Но если вы будете практиковаться каждый день, вы увидите прогресс. Чтение книг, просмотр фильмов и общение с носителями языка — отличные способы улучшить свои навыки."
      }
    ],
    vocabulary: [
      { word: "adventure", translation: { en: "adventure", hy: "արկած", ru: "приключение" } },
      { word: "progress", translation: { en: "progress", hy: "առաջընթաց", ru: "прогресс" } },
      { word: "native speaker", translation: { en: "native speaker", hy: "մայրենի խոսող", ru: "носитель языка" } }
    ],
    questions: [
      {
        question: { en: "How can you improve your language skills?", hy: "Ինչպե՞ս կարող ես բարելավել լեզվական հմտություններդ:", ru: "Как можно улучшить языковые навыки?" },
        options: [
          { en: "By sleeping more", hy: "Ավելի շատ քնելով", ru: "Больше спать" },
          { en: "By practicing every day", hy: "Ամեն օր պարապելով", ru: "Практикуясь каждый день" },
          { en: "By eating healthy food", hy: "Առողջ սնունդ ուտելով", ru: "Есть здоровую пищу" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What is NOT mentioned as a way to learn?", hy: "Ի՞նչը ՆՇՎԱԾ ՉԷ որպես սովորելու միջոց:", ru: "Что НЕ упомянуто как способ обучения?" },
        options: [
          { en: "Reading books", hy: "Գրքեր կարդալը", ru: "Чтение книг" },
          { en: "Watching movies", hy: "Ֆիլմեր դիտելը", ru: "Просмотр фильмов" },
          { en: "Writing letters", hy: "Նամակներ գրելը", ru: "Написание писем" }
        ],
        correctIndex: 2
      }
    ]
  },

  // 8. HOBBIES
  {
    id: "hobbies_painting",
    level: "A2",
    topics: ["hobbies"],
    title: { en: "My Favorite Hobby", hy: "Իմ սիրելի հոբբին", ru: "Моё любимое хобби" },
    format: "Story",
    difficulty: 1,
    words: 70,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "My favorite hobby is painting. I love to draw nature, especially mountains and trees. I usually paint on weekends when I have free time. It helps me relax and forget about my problems. I also like to give my paintings to my friends.",
        hy: "Իմ սիրելի հոբբին նկարելն է: Ես սիրում եմ նկարել բնություն, հատկապես լեռներ և ծառեր: Ես սովորաբար նկարում եմ հանգստյան օրերին, երբ ազատ ժամանակ ունեմ: Դա օգնում է ինձ հանգստանալ և մոռանալ իմ խնդիրների մասին: Ես նաև սիրում եմ իմ նկարները նվիրել ընկերներիս:",
        ru: "Моё любимое хобби — рисование. Я люблю рисовать природу, особенно горы и деревья. Обычно я рисую по выходным, когда у меня есть свободное время. Это помогает мне расслабиться и забыть о проблемах. Я также люблю дарить свои картины друзьям."
      }
    ],
    vocabulary: [
      { word: "painting", translation: { en: "painting", hy: "նկարչություն", ru: "живопись" } },
      { word: "relax", translation: { en: "relax", hy: "հանգստանալ", ru: "расслабляться" } },
      { word: "free time", translation: { en: "free time", hy: "ազատ ժամանակ", ru: "свободное время" } }
    ],
    questions: [
      {
        question: { en: "What does the narrator love to draw?", hy: "Ի՞նչ է սիրում նկարել պատմողը:", ru: "Что рассказчик любит рисовать?" },
        options: [
          { en: "Animals", hy: "Կենդանիներ", ru: "Животных" },
          { en: "Nature", hy: "Բնություն", ru: "Природу" },
          { en: "People", hy: "Մարդիկ", ru: "Людей" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "When does the narrator usually paint?", hy: "Ե՞րբ է սովորաբար նկարում պատմողը:", ru: "Когда рассказчик обычно рисует?" },
        options: [
          { en: "On weekends", hy: "Հանգստյան օրերին", ru: "По выходным" },
          { en: "Every morning", hy: "Ամեն առավոտ", ru: "Каждое утро" },
          { en: "At night", hy: "Գիշերը", ru: "Ночью" }
        ],
        correctIndex: 0
      }
    ]
  },

  // 9. HEALTH
  {
    id: "health_routine",
    level: "B1",
    topics: ["health"],
    title: { en: "A Small Change in Routine", hy: "Փոքր փոփոխություն առօրյայում", ru: "Небольшое изменение в рутине" },
    format: "Story",
    difficulty: 2,
    words: 95,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "For years, I started my day by checking my phone. One day, I decided to leave my phone in the kitchen and start my morning with a glass of water and a five-minute stretch. To my surprise, this tiny habit made a huge difference. I felt more focused and less anxious throughout the day.",
        hy: "Տարիներ շարունակ ես սկսում էի իմ օրը՝ ստուգելով հեռախոսս: Մի օր ես որոշեցի թողնել հեռախոսս խոհանոցում և առավոտս սկսել մի բաժակ ջրով ու հինգ րոպե ձգվող վարժություններով: Ի զարմանս ինձ, այս փոքրիկ սովորությունը հսկայական տարբերություն ստեղծեց: Ես ավելի կենտրոնացած էի զգում և ավելի քիչ անհանգստացած օրվա ընթացքում:",
        ru: "Годами я начинал свой день с проверки телефона. Однажды я решил оставить телефон на кухне и начать утро со стакана воды и пятиминутной растяжки. К моему удивлению, эта маленькая привычка имела огромное значение. Я чувствовал себя более сосредоточенным и менее тревожным в течение дня."
      }
    ],
    vocabulary: [
      { word: "stretch", translation: { en: "stretch", hy: "ձգվել", ru: "растягиваться" } },
      { word: "focused", translation: { en: "focused", hy: "կենտրոնացած", ru: "сосредоточенный" } },
      { word: "anxious", translation: { en: "anxious", hy: "անհանգստացած", ru: "тревожный" } }
    ],
    questions: [
      {
        question: { en: "What did the narrator leave in the kitchen?", hy: "Ի՞նչ թողեց պատմողը խոհանոցում:", ru: "Что рассказчик оставил на кухне?" },
        options: [
          { en: "A glass of water", hy: "Մի բաժակ ջուր", ru: "Стакан воды" },
          { en: "The phone", hy: "Հեռախոսը", ru: "Телефон" },
          { en: "A book", hy: "Գիրք", ru: "Книгу" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How did the narrator feel after the change?", hy: "Ինչպե՞ս էր զգում պատմողը փոփոխությունից հետո:", ru: "Как рассказчик себя чувствовал после изменения?" },
        options: [
          { en: "More tired", hy: "Ավելի հոգնած", ru: "Более уставшим" },
          { en: "More focused", hy: "Ավելի կենտրոնացած", ru: "Более сосредоточенным" },
          { en: "More stressed", hy: "Ավելի սթրեսային", ru: "Более stressed" }
        ],
        correctIndex: 1
      }
    ]
  },

  // 10. NATURE
  {
    id: "nature_forest",
    level: "A2",
    topics: ["nature"],
    title: { en: "The Forest Walk", hy: "Անտառային զբոսանք", ru: "Прогулка по лесу" },
    format: "Story",
    difficulty: 1,
    words: 75,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "On Sunday, I went for a walk in the forest. The trees were tall and green, and the air was fresh. I saw a small squirrel running up a tree and heard birds singing. It was a peaceful and beautiful place. I will definitely go back there next weekend.",
        hy: "Կիրակի օրը ես գնացի զբոսնելու անտառում: Ծառերը բարձր էին և կանաչ, իսկ օդը՝ մաքուր: Ես տեսա մի փոքրիկ սկյուռ, որը վազում էր ծառի վրայով, և լսեցի թռչունների երգը: Դա խաղաղ և գեղեցիկ վայր էր: Ես անպայման կվերադառնամ այնտեղ հաջորդ հանգստյան օրերին:",
        ru: "В воскресенье я пошёл погулять в лес. Деревья были высокими и зелёными, а воздух свежим. Я увидел маленькую белку, взбирающуюся на дерево, и услышал пение птиц. Это было тихое и красивое место. Я обязательно вернусь туда в следующие выходные."
      }
    ],
    vocabulary: [
      { word: "forest", translation: { en: "forest", hy: "անտառ", ru: "лес" } },
      { word: "squirrel", translation: { en: "squirrel", hy: "սկյուռ", ru: "белка" } },
      { word: "peaceful", translation: { en: "peaceful", hy: "խաղաղ", ru: "мирный" } }
    ],
    questions: [
      {
        question: { en: "When did the narrator go to the forest?", hy: "Ե՞րբ գնաց պատմողը անտառ:", ru: "Когда рассказчик пошёл в лес?" },
        options: [
          { en: "On Saturday", hy: "Շաբաթ օրը", ru: "В субботу" },
          { en: "On Sunday", hy: "Կիրակի օրը", ru: "В воскресенье" },
          { en: "On Friday", hy: "Ուրբաթ օրը", ru: "В пятницу" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What animal did the narrator see?", hy: "Ի՞նչ կենդանի տեսավ պատմողը:", ru: "Какое животное увидел рассказчик?" },
        options: [
          { en: "A rabbit", hy: "Ճագար", ru: "Кролика" },
          { en: "A squirrel", hy: "Սկյուռ", ru: "Белку" },
          { en: "A fox", hy: "Աղվես", ru: "Лису" }
        ],
        correctIndex: 1
      }
    ]
  },

  // 11. TECH
  {
    id: "tech_smartphones",
    level: "B1",
    topics: ["tech"],
    title: { en: "Smartphones in Our Life", hy: "Սմարթֆոնները մեր կյանքում", ru: "Смартфоны в нашей жизни" },
    format: "Essay",
    difficulty: 2,
    words: 85,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Smartphones have changed our lives completely. Today, we use them for almost everything: calling, messaging, shopping, and learning. However, spending too much time on our phones can be bad for our health and relationships. It is important to find a balance between the digital world and real life.",
        hy: "Սմարթֆոնները ամբողջովին փոխել են մեր կյանքը: Այսօր մենք օգտագործում ենք դրանք գրեթե ամեն ինչի համար՝ զանգահարելու, հաղորդագրություններ ուղարկելու, գնումներ կատարելու և սովորելու: Այնուամենայնիվ, հեռախոսների վրա չափից շատ ժամանակ անցկացնելը կարող է վնասակար լինել մեր առողջության և հարաբերությունների համար: Կարևոր է հավասարակշռություն գտնել թվային աշխարհի և իրական կյանքի միջև:",
        ru: "Смартфоны полностью изменили нашу жизнь. Сегодня мы используем их почти для всего: звонков, обмена сообщениями, покупок и обучения. Однако проводить слишком много времени в телефоне может быть вредно для нашего здоровья и отношений. Важно найти баланс между цифровым миром и реальной жизнью."
      }
    ],
    vocabulary: [
      { word: "completely", translation: { en: "completely", hy: "ամբողջովին", ru: "полностью" } },
      { word: "balance", translation: { en: "balance", hy: "հավասարակշռություն", ru: "баланс" } },
      { word: "digital", translation: { en: "digital", hy: "թվային", ru: "цифровой" } }
    ],
    questions: [
      {
        question: { en: "What do we use smartphones for?", hy: "Ինչի՞ համար ենք մենք օգտագործում սմարթֆոնները:", ru: "Для чего мы используем смартфоны?" },
        options: [
          { en: "Only for calling", hy: "Միայն զանգահարելու համար", ru: "Только для звонков" },
          { en: "For almost everything", hy: "Գրեթե ամեն ինչի համար", ru: "Почти для всего" },
          { en: "Only for games", hy: "Միայն խաղերի համար", ru: "Только для игр" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What is important according to the text?", hy: "Ի՞նչն է կարևոր ըստ տեքստի:", ru: "Что важно согласно тексту?" },
        options: [
          { en: "To buy a new phone", hy: "Նոր հեռախոս գնել", ru: "Купить новый телефон" },
          { en: "To find a balance", hy: "Հավասարակշռություն գտնել", ru: "Найти баланс" },
          { en: "To use phones all day", hy: "Ամբողջ օրը հեռախոս օգտագործել", ru: "Использовать телефон весь день" }
        ],
        correctIndex: 1
      }
    ]
  },

  // 12. CULTURE
  {
    id: "culture_festival",
    level: "A2",
    topics: ["culture"],
    title: { en: "A Traditional Festival", hy: "Ավանդական փառատոն", ru: "Традиционный фестиваль" },
    format: "Story",
    difficulty: 1,
    words: 75,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Every year, my town celebrates a traditional festival in autumn. People wear beautiful national clothes and cook special food. There is music, dancing, and games for children. It is a great time to meet friends and learn about our history and culture.",
        hy: "Ամեն տարի իմ քաղաքը աշնանը նշում է ավանդական փառատոն: Մարդիկ հագնում են գեղեցիկ ազգային հագուստ և պատրաստում հատուկ ուտելիք: Կա երաժշտություն, պարեր և խաղեր երեխաների համար: Սա հիանալի ժամանակ է ընկերների հետ հանդիպելու և մեր պատմությունն ու մշակույթը սովորելու համար:",
        ru: "Каждый год мой город осенью отмечает традиционный фестиваль. Люди надевают красивую национальную одежду и готовят особую еду. Там есть музыка, танцы и игры для детей. Это отличное время, чтобы встретиться с друзьями и узнать о нашей истории и культуре."
      }
    ],
    vocabulary: [
      { word: "festival", translation: { en: "festival", hy: "փառատոն", ru: "фестиваль" } },
      { word: "national clothes", translation: { en: "national clothes", hy: "ազգային հագուստ", ru: "национальная одежда" } },
      { word: "celebrate", translation: { en: "celebrate", hy: "նշել", ru: "праздновать" } }
    ],
    questions: [
      {
        question: { en: "When is the festival celebrated?", hy: "Ե՞րբ է նշվում փառատոնը:", ru: "Когда отмечается фестиваль?" },
        options: [
          { en: "In spring", hy: "Գարնանը", ru: "Весной" },
          { en: "In autumn", hy: "Աշնանը", ru: "Осенью" },
          { en: "In winter", hy: "Ձմռանը", ru: "Зимой" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What do people wear?", hy: "Ի՞նչ են հագնում մարդիկ:", ru: "Что надевают люди?" },
        options: [
          { en: "National clothes", hy: "Ազգային հագուստ", ru: "Национальную одежду" },
          { en: "Sports clothes", hy: "Սպորտային հագուստ", ru: "Спортивную одежду" },
          { en: "Business suits", hy: "Գործնական կոստյումներ", ru: "Деловые костюмы" }
        ],
        correctIndex: 0
      }
    ]
  },

  // 13. STORIES
  {
    id: "stories_letter",
    level: "B1",
    topics: ["stories"],
    title: { en: "The Mysterious Letter", hy: "Առեղծվածային նամակը", ru: "Таинственное письмо" },
    format: "Story",
    difficulty: 2,
    words: 95,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "One cold evening, a woman found an old letter under her door. It had no name, only a strange symbol. Inside, there was a map showing a place in the forest. She decided to follow it. After an hour of walking, she found a small wooden box with a golden key inside.",
        hy: "Մի ցուրտ երեկո մի կին իր դռան տակ գտավ հին նամակ: Այն չուներ անուն, միայն տարօրինակ խորհրդանիշ: Ներսում կար քարտեզ, որը ցույց էր տալիս մի տեղ անտառում: Նա որոշեց հետևել դրան: Մեկ ժամ քայլելուց հետո նա գտավ մի փոքրիկ փայտե տուփ, որի մեջ ոսկե բանալի կար:",
        ru: "Однажды холодным вечером женщина нашла под дверью старое письмо. На нём не было имени, только странный символ. Внутри была карта, показывающая место в лесу. Она решила последовать ей. После часа ходьбы она нашла маленькую деревянную коробку, внутри которой был золотой ключ."
      }
    ],
    vocabulary: [
      { word: "mysterious", translation: { en: "mysterious", hy: "առեղծվածային", ru: "таинственный" } },
      { word: "symbol", translation: { en: "symbol", hy: "խորհրդանիշ", ru: "символ" } },
      { word: "map", translation: { en: "map", hy: "քարտեզ", ru: "карта" } }
    ],
    questions: [
      {
        question: { en: "What was inside the letter?", hy: "Ի՞նչ կար նամակի մեջ:", ru: "Что было внутри письма?" },
        options: [
          { en: "Money", hy: "Փող", ru: "Деньги" },
          { en: "A map", hy: "Քարտեզ", ru: "Карта" },
          { en: "A photo", hy: "Լուսանկար", ru: "Фотография" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What did she find in the forest?", hy: "Ի՞նչ գտավ նա անտառում:", ru: "Что она нашла в лесу?" },
        options: [
          { en: "A house", hy: "Տուն", ru: "Дом" },
          { en: "A wooden box with a key", hy: "Փայտե տուփ բանալիով", ru: "Деревянную коробку с ключом" },
          { en: "A treasure chest", hy: "Գանձերով սնդուկ", ru: "Сундук с сокровищами" }
        ],
        correctIndex: 1
      }
    ]
  },

  // 14. SOCIETY
  {
    id: "society_community",
    level: "B1",
    topics: ["society"],
    title: { en: "Helping the Community", hy: "Օգնելով համայնքին", ru: "Помощь обществу" },
    format: "Essay",
    difficulty: 2,
    words: 85,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Helping your community is a wonderful way to make the world a better place. You can volunteer at a local animal shelter, help elderly people, or clean up parks. Small actions can have a big impact. When we work together, we can solve problems and create a happier society.",
        hy: "Ձեր համայնքին օգնելը հիանալի միջոց է աշխարհը ավելի լավ տեղ դարձնելու համար: Դուք կարող եք կամավոր աշխատել տեղական կենդանիների ապաստանում, օգնել տարեցներին կամ մաքրել զբոսայգիները: Փոքր գործողությունները կարող են մեծ ազդեցություն ունենալ: Երբ մենք միասին ենք աշխատում, կարող ենք լուծել խնդիրներ և ստեղծել ավելի երջանիկ հասարակություն:",
        ru: "Помощь своему сообществу — прекрасный способ сделать мир лучше. Вы можете стать волонтёром в местном приюте для животных, помогать пожилым людям или убирать парки. Маленькие действия могут иметь большое значение. Когда мы работаем вместе, мы можем решать проблемы и создавать более счастливое общество."
      }
    ],
    vocabulary: [
      { word: "community", translation: { en: "community", hy: "համայնք", ru: "сообщество" } },
      { word: "volunteer", translation: { en: "volunteer", hy: "կամավոր", ru: "волонтёр" } },
      { word: "impact", translation: { en: "impact", hy: "ազդեցություն", ru: "влияние" } }
    ],
    questions: [
      {
        question: { en: "What is a way to help the community?", hy: "Ո՞րն է համայնքին օգնելու միջոց:", ru: "Каков способ помочь сообществу?" },
        options: [
          { en: "Volunteering at a shelter", hy: "Կամավոր աշխատել ապաստանում", ru: "Волонтёрство в приюте" },
          { en: "Staying at home", hy: "Տանը մնալ", ru: "Оставаться дома" },
          { en: "Watching TV", hy: "Հեռուստացույց դիտել", ru: "Смотреть телевизор" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What happens when we work together?", hy: "Ի՞նչ է տեղի ունենում, երբ միասին ենք աշխատում:", ru: "Что происходит, когда мы работаем вместе?" },
        options: [
          { en: "Nothing changes", hy: "Ոչինչ չի փոխվում", ru: "Ничего не меняется" },
          { en: "We create a happier society", hy: "Մենք ստեղծում ենք ավելի երջանիկ հասարակություն", ru: "Мы создаём более счастливое общество" },
          { en: "We get tired", hy: "Մենք հոգնում ենք", ru: "Мы устаём" }
        ],
        correctIndex: 1
      }
    ]
  },

  // 15. SCIENCE
  {
    id: "science_water_cycle",
    level: "A2",
    topics: ["science"],
    title: { en: "The Water Cycle", hy: "Ջրի շրջապտույտը", ru: "Круговорот воды" },
    format: "Essay",
    difficulty: 1,
    words: 75,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Water is always moving around our planet in a process called the water cycle. When the sun heats the water in oceans and rivers, it turns into vapor and goes up into the sky. Then, it cools down, forms clouds, and falls back to earth as rain or snow.",
        hy: "Ջուրը միշտ շարժվում է մեր մոլորակի շուրջը մի գործընթացում, որը կոչվում է ջրի շրջապտույտ: Երբ արևը տաքացնում է օվկիանոսների և գետերի ջուրը, այն վերածվում է գոլորշու և բարձրանում երկինք: Այնուհետև այն սառչում է, առաջացնում ամպեր և անձրևի կամ ձյան տեսքով վերադառնում երկիր:",
        ru: "Вода постоянно движется вокруг нашей планеты в процессе, называемом круговоротом воды. Когда солнце нагревает воду в океанах и реках, она превращается в пар и поднимается в небо. Затем она охлаждается, образует облака и возвращается на землю в виде дождя или снега."
      }
    ],
    vocabulary: [
      { word: "cycle", translation: { en: "cycle", hy: "շրջապտույտ", ru: "цикл" } },
      { word: "vapor", translation: { en: "vapor", hy: "գոլորշի", ru: "пар" } },
      { word: "cloud", translation: { en: "cloud", hy: "ամպ", ru: "облако" } }
    ],
    questions: [
      {
        question: { en: "What turns water into vapor?", hy: "Ի՞նչն է ջուրը վերածում գոլորշու:", ru: "Что превращает воду в пар?" },
        options: [
          { en: "The wind", hy: "Քամին", ru: "Ветер" },
          { en: "The sun", hy: "Արևը", ru: "Солнце" },
          { en: "The moon", hy: "Լուսինը", ru: "Луна" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What forms in the sky?", hy: "Ի՞նչ է առաջանում երկնքում:", ru: "Что образуется в небе?" },
        options: [
          { en: "Clouds", hy: "Ամպեր", ru: "Облака" },
          { en: "Mountains", hy: "Լեռներ", ru: "Горы" },
          { en: "Trees", hy: "Ծառեր", ru: "Деревья" }
        ],
        correctIndex: 0
      }
    ]
  },

  // 16. HISTORY
  {
    id: "history_castle",
    level: "B1",
    topics: ["history"],
    title: { en: "The Old Castle", hy: "Հին ամրոցը", ru: "Старый замок" },
    format: "Story",
    difficulty: 2,
    words: 80,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "On top of the hill, there is an old stone castle. It was built more than 500 years ago by a powerful king. Today, it is a museum. Thousands of tourists visit it every year to learn about its history and see the ancient walls and towers.",
        hy: "Բլրի գագաթին կա մի հին քարե ամրոց: Այն կառուցվել է ավելի քան 500 տարի առաջ մի հզոր թագավորի կողմից: Այսօր այն թանգարան է: Հազարավոր զբոսաշրջիկներ ամեն տարի այցելում են այն՝ իմանալու նրա պատմությունը և տեսնելու հին պարիսպներն ու աշտարակները:",
        ru: "На вершине холма стоит старый каменный замок. Он был построен более 500 лет назад могущественным королём. Сегодня это музей. Тысячи туристов посещают его каждый год, чтобы узнать его историю и увидеть древние стены и башни."
      }
    ],
    vocabulary: [
      { word: "castle", translation: { en: "castle", hy: "ամրոց", ru: "замок" } },
      { word: "ancient", translation: { en: "ancient", hy: "հին", ru: "древний" } },
      { word: "tourist", translation: { en: "tourist", hy: "զբոսաշրջիկ", ru: "турист" } }
    ],
    questions: [
      {
        question: { en: "When was the castle built?", hy: "Ե՞րբ է կառուցվել ամրոցը:", ru: "Когда был построен замок?" },
        options: [
          { en: "100 years ago", hy: "100 տարի առաջ", ru: "100 лет назад" },
          { en: "More than 500 years ago", hy: "Ավելի քան 500 տարի առաջ", ru: "Более 500 лет назад" },
          { en: "50 years ago", hy: "50 տարի առաջ", ru: "50 лет назад" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What is the castle today?", hy: "Ի՞նչ է ամրոցը այսօր:", ru: "Чем является замок сегодня?" },
        options: [
          { en: "A hotel", hy: "Հյուրանոց", ru: "Отель" },
          { en: "A museum", hy: "Թանգարան", ru: "Музей" },
          { en: "A school", hy: "Դպրոց", ru: "Школа" }
        ],
        correctIndex: 1
      }
    ]
  },

  // 17. MONEY
  {
    id: "money_saving",
    level: "A2",
    topics: ["money"],
    title: { en: "Saving Money", hy: "Գումար խնայելը", ru: "Экономия денег" },
    format: "Story",
    difficulty: 1,
    words: 75,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "My brother wants to buy a new bicycle. It costs 200 dollars. He decided to save money. He stopped buying coffee every morning and started making it at home. He also walks to work instead of taking the bus. After three months, he finally had enough money.",
        hy: "Իմ եղբայրը ուզում է նոր հեծանիվ գնել: Այն արժե 200 դոլար: Նա որոշեց գումար խնայել: Նա դադարեց ամեն առավոտ սուրճ գնելուց և սկսեց այն տանը պատրաստել: Նա նաև քայլում է աշխատանքի գնալու համար՝ ավտոբուս նստելու փոխարեն: Երեք ամիս անց նա վերջապես բավականաչափ գումար ուներ:",
        ru: "Мой брат хочет купить новый велосипед. Он стоит 200 долларов. Он решил экономить деньги. Он перестал покупать кофе каждое утро и начал готовить его дома. Он также ходит на работу пешком вместо того, чтобы ездить на автобусе. Через три месяца у него наконец-то появилось достаточно денег."
      }
    ],
    vocabulary: [
      { word: "save money", translation: { en: "save money", hy: "գումար խնայել", ru: "экономить деньги" } },
      { word: "enough", translation: { en: "enough", hy: "բավարար", ru: "достаточно" } },
      { word: "instead of", translation: { en: "instead of", hy: "փոխարեն", ru: "вместо" } }
    ],
    questions: [
      {
        question: { en: "What does the brother want to buy?", hy: "Ի՞նչ է ուզում գնել եղբայրը:", ru: "Что хочет купить брат?" },
        options: [
          { en: "A car", hy: "Մեքենա", ru: "Машину" },
          { en: "A bicycle", hy: "Հեծանիվ", ru: "Велосипед" },
          { en: "A phone", hy: "Հեռախոս", ru: "Телефон" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How does he go to work now?", hy: "Ինչպե՞ս է նա հիմա գնում աշխատանքի:", ru: "Как он сейчас ходит на работу?" },
        options: [
          { en: "By bus", hy: "Ավտոբուսով", ru: "На автобусе" },
          { en: "By car", hy: "Մեքենայով", ru: "На машине" },
          { en: "On foot", hy: "Ոտքով", ru: "Пешком" }
        ],
        correctIndex: 2
      }
    ]
  },

  // 18. RELATIONSHIPS
  {
    id: "relationships_friend",
    level: "A2",
    topics: ["relationships"],
    title: { en: "A Good Friend", hy: "Լավ ընկերը", ru: "Хороший друг" },
    format: "Story",
    difficulty: 1,
    words: 70,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "A good friend is someone who listens to you and helps you when you have problems. My best friend's name is David. We met at school ten years ago. We like to play football and watch movies together. I know I can always trust him.",
        hy: "Լավ ընկերը նա է, ով լսում է քեզ և օգնում է, երբ խնդիրներ ունես: Իմ լավագույն ընկերոջ անունը Դավիթ է: Մենք հանդիպել ենք դպրոցում տասը տարի առաջ: Մենք սիրում ենք միասին ֆուտբոլ խաղալ և ֆիլմեր դիտել: Ես գիտեմ, որ միշտ կարող եմ վստահել նրան:",
        ru: "Хороший друг — это тот, кто слушает тебя и помогает, когда у тебя проблемы. Моего лучшего друга зовут Давид. Мы познакомились в школе десять лет назад. Мы любим вместе играть в футбол и смотреть фильмы. Я знаю, что всегда могу ему доверять."
      }
    ],
    vocabulary: [
      { word: "trust", translation: { en: "trust", hy: "վստահել", ru: "доверять" } },
      { word: "listen", translation: { en: "listen", hy: "լսել", ru: "слушать" } },
      { word: "met", translation: { en: "met", hy: "հանդիպել", ru: "встретились" } }
    ],
    questions: [
      {
        question: { en: "Where did they meet?", hy: "Որտե՞ղ են նրանք հանդիպել:", ru: "Где они познакомились?" },
        options: [
          { en: "At work", hy: "Աշխատանքում", ru: "На работе" },
          { en: "At school", hy: "Դպրոցում", ru: "В школе" },
          { en: "At the park", hy: "Այգում", ru: "В парке" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What do they like to do together?", hy: "Ի՞նչ են նրանք սիրում անել միասին:", ru: "Что они любят делать вместе?" },
        options: [
          { en: "Play football and watch movies", hy: "Ֆուտբոլ խաղալ և ֆիլմեր դիտել", ru: "Играть в футбол и смотреть фильмы" },
          { en: "Read books", hy: "Գրքեր կարդալ", ru: "Читать книги" },
          { en: "Cook dinner", hy: "Ընթրիք պատրաստել", ru: "Готовить ужин" }
        ],
        correctIndex: 0
      }
    ]
  },

  // 19. MEDIA
  {
    id: "media_news",
    level: "B1",
    topics: ["media"],
    title: { en: "News in the Digital Age", hy: "Նորությունները թվային դարաշրջանում", ru: "Новости в цифровую эпоху" },
    format: "Essay",
    difficulty: 2,
    words: 80,
    minutes: 1,
    parts: 1,
    questionsCount: 2,
    paragraphs: [
      {
        en: "Today, we get news from many different sources: social media, websites, and television. The internet allows us to know what is happening in the world instantly. However, not all information online is true. It is very important to check the facts and use trusted websites.",
        hy: "Այսօր մենք նորություններ ենք ստանում բազմաթիվ տարբեր աղբյուրներից՝ սոցիալական ցանցերից, կայքերից և հեռուստատեսությունից: Ինտերնետը թույլ է տալիս ակնթարթորեն իմանալ, թե ինչ է կատարվում աշխարհում: Այնուամենայնիվ, ոչ բոլոր տեղեկություններն են ինտերնետում ճշմարիտ: Շատ կարևոր է ստուգել փաստերը և օգտագործել վստահելի կայքեր:",
        ru: "Сегодня мы получаем новости из множества разных источников: социальных сетей, веб-сайтов и телевидения. Интернет позволяет нам мгновенно узнавать, что происходит в мире. Однако не вся информация в сети является правдивой. Очень важно проверять факты и использовать проверенные сайты."
      }
    ],
    vocabulary: [
      { word: "source", translation: { en: "source", hy: "աղբյուր", ru: "источник" } },
      { word: "instantly", translation: { en: "instantly", hy: "ակնթարթորեն", ru: "мгновенно" } },
      { word: "trusted", translation: { en: "trusted", hy: "վստահելի", ru: "проверенный" } }
    ],
    questions: [
      {
        question: { en: "Where do we get news from today?", hy: "Որտեղի՞ց ենք մենք այսօր նորություններ ստանում:", ru: "Откуда мы сегодня получаем новости?" },
        options: [
          { en: "Only from newspapers", hy: "Միայն թերթերից", ru: "Только из газет" },
          { en: "From many different sources", hy: "Բազմաթիվ տարբեր աղբյուրներից", ru: "Из множества разных источников" },
          { en: "Only from the radio", hy: "Միայն ռադիոյից", ru: "Только по радио" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What is important to do with online information?", hy: "Ի՞նչն է կարևոր անել առցանց տեղեկատվության հետ:", ru: "Что важно делать с онлайн-информацией?" },
        options: [
          { en: "Share it immediately", hy: "Անմիջապես կիսվել դրանով", ru: "Сразу делиться ею" },
          { en: "Check the facts", hy: "Ստուգել փաստերը", ru: "Проверять факты" },
          { en: "Ignore it", hy: "Անտեսել այն", ru: "Игнорировать её" }
        ],
        correctIndex: 1
      }
    ]
  }
];