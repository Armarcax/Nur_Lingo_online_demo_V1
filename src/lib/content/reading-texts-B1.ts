// src/lib/content/reading-texts-B1.ts

import type { ReadingText } from "./reading-types";

export const B1_TEXTS: ReadingText[] = [
  // 1. TRAVEL
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about a trip you remember!", hy: "Պատմիր հիշարժան ուղևորության մասին:", ru: "Расскажи о поездке, которую ты помнишь!" },
      questions: [
        { en: "Where did you go?", hy: "Ո՞ւր գնացիր:", ru: "Куда ты поехал?" },
        { en: "Who did you go with?", hy: "Ու՞մ հետ գնացիր:", ru: "С кем ты поехал?" },
        { en: "What was the most memorable moment?", hy: "Ո՞րն էր ամենահիշարժան պահը:", ru: "Какой момент был самым запоминающимся?" }
      ]
    }
  },

  // 2. WORK
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about your first day at school or work!", hy: "Պատմիր դպրոցում կամ աշխատանքում առաջին օրդ:", ru: "Расскажи о своём первом дне в школе или на работе!" },
      questions: [
        { en: "How did you feel?", hy: "Ինչպե՞ս էիր զգում:", ru: "Как ты себя чувствовал?" },
        { en: "Who helped you?", hy: "Ո՞վ օգնեց քեզ:", ru: "Кто тебе помог?" },
        { en: "What did you learn?", hy: "Ի՞նչ սովորեցիր:", ru: "Чему ты научился?" }
      ]
    }
  },

  // 3. LEARNING
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about your language learning experience!", hy: "Պատմիր լեզու սովորելու փորձիդ մասին:", ru: "Расскажи о своём опыте изучения языка!" },
      questions: [
        { en: "Why are you learning a new language?", hy: "Ինչո՞ւ ես նոր լեզու սովորում:", ru: "Почему ты учишь новый язык?" },
        { en: "What is the most difficult part?", hy: "Ո՞րն է ամենադժվար մասը:", ru: "Что самое сложное?" },
        { en: "What helps you practice?", hy: "Ի՞նչն է օգնում քեզ պարապել:", ru: "Что помогает тебе практиковаться?" }
      ]
    }
  },

  // 4. HEALTH
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
          { en: "More stressed", hy: "Ավելի սթրեսային", ru: "Более напряжённым" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about a small change you made in your life!", hy: "Պատմիր քո կյանքում կատարած փոքր փոփոխության մասին:", ru: "Расскажи о небольшом изменении, которое ты сделал в своей жизни!" },
      questions: [
        { en: "What did you change?", hy: "Ի՞նչ փոխեցիր:", ru: "Что ты изменил?" },
        { en: "Why did you decide to change it?", hy: "Ինչո՞ւ որոշեցիր փոխել այն:", ru: "Почему ты решил это изменить?" },
        { en: "How did you feel after the change?", hy: "Ինչպե՞ս էիր զգում փոփոխությունից հետո:", ru: "Как ты себя чувствовал после изменения?" }
      ]
    }
  },

  // 5. TECH
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
    ],
    creativeTask: {
      prompt: { en: "Tell us how you use your phone!", hy: "Պատմիր, թե ինչպես ես օգտագործում հեռախոսդ:", ru: "Расскажи, как ты используешь свой телефон!" },
      questions: [
        { en: "What do you use your phone for?", hy: "Ինչի՞ համար ես օգտագործում հեռախոսդ:", ru: "Для чего ты используешь свой телефон?" },
        { en: "How much time do you spend on it daily?", hy: "Օրական որքա՞ն ժամանակ ես անցկացնում դրա վրա:", ru: "Сколько времени ты проводишь в нём ежедневно?" },
        { en: "How can we find a balance?", hy: "Ինչպե՞ս կարող ենք հավասարակշռություն գտնել:", ru: "Как мы можем найти баланс?" }
      ]
    }
  },

  // 6. STORIES
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
    ],
    creativeTask: {
      prompt: { en: "Continue the story!", hy: "Շարունակիր պատմությունը:", ru: "Продолжи историю!" },
      questions: [
        { en: "What could be inside the box?", hy: "Ի՞նչ կարող է լինել տուփի մեջ:", ru: "Что может быть внутри коробки?" },
        { en: "What will the woman do next?", hy: "Ի՞նչ կանի կինը հետո:", ru: "Что женщина сделает дальше?" },
        { en: "Who wrote the letter?", hy: "Ո՞վ է գրել նամակը:", ru: "Кто написал письмо?" }
      ]
    }
  },

  // 7. SOCIETY
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
    ],
    creativeTask: {
      prompt: { en: "Tell us how you help your community!", hy: "Պատմիր, թե ինչպես ես օգնում քո համայնքին:", ru: "Расскажи, как ты помогаешь своему сообществу!" },
      questions: [
        { en: "How do you help others?", hy: "Ինչպե՞ս ես օգնում ուրիշներին:", ru: "Как ты помогаешь другим?" },
        { en: "Why is helping important?", hy: "Ինչո՞ւ է օգնելը կարևոր:", ru: "Почему важно помогать?" },
        { en: "What can we do together?", hy: "Ի՞նչ կարող ենք անել միասին:", ru: "Что мы можем сделать вместе?" }
      ]
    }
  },

  // 8. HISTORY
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about a historical place you know!", hy: "Պատմիր քեզ հայտնի պատմական վայրի մասին:", ru: "Расскажи об историческом месте, которое ты знаешь!" },
      questions: [
        { en: "What is the place?", hy: "Ի՞նչ վայր է:", ru: "Что это за место?" },
        { en: "What is its history?", hy: "Ո՞րն է նրա պատմությունը:", ru: "Какова его история?" },
        { en: "Why do people visit it?", hy: "Ինչո՞ւ են մարդիկ այցելում այն:", ru: "Почему люди его посещают?" }
      ]
    }
  },

  // 9. MEDIA
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
    ],
    creativeTask: {
      prompt: { en: "Tell us how you get your news!", hy: "Պատմիր, թե ինչպես ես նորություններ ստանում:", ru: "Расскажи, как ты получаешь новости!" },
      questions: [
        { en: "Where do you get news from?", hy: "Որտեղի՞ց ես նորություններ ստանում:", ru: "Откуда ты получаешь новости?" },
        { en: "Do you trust all information online?", hy: "Վստահու՞մ ես առցանց բոլոր տեղեկություններին:", ru: "Доверяешь ли ты всей информации в интернете?" },
        { en: "How can we check the facts?", hy: "Ինչպե՞ս կարող ենք ստուգել փաստերը:", ru: "Как мы можем проверить факты?" }
      ]
    }
  }
];