// src/lib/content/reading-texts-A2.ts

import type { ReadingText } from "./reading-types";

export const A2_TEXTS: ReadingText[] = [
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about a helpful neighbor!", hy: "Պատմիր օգնող հարևանի մասին:", ru: "Расскажи о помогающем соседе!" },
      questions: [
        { en: "Who is your neighbor?", hy: "Ո՞վ է քո հարևանը:", ru: "Кто твой сосед?" },
        { en: "What did they do to help you?", hy: "Ի՞նչ արեցին նրանք քեզ օգնելու համար:", ru: "Что они сделали, чтобы помочь тебе?" },
        { en: "How did you feel?", hy: "Ինչպե՞ս էիր զգում:", ru: "Как ты себя чувствовал?" }
      ]
    }
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about a special meal!", hy: "Պատմիր հատուկ ընթրիքի մասին:", ru: "Расскажи об особенном ужине!" },
      questions: [
        { en: "Where did you go?", hy: "Ո՞ւր գնացիր:", ru: "Куда ты пошёл?" },
        { en: "What did you order?", hy: "Ի՞նչ պատվիրեցիր:", ru: "Что ты заказал?" },
        { en: "What was the best part of the meal?", hy: "Ո՞րն էր ուտելիքի լավագույն մասը:", ru: "Что было лучшей частью еды?" }
      ]
    }
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
          { en: "A bus driver", hy: "Ավտոբուսի վարորդը", ru: "Водитель автобуса" },
          { en: "A kind woman", hy: "Մի բարի կին", ru: "Добрая женщина" },
          { en: "A child", hy: "Մի երեխա", ru: "Ребёнок" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about a time you lost something!", hy: "Պատմիր մի դեպքի մասին, երբ ինչ-որ բան կորցրել ես:", ru: "Расскажи о случае, когда ты что-то потерял!" },
      questions: [
        { en: "What did you lose?", hy: "Ի՞նչ կորցրիր:", ru: "Что ты потерял?" },
        { en: "Where did you lose it?", hy: "Որտե՞ղ կորցրիր այն:", ru: "Где ты это потерял?" },
        { en: "How did you feel, and what happened in the end?", hy: "Ինչպե՞ս էիր զգում, և ի՞նչ եղավ վերջում:", ru: "Как ты себя чувствовал, и что случилось в итоге?" }
      ]
    }
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about your favorite hobby!", hy: "Պատմիր քո սիրելի հոբբիի մասին:", ru: "Расскажи о своём любимом хобби!" },
      questions: [
        { en: "What is your hobby?", hy: "Ո՞րն է քո հոբբին:", ru: "Какое у тебя хобби?" },
        { en: "When do you do it?", hy: "Ե՞րբ ես դա անում:", ru: "Когда ты этим занимаешься?" },
        { en: "Why do you like it?", hy: "Ինչո՞ւ է այն քեզ դուր գալիս:", ru: "Почему тебе это нравится?" }
      ]
    }
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about a walk in nature!", hy: "Պատմիր բնության մեջ զբոսանքի մասին:", ru: "Расскажи о прогулке на природе!" },
      questions: [
        { en: "Where did you go?", hy: "Ո՞ւր գնացիր:", ru: "Куда ты пошёл?" },
        { en: "What did you see?", hy: "Ի՞նչ տեսար:", ru: "Что ты увидел?" },
        { en: "How did you feel?", hy: "Ինչպե՞ս էիր զգում:", ru: "Как ты себя чувствовал?" }
      ]
    }
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about a festival in your country!", hy: "Պատմիր քո երկրի փառատոներից մեկի մասին:", ru: "Расскажи о фестивале в твоей стране!" },
      questions: [
        { en: "What festival is it?", hy: "Ի՞նչ փառատոն է:", ru: "Что это за фестиваль?" },
        { en: "When is it celebrated?", hy: "Ե՞րբ է այն նշվում:", ru: "Когда его отмечают?" },
        { en: "What do people do during the festival?", hy: "Ի՞նչ են անում մարդիկ փառատոնի ընթացքում:", ru: "Что люди делают во время фестиваля?" }
      ]
    }
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
    ],
    creativeTask: {
      prompt: { en: "Tell us what you know about nature!", hy: "Պատմիր, թե ինչ գիտես բնության մասին:", ru: "Расскажи, что ты знаешь о природе!" },
      questions: [
        { en: "What is your favorite natural process?", hy: "Ո՞րն է քո սիրելի բնական գործընթացը:", ru: "Какой твой любимый природный процесс?" },
        { en: "Why is water important?", hy: "Ինչո՞ւ է ջուրը կարևոր:", ru: "Почему важна вода?" },
        { en: "How can we save water?", hy: "Ինչպե՞ս կարող ենք խնայել ջուրը:", ru: "Как мы можем экономить воду?" }
      ]
    }
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about how you save money!", hy: "Պատմիր, թե ինչպես ես գումար խնայում:", ru: "Расскажи, как ты экономишь деньги!" },
      questions: [
        { en: "What do you want to buy?", hy: "Ի՞նչ ես ուզում գնել:", ru: "Что ты хочешь купить?" },
        { en: "How do you save money?", hy: "Ինչպե՞ս ես գումար խնայում:", ru: "Как ты экономишь деньги?" },
        { en: "How long will it take?", hy: "Որքա՞ն ժամանակ կպահանջվի:", ru: "Сколько времени это займёт?" }
      ]
    }
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about your best friend!", hy: "Պատմիր քո լավագույն ընկերոջ մասին:", ru: "Расскажи о своём лучшем друге!" },
      questions: [
        { en: "What is your friend's name?", hy: "Ի՞նչ է քո ընկերոջ անունը:", ru: "Как зовут твоего друга?" },
        { en: "How did you meet?", hy: "Ինչպե՞ս եք ծանոթացել:", ru: "Как вы познакомились?" },
        { en: "What do you like to do together?", hy: "Ի՞նչ եք սիրում անել միասին:", ru: "Что вы любите делать вместе?" }
      ]
    }
  },

  // ─── ԹԵՄԱ 08. MY SCHOOL SUBJECTS — 6 տեքստ ───────────────────────

  // 08.1. My Favourite Teacher
  {
    id: "teacher_favourite",
    level: "A2",
    topics: ["school", "people"],
    title: { en: "My Favourite Teacher", hy: "Իմ սիրելի ուսուցիչը", ru: "Мой любимый учитель" },
    format: "Story",
    difficulty: 1,
    words: 108,
    minutes: 1,
    parts: 6,
    questionsCount: 5,
    paragraphs: [
      {
        en: "My favourite teacher is Miss Anna. She is our English teacher. She is kind, friendly and patient.",
        hy: "Իմ սիրելի ուսուցչուհին միսս Աննան է։ Նա մեր անգլերենի ուսուցչուհին է։ Նա բարի է, ընկերասեր և համբերատար։",
        ru: "Мой любимый учитель — мисс Анна. Она наша учительница английского языка. Она добрая, дружелюбная и терпеливая."
      },
      {
        en: "She has long brown hair and beautiful green eyes. She always smiles when she comes into the classroom.",
        hy: "Նա երկար շագանակագույն մազեր և գեղեցիկ կանաչ աչքեր ունի։ Երբ նա մտնում է դասարան, միշտ ժպտում է։",
        ru: "У неё длинные каштановые волосы и красивые зелёные глаза. Она всегда улыбается, когда входит в класс."
      },
      {
        en: "Miss Anna speaks clearly and explains new words to us. She writes new words on the board and gives us interesting exercises.",
        hy: "Միսս Աննան հստակ է խոսում և մեզ բացատրում նոր բառերը։ Նա գրատախտակին գրում է նոր բառեր և մեզ հետաքրքիր վարժություններ տալիս։",
        ru: "Мисс Анна говорит чётко и объясняет нам новые слова. Она пишет новые слова на доске и даёт нам интересные упражнения."
      },
      {
        en: "Sometimes we read short stories, sing songs and play word games in her lessons. She helps us when we make mistakes.",
        hy: "Երբեմն նրա դասերին մենք կարճ պատմություններ ենք կարդում, երգեր երգում և բառախաղեր խաղում։ Նա օգնում է մեզ, երբ մենք սխալներ ենք թույլ տալիս։",
        ru: "Иногда на её уроках мы читаем короткие рассказы, поём песни и играем в словесные игры. Она помогает нам, когда мы делаем ошибки."
      },
      {
        en: "I am not afraid to speak English in her class. She always encourages us to try again.",
        hy: "Ես նրա դասարանում չեմ վախենում անգլերեն խոսել։ Նա միշտ քաջալերում է մեզ կրկին փորձել։",
        ru: "Я не боюсь говорить по-английски на её уроках. Она всегда поддерживает нас и предлагает попробовать ещё раз."
      },
      {
        en: "I like Miss Anna because she makes learning English interesting and fun.",
        hy: "Ես սիրում եմ միսս Աննային, որովհետև նա անգլերեն սովորելը դարձնում է հետաքրքիր և զվարճալի։",
        ru: "Я люблю мисс Анну, потому что она делает изучение английского языка интересным и увлекательным."
      }
    ],
    vocabulary: [
      { word: "teacher", translation: { en: "teacher", hy: "ուսուցիչ", ru: "учитель" } },
      { word: "patient", translation: { en: "patient", hy: "համբերատար", ru: "терпеливый" } },
      { word: "smile", translation: { en: "smile", hy: "ժպտալ", ru: "улыбаться" } },
      { word: "board", translation: { en: "board", hy: "գրատախտակ", ru: "доска" } },
      { word: "mistake", translation: { en: "mistake", hy: "սխալ", ru: "ошибка" } },
      { word: "encourage", translation: { en: "encourage", hy: "քաջալերել", ru: "поддерживать" } },
      { word: "interesting", translation: { en: "interesting", hy: "հետաքրքիր", ru: "интересный" } },
      { word: "try again", translation: { en: "try again", hy: "կրկին փորձել", ru: "попробовать ещё раз" } }
    ],
    questions: [
      {
        question: { en: "What subject does Miss Anna teach?", hy: "Ի՞նչ առարկա է դասավանդում միսս Աննան:", ru: "Какой предмет преподаёт мисс Анна?" },
        options: [
          { en: "Maths", hy: "Մաթեմատիկա", ru: "Математику" },
          { en: "English", hy: "Անգլերեն", ru: "Английский" },
          { en: "Science", hy: "Բնագիտություն", ru: "Естествознание" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Miss Anna look like?", hy: "Ինչպիսի՞ տեսք ունի միսս Աննան:", ru: "Как выглядит мисс Анна?" },
        options: [
          { en: "She has short black hair", hy: "Նա կարճ սև մազեր ունի", ru: "У неё короткие чёрные волосы" },
          { en: "She has long brown hair and green eyes", hy: "Նա երկար շագանակագույն մազեր և կանաչ աչքեր ունի", ru: "У неё длинные каштановые волосы и зелёные глаза" },
          { en: "She has blonde hair and blue eyes", hy: "Նա շիկահեր է և կապույտ աչքեր ունի", ru: "У неё светлые волосы и голубые глаза" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What do the students sometimes do in her lessons?", hy: "Ի՞նչ են աշակերտները երբեմն անում նրա դասերին:", ru: "Что ученики иногда делают на её уроках?" },
        options: [
          { en: "They read stories, sing songs and play word games", hy: "Նրանք կարդում են պատմություններ, երգում և բառախաղեր խաղում", ru: "Они читают рассказы, поют песни и играют в словесные игры" },
          { en: "They watch television", hy: "Նրանք հեռուստացույց են դիտում", ru: "Они смотрят телевизор" },
          { en: "They play football outside", hy: "Նրանք դրսում ֆուտբոլ են խաղում", ru: "Они играют в футбол на улице" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does Miss Anna do when students make mistakes?", hy: "Ի՞նչ է անում միսս Աննան, երբ աշակերտները սխալվում են:", ru: "Что делает мисс Анна, когда ученики ошибаются?" },
        options: [
          { en: "She gets angry", hy: "Նա բարկանում է", ru: "Она сердится" },
          { en: "She ignores them", hy: "Նա անտեսում է նրանց", ru: "Она их игнорирует" },
          { en: "She helps them", hy: "Նա օգնում է նրանց", ru: "Она им помогает" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Why does the student like Miss Anna?", hy: "Ինչո՞ւ է աշակերտը սիրում միսս Աննային:", ru: "Почему ученику нравится мисс Анна?" },
        options: [
          { en: "Because she makes learning English interesting and fun", hy: "Որովհետև նա անգլերեն սովորելը դարձնում է հետաքրքիր և զվարճալի", ru: "Потому что она делает изучение английского интересным и весёлым" },
          { en: "Because she gives no homework", hy: "Որովհետև նա տնային չի տալիս", ru: "Потому что она не задаёт домашнее задание" },
          { en: "Because she finishes lessons early", hy: "Որովհետև նա շուտ է ավարտում դասերը", ru: "Потому что она рано заканчивает уроки" }
        ],
        correctIndex: 0
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about your favourite teacher!", hy: "Հիմա պատմիր քո սիրելի ուսուցչի մասին:", ru: "А теперь расскажи о своём любимом учителе!" },
      questions: [
        { en: "Who is your favourite teacher?", hy: "Ո՞վ է քո սիրելի ուսուցիչը:", ru: "Кто твой любимый учитель?" },
        { en: "What subject does your teacher teach?", hy: "Ի՞նչ առարկա է դասավանդում քո ուսուցիչը:", ru: "Какой предмет преподаёт твой учитель?" },
        { en: "What does your teacher look like?", hy: "Ինչպիսի՞ տեսք ունի քո ուսուցիչը:", ru: "Как выглядит твой учитель?" },
        { en: "Is your teacher kind and friendly?", hy: "Քո ուսուցիչը բարի՞ և ընկերասե՞ր է:", ru: "Твой учитель добрый и дружелюбный?" },
        { en: "What do you do in your teacher's lessons?", hy: "Ի՞նչ եք անում ձեր ուսուցչի դասերին:", ru: "Что вы делаете на уроках твоего учителя?" },
        { en: "Why do you like your teacher?", hy: "Ինչո՞ւ ես սիրում քո ուսուցչին:", ru: "Почему ты любишь своего учителя?" }
      ]
    }
  },

  // 08.2. Learning Together
  {
    id: "learning_together",
    level: "A2",
    topics: ["school", "relationships"],
    title: { en: "Learning Together", hy: "Միասին սովորելը", ru: "Учимся вместе" },
    format: "Story",
    difficulty: 1,
    words: 120,
    minutes: 1,
    parts: 7,
    questionsCount: 6,
    paragraphs: [
      {
        en: "My best friend is Tom. We are classmates. We sit next to each other in the classroom.",
        hy: "Իմ լավագույն ընկերը Թոմն է։ Մենք դասընկերներ ենք։ Մենք դասարանում նստում ենք իրար կողքի։",
        ru: "Мой лучший друг — Том. Мы одноклассники. Мы сидим рядом друг с другом в классе."
      },
      {
        en: "We like studying together. Sometimes I help Tom with English, and he helps me with Maths.",
        hy: "Մենք սիրում ենք միասին սովորել։ Երբեմն ես օգնում եմ Թոմին անգլերենի հարցում, իսկ նա ինձ օգնում է մաթեմատիկայից։",
        ru: "Нам нравится учиться вместе. Иногда я помогаю Тому с английским языком, а он помогает мне с математикой."
      },
      {
        en: "After school, we sometimes go to my house and do our homework together.",
        hy: "Դպրոցից հետո երբեմն գնում ենք իմ տուն և միասին կատարում մեր տնային աշխատանքները։",
        ru: "После школы мы иногда идём ко мне домой и вместе делаем домашнее задание."
      },
      {
        en: "Tom is good at Maths. He can solve difficult problems quickly. I am good at English. I can read stories and explain new words.",
        hy: "Թոմը լավ է մաթեմատիկայից։ Նա կարողանում է արագ լուծել բարդ խնդիրներ։ Ես լավ եմ անգլերենից։ Ես կարողանում եմ կարդալ պատմություններ և բացատրել նոր բառերը։",
        ru: "Том хорошо знает математику. Он умеет быстро решать сложные задачи. Я хорошо знаю английский язык. Я умею читать рассказы и объяснять новые слова."
      },
      {
        en: "When one of us does not understand something, the other one tries to help.",
        hy: "Երբ մեզանից մեկը ինչ-որ բան չի հասկանում, մյուսը փորձում է օգնել։",
        ru: "Когда один из нас чего-то не понимает, другой старается помочь."
      },
      {
        en: "We also take short breaks. We drink some water, eat fruit and talk about our favourite games.",
        hy: "Մենք նաև կարճ ընդմիջումներ ենք անում։ Մենք ջուր ենք խմում, միրգ ուտում և զրուցում մեր սիրելի խաղերի մասին։",
        ru: "Мы также делаем короткие перерывы. Мы пьём воду, едим фрукты и разговариваем о наших любимых играх."
      },
      {
        en: "Studying with a friend is fun. We learn new things and help each other every day.",
        hy: "Ընկերոջ հետ սովորելը զվարճալի է։ Մենք ամեն օր նոր բաներ ենք սովորում և օգնում միմյանց։",
        ru: "Учиться с другом весело. Мы каждый день узнаём что-то новое и помогаем друг другу."
      }
    ],
    vocabulary: [
      { word: "best friend", translation: { en: "best friend", hy: "լավագույն ընկեր", ru: "лучший друг" } },
      { word: "classmate", translation: { en: "classmate", hy: "դասընկեր", ru: "одноклассник" } },
      { word: "next to", translation: { en: "next to", hy: "կողքին", ru: "рядом" } },
      { word: "study", translation: { en: "study", hy: "սովորել", ru: "учиться" } },
      { word: "homework", translation: { en: "homework", hy: "տնային աշխատանք", ru: "домашнее задание" } },
      { word: "difficult", translation: { en: "difficult", hy: "դժվար", ru: "трудный" } },
      { word: "quickly", translation: { en: "quickly", hy: "արագ", ru: "быстро" } },
      { word: "understand", translation: { en: "understand", hy: "հասկանալ", ru: "понимать" } },
      { word: "explain", translation: { en: "explain", hy: "բացատրել", ru: "объяснять" } },
      { word: "help each other", translation: { en: "help each other", hy: "օգնել միմյանց", ru: "помогать друг другу" } },
      { word: "break", translation: { en: "break", hy: "ընդմիջում", ru: "перерыв" } },
      { word: "solve", translation: { en: "solve", hy: "լուծել", ru: "решать" } }
    ],
    questions: [
      {
        question: { en: "Who is the narrator's best friend?", hy: "Ո՞վ է պատմողի լավագույն ընկերը:", ru: "Кто лучший друг рассказчика?" },
        options: [
          { en: "David", hy: "Դավիթ", ru: "Давид" },
          { en: "Tom", hy: "Թոմ", ru: "Том" },
          { en: "Max", hy: "Մաքս", ru: "Макс" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does the narrator help Tom with?", hy: "Ինչո՞ւմ է պատմողը օգնում Թոմին:", ru: "В чём рассказчик помогает Тому?" },
        options: [
          { en: "English", hy: "Անգլերեն", ru: "Английский" },
          { en: "Science", hy: "Բնագիտություն", ru: "Естествознание" },
          { en: "Art", hy: "Կերպարվեստ", ru: "Рисование" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does Tom do well?", hy: "Ի՞նչ է Թոմը լավ անում:", ru: "Что Том делает хорошо?" },
        options: [
          { en: "He draws pictures", hy: "Նա նկարներ է նկարում", ru: "Он рисует картины" },
          { en: "He sings songs", hy: "Նա երգեր է երգում", ru: "Он поёт песни" },
          { en: "He solves Maths problems", hy: "Նա լուծում է մաթեմատիկական խնդիրներ", ru: "Он решает задачи по математике" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Where do the boys sometimes do their homework?", hy: "Որտե՞ղ են տղաները երբեմն կատարում տնայինը:", ru: "Где мальчики иногда делают домашнее задание?" },
        options: [
          { en: "At school", hy: "Դպրոցում", ru: "В школе" },
          { en: "At the narrator's house", hy: "Պատմողի տանը", ru: "У рассказчика дома" },
          { en: "At the park", hy: "Այգում", ru: "В парке" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What do the boys do when one of them does not understand something?", hy: "Ի՞նչ են անում տղաները, երբ նրանցից մեկը ինչ-որ բան չի հասկանում:", ru: "Что мальчики делают, когда один из них чего-то не понимает?" },
        options: [
          { en: "They stop studying", hy: "Նրանք դադարում են սովորել", ru: "Они перестают учиться" },
          { en: "They try to help each other", hy: "Նրանք փորձում են օգնել միմյանց", ru: "Они стараются помочь друг другу" },
          { en: "They go home", hy: "Նրանք գնում են տուն", ru: "Они идут домой" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What do they do during their breaks?", hy: "Ի՞նչ են նրանք անում ընդմիջումների ժամանակ:", ru: "Что они делают во время перерывов?" },
        options: [
          { en: "They drink water, eat fruit and talk", hy: "Նրանք ջուր են խմում, միրգ ուտում և զրուցում", ru: "Они пьют воду, едят фрукты и разговаривают" },
          { en: "They play computer games", hy: "Նրանք համակարգչային խաղեր են խաղում", ru: "Они играют в компьютерные игры" },
          { en: "They watch films", hy: "Նրանք ֆիլմեր են դիտում", ru: "Они смотрят фильмы" }
        ],
        correctIndex: 0
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us how you study with your friends!", hy: "Հիմա պատմիր, թե ինչպես ես սովորում ընկերներիդ հետ:", ru: "А теперь расскажи, как ты учишься с друзьями!" },
      questions: [
        { en: "Who is your best friend?", hy: "Ո՞վ է քո լավագույն ընկերը:", ru: "Кто твой лучший друг?" },
        { en: "Are you classmates?", hy: "Դուք դասընկերնե՞ր եք:", ru: "Вы одноклассники?" },
        { en: "Do you study together?", hy: "Դուք միասի՞ն եք սովորում:", ru: "Вы учитесь вместе?" },
        { en: "Which school subject do you like most?", hy: "Ո՞ր դպրոցական առարկան է քեզ ամենաշատը դուր գալիս:", ru: "Какой школьный предмет тебе нравится больше всего?" },
        { en: "Do you help your friends with homework?", hy: "Օգնու՞մ ես ընկերներիդ տնայինի հարցում:", ru: "Помогаешь ли ты друзьям с домашним заданием?" },
        { en: "What do you do during your breaks?", hy: "Ի՞նչ ես անում ընդմիջումներին:", ru: "Что ты делаешь на переменах?" }
      ]
    }
  },

  // 08.3. My Homework
  {
    id: "homework_daily",
    level: "A2",
    topics: ["school", "daily"],
    title: { en: "My Homework", hy: "Իմ տնային աշխատանքը", ru: "Моё домашнее задание" },
    format: "Story",
    difficulty: 1,
    words: 150,
    minutes: 1,
    parts: 7,
    questionsCount: 6,
    paragraphs: [
      {
        en: "My name is Alex. Every day after school, I come home and have lunch with my family.",
        hy: "Իմ անունը Ալեքս է։ Ամեն օր դպրոցից հետո ես տուն եմ գալիս և ընտանիքիս հետ ճաշում։",
        ru: "Меня зовут Алекс. Каждый день после школы я прихожу домой и обедаю вместе с семьёй."
      },
      {
        en: "After lunch, I take a short break. I play with my dog Max or read a funny story.",
        hy: "Ճաշից հետո մի փոքր հանգստանում եմ։ Ես խաղում եմ իմ շան՝ Մաքսի հետ կամ կարդում եմ զվարճալի պատմություն։",
        ru: "После обеда я немного отдыхаю. Я играю со своей собакой Максом или читаю весёлый рассказ."
      },
      {
        en: "Then I go to my room and prepare my school things. I open my books and notebooks and start doing my homework.",
        hy: "Այնուհետև գնում եմ իմ սենյակ և պատրաստում դպրոցական պարագաներս։ Բացում եմ գրքերս ու տետրերս և սկսում կատարել տնային աշխատանքներս։",
        ru: "Затем я иду в свою комнату и готовлю школьные принадлежности. Я открываю книги и тетради и начинаю делать домашнее задание."
      },
      {
        en: "First, I do my Maths homework. I read the problems carefully and write the answers in my notebook.",
        hy: "Սկզբում կատարում եմ մաթեմատիկայի տնային աշխատանքը։ Ուշադիր կարդում եմ խնդիրները և պատասխանները գրում տետրում։",
        ru: "Сначала я выполняю домашнее задание по математике. Я внимательно читаю задачи и записываю ответы в тетрадь."
      },
      {
        en: "Next, I do my English homework. I learn new words, read a short text and answer questions.",
        hy: "Հաջորդը կատարում եմ անգլերենի տնային աշխատանքը։ Սովորում եմ նոր բառեր, կարդում կարճ տեքստ և պատասխանում հարցերին։",
        ru: "Затем я делаю домашнее задание по английскому языку. Я учу новые слова, читаю небольшой текст и отвечаю на вопросы."
      },
      {
        en: "Sometimes my homework is difficult. When I do not understand something, I ask my mother or father for help.",
        hy: "Երբեմն տնային աշխատանքս դժվար է լինում։ Երբ ինչ-որ բան չեմ հասկանում, օգնություն եմ խնդրում մայրիկիցս կամ հայրիկիցս։",
        ru: "Иногда домашнее задание бывает трудным. Когда я чего-то не понимаю, я прошу помощи у мамы или папы."
      },
      {
        en: "After finishing my homework, I put everything in my schoolbag. I like doing my homework because I want to learn new things and do well at school.",
        hy: "Տնային աշխատանքս ավարտելուց հետո ամեն ինչ դնում եմ դպրոցական պայուսակիս մեջ։ Ես սիրում եմ կատարել տնային աշխատանքներս, որովհետև ուզում եմ նոր բաներ սովորել և լավ սովորել դպրոցում։",
        ru: "Закончив домашнее задание, я кладу всё в школьный рюкзак. Мне нравится выполнять домашние задания, потому что я хочу узнавать новое и хорошо учиться в школе."
      }
    ],
    vocabulary: [
      { word: "homework", translation: { en: "homework", hy: "տնային աշխատանք", ru: "домашнее задание" } },
      { word: "after school", translation: { en: "after school", hy: "դպրոցից հետո", ru: "после школы" } },
      { word: "lunch", translation: { en: "lunch", hy: "ճաշ", ru: "обед" } },
      { word: "prepare", translation: { en: "prepare", hy: "պատրաստել", ru: "готовить" } },
      { word: "school things", translation: { en: "school things", hy: "դպրոցական պարագաներ", ru: "школьные принадлежности" } },
      { word: "notebook", translation: { en: "notebook", hy: "տետր", ru: "тетрадь" } },
      { word: "carefully", translation: { en: "carefully", hy: "ուշադիր", ru: "внимательно" } },
      { word: "answer", translation: { en: "answer", hy: "պատասխան", ru: "ответ" } },
      { word: "question", translation: { en: "question", hy: "հարց", ru: "вопрос" } },
      { word: "ask for help", translation: { en: "ask for help", hy: "օգնություն խնդրել", ru: "просить помощи" } },
      { word: "finish", translation: { en: "finish", hy: "ավարտել", ru: "заканчивать" } },
      { word: "do well", translation: { en: "do well", hy: "լավ սովորել, հաջողության հասնել", ru: "хорошо справляться" } }
    ],
    questions: [
      {
        question: { en: "What does Alex do after school?", hy: "Ի՞նչ է անում Ալեքսը դպրոցից հետո:", ru: "Что Алекс делает после школы?" },
        options: [
          { en: "He goes to the park", hy: "Նա գնում է այգի", ru: "Он идёт в парк" },
          { en: "He comes home and has lunch", hy: "Նա տուն է գալիս և ճաշում", ru: "Он приходит домой и обедает" },
          { en: "He watches television", hy: "Նա հեռուստացույց է դիտում", ru: "Он смотрит телевизор" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Alex do after lunch?", hy: "Ի՞նչ է անում Ալեքսը ճաշից հետո:", ru: "Что Алекс делает после обеда?" },
        options: [
          { en: "He takes a short break", hy: "Նա կարճ հանգստանում է", ru: "Он делает короткий перерыв" },
          { en: "He goes back to school", hy: "Նա վերադառնում է դպրոց", ru: "Он возвращается в школу" },
          { en: "He starts playing football", hy: "Նա սկսում է ֆուտբոլ խաղալ", ru: "Он начинает играть в футбол" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Which homework does Alex do first?", hy: "Ո՞ր տնայինն է Ալեքսը սկզբում անում:", ru: "Какое домашнее задание Алекс выполняет первым?" },
        options: [
          { en: "English", hy: "Անգլերեն", ru: "Английский" },
          { en: "Science", hy: "Բնագիտություն", ru: "Естествознание" },
          { en: "Maths", hy: "Մաթեմատիկա", ru: "Математика" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What does Alex do when he does not understand something?", hy: "Ի՞նչ է անում Ալեքսը, երբ ինչ-որ բան չի հասկանում:", ru: "Что Алекс делает, когда чего-то не понимает?" },
        options: [
          { en: "He asks his parents for help", hy: "Նա օգնություն է խնդրում ծնողներից", ru: "Он просит помощи у родителей" },
          { en: "He stops studying", hy: "Նա դադարում է սովորել", ru: "Он перестаёт учиться" },
          { en: "He forgets his homework", hy: "Նա մոռանում է տնայինը", ru: "Он забывает о домашнем задании" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does Alex do after finishing his homework?", hy: "Ի՞նչ է անում Ալեքսը տնայինն ավարտելուց հետո:", ru: "Что Алекс делает после выполнения домашнего задания?" },
        options: [
          { en: "He puts everything in his schoolbag", hy: "Նա ամեն ինչ դնում է դպրոցական պայուսակի մեջ", ru: "Он кладёт всё в школьный рюкзак" },
          { en: "He goes shopping", hy: "Նա գնում է գնումների", ru: "Он идёт за покупками" },
          { en: "He starts another game", hy: "Նա սկսում է ուրիշ խաղ", ru: "Он начинает другую игру" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Why does Alex like doing homework?", hy: "Ինչո՞ւ է Ալեքսը սիրում տնայինն անել:", ru: "Почему Алексу нравится делать домашнее задание?" },
        options: [
          { en: "Because he wants to learn new things", hy: "Որովհետև նա ուզում է նոր բաներ սովորել", ru: "Потому что он хочет узнавать новое" },
          { en: "Because he does not like school", hy: "Որովհետև նա չի սիրում դպրոցը", ru: "Потому что он не любит школу" },
          { en: "Because he wants to sleep", hy: "Որովհետև նա ուզում է քնել", ru: "Потому что он хочет спать" }
        ],
        correctIndex: 0
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about your homework!", hy: "Հիմա պատմիր քո տնային աշխատանքի մասին:", ru: "А теперь расскажи о своём домашнем задании!" },
      questions: [
        { en: "What time do you come home from school?", hy: "Ժամը քանիսի՞ն ես տուն գալիս դպրոցից:", ru: "Во сколько ты приходишь домой из школы?" },
        { en: "What do you do after lunch?", hy: "Ի՞նչ ես անում ճաշից հետո:", ru: "Что ты делаешь после обеда?" },
        { en: "Where do you do your homework?", hy: "Որտե՞ղ ես կատարում տնայինդ:", ru: "Где ты делаешь домашнее задание?" },
        { en: "Which subject do you do first?", hy: "Ո՞ր առարկան ես սկզբում անում:", ru: "Какой предмет ты делаешь первым?" },
        { en: "Who helps you with your homework?", hy: "Ո՞վ է օգնում քեզ տնայինի հարցում:", ru: "Кто помогает тебе с домашним заданием?" },
        { en: "What do you do after finishing your homework?", hy: "Ի՞նչ ես անում տնայինդ ավարտելուց հետո:", ru: "Что ты делаешь после выполнения домашнего задания?" }
      ]
    }
  },

  // 08.4. My School Library
  {
    id: "library_school",
    level: "A2",
    topics: ["school", "learning"],
    title: { en: "My School Library", hy: "Իմ դպրոցական գրադարանը", ru: "Моя школьная библиотека" },
    format: "Story",
    difficulty: 1,
    words: 150,
    minutes: 1,
    parts: 8,
    questionsCount: 6,
    paragraphs: [
      {
        en: "My school has a big and beautiful library. It is a quiet place with many books.",
        hy: "Իմ դպրոցն ունի մեծ և գեղեցիկ գրադարան։ Այն շատ գրքերով լի հանգիստ վայր է։",
        ru: "В моей школе есть большая и красивая библиотека. Это тихое место, где много книг."
      },
      {
        en: "I like going to the library during my free time. There are books about animals, nature, history, science and adventures.",
        hy: "Ես սիրում եմ ազատ ժամանակ գնալ գրադարան։ Այնտեղ կան գրքեր կենդանիների, բնության, պատմության, գիտության և արկածների մասին։",
        ru: "Мне нравится ходить в библиотеку в свободное время. Там есть книги о животных, природе, истории, науке и приключениях."
      },
      {
        en: "Our librarian is Mrs. Mary. She is very kind and always helps students find interesting books.",
        hy: "Մեր գրադարանավարուհին տիկին Մերին է։ Նա շատ բարի է և միշտ օգնում է աշակերտներին հետաքրքիր գրքեր գտնել։",
        ru: "Наш библиотекарь — миссис Мэри. Она очень добрая и всегда помогает ученикам находить интересные книги."
      },
      {
        en: "Last Monday, I went to the library with my friend Tom. I wanted to find a book about wild animals.",
        hy: "Անցած երկուշաբթի ես ընկերոջս՝ Թոմի հետ գնացի գրադարան։ Ես ուզում էի վայրի կենդանիների մասին գիրք գտնել։",
        ru: "В прошлый понедельник я ходил в библиотеку со своим другом Томом. Я хотел найти книгу о диких животных."
      },
      {
        en: "Mrs. Mary showed me a book about lions, elephants, giraffes and bears. I looked through the pages and chose the book.",
        hy: "Տիկին Մերին ինձ ցույց տվեց մի գիրք առյուծների, փղերի, ընձուղտների և արջերի մասին։ Ես թերթեցի էջերը և ընտրեցի այդ գիրքը։",
        ru: "Миссис Мэри показала мне книгу о львах, слонах, жирафах и медведях. Я полистал страницы и выбрал эту книгу."
      },
      {
        en: "I borrowed the book for one week. I promised to take good care of it and return it on time.",
        hy: "Ես գիրքը վերցրի մեկ շաբաթով։ Խոստացա լավ խնամել այն և ժամանակին վերադարձնել։",
        ru: "Я взял книгу на одну неделю. Я пообещал бережно обращаться с ней и вернуть её вовремя."
      },
      {
        en: "Reading books helps me learn new words and discover interesting things about the world.",
        hy: "Գրքեր կարդալն օգնում է ինձ նոր բառեր սովորել և աշխարհի մասին հետաքրքիր բաներ բացահայտել։",
        ru: "Чтение книг помогает мне учить новые слова и узнавать интересные вещи об окружающем мире."
      },
      {
        en: "I think our school library is a wonderful place!",
        hy: "Կարծում եմ՝ մեր դպրոցական գրադարանը հրաշալի վայր է։",
        ru: "Я думаю, что наша школьная библиотека — замечательное место!"
      }
    ],
    vocabulary: [
      { word: "library", translation: { en: "library", hy: "գրադարան", ru: "библиотека" } },
      { word: "librarian", translation: { en: "librarian", hy: "գրադարանավար", ru: "библиотекарь" } },
      { word: "quiet", translation: { en: "quiet", hy: "հանգիստ, լուռ", ru: "тихий" } },
      { word: "free time", translation: { en: "free time", hy: "ազատ ժամանակ", ru: "свободное время" } },
      { word: "wild animals", translation: { en: "wild animals", hy: "վայրի կենդանիներ", ru: "дикие животные" } },
      { word: "page", translation: { en: "page", hy: "էջ", ru: "страница" } },
      { word: "choose", translation: { en: "choose", hy: "ընտրել", ru: "выбирать" } },
      { word: "borrow", translation: { en: "borrow", hy: "ժամանակավոր վերցնել", ru: "брать на время" } },
      { word: "return", translation: { en: "return", hy: "վերադարձնել", ru: "возвращать" } },
      { word: "promise", translation: { en: "promise", hy: "խոստանալ", ru: "обещать" } },
      { word: "on time", translation: { en: "on time", hy: "ժամանակին", ru: "вовремя" } },
      { word: "discover", translation: { en: "discover", hy: "բացահայտել", ru: "открывать" } },
      { word: "take care of", translation: { en: "take care of", hy: "խնամել", ru: "заботиться о" } }
    ],
    questions: [
      {
        question: { en: "What kind of place is the school library?", hy: "Ինչպիսի՞ վայր է դպրոցական գրադարանը:", ru: "Что это за место — школьная библиотека?" },
        options: [
          { en: "A noisy place", hy: "Աղմկոտ վայր", ru: "Шумное место" },
          { en: "A quiet place with many books", hy: "Հանգիստ վայր՝ շատ գրքերով", ru: "Тихое место с множеством книг" },
          { en: "A sports hall", hy: "Սպորտային դահլիճ", ru: "Спортивный зал" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Who is Mrs. Mary?", hy: "Ո՞վ է տիկին Մերին:", ru: "Кто такая миссис Мэри?" },
        options: [
          { en: "A teacher", hy: "Ուսուցիչ", ru: "Учитель" },
          { en: "A doctor", hy: "Բժիշկ", ru: "Врач" },
          { en: "A librarian", hy: "Գրադարանավար", ru: "Библиотекарь" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What kind of book does the narrator want to find?", hy: "Ինչպիսի՞ գիրք է ուզում գտնել պատմողը:", ru: "Какую книгу хочет найти рассказчик?" },
        options: [
          { en: "A book about wild animals", hy: "Գիրք վայրի կենդանիների մասին", ru: "Книгу о диких животных" },
          { en: "A book about cars", hy: "Գիրք մեքենաների մասին", ru: "Книгу о машинах" },
          { en: "A book about music", hy: "Գիրք երաժշտության մասին", ru: "Книгу о музыке" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Who goes to the library with the narrator?", hy: "Ո՞վ է պատմողի հետ գնում գրադարան:", ru: "Кто идёт в библиотеку вместе с рассказчиком?" },
        options: [
          { en: "His sister Emma", hy: "Նրա քույրը՝ Էմման", ru: "Его сестра Эмма" },
          { en: "His friend Tom", hy: "Նրա ընկերը՝ Թոմը", ru: "Его друг Том" },
          { en: "His father", hy: "Նրա հայրը", ru: "Его отец" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How long does the narrator borrow the book for?", hy: "Որքա՞ն ժամանակով է պատմողը վերցնում գիրքը:", ru: "На сколько рассказчик берёт книгу?" },
        options: [
          { en: "One day", hy: "Մեկ օր", ru: "На один день" },
          { en: "One week", hy: "Մեկ շաբաթ", ru: "На одну неделю" },
          { en: "One month", hy: "Մեկ ամիս", ru: "На один месяц" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Why does the narrator like reading books?", hy: "Ինչո՞ւ է պատմողը սիրում գրքեր կարդալ:", ru: "Почему рассказчику нравится читать книги?" },
        options: [
          { en: "Because books help him learn new words and discover interesting things", hy: "Որովհետև գրքերը օգնում են նրան նոր բառեր սովորել և հետաքրքիր բաներ բացահայտել", ru: "Потому что книги помогают ему учить новые слова и узнавать интересное" },
          { en: "Because books are very expensive", hy: "Որովհետև գրքերը շատ թանկ են", ru: "Потому что книги очень дорогие" },
          { en: "Because he does not like playing", hy: "Որովհետև նա չի սիրում խաղալ", ru: "Потому что он не любит играть" }
        ],
        correctIndex: 0
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about your school library and favourite books!", hy: "Հիմա պատմիր քո դպրոցական գրադարանի և սիրելի գրքերի մասին:", ru: "А теперь расскажи о своей школьной библиотеке и любимых книгах!" },
      questions: [
        { en: "Does your school have a library?", hy: "Քո դպրոցը գրադարան ունի՞:", ru: "Есть ли в твоей школе библиотека?" },
        { en: "Do you like reading books?", hy: "Սիրու՞մ ես գրքեր կարդալ:", ru: "Ты любишь читать книги?" },
        { en: "What kind of books do you like?", hy: "Ինչպիսի՞ գրքեր ես սիրում:", ru: "Какие книги ты любишь?" },
        { en: "Who is your favourite writer?", hy: "Ո՞վ է քո սիրելի գրողը:", ru: "Кто твой любимый писатель?" },
        { en: "What is your favourite book?", hy: "Ո՞րն է քո սիրելի գիրքը:", ru: "Какая твоя любимая книга?" },
        { en: "What can you learn from books?", hy: "Ի՞նչ կարող ես սովորել գրքերից:", ru: "Чему ты можешь научиться из книг?" }
      ]
    }
  },

  // 08.5. A School Trip
  {
    id: "trip_museum",
    level: "A2",
    topics: ["school", "travel", "culture"],
    title: { en: "A School Trip", hy: "Դպրոցական էքսկուրսիա", ru: "Школьная экскурсия" },
    format: "Story",
    difficulty: 2,
    words: 165,
    minutes: 2,
    parts: 7,
    questionsCount: 6,
    paragraphs: [
      {
        en: "My name is Alex. Last Friday, my class went on a school trip to the History Museum.",
        hy: "Իմ անունը Ալեքս է։ Անցած ուրբաթ մեր դասարանը դպրոցական էքսկուրսիայի մեկնեց Պատմության թանգարան։",
        ru: "Меня зовут Алекс. В прошлую пятницу наш класс отправился на школьную экскурсию в Исторический музей."
      },
      {
        en: "We went there by bus. I sat next to my best friend, Tom. We talked, laughed and looked out of the window. Everyone was excited.",
        hy: "Մենք այնտեղ գնացինք ավտոբուսով։ Ես նստեցի իմ լավագույն ընկերոջ՝ Թոմի կողքին։ Մենք զրուցում էինք, ծիծաղում և նայում պատուհանից դուրս։ Բոլորը ոգևորված էին։",
        ru: "Мы поехали туда на автобусе. Я сидел рядом со своим лучшим другом Томом. Мы разговаривали, смеялись и смотрели в окно. Все были в восторге."
      },
      {
        en: "When we arrived, a museum guide welcomed us. She showed us many interesting things. We saw old coins, beautiful paintings, traditional clothes and ancient objects.",
        hy: "Երբ հասանք, թանգարանի էքսկուրսավարը մեզ դիմավորեց։ Նա մեզ շատ հետաքրքիր իրեր ցույց տվեց։ Մենք տեսանք հին մետաղադրամներ, գեղեցիկ նկարներ, ավանդական հագուստներ և հնագույն իրեր։",
        ru: "Когда мы приехали, нас встретил экскурсовод музея. Она показала нам много интересных вещей. Мы увидели старинные монеты, красивые картины, традиционную одежду и древние предметы."
      },
      {
        en: "The guide told us stories about the past. I asked her many questions, and she answered them with a smile.",
        hy: "Էքսկուրսավարը մեզ պատմություններ պատմեց անցյալի մասին։ Ես նրան շատ հարցեր տվեցի, իսկ նա ժպիտով պատասխանեց դրանց։",
        ru: "Экскурсовод рассказала нам истории о прошлом. Я задал ей много вопросов, и она ответила на них с улыбкой."
      },
      {
        en: "My favourite part was the room about ancient animals. There were pictures of dinosaurs and other animals that lived a long time ago.",
        hy: "Իմ ամենասիրելի մասը հնագույն կենդանիներին նվիրված սրահն էր։ Այնտեղ կային դինոզավրերի և շատ վաղուց ապրած այլ կենդանիների նկարներ։",
        ru: "Больше всего мне понравился зал, посвящённый древним животным. Там были изображения динозавров и других животных, которые жили очень давно."
      },
      {
        en: "After the visit, we ate our sandwiches in the park near the museum. Then we took a class photo and got back on the bus.",
        hy: "Այցելությունից հետո մենք մեր բուտերբրոդները կերանք թանգարանի մոտ գտնվող այգում։ Հետո դասարանով լուսանկարվեցինք և նորից նստեցինք ավտոբուս։",
        ru: "После экскурсии мы съели свои бутерброды в парке возле музея. Затем мы сфотографировались всем классом и снова сели в автобус."
      },
      {
        en: "We returned to school in the afternoon. I was a little tired, but very happy. I learned many new things, and I hope we will have another school trip soon!",
        hy: "Մենք դպրոց վերադարձանք կեսօրից հետո։ Ես մի փոքր հոգնած էի, բայց շատ ուրախ։ Ես շատ նոր բաներ սովորեցի և հույս ունեմ, որ շուտով կրկին դպրոցական էքսկուրսիա կունենանք։",
        ru: "Мы вернулись в школу после обеда. Я немного устал, но был очень рад. Я узнал много нового и надеюсь, что скоро у нас будет ещё одна школьная экскурсия!"
      }
    ],
    vocabulary: [
      { word: "school trip", translation: { en: "school trip", hy: "դպրոցական էքսկուրսիա", ru: "школьная экскурсия" } },
      { word: "museum", translation: { en: "museum", hy: "թանգարան", ru: "музей" } },
      { word: "guide", translation: { en: "guide", hy: "էքսկուրսավար", ru: "экскурсовод" } },
      { word: "arrive", translation: { en: "arrive", hy: "հասնել", ru: "прибывать" } },
      { word: "welcome", translation: { en: "welcome", hy: "դիմավորել", ru: "приветствовать" } },
      { word: "coin", translation: { en: "coin", hy: "մետաղադրամ", ru: "монета" } },
      { word: "painting", translation: { en: "painting", hy: "նկար, կտավ", ru: "картина" } },
      { word: "traditional", translation: { en: "traditional", hy: "ավանդական", ru: "традиционный" } },
      { word: "ancient", translation: { en: "ancient", hy: "հնագույն", ru: "древний" } },
      { word: "past", translation: { en: "past", hy: "անցյալ", ru: "прошлое" } },
      { word: "excited", translation: { en: "excited", hy: "ոգևորված", ru: "взволнованный" } },
      { word: "sandwich", translation: { en: "sandwich", hy: "բուտերբրոդ", ru: "бутерброд" } },
      { word: "return", translation: { en: "return", hy: "վերադառնալ", ru: "возвращаться" } },
      { word: "take a photo", translation: { en: "take a photo", hy: "լուսանկարվել", ru: "фотографироваться" } }
    ],
    questions: [
      {
        question: { en: "Where did the class go?", hy: "Ո՞ւր գնաց դասարանը:", ru: "Куда пошёл класс?" },
        options: [
          { en: "To the zoo", hy: "Կենդանաբանական այգի", ru: "В зоопарк" },
          { en: "To the History Museum", hy: "Պատմության թանգարան", ru: "В Исторический музей" },
          { en: "To the library", hy: "Գրադարան", ru: "В библиотеку" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How did they travel?", hy: "Ինչպե՞ս են նրանք ճանապարհորդել:", ru: "Как они добирались?" },
        options: [
          { en: "By bus", hy: "Ավտոբուսով", ru: "На автобусе" },
          { en: "By train", hy: "Գնացքով", ru: "На поезде" },
          { en: "On foot", hy: "Ոտքով", ru: "Пешком" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Who sat next to Alex?", hy: "Ո՞վ էր նստած Ալեքսի կողքին:", ru: "Кто сидел рядом с Алексом?" },
        options: [
          { en: "His teacher", hy: "Նրա ուսուցիչը", ru: "Его учитель" },
          { en: "His brother", hy: "Նրա եղբայրը", ru: "Его брат" },
          { en: "His friend Tom", hy: "Նրա ընկերը՝ Թոմը", ru: "Его друг Том" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What did they see at the museum?", hy: "Ի՞նչ տեսան նրանք թանգարանում:", ru: "Что они увидели в музее?" },
        options: [
          { en: "Old coins and paintings", hy: "Հին մետաղադրամներ և նկարներ", ru: "Старинные монеты и картины" },
          { en: "New computers", hy: "Նոր համակարգիչներ", ru: "Новые компьютеры" },
          { en: "School books", hy: "Դպրոցական գրքեր", ru: "Школьные книги" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What was Alex's favourite part?", hy: "Ո՞րն էր Ալեքսի ամենասիրելի մասը:", ru: "Что было любимой частью Алекса?" },
        options: [
          { en: "The park", hy: "Այգին", ru: "Парк" },
          { en: "The room about ancient animals", hy: "Հնագույն կենդանիների սրահը", ru: "Зал о древних животных" },
          { en: "The bus", hy: "Ավտոբուսը", ru: "Автобус" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How did Alex feel at the end of the trip?", hy: "Ինչպե՞ս էր զգում Ալեքսը էքսկուրսիայի վերջում:", ru: "Как Алекс себя чувствовал в конце экскурсии?" },
        options: [
          { en: "Angry", hy: "Բարկացած", ru: "Сердитым" },
          { en: "Sad", hy: "Տխուր", ru: "Грустным" },
          { en: "Tired but happy", hy: "Հոգնած, բայց ուրախ", ru: "Уставшим, но счастливым" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about a school trip!", hy: "Հիմա պատմիր դպրոցական էքսկուրսիայի մասին:", ru: "А теперь расскажи о школьной экскурсии!" },
      questions: [
        { en: "Have you ever visited a museum?", hy: "Երբևէ այցելե՞լ ես թանգարան:", ru: "Ты когда-нибудь посещал музей?" },
        { en: "Where did you go on your last school trip?", hy: "Ո՞ւր էիր գնացել վերջին դպրոցական էքսկուրսիայի ժամանակ:", ru: "Куда ты ездил на последней школьной экскурсии?" },
        { en: "Who went with you?", hy: "Ո՞վ էր քեզ հետ գնացել:", ru: "Кто ездил с тобой?" },
        { en: "How did you travel?", hy: "Ինչպե՞ս էիր ճանապարհորդել:", ru: "Как вы добирались?" },
        { en: "What did you see there?", hy: "Ի՞նչ տեսար այնտեղ:", ru: "Что ты там увидел?" },
        { en: "Would you like to go there again? Why?", hy: "Կցանկանա՞յիր նորից այնտեղ գնալ: Ինչո՞ւ:", ru: "Хотел бы ты снова туда поехать? Почему?" }
      ]
    }
  },

  // 08.6. My School Project
  {
    id: "project_school",
    level: "A2",
    topics: ["school", "nature"],
    title: { en: "My School Project", hy: "Իմ դպրոցական նախագիծը", ru: "Мой школьный проект" },
    format: "Story",
    difficulty: 2,
    words: 175,
    minutes: 2,
    parts: 9,
    questionsCount: 6,
    paragraphs: [
      {
        en: "My name is Alex. This week, our teacher gave us an interesting school project. We had to make a poster about nature.",
        hy: "Իմ անունը Ալեքս է։ Այս շաբաթ մեր ուսուցիչը մեզ հետաքրքիր դպրոցական նախագիծ տվեց։ Մենք պետք է բնության մասին պաստառ պատրաստեինք։",
        ru: "Меня зовут Алекс. На этой неделе наш учитель дал нам интересный школьный проект. Мы должны были сделать плакат о природе."
      },
      {
        en: "I worked with my friends, Tom and Emma. First, we talked about our ideas. Tom wanted to write about animals, Emma wanted to draw flowers, and I wanted to write about trees.",
        hy: "Ես աշխատում էի իմ ընկերների՝ Թոմի և Էմմայի հետ։ Սկզբում մենք քննարկեցինք մեր գաղափարները։ Թոմը ցանկանում էր գրել կենդանիների մասին, Էմման ուզում էր նկարել ծաղիկներ, իսկ ես ցանկանում էի գրել ծառերի մասին։",
        ru: "Я работал вместе со своими друзьями Томом и Эммой. Сначала мы обсудили наши идеи. Том хотел написать о животных, Эмма хотела нарисовать цветы, а я хотел написать о деревьях."
      },
      {
        en: "We decided to make one big poster called \"Our Beautiful Planet\".",
        hy: "Մենք որոշեցինք պատրաստել մեկ մեծ պաստառ՝ «Մեր գեղեցիկ մոլորակը» վերնագրով։",
        ru: "Мы решили сделать один большой плакат под названием «Наша прекрасная планета»."
      },
      {
        en: "On Monday, we collected pictures of animals, trees, rivers and mountains. On Tuesday, we wrote short sentences and prepared our drawings.",
        hy: "Երկուշաբթի օրը մենք հավաքեցինք կենդանիների, ծառերի, գետերի և լեռների նկարներ։ Երեքշաբթի օրը գրեցինք կարճ նախադասություններ և պատրաստեցինք մեր նկարները։",
        ru: "В понедельник мы собрали изображения животных, деревьев, рек и гор. Во вторник мы написали короткие предложения и подготовили рисунки."
      },
      {
        en: "I drew a big green tree. Tom found interesting facts about wild animals. Emma made beautiful pictures of flowers.",
        hy: "Ես նկարեցի մի մեծ կանաչ ծառ։ Թոմը հետաքրքիր տեղեկություններ գտավ վայրի կենդանիների մասին։ Էմման գեղեցիկ ծաղիկներ նկարեց։",
        ru: "Я нарисовал большое зелёное дерево. Том нашёл интересные факты о диких животных. Эмма нарисовала красивые цветы."
      },
      {
        en: "We worked together and helped each other. Sometimes we had different ideas, but we listened to one another and found good solutions.",
        hy: "Մենք միասին աշխատում էինք և օգնում էինք միմյանց։ Երբեմն մենք տարբեր գաղափարներ էինք ունենում, բայց լսում էինք իրար և լավ լուծումներ գտնում։",
        ru: "Мы работали вместе и помогали друг другу. Иногда у нас были разные идеи, но мы слушали друг друга и находили хорошие решения."
      },
      {
        en: "On Friday, we presented our project to the class. I was a little nervous, but my friends helped me feel confident.",
        hy: "Ուրբաթ օրը մենք մեր նախագիծը ներկայացրինք դասարանին։ Ես մի փոքր անհանգստանում էի, բայց ընկերներս օգնեցին ինձ ավելի վստահ զգալ։",
        ru: "В пятницу мы представили наш проект классу. Я немного волновался, но друзья помогли мне почувствовать себя увереннее."
      },
      {
        en: "Our teacher liked our poster and said that we did a great job. I was proud of our team.",
        hy: "Մեր ուսուցչին դուր եկավ պաստառը, և նա ասաց, որ մենք շատ լավ աշխատանք ենք կատարել։ Ես հպարտ էի մեր թիմով։",
        ru: "Нашему учителю понравился плакат, и он сказал, что мы отлично поработали. Я гордился нашей командой."
      },
      {
        en: "I learned that working together can make difficult tasks easier and more enjoyable.",
        hy: "Ես հասկացա, որ միասին աշխատելը կարող է դժվար առաջադրանքներն ավելի հեշտ և հաճելի դարձնել։",
        ru: "Я понял, что совместная работа может сделать трудные задания легче и приятнее."
      }
    ],
    vocabulary: [
      { word: "project", translation: { en: "project", hy: "նախագիծ", ru: "проект" } },
      { word: "poster", translation: { en: "poster", hy: "պաստառ", ru: "плакат" } },
      { word: "nature", translation: { en: "nature", hy: "բնություն", ru: "природа" } },
      { word: "idea", translation: { en: "idea", hy: "գաղափար", ru: "идея" } },
      { word: "decide", translation: { en: "decide", hy: "որոշել", ru: "решать" } },
      { word: "collect", translation: { en: "collect", hy: "հավաքել", ru: "собирать" } },
      { word: "fact", translation: { en: "fact", hy: "փաստ", ru: "факт" } },
      { word: "together", translation: { en: "together", hy: "միասին", ru: "вместе" } },
      { word: "help each other", translation: { en: "help each other", hy: "օգնել միմյանց", ru: "помогать друг другу" } },
      { word: "solution", translation: { en: "solution", hy: "լուծում", ru: "решение" } },
      { word: "present", translation: { en: "present", hy: "ներկայացնել", ru: "представлять" } },
      { word: "nervous", translation: { en: "nervous", hy: "անհանգիստ, հուզված", ru: "нервничающий" } },
      { word: "confident", translation: { en: "confident", hy: "ինքնավստահ", ru: "уверенный" } },
      { word: "proud", translation: { en: "proud", hy: "հպարտ", ru: "гордый" } },
      { word: "team", translation: { en: "team", hy: "թիմ", ru: "команда" } },
      { word: "task", translation: { en: "task", hy: "առաջադրանք", ru: "задание" } }
    ],
    questions: [
      {
        question: { en: "What was the school project about?", hy: "Ինչի՞ մասին էր դպրոցական նախագիծը:", ru: "О чём был школьный проект?" },
        options: [
          { en: "Sports", hy: "Սպորտ", ru: "Спорт" },
          { en: "Nature", hy: "Բնություն", ru: "Природа" },
          { en: "Music", hy: "Երաժշտություն", ru: "Музыка" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Who worked with Alex?", hy: "Ո՞վ էր աշխատում Ալեքսի հետ:", ru: "Кто работал с Алексом?" },
        options: [
          { en: "Tom and Emma", hy: "Թոմը և Էմման", ru: "Том и Эмма" },
          { en: "His brother and sister", hy: "Նրա եղբայրն ու քույրը", ru: "Его брат и сестра" },
          { en: "His parents", hy: "Նրա ծնողները", ru: "Его родители" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What did Tom write about?", hy: "Ինչի՞ մասին էր Թոմը գրում:", ru: "О чём писал Том?" },
        options: [
          { en: "Trees", hy: "Ծառեր", ru: "Деревья" },
          { en: "Flowers", hy: "Ծաղիկներ", ru: "Цветы" },
          { en: "Wild animals", hy: "Վայրի կենդանիներ", ru: "Дикие животные" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What did Emma draw?", hy: "Ի՞նչ նկարեց Էմման:", ru: "Что нарисовала Эмма?" },
        options: [
          { en: "Mountains", hy: "Լեռներ", ru: "Горы" },
          { en: "Flowers", hy: "Ծաղիկներ", ru: "Цветы" },
          { en: "Rivers", hy: "Գետեր", ru: "Реки" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "When did they present their project?", hy: "Ե՞րբ ներկայացրին նրանք իրենց նախագիծը:", ru: "Когда они представили свой проект?" },
        options: [
          { en: "Monday", hy: "Երկուշաբթի", ru: "В понедельник" },
          { en: "Wednesday", hy: "Չորեքշաբթի", ru: "В среду" },
          { en: "Friday", hy: "Ուրբաթ", ru: "В пятницу" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "How did Alex feel about the team?", hy: "Ինչպե՞ս էր Ալեքսը զգում թիմի հանդեպ:", ru: "Как Алекс относился к команде?" },
        options: [
          { en: "He was proud", hy: "Նա հպարտ էր", ru: "Он гордился" },
          { en: "He was angry", hy: "Նա բարկացած էր", ru: "Он сердился" },
          { en: "He was bored", hy: "Նա ձանձրացած էր", ru: "Ему было скучно" }
        ],
        correctIndex: 0
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about your own school project!", hy: "Հիմա պատմիր քո սեփական դպրոցական նախագծի մասին:", ru: "А теперь расскажи о своём школьном проекте!" },
      questions: [
        { en: "Have you ever made a school project?", hy: "Երբևէ դպրոցական նախագիծ պատրաստե՞լ ես:", ru: "Ты когда-нибудь делал школьный проект?" },
        { en: "What was your project about?", hy: "Ինչի՞ մասին էր քո նախագիծը:", ru: "О чём был твой проект?" },
        { en: "Did you work alone or with friends?", hy: "Մենա՞կ էիր աշխատում, թե՞ ընկերներիդ հետ:", ru: "Ты работал один или с друзьями?" },
        { en: "What pictures or materials did you use?", hy: "Ի՞նչ նկարներ կամ նյութեր էիր օգտագործել:", ru: "Какие картинки или материалы ты использовал?" },
        { en: "Did you present your project to the class?", hy: "Ներկայացրե՞լ ես նախագիծդ դասարանին:", ru: "Ты представлял свой проект классу?" },
        { en: "What did you learn from this project?", hy: "Ի՞նչ սովորեցիր այս նախագծից:", ru: "Чему ты научился из этого проекта?" }
      ]
    }
  }
];