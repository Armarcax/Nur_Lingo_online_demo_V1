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
  },

    // ─── A2 ԹԵՄԱ 16. ԻՄ ԱՄԲՈՂՋ ՕՐԸ ──────────────────────────────────────
  {
    id: "whole_day",
    level: "A2",
    topics: ["daily"],
    title: { en: "My Whole Day", hy: "Իմ ամբողջ օրը", ru: "Весь мой день" },
    format: "Story",
    difficulty: 1,
    words: 220,
    minutes: 2,
    parts: 9,
    questionsCount: 6,
    paragraphs: [
      {
        en: "Hello! My name is Daniel. I am ten years old. I live with my family in a nice house.",
        hy: "Բարև՛։ Իմ անունը Դանիել է։ Ես տասը տարեկան եմ։ Ապրում եմ ընտանիքիս հետ գեղեցիկ տանը։",
        ru: "Привет! Меня зовут Даниэль. Мне десять лет. Я живу со своей семьёй в красивом доме."
      },
      {
        en: "Every day, I wake up at seven o'clock in the morning. I make my bed, wash my face and brush my teeth. Then I get dressed and go to the kitchen.",
        hy: "Ամեն օր առավոտյան արթնանում եմ ժամը յոթին։ Հարդարում եմ անկողինս, լվանում դեմքս և մաքրում ատամներս։ Հետո հագնվում եմ և գնում խոհանոց։",
        ru: "Каждый день я просыпаюсь в семь часов утра. Я заправляю кровать, умываюсь и чищу зубы. Затем одеваюсь и иду на кухню."
      },
      {
        en: "My mother prepares breakfast for our family. I usually eat eggs, bread and cheese. I drink a glass of milk or tea. After breakfast, I take my schoolbag and go to school.",
        hy: "Մայրս մեր ընտանիքի համար նախաճաշ է պատրաստում։ Ես սովորաբար ուտում եմ ձու, հաց և պանիր։ Խմում եմ մեկ բաժակ կաթ կամ թեյ։ Նախաճաշից հետո վերցնում եմ դպրոցական պայուսակս և գնում դպրոց։",
        ru: "Моя мама готовит завтрак для нашей семьи. Обычно я ем яйца, хлеб и сыр. Я выпиваю стакан молока или чая. После завтрака беру школьный рюкзак и иду в школу."
      },
      {
        en: "My lessons start at eight thirty. At school, I study English, Armenian, Maths, Science and other subjects. During the breaks, I talk and play with my classmates. My favourite subject is English because I like learning new words.",
        hy: "Դասերս սկսվում են ժամը ութն անց երեսունին։ Դպրոցում սովորում եմ անգլերեն, հայերեն, մաթեմատիկա, բնագիտություն և այլ առարկաներ։ Դասամիջոցներին զրուցում և խաղում եմ դասընկերներիս հետ։ Իմ սիրելի առարկան անգլերենն է, որովհետև սիրում եմ նոր բառեր սովորել։",
        ru: "Мои уроки начинаются в половине девятого. В школе я изучаю английский язык, армянский язык, математику, естествознание и другие предметы. На переменах я разговариваю и играю со своими одноклассниками. Мой любимый предмет — английский язык, потому что мне нравится учить новые слова."
      },
      {
        en: "I finish school at two o'clock. I come home, have lunch and rest for a little while. Then I do my homework. Sometimes I need help, so I ask my parents.",
        hy: "Դպրոցն ավարտում եմ ժամը երկուսին։ Գալիս եմ տուն, ճաշում և մի փոքր հանգստանում։ Այնուհետև կատարում եմ տնային առաջադրանքներս։ Երբեմն օգնության կարիք եմ ունենում, այդ պատճառով դիմում եմ ծնողներիս։",
        ru: "Я заканчиваю школу в два часа. Возвращаюсь домой, обедаю и немного отдыхаю. Затем делаю домашнее задание. Иногда мне нужна помощь, поэтому я обращаюсь к родителям."
      },
      {
        en: "In the afternoon, I go outside and play football with my friends. When the weather is bad, I stay at home and read books, draw pictures or play board games.",
        hy: "Կեսօրից հետո դուրս եմ գալիս և ընկերներիս հետ ֆուտբոլ խաղում։ Երբ եղանակը վատ է, մնում եմ տանը, կարդում գրքեր, նկարում կամ սեղանի խաղեր խաղում։",
        ru: "После обеда я выхожу на улицу и играю в футбол с друзьями. Когда погода плохая, я остаюсь дома, читаю книги, рисую или играю в настольные игры."
      },
      {
        en: "In the evening, my family has dinner together. We talk about our day and share interesting stories. After dinner, I prepare my schoolbag for the next day.",
        hy: "Երեկոյան ընտանիքս միասին ընթրում է։ Մենք զրուցում ենք մեր օրվա մասին և պատմում հետաքրքիր դեպքեր։ Ընթրիքից հետո պատրաստում եմ դպրոցական պայուսակս հաջորդ օրվա համար։",
        ru: "Вечером моя семья ужинает вместе. Мы разговариваем о нашем дне и делимся интересными историями. После ужина я собираю школьный рюкзак на следующий день."
      },
      {
        en: "Before bed, I take a shower, put on my pyjamas and read a book. I usually go to bed at nine thirty.",
        hy: "Քնելուց առաջ ցնցուղ եմ ընդունում, հագնում գիշերազգեստս և գիրք կարդում։ Սովորաբար քնում եմ ժամը ինն անց երեսունին։",
        ru: "Перед сном я принимаю душ, надеваю пижаму и читаю книгу. Обычно я ложусь спать в половине десятого."
      },
      {
        en: "I like my daily routine. Every day brings something new!",
        hy: "Ես սիրում եմ իմ առօրյան։ Ամեն օր մի նոր բան է բերում։",
        ru: "Мне нравится мой распорядок дня. Каждый день приносит что-то новое!"
      }
    ],
    vocabulary: [
      { word: "wake up", translation: { en: "wake up", hy: "արթնանալ", ru: "просыпаться" } },
      { word: "make my bed", translation: { en: "make my bed", hy: "հարդարել անկողինս", ru: "заправлять кровать" } },
      { word: "wash my face", translation: { en: "wash my face", hy: "լվանալ դեմքս", ru: "умываться" } },
      { word: "brush my teeth", translation: { en: "brush my teeth", hy: "մաքրել ատամներս", ru: "чистить зубы" } },
      { word: "get dressed", translation: { en: "get dressed", hy: "հագնվել", ru: "одеваться" } },
      { word: "prepare breakfast", translation: { en: "prepare breakfast", hy: "նախաճաշ պատրաստել", ru: "готовить завтрак" } },
      { word: "schoolbag", translation: { en: "schoolbag", hy: "դպրոցական պայուսակ", ru: "школьный рюкзак" } },
      { word: "lesson", translation: { en: "lesson", hy: "դաս", ru: "урок" } },
      { word: "subject", translation: { en: "subject", hy: "առարկա", ru: "предмет" } },
      { word: "break", translation: { en: "break", hy: "դասամիջոց", ru: "перемена" } },
      { word: "classmate", translation: { en: "classmate", hy: "դասընկեր", ru: "одноклассник" } },
      { word: "finish", translation: { en: "finish", hy: "ավարտել", ru: "заканчивать" } },
      { word: "have lunch", translation: { en: "have lunch", hy: "ճաշել", ru: "обедать" } },
      { word: "rest", translation: { en: "rest", hy: "հանգստանալ", ru: "отдыхать" } },
      { word: "homework", translation: { en: "homework", hy: "տնային առաջադրանք", ru: "домашнее задание" } },
      { word: "go outside", translation: { en: "go outside", hy: "դուրս գալ", ru: "выходить на улицу" } },
      { word: "board games", translation: { en: "board games", hy: "սեղանի խաղեր", ru: "настольные игры" } },
      { word: "have dinner", translation: { en: "have dinner", hy: "ընթրել", ru: "ужинать" } },
      { word: "share stories", translation: { en: "share stories", hy: "պատմություններով կիսվել", ru: "делиться историями" } },
      { word: "daily routine", translation: { en: "daily routine", hy: "առօրյա, օրվա կարգ", ru: "распорядок дня" } }
    ],
    questions: [
      {
        question: { en: "What time does Daniel wake up?", hy: "Ժամը քանիսի՞ն է Դանիելը արթնանում:", ru: "Во сколько Даниэль просыпается?" },
        options: [
          { en: "At six o'clock", hy: "Ժամը վեցին", ru: "В шесть часов" },
          { en: "At seven o'clock", hy: "Ժամը յոթին", ru: "В семь часов" },
          { en: "At eight o'clock", hy: "Ժամը ութին", ru: "В восемь часов" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Daniel usually eat for breakfast?", hy: "Ի՞նչ է սովորաբար ուտում Դանիելը նախաճաշին:", ru: "Что Даниэль обычно ест на завтрак?" },
        options: [
          { en: "Eggs, bread and cheese", hy: "Ձու, հաց և պանիր", ru: "Яйца, хлеб и сыр" },
          { en: "Pizza and salad", hy: "Պիցցա և աղցան", ru: "Пиццу и салат" },
          { en: "Soup and potatoes", hy: "Ապուր և կարտոֆիլ", ru: "Суп и картофель" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What is Daniel's favourite subject?", hy: "Ո՞րն է Դանիելի սիրելի առարկան:", ru: "Какой любимый предмет у Даниэля?" },
        options: [
          { en: "Maths", hy: "Մաթեմատիկա", ru: "Математика" },
          { en: "Science", hy: "Բնագիտություն", ru: "Естествознание" },
          { en: "English", hy: "Անգլերեն", ru: "Английский" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What does Daniel do after school?", hy: "Ի՞նչ է անում Դանիելը դպրոցից հետո:", ru: "Что Даниэль делает после школы?" },
        options: [
          { en: "He goes to sleep", hy: "Նա գնում է քնելու", ru: "Он идёт спать" },
          { en: "He has lunch and does his homework", hy: "Նա ճաշում է և կատարում տնայինը", ru: "Он обедает и делает домашнее задание" },
          { en: "He watches television all day", hy: "Նա ամբողջ օրը հեռուստացույց է դիտում", ru: "Он весь день смотрит телевизор" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Daniel do when the weather is bad?", hy: "Ի՞նչ է անում Դանիելը, երբ եղանակը վատ է:", ru: "Что Даниэль делает, когда погода плохая?" },
        options: [
          { en: "He stays at home and reads or draws", hy: "Նա մնում է տանը, կարդում կամ նկարում է", ru: "Он остаётся дома, читает или рисует" },
          { en: "He goes swimming", hy: "Նա գնում է լողալու", ru: "Он идёт плавать" },
          { en: "He rides his bicycle", hy: "Նա հեծանիվ է քշում", ru: "Он катается на велосипеде" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What time does Daniel usually go to bed?", hy: "Ժամը քանիսի՞ն է Դանիելը սովորաբար քնում:", ru: "Во сколько Даниэль обычно ложится спать?" },
        options: [
          { en: "At eight thirty", hy: "Ժամը ութն անց երեսունին", ru: "В половине девятого" },
          { en: "At nine thirty", hy: "Ժամը ինն անց երեսունին", ru: "В половине десятого" },
          { en: "At ten thirty", hy: "Ժամը տասն անց երեսունին", ru: "В половине одиннадцатого" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about your whole day!", hy: "Պատմիր քո ամբողջ օրվա մասին:", ru: "Расскажи о своём дне!" },
      questions: [
        { en: "What time do you wake up?", hy: "Ժամը քանիսի՞ն ես արթնանում:", ru: "Во сколько ты просыпаешься?" },
        { en: "What do you eat for breakfast?", hy: "Ի՞նչ ես ուտում նախաճաշին:", ru: "Что ты ешь на завтрак?" },
        { en: "What are your favourite school subjects?", hy: "Որո՞նք են քո սիրելի դպրոցական առարկաները:", ru: "Какие твои любимые школьные предметы?" },
        { en: "What do you do after school?", hy: "Ի՞նչ ես անում դպրոցից հետո:", ru: "Что ты делаешь после школы?" },
        { en: "What do you do in the evening with your family?", hy: "Ի՞նչ ես անում երեկոյան ընտանիքիդ հետ:", ru: "Что ты делаешь вечером с семьёй?" },
        { en: "What time do you go to bed?", hy: "Ժամը քանիսի՞ն ես քնում:", ru: "Во сколько ты ложишься спать?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 17. ԻՆՉ ԵՄ ԱՆՈՒՄ ՀԱՆԳՍՏՅԱՆ ՕՐԵՐԻՆ ──────────────────────
  {
    id: "weekend_anna",
    level: "A2",
    topics: ["daily", "hobbies"],
    title: { en: "What I Do at the Weekend", hy: "Իմ հանգստյան օրերը", ru: "Чем я занимаюсь в выходные" },
    format: "Story",
    difficulty: 1,
    words: 235,
    minutes: 2,
    parts: 8,
    questionsCount: 6,
    paragraphs: [
      {
        en: "Hello! My name is Anna. I am eleven years old. I love weekends because I do not have to go to school, and I have more free time.",
        hy: "Բարև՛։ Իմ անունը Աննա է։ Ես տասնմեկ տարեկան եմ։ Ես սիրում եմ հանգստյան օրերը, որովհետև դպրոց գնալու կարիք չունեմ և ավելի շատ ազատ ժամանակ եմ ունենում։",
        ru: "Привет! Меня зовут Анна. Мне одиннадцать лет. Я люблю выходные, потому что мне не нужно идти в школу и у меня больше свободного времени."
      },
      {
        en: "On Saturdays, I usually wake up later than on school days. I get up at eight thirty and have breakfast with my family. We eat pancakes, fruit and sometimes sandwiches. My little brother likes pancakes with honey.",
        hy: "Շաբաթ օրերին սովորաբար ավելի ուշ եմ արթնանում, քան դպրոցական օրերին։ Վեր եմ կենում ժամը ութն անց երեսունին և ընտանիքիս հետ նախաճաշում։ Մենք ուտում ենք բլիթներ, միրգ և երբեմն սենդվիչներ։ Իմ փոքր եղբայրը սիրում է մեղրով բլիթներ։",
        ru: "По субботам я обычно просыпаюсь позже, чем в учебные дни. Я встаю в половине девятого и завтракаю вместе с семьёй. Мы едим блинчики, фрукты, а иногда бутерброды. Мой младший брат любит блинчики с мёдом."
      },
      {
        en: "After breakfast, I tidy my room and help my mother. I put my books on the shelf and water the flowers. My brother puts his toys in the box. We try to keep our home clean and tidy.",
        hy: "Նախաճաշից հետո հավաքում եմ սենյակս և օգնում մայրիկիս։ Գրքերս դնում եմ դարակի վրա և ջրում ծաղիկները։ Եղբայրս իր խաղալիքները դնում է տուփի մեջ։ Մենք փորձում ենք մեր տունը մաքուր և կոկիկ պահել։",
        ru: "После завтрака я убираю свою комнату и помогаю маме. Я ставлю книги на полку и поливаю цветы. Мой брат складывает игрушки в коробку. Мы стараемся поддерживать чистоту и порядок в доме."
      },
      {
        en: "In the afternoon, I often meet my friends in the park. We ride our bicycles, play ball and talk about our favourite games. Sometimes we have a small picnic. We bring sandwiches, apples and juice.",
        hy: "Կեսօրից հետո հաճախ հանդիպում եմ ընկերներիս այգում։ Մենք հեծանիվ ենք քշում, գնդակ խաղում և զրուցում մեր սիրելի խաղերի մասին։ Երբեմն փոքրիկ խնջույք ենք կազմակերպում։ Մեզ հետ վերցնում ենք սենդվիչներ, խնձորներ և հյութ։",
        ru: "После обеда я часто встречаюсь с друзьями в парке. Мы катаемся на велосипедах, играем в мяч и разговариваем о наших любимых играх. Иногда мы устраиваем небольшой пикник. Мы берём с собой бутерброды, яблоки и сок."
      },
      {
        en: "On Sundays, I usually spend time with my family. Sometimes we visit my grandparents. My grandmother makes delicious cakes, and my grandfather tells us interesting stories about his childhood.",
        hy: "Կիրակի օրերին սովորաբար ժամանակ եմ անցկացնում ընտանիքիս հետ։ Երբեմն այցելում ենք տատիկիս և պապիկիս։ Տատիկս համեղ թխվածքներ է պատրաստում, իսկ պապիկս մեզ հետաքրքիր պատմություններ է պատմում իր մանկությունից։",
        ru: "По воскресеньям я обычно провожу время с семьёй. Иногда мы навещаем бабушку и дедушку. Бабушка готовит вкусные пироги, а дедушка рассказывает нам интересные истории из своего детства."
      },
      {
        en: "When we stay at home, I like drawing, reading books and watching cartoons. My brother enjoys building things with his toy blocks.",
        hy: "Երբ տանն ենք մնում, սիրում եմ նկարել, գրքեր կարդալ և մուլտֆիլմեր դիտել։ Եղբայրս սիրում է իր խաղալիք խորանարդներով տարբեր իրեր կառուցել։",
        ru: "Когда мы остаёмся дома, я люблю рисовать, читать книги и смотреть мультфильмы. Моему брату нравится строить разные вещи из игрушечных кубиков."
      },
      {
        en: "In the evening, I prepare my schoolbag and choose my clothes for Monday. I also check my homework. Then I take a shower and go to bed.",
        hy: "Երեկոյան պատրաստում եմ դպրոցական պայուսակս և ընտրում երկուշաբթի օրվա հագուստս։ Նաև ստուգում եմ տնային առաջադրանքներս։ Հետո ցնցուղ եմ ընդունում և գնում քնելու։",
        ru: "Вечером я собираю школьный рюкзак и выбираю одежду на понедельник. Ещё я проверяю домашнее задание. Затем принимаю душ и ложусь спать."
      },
      {
        en: "Weekends are special for me. I can relax, have fun and spend time with the people I love. I always feel happy on Sunday evening because I have many nice memories.",
        hy: "Հանգստյան օրերն ինձ համար առանձնահատուկ են։ Ես կարող եմ հանգստանալ, զվարճանալ և ժամանակ անցկացնել ինձ սիրելի մարդկանց հետ։ Կիրակի երեկոյան միշտ ուրախ եմ լինում, որովհետև շատ հաճելի հիշողություններ եմ ունենում։",
        ru: "Выходные для меня особенные. Я могу отдыхать, веселиться и проводить время с любимыми людьми. В воскресенье вечером я всегда чувствую себя счастливой, потому что у меня остаётся много приятных воспоминаний."
      }
    ],
    vocabulary: [
      { word: "weekend", translation: { en: "weekend", hy: "հանգստյան օրեր", ru: "выходные" } },
      { word: "later", translation: { en: "later", hy: "ավելի ուշ", ru: "позже" } },
      { word: "tidy my room", translation: { en: "tidy my room", hy: "հավաքել սենյակս", ru: "убирать комнату" } },
      { word: "shelf", translation: { en: "shelf", hy: "դարակ", ru: "полка" } },
      { word: "water the flowers", translation: { en: "water the flowers", hy: "ջրել ծաղիկները", ru: "поливать цветы" } },
      { word: "keep clean", translation: { en: "keep clean", hy: "մաքուր պահել", ru: "поддерживать чистоту" } },
      { word: "meet friends", translation: { en: "meet friends", hy: "հանդիպել ընկերներին", ru: "встречаться с друзьями" } },
      { word: "picnic", translation: { en: "picnic", hy: "խնջույք բնության գրկում", ru: "пикник" } },
      { word: "visit grandparents", translation: { en: "visit grandparents", hy: "այցելել տատիկին ու պապիկին", ru: "навещать бабушку и дедушку" } },
      { word: "childhood", translation: { en: "childhood", hy: "մանկություն", ru: "детство" } },
      { word: "cartoon", translation: { en: "cartoon", hy: "մուլտֆիլմ", ru: "мультфильм" } },
      { word: "memory", translation: { en: "memory", hy: "հիշողություն", ru: "воспоминание" } },
      { word: "special", translation: { en: "special", hy: "առանձնահատուկ", ru: "особенный" } },
      { word: "always", translation: { en: "always", hy: "միշտ", ru: "всегда" } },
      { word: "usually", translation: { en: "usually", hy: "սովորաբար", ru: "обычно" } },
      { word: "sometimes", translation: { en: "sometimes", hy: "երբեմն", ru: "иногда" } },
      { word: "never", translation: { en: "never", hy: "երբեք", ru: "никогда" } }
    ],
    questions: [
      {
        question: { en: "Why does Anna love weekends?", hy: "Ինչո՞ւ է Աննան սիրում հանգստյան օրերը:", ru: "Почему Анна любит выходные?" },
        options: [
          { en: "Because she has more free time", hy: "Որովհետև ավելի շատ ազատ ժամանակ ունի", ru: "Потому что у неё больше свободного времени" },
          { en: "Because she has many lessons", hy: "Որովհետև նա շատ դասեր ունի", ru: "Потому что у неё много уроков" },
          { en: "Because she goes to school", hy: "Որովհետև նա դպրոց է գնում", ru: "Потому что она ходит в школу" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What time does Anna get up on Saturday?", hy: "Ժամը քանիսի՞ն է Աննան արթնանում շաբաթ օրը:", ru: "Во сколько Анна встаёт в субботу?" },
        options: [
          { en: "At seven o'clock", hy: "Ժամը յոթին", ru: "В семь часов" },
          { en: "At eight thirty", hy: "Ժամը ութն անց երեսունին", ru: "В половине девятого" },
          { en: "At ten o'clock", hy: "Ժամը տասին", ru: "В десять часов" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Anna do after breakfast?", hy: "Ի՞նչ է անում Աննան նախաճաշից հետո:", ru: "Что Анна делает после завтрака?" },
        options: [
          { en: "She watches cartoons", hy: "Նա մուլտֆիլմեր է դիտում", ru: "Она смотрит мультфильмы" },
          { en: "She goes to school", hy: "Նա գնում է դպրոց", ru: "Она идёт в школу" },
          { en: "She tidies her room and helps her mother", hy: "Նա հավաքում է սենյակը և օգնում մայրիկին", ru: "Она убирает комнату и помогает маме" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Where does Anna meet her friends?", hy: "Որտե՞ղ է Աննան հանդիպում ընկերներին:", ru: "Где Анна встречает друзей?" },
        options: [
          { en: "In the park", hy: "Այգում", ru: "В парке" },
          { en: "At school", hy: "Դպրոցում", ru: "В школе" },
          { en: "In the supermarket", hy: "Սուպերմարկետում", ru: "В супермаркете" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does Anna's grandfather do?", hy: "Ի՞նչ է անում Աննայի պապիկը:", ru: "Что делает дедушка Анны?" },
        options: [
          { en: "He plays football", hy: "Նա ֆուտբոլ է խաղում", ru: "Он играет в футбол" },
          { en: "He tells stories about his childhood", hy: "Նա պատմում է իր մանկության մասին", ru: "Он рассказывает истории о своём детстве" },
          { en: "He teaches English", hy: "Նա անգլերեն է դասավանդում", ru: "Он преподаёт английский" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Anna do on Sunday evening?", hy: "Ի՞նչ է անում Աննան կիրակի երեկոյան:", ru: "Что Анна делает в воскресенье вечером?" },
        options: [
          { en: "She prepares her schoolbag", hy: "Նա պատրաստում է դպրոցական պայուսակը", ru: "Она собирает школьный рюкзак" },
          { en: "She goes to the cinema", hy: "Նա գնում է կինոթատրոն", ru: "Она идёт в кино" },
          { en: "She visits her friends", hy: "Նա այցելում է ընկերներին", ru: "Она навещает друзей" }
        ],
        correctIndex: 0
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about your weekends!", hy: "Պատմիր քո հանգստյան օրերի մասին:", ru: "Расскажи о своих выходных!" },
      questions: [
        { en: "What do you usually do on Saturdays?", hy: "Ի՞նչ ես սովորաբար անում շաբաթ օրերին:", ru: "Что ты обычно делаешь по субботам?" },
        { en: "Do you help your parents at home?", hy: "Օգնու՞մ ես ծնողներիդ տանը:", ru: "Ты помогаешь родителям дома?" },
        { en: "Where do you meet your friends?", hy: "Որտե՞ղ ես հանդիպում ընկերներիդ:", ru: "Где ты встречаешься с друзьями?" },
        { en: "What do you like doing on Sundays?", hy: "Ի՞նչ ես սիրում անել կիրակի օրերին:", ru: "Что ты любишь делать по воскресеньям?" },
        { en: "Do you visit your grandparents at weekends?", hy: "Այցելու՞մ ես տատիկին ու պապիկին հանգստյան օրերին:", ru: "Ты навещаешь бабушку и дедушку по выходным?" },
        { en: "Why do you like weekends?", hy: "Ինչո՞ւ ես սիրում հանգստյան օրերը:", ru: "Почему ты любишь выходные?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 18. ԻՄ ԵՐԱԶԱՆՔՆԵՐԸ ─────────────────────────────────────
  {
    id: "dreams_michael",
    level: "A2",
    topics: ["dreams", "future"],
    title: { en: "My Dreams", hy: "Իմ երազանքները", ru: "Мои мечты" },
    format: "Essay",
    difficulty: 1,
    words: 210,
    minutes: 2,
    parts: 8,
    questionsCount: 6,
    paragraphs: [
      {
        en: "Hello! My name is Michael. I am eleven years old. I have many dreams, and I like thinking about my future.",
        hy: "Բարև՛։ Իմ անունը Մայքլ է։ Ես տասնմեկ տարեկան եմ։ Ես շատ երազանքներ ունեմ և սիրում եմ մտածել իմ ապագայի մասին։",
        ru: "Привет! Меня зовут Майкл. Мне одиннадцать лет. У меня много мечтаний, и мне нравится думать о своём будущем."
      },
      {
        en: "When I grow up, I want to do something useful and interesting. I want to learn new things, meet different people and discover the world.",
        hy: "Երբ մեծանամ, ուզում եմ օգտակար և հետաքրքիր գործով զբաղվել։ Ուզում եմ նոր բաներ սովորել, տարբեր մարդկանց հանդիպել և բացահայտել աշխարհը։",
        ru: "Когда я вырасту, я хочу заниматься чем-то полезным и интересным. Я хочу узнавать новое, встречать разных людей и открывать для себя мир."
      },
      {
        en: "One of my biggest dreams is to travel to different countries. I would like to visit Italy, Japan, France and many other places. I want to see beautiful cities, taste new food and learn about different cultures.",
        hy: "Իմ ամենամեծ երազանքներից մեկը տարբեր երկրներ ճանապարհորդելն է։ Ես կուզենայի այցելել Իտալիա, Ճապոնիա, Ֆրանսիա և շատ այլ վայրեր։ Ուզում եմ տեսնել գեղեցիկ քաղաքներ, համտեսել նոր ուտեստներ և ծանոթանալ տարբեր մշակույթների։",
        ru: "Одна из моих самых больших мечт — путешествовать по разным странам. Я хотел бы посетить Италию, Японию, Францию и многие другие места. Я хочу увидеть красивые города, попробовать новые блюда и познакомиться с разными культурами."
      },
      {
        en: "I also dream of having a big house with a garden. I would like to plant flowers, grow fruit trees and have a small place where I can read books outside.",
        hy: "Ես նաև երազում եմ մեծ այգի ունեցող տան մասին։ Կուզենայի ծաղիկներ տնկել, պտղատու ծառեր աճեցնել և ունենալ մի փոքրիկ անկյուն, որտեղ կարող եմ դրսում գիրք կարդալ։",
        ru: "Я также мечтаю о большом доме с садом. Я хотел бы посадить цветы, выращивать фруктовые деревья и иметь уютное место, где можно читать книги на свежем воздухе."
      },
      {
        en: "I love animals, so I want to help them. Maybe one day I will become a veterinarian. I would like to take care of sick animals and help them feel better.",
        hy: "Ես սիրում եմ կենդանիներին, այդ պատճառով ուզում եմ օգնել նրանց։ Գուցե մի օր անասնաբույժ դառնամ։ Կուզենայի խնամել հիվանդ կենդանիներին և օգնել նրանց առողջանալ։",
        ru: "Я люблю животных, поэтому хочу им помогать. Возможно, однажды я стану ветеринаром. Я хотел бы заботиться о больных животных и помогать им выздоравливать."
      },
      {
        en: "Another dream of mine is to speak three languages: Armenian, English and Russian. I know that learning a language takes time and practice. I try to learn new words every day and speak with my friends.",
        hy: "Իմ մյուս երազանքներից մեկը երեք լեզվով՝ հայերեն, անգլերեն և ռուսերեն խոսելն է։ Գիտեմ, որ լեզու սովորելու համար ժամանակ և վարժանք է անհրաժեշտ։ Ամեն օր փորձում եմ նոր բառեր սովորել և ընկերներիս հետ խոսել։",
        ru: "Ещё одна моя мечта — говорить на трёх языках: армянском, английском и русском. Я знаю, что изучение языка требует времени и практики. Каждый день я стараюсь учить новые слова и разговаривать с друзьями."
      },
      {
        en: "My parents always tell me that dreams need hard work. I understand that I cannot achieve everything in one day. I need to study, practise and never give up.",
        hy: "Ծնողներս միշտ ասում են, որ երազանքներն իրականացնելու համար պետք է աշխատել։ Ես հասկանում եմ, որ ամեն ինչ չեմ կարող իրականացնել մեկ օրում։ Պետք է սովորեմ, վարժվեմ և երբեք չհանձնվեմ։",
        ru: "Мои родители всегда говорят, что для осуществления мечты нужно много трудиться. Я понимаю, что не могу достичь всего за один день. Мне нужно учиться, практиковаться и никогда не сдаваться."
      },
      {
        en: "I believe that every small step brings me closer to my dreams. What about you? What is your biggest dream?",
        hy: "Ես հավատում եմ, որ յուրաքանչյուր փոքր քայլ ինձ ավելի է մոտեցնում իմ երազանքներին։ Իսկ դո՞ւ։ Ո՞րն է քո ամենամեծ երազանքը։",
        ru: "Я верю, что каждый маленький шаг приближает меня к моим мечтам. А ты? Какая у тебя самая большая мечта?"
      }
    ],
    vocabulary: [
      { word: "dream", translation: { en: "dream", hy: "երազանք", ru: "мечта" } },
      { word: "future", translation: { en: "future", hy: "ապագա", ru: "будущее" } },
      { word: "grow up", translation: { en: "grow up", hy: "մեծանալ", ru: "вырасти" } },
      { word: "useful", translation: { en: "useful", hy: "օգտակար", ru: "полезный" } },
      { word: "travel", translation: { en: "travel", hy: "ճանապարհորդել", ru: "путешествовать" } },
      { word: "country", translation: { en: "country", hy: "երկիր", ru: "страна" } },
      { word: "discover", translation: { en: "discover", hy: "բացահայտել", ru: "открывать" } },
      { word: "culture", translation: { en: "culture", hy: "մշակույթ", ru: "культура" } },
      { word: "garden", translation: { en: "garden", hy: "այգի", ru: "сад" } },
      { word: "plant flowers", translation: { en: "plant flowers", hy: "ծաղիկներ տնկել", ru: "сажать цветы" } },
      { word: "veterinarian", translation: { en: "veterinarian", hy: "անասնաբույժ", ru: "ветеринар" } },
      { word: "take care of", translation: { en: "take care of", hy: "խնամել", ru: "заботиться о" } },
      { word: "language", translation: { en: "language", hy: "լեզու", ru: "язык" } },
      { word: "practice", translation: { en: "practice", hy: "վարժանք", ru: "практика" } },
      { word: "achieve", translation: { en: "achieve", hy: "հասնել, իրականացնել", ru: "достигать" } },
      { word: "hard work", translation: { en: "hard work", hy: "քրտնաջան աշխատանք", ru: "усердная работа" } },
      { word: "give up", translation: { en: "give up", hy: "հանձնվել", ru: "сдаваться" } },
      { word: "step", translation: { en: "step", hy: "քայլ", ru: "шаг" } },
      { word: "believe", translation: { en: "believe", hy: "հավատալ", ru: "верить" } }
    ],
    questions: [
      {
        question: { en: "What does Michael want to do when he grows up?", hy: "Ի՞նչ է ուզում անել Մայքլը, երբ մեծանա:", ru: "Что Майкл хочет делать, когда вырастет?" },
        options: [
          { en: "He wants to do something useful and interesting", hy: "Նա ուզում է օգտակար և հետաքրքիր գործով զբաղվել", ru: "Он хочет заниматься чем-то полезным и интересным" },
          { en: "He wants to stop learning", hy: "Նա ուզում է դադարեցնել սովորելը", ru: "Он хочет перестать учиться" },
          { en: "He wants to stay at home every day", hy: "Նա ուզում է ամեն օր տանը մնալ", ru: "Он хочет оставаться дома каждый день" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Which countries would Michael like to visit?", hy: "Ո՞ր երկրներն է Մայքլը կուզենա այցելել:", ru: "Какие страны Майкл хотел бы посетить?" },
        options: [
          { en: "Italy, Japan and France", hy: "Իտալիա, Ճապոնիա և Ֆրանսիա", ru: "Италию, Японию и Францию" },
          { en: "Armenia, Georgia and Greece", hy: "Հայաստան, Վրաստան և Հունաստան", ru: "Армению, Грузию и Грецию" },
          { en: "Spain, Germany and Canada", hy: "Իսպանիա, Գերմանիա և Կանադա", ru: "Испанию, Германию и Канаду" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What kind of house does Michael dream of?", hy: "Ինչպիսի՞ տան մասին է երազում Մայքլը:", ru: "О каком доме мечтает Майкл?" },
        options: [
          { en: "A small house without a garden", hy: "Փոքրիկ տուն առանց այգու", ru: "Маленький дом без сада" },
          { en: "A big house with a garden", hy: "Մեծ տուն այգիով", ru: "Большой дом с садом" },
          { en: "A house near his school", hy: "Տուն դպրոցի մոտ", ru: "Дом рядом со школой" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Why might Michael become a veterinarian?", hy: "Ինչո՞ւ կարող է Մայքլը անասնաբույժ դառնալ:", ru: "Почему Майкл может стать ветеринаром?" },
        options: [
          { en: "Because he loves animals and wants to help them", hy: "Որովհետև սիրում է կենդանիներին և ուզում է օգնել նրանց", ru: "Потому что он любит животных и хочет им помогать" },
          { en: "Because he likes travelling", hy: "Որովհետև սիրում է ճանապարհորդել", ru: "Потому что он любит путешествовать" },
          { en: "Because he wants to build houses", hy: "Որովհետև ուզում է տներ կառուցել", ru: "Потому что он хочет строить дома" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Which three languages does Michael want to speak?", hy: "Ո՞ր երեք լեզուներով է Մայքլը ուզում խոսել:", ru: "На каких трёх языках Майкл хочет говорить?" },
        options: [
          { en: "English, French and German", hy: "Անգլերեն, ֆրանսերեն և գերմաներեն", ru: "Английском, французском и немецком" },
          { en: "Armenian, English and Russian", hy: "Հայերեն, անգլերեն և ռուսերեն", ru: "Армянском, английском и русском" },
          { en: "Russian, Italian and Japanese", hy: "Ռուսերեն, իտալերեն և ճապոներեն", ru: "Русском, итальянском и японском" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Michael believe?", hy: "Ինչի՞ն է Մայքլը հավատում:", ru: "Во что верит Майкл?" },
        options: [
          { en: "Dreams come true without effort", hy: "Երազանքներն իրականանում են առանց ջանքի", ru: "Мечты сбываются без усилий" },
          { en: "Small steps bring him closer to his dreams", hy: "Փոքր քայլերն իրեն ավելի են մոտեցնում երազանքներին", ru: "Маленькие шаги приближают его к мечтам" },
          { en: "Learning is not important", hy: "Սովորելը կարևոր չէ", ru: "Учёба не важна" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about your dreams!", hy: "Հիմա պատմիր քո երազանքների մասին:", ru: "А теперь расскажи о своих мечтах!" },
      questions: [
        { en: "What do you want to be when you grow up?", hy: "Ի՞նչ ես ուզում դառնալ, երբ մեծանաս:", ru: "Кем ты хочешь стать, когда вырастешь?" },
        { en: "Which countries would you like to visit?", hy: "Ո՞ր երկրներն ես կուզենա այցելել:", ru: "Какие страны ты хотел бы посетить?" },
        { en: "What would you like to learn?", hy: "Ի՞նչ կուզենայի սովորել:", ru: "Чему ты хотел бы научиться?" },
        { en: "What kind of house would you like to have?", hy: "Ինչպիսի՞ տուն կուզենայի ունենալ:", ru: "Какой дом ты хотел бы иметь?" },
        { en: "How would you like to help other people or animals?", hy: "Ինչպե՞ս կուզենայի օգնել այլ մարդկանց կամ կենդանիներին:", ru: "Как ты хотел бы помогать другим людям или животным?" },
        { en: "What is your biggest dream?", hy: "Ո՞րն է քո ամենամեծ երազանքը:", ru: "Какая твоя самая большая мечта?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 1 ──────────────────────────
  {
    id: "friends_best_tom",
    level: "A2",
    topics: ["relationships", "people"],
    title: { en: "My Best Friend", hy: "Իմ լավագույն ընկերը", ru: "Мой лучший друг" },
    format: "Story",
    difficulty: 1,
    words: 125,
    minutes: 2,
    parts: 6,
    questionsCount: 6,
    paragraphs: [
      {
        en: "My best friend's name is Tom. He is nine years old, and he is in my class. We sit next to each other at school.",
        hy: "Իմ լավագույն ընկերոջ անունը Թոմ է։ Նա ինը տարեկան է և սովորում է իմ դասարանում։ Մենք դպրոցում նստում ենք իրար կողքի։",
        ru: "Моего лучшего друга зовут Том. Ему девять лет, и он учится в моём классе. В школе мы сидим рядом друг с другом."
      },
      {
        en: "Tom is a friendly and helpful boy. He is always ready to help his classmates. He is also funny, and he often makes me laugh.",
        hy: "Թոմը ընկերասեր և օգնող տղա է։ Նա միշտ պատրաստ է օգնել իր դասընկերներին։ Նա նաև զվարճալի է և հաճախ ինձ ծիծաղեցնում է։",
        ru: "Том дружелюбный и отзывчивый мальчик. Он всегда готов помочь своим одноклассникам. Он также весёлый и часто заставляет меня смеяться."
      },
      {
        en: "We have many things in common. We both like football, drawing, and reading interesting stories. After school, we sometimes play football in the park. When the weather is bad, we stay at home and play board games.",
        hy: "Մենք շատ ընդհանուր հետաքրքրություններ ունենք։ Երկուսս էլ սիրում ենք ֆուտբոլ, նկարել և հետաքրքիր պատմություններ կարդալ։ Դասերից հետո երբեմն այգում ֆուտբոլ ենք խաղում։ Երբ եղանակը վատ է լինում, մնում ենք տանը և սեղանի խաղեր խաղում։",
        ru: "У нас много общих интересов. Мы оба любим футбол, рисование и чтение интересных историй. После уроков мы иногда играем в футбол в парке. Когда погода плохая, мы остаёмся дома и играем в настольные игры."
      },
      {
        en: "Tom is good at Maths, and I am good at English. We help each other with our homework. If I do not understand a Maths problem, Tom explains it to me. I help him learn new English words.",
        hy: "Թոմը լավ է մաթեմատիկայից, իսկ ես՝ անգլերենից։ Մենք օգնում ենք միմյանց տնային առաջադրանքները կատարելիս։ Եթե ես մաթեմատիկայի որևէ խնդիր չեմ հասկանում, Թոմը բացատրում է այն ինձ։ Ես օգնում եմ նրան նոր անգլերեն բառեր սովորել։",
        ru: "Том хорошо разбирается в математике, а я хорошо знаю английский. Мы помогаем друг другу делать домашнее задание. Если я не понимаю задачу по математике, Том объясняет её мне. Я помогаю ему учить новые английские слова."
      },
      {
        en: "I like spending time with Tom because he is a good friend. We sometimes have different ideas, but we listen to each other and try to understand one another.",
        hy: "Ես սիրում եմ ժամանակ անցկացնել Թոմի հետ, որովհետև նա լավ ընկեր է։ Երբեմն մենք տարբեր կարծիքներ ենք ունենում, բայց լսում ենք միմյանց և փորձում հասկանալ իրար։",
        ru: "Мне нравится проводить время с Томом, потому что он хороший друг. Иногда у нас разные мнения, но мы слушаем друг друга и стараемся понять друг друга."
      },
      {
        en: "For me, a best friend is someone who cares, listens, helps, and makes you happy. I am glad to have Tom as my friend!",
        hy: "Ինձ համար լավագույն ընկերն այն մարդն է, ով հոգ է տանում քո մասին, լսում է քեզ, օգնում է և ուրախացնում։ Ես ուրախ եմ, որ Թոմի նման ընկեր ունեմ։",
        ru: "Для меня лучший друг — это человек, который заботится о тебе, слушает тебя, помогает тебе и радует тебя. Я рад, что у меня есть такой друг, как Том!"
      }
    ],
    vocabulary: [
      { word: "best friend", translation: { en: "best friend", hy: "լավագույն ընկեր", ru: "лучший друг" } },
      { word: "friendly", translation: { en: "friendly", hy: "ընկերասեր", ru: "дружелюбный" } },
      { word: "helpful", translation: { en: "helpful", hy: "օգնող, պատրաստակամ", ru: "отзывчивый" } },
      { word: "classmate", translation: { en: "classmate", hy: "դասընկեր", ru: "одноклассник" } },
      { word: "next to", translation: { en: "next to", hy: "կողքին", ru: "рядом с" } },
      { word: "make someone laugh", translation: { en: "make someone laugh", hy: "ծիծաղեցնել մեկին", ru: "рассмешить кого-то" } },
      { word: "have in common", translation: { en: "have in common", hy: "ընդհանուր բաներ ունենալ", ru: "иметь общее" } },
      { word: "board game", translation: { en: "board game", hy: "սեղանի խաղ", ru: "настольная игра" } },
      { word: "spend time", translation: { en: "spend time", hy: "ժամանակ անցկացնել", ru: "проводить время" } },
      { word: "homework", translation: { en: "homework", hy: "տնային առաջադրանք", ru: "домашнее задание" } },
      { word: "explain", translation: { en: "explain", hy: "բացատրել", ru: "объяснять" } },
      { word: "understand", translation: { en: "understand", hy: "հասկանալ", ru: "понимать" } },
      { word: "idea", translation: { en: "idea", hy: "միտք, գաղափար", ru: "идея" } },
      { word: "listen", translation: { en: "listen", hy: "լսել", ru: "слушать" } },
      { word: "care about", translation: { en: "care about", hy: "հոգ տանել", ru: "заботиться" } },
      { word: "each other", translation: { en: "each other", hy: "միմյանց", ru: "друг друга" } }
    ],
    questions: [
      {
        question: { en: "How old is Tom?", hy: "Քանի՞ տարեկան է Թոմը:", ru: "Сколько лет Тому?" },
        options: [
          { en: "Eight years old", hy: "Ութ տարեկան", ru: "Восемь лет" },
          { en: "Nine years old", hy: "Ինը տարեկան", ru: "Девять лет" },
          { en: "Ten years old", hy: "Տասը տարեկան", ru: "Десять лет" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Where do Alex and Tom sit at school?", hy: "Որտե՞ղ են Ալեքսը և Թոմը նստում դպրոցում:", ru: "Где Алекс и Том сидят в школе?" },
        options: [
          { en: "Next to each other", hy: "Իրար կողքի", ru: "Рядом друг с другом" },
          { en: "Near the door", hy: "Դռան մոտ", ru: "Возле двери" },
          { en: "At different desks", hy: "Տարբեր նստարանների մոտ", ru: "За разными партами" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What do they both like?", hy: "Ի՞նչ են նրանք երկուսն էլ սիրում:", ru: "Что они оба любят?" },
        options: [
          { en: "Swimming and dancing", hy: "Լողալ և պարել", ru: "Плавать и танцевать" },
          { en: "Cooking and singing", hy: "Խոհարարություն և երգել", ru: "Готовить и петь" },
          { en: "Football, drawing and reading", hy: "Ֆուտբոլ, նկարել և կարդալ", ru: "Футбол, рисование и чтение" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What subject is Tom good at?", hy: "Ո՞ր առարկայից է Թոմը լավ:", ru: "По какому предмету Том силён?" },
        options: [
          { en: "English", hy: "Անգլերեն", ru: "Английский" },
          { en: "Maths", hy: "Մաթեմատիկա", ru: "Математика" },
          { en: "Art", hy: "Կերպարվեստ", ru: "Рисование" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How does Alex help Tom?", hy: "Ինչպե՞ս է Ալեքսը օգնում Թոմին:", ru: "Как Алекс помогает Тому?" },
        options: [
          { en: "He teaches him football", hy: "Նա սովորեցնում է ֆուտբոլ խաղալ", ru: "Он учит его играть в футбол" },
          { en: "He helps him learn English words", hy: "Նա օգնում է նոր անգլերեն բառեր սովորել", ru: "Он помогает ему учить английские слова" },
          { en: "He does his homework", hy: "Նա կատարում է նրա տնայինը", ru: "Он делает за него домашнее задание" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What do good friends do when they have different ideas?", hy: "Ի՞նչ են անում լավ ընկերները, երբ տարբեր կարծիքներ ունեն:", ru: "Что делают хорошие друзья, когда у них разные мнения?" },
        options: [
          { en: "They stop talking", hy: "Նրանք դադարում են խոսել", ru: "Они перестают разговаривать" },
          { en: "They argue all the time", hy: "Նրանք անընդհատ վիճում են", ru: "Они всё время ссорятся" },
          { en: "They listen to each other", hy: "Նրանք լսում են միմյանց", ru: "Они слушают друг друга" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about your best friend!", hy: "Հիմա պատմիր քո լավագույն ընկերոջ մասին:", ru: "А теперь расскажи о своём лучшем друге!" },
      questions: [
        { en: "What is your best friend's name?", hy: "Ի՞նչ է քո լավագույն ընկերոջ անունը:", ru: "Как зовут твоего лучшего друга?" },
        { en: "How old is your friend?", hy: "Քանի՞ տարեկան է քո ընկերը:", ru: "Сколько лет твоему другу?" },
        { en: "What does your friend look like?", hy: "Ինչպիսի՞ տեսք ունի քո ընկերը:", ru: "Как выглядит твой друг?" },
        { en: "What is your friend's character like?", hy: "Ինչպիսի՞ն է քո ընկերոջ բնավորությունը:", ru: "Какой характер у твоего друга?" },
        { en: "What games do you play together?", hy: "Ի՞նչ խաղեր եք միասին խաղում:", ru: "В какие игры вы играете вместе?" },
        { en: "Why is your friend special to you?", hy: "Ինչո՞ւ է քո ընկերը քեզ համար առանձնահատուկ:", ru: "Почему твой друг особенный для тебя?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 2 ──────────────────────────
  {
    id: "friends_playground",
    level: "A2",
    topics: ["relationships", "school"],
    title: { en: "A New Friend in the Playground", hy: "Նոր ընկեր խաղահրապարակում", ru: "Новый друг на игровой площадке" },
    format: "Story",
    difficulty: 1,
    words: 175,
    minutes: 2,
    parts: 9,
    questionsCount: 6,
    paragraphs: [
      {
        en: "It is Friday afternoon. Alex and Tom are playing football in the school playground. They are having a great time.",
        hy: "Ուրբաթ օրվա կեսօրից հետո է։ Ալեքսն ու Թոմը ֆուտբոլ են խաղում դպրոցի խաղահրապարակում։ Նրանք շատ լավ ժամանակ են անցկացնում։",
        ru: "Наступила пятница, вторая половина дня. Алекс и Том играют в футбол на школьной игровой площадке. Они отлично проводят время."
      },
      {
        en: "Suddenly, they see a boy standing near a tree. He is watching the other children, but he is not playing with anyone.",
        hy: "Հանկարծ նրանք տեսնում են մի տղայի, որը կանգնած է ծառի մոտ։ Նա հետևում է մյուս երեխաներին, բայց ոչ մեկի հետ չի խաղում։",
        ru: "Вдруг они замечают мальчика, который стоит возле дерева. Он наблюдает за другими детьми, но ни с кем не играет."
      },
      {
        en: "Alex looks at him and says, \"Hello! My name is Alex. What is your name?\"",
        hy: "Ալեքսը նայում է նրան և ասում. «Բարև՛։ Իմ անունը Ալեքս է։ Քո անունն ի՞նչ է»։",
        ru: "Алекс смотрит на него и говорит: «Привет! Меня зовут Алекс. Как тебя зовут?»"
      },
      {
        en: "The boy smiles and answers, \"Hi! I am Daniel. I am new at this school.\"",
        hy: "Տղան ժպտում է և պատասխանում. «Բարև՛։ Ես Դանիելն եմ։ Ես այս դպրոցում նոր եմ»։",
        ru: "Мальчик улыбается и отвечает: «Привет! Я Даниэль. Я новенький в этой школе»."
      },
      {
        en: "\"Welcome to our school!\" says Tom. \"Are you in the fourth grade?\" \"Yes, I am,\" Daniel answers. \"I like football, but I do not know many children here.\"",
        hy: "«Բարի գալուստ մեր դպրոց», — ասում է Թոմը։ «Դու չորրորդ դասարանո՞ւմ ես սովորում»։ «Այո՛, — պատասխանում է Դանիելը։ — Ես սիրում եմ ֆուտբոլ, բայց այստեղ շատ երեխաների դեռ չեմ ճանաչում»։",
        ru: "«Добро пожаловать в нашу школу!» — говорит Том. «Ты учишься в четвёртом классе?» «Да, — отвечает Даниэль. — Я люблю футбол, но пока здесь знаю не многих детей»."
      },
      {
        en: "\"That is okay,\" says Alex. \"Would you like to play with us?\" \"Of course!\" Daniel says happily.",
        hy: "«Ոչինչ, — ասում է Ալեքսը։ — Կցանկանա՞ս մեզ հետ խաղալ»։ «Իհարկե՛», — ուրախությամբ պատասխանում է Դանիելը։",
        ru: "«Ничего страшного, — говорит Алекс. — Хочешь поиграть с нами?» «Конечно!» — радостно отвечает Даниэль."
      },
      {
        en: "The three boys start playing football together. Daniel is good at passing the ball, and Tom is good at scoring goals. Alex enjoys playing with his new friend.",
        hy: "Երեք տղաները սկսում են միասին ֆուտբոլ խաղալ։ Դանիելը լավ է գնդակը փոխանցում, իսկ Թոմը լավ է գոլեր խփում։ Ալեքսին դուր է գալիս խաղալ իր նոր ընկերոջ հետ։",
        ru: "Три мальчика начинают вместе играть в футбол. Даниэль хорошо передаёт мяч, а Том хорошо забивает голы. Алексу нравится играть со своим новым другом."
      },
      {
        en: "After the game, they sit on a bench and talk about their favourite subjects, hobbies, and games.",
        hy: "Խաղից հետո նրանք նստում են նստարանին և զրուցում իրենց սիրելի առարկաների, նախասիրությունների և խաղերի մասին։",
        ru: "После игры они садятся на скамейку и разговаривают о любимых школьных предметах, увлечениях и играх."
      },
      {
        en: "Daniel feels happy because he has made two new friends. Alex and Tom are happy too. They understand that a simple hello can be the beginning of a wonderful friendship.",
        hy: "Դանիելն ուրախ է, որովհետև երկու նոր ընկեր է ձեռք բերել։ Ալեքսն ու Թոմն էլ են ուրախ։ Նրանք հասկանում են, որ մի պարզ բարևը կարող է հրաշալի ընկերության սկիզբ դառնալ։",
        ru: "Даниэль счастлив, потому что у него появилось два новых друга. Алекс и Том тоже рады. Они понимают, что простое приветствие может стать началом прекрасной дружбы."
      }
    ],
    vocabulary: [
      { word: "playground", translation: { en: "playground", hy: "խաղահրապարակ", ru: "игровая площадка" } },
      { word: "suddenly", translation: { en: "suddenly", hy: "հանկարծ", ru: "внезапно" } },
      { word: "near", translation: { en: "near", hy: "մոտ", ru: "возле" } },
      { word: "stand", translation: { en: "stand", hy: "կանգնել", ru: "стоять" } },
      { word: "watch", translation: { en: "watch", hy: "հետևել, դիտել", ru: "наблюдать" } },
      { word: "new at school", translation: { en: "new at school", hy: "նորեկ դպրոցում", ru: "новенький в школе" } },
      { word: "welcome", translation: { en: "welcome", hy: "բարի գալուստ", ru: "добро пожаловать" } },
      { word: "grade", translation: { en: "grade", hy: "դասարան", ru: "класс" } },
      { word: "of course", translation: { en: "of course", hy: "իհարկե", ru: "конечно" } },
      { word: "pass the ball", translation: { en: "pass the ball", hy: "փոխանցել գնդակը", ru: "передавать мяч" } },
      { word: "score a goal", translation: { en: "score a goal", hy: "գոլ խփել", ru: "забить гол" } },
      { word: "bench", translation: { en: "bench", hy: "նստարան", ru: "скамейка" } },
      { word: "make a friend", translation: { en: "make a friend", hy: "ընկերանալ", ru: "подружиться" } },
      { word: "friendship", translation: { en: "friendship", hy: "ընկերություն", ru: "дружба" } },
      { word: "beginning", translation: { en: "beginning", hy: "սկիզբ", ru: "начало" } }
    ],
    questions: [
      {
        question: { en: "What day is it?", hy: "Ի՞նչ օր է:", ru: "Какой день?" },
        options: [
          { en: "Monday", hy: "Երկուշաբթի", ru: "Понедельник" },
          { en: "Friday", hy: "Ուրբաթ", ru: "Пятница" },
          { en: "Sunday", hy: "Կիրակի", ru: "Воскресенье" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Where is the new boy standing?", hy: "Որտե՞ղ է կանգնած նոր տղան:", ru: "Где стоит новый мальчик?" },
        options: [
          { en: "Near a tree", hy: "Ծառի մոտ", ru: "Возле дерева" },
          { en: "Near the classroom", hy: "Դասարանին մոտ", ru: "Возле класса" },
          { en: "Near the library", hy: "Գրադարանին մոտ", ru: "Возле библиотеки" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What is the new boy's name?", hy: "Ի՞նչ է նոր տղայի անունը:", ru: "Как зовут нового мальчика?" },
        options: [
          { en: "David", hy: "Դավիթ", ru: "Давид" },
          { en: "Daniel", hy: "Դանիել", ru: "Даниэль" },
          { en: "Peter", hy: "Փիթեր", ru: "Питер" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Daniel like?", hy: "Ի՞նչ է սիրում Դանիելը:", ru: "Что Даниэль любит?" },
        options: [
          { en: "Basketball", hy: "Բասկետբոլ", ru: "Баскетбол" },
          { en: "Swimming", hy: "Լող", ru: "Плавание" },
          { en: "Football", hy: "Ֆուտբոլ", ru: "Футбол" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What is Daniel good at?", hy: "Ինչո՞ւմ է Դանիելը լավ:", ru: "В чём Даниэль хорош?" },
        options: [
          { en: "Passing the ball", hy: "Գնդակը փոխանցելը", ru: "Передавать мяч" },
          { en: "Scoring goals", hy: "Գոլեր խփելը", ru: "Забивать голы" },
          { en: "Drawing pictures", hy: "Նկարներ նկարելը", ru: "Рисовать картинки" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What do the boys do after the game?", hy: "Ի՞նչ են անում տղաները խաղից հետո:", ru: "Что мальчики делают после игры?" },
        options: [
          { en: "Go home immediately", hy: "Անմիջապես գնում են տուն", ru: "Сразу идут домой" },
          { en: "Sit on a bench and talk", hy: "Նստում են նստարանին և զրուցում", ru: "Садятся на скамейку и разговаривают" },
          { en: "Go to the library", hy: "Գնում են գրադարան", ru: "Идут в библиотеку" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Imagine that you meet a new student!", hy: "Պատկերացրու, որ դպրոցում հանդիպում ես նոր աշակերտի:", ru: "Представь, что ты встретил нового ученика!" },
      questions: [
        { en: "What is your name?", hy: "Ի՞նչ է քո անունը:", ru: "Как тебя зовут?" },
        { en: "How do you ask another child about their name?", hy: "Ինչպե՞ս ես հարցնում մեկ այլ երեխայի անունը:", ru: "Как ты спрашиваешь имя другого ребёнка?" },
        { en: "How do you welcome a new student?", hy: "Ինչպե՞ս ես դիմավորում նոր աշակերտին:", ru: "Как ты приветствуешь нового ученика?" },
        { en: "What games can you play together?", hy: "Ի՞նչ խաղեր կարող եք միասին խաղալ:", ru: "В какие игры вы можете играть вместе?" },
        { en: "What questions can you ask about their hobbies?", hy: "Ի՞նչ հարցեր կարող ես տալ նրանց նախասիրությունների մասին:", ru: "Какие вопросы ты можешь задать об их увлечениях?" },
        { en: "How can you help a new student feel welcome?", hy: "Ինչպե՞ս կարող ես օգնել նոր աշակերտին իրեն հարմար զգալ:", ru: "Как ты можешь помочь новому ученику почувствовать себя желанным?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 3 ──────────────────────────
  {
    id: "friends_sharing",
    level: "A2",
    topics: ["relationships", "school"],
    title: { en: "Sharing Is Caring", hy: "Կիսվելը հոգատարություն է", ru: "Делиться — значит заботиться" },
    format: "Story",
    difficulty: 1,
    words: 200,
    minutes: 2,
    parts: 9,
    questionsCount: 6,
    paragraphs: [
      {
        en: "It is lunchtime at school. Alex, Tom, and Daniel are sitting together in the school garden.",
        hy: "Դպրոցում ճաշի ժամն է։ Ալեքսը, Թոմն ու Դանիելը միասին նստած են դպրոցի այգում։",
        ru: "В школе наступило время обеда. Алекс, Том и Даниэль сидят вместе в школьном саду."
      },
      {
        en: "Alex opens his lunchbox. He has a cheese sandwich, an apple, and a small bottle of water. Tom has two sandwiches, but Daniel has only an apple.",
        hy: "Ալեքսը բացում է իր ճաշի տուփը։ Նրա մեջ կա պանրով սենդվիչ, մեկ խնձոր և մի փոքրիկ շիշ ջուր։ Թոմը երկու սենդվիչ ունի, իսկ Դանիելը միայն մեկ խնձոր ունի։",
        ru: "Алекс открывает свой контейнер с едой. В нём есть бутерброд с сыром, яблоко и маленькая бутылка воды. У Тома два бутерброда, а у Даниэля только одно яблоко."
      },
      {
        en: "Tom looks at Daniel and asks, \"Would you like half of my sandwich?\" Daniel smiles and says, \"Thank you! That is very kind of you.\"",
        hy: "Թոմը նայում է Դանիելին և հարցնում. «Կցանկանա՞ս իմ սենդվիչի կեսը»։ Դանիելը ժպտում է և ասում. «Շնորհակալությո՛ւն։ Դա շատ բարի է քո կողմից»։",
        ru: "Том смотрит на Даниэля и спрашивает: «Хочешь половину моего бутерброда?» Даниэль улыбается и говорит: «Спасибо! Это очень мило с твоей стороны»."
      },
      {
        en: "Tom gives Daniel half of his sandwich. Then Alex takes his apple and says, \"We can share this too!\"",
        hy: "Թոմը Դանիելին տալիս է իր սենդվիչի կեսը։ Հետո Ալեքսը վերցնում է իր խնձորն ու ասում. «Մենք կարող ենք սա էլ կիսել»։",
        ru: "Том отдаёт Даниэлю половину своего бутерброда. Затем Алекс берёт своё яблоко и говорит: «Мы можем поделиться и этим!»"
      },
      {
        en: "The three friends enjoy their lunch together. They talk, laugh, and tell each other funny stories.",
        hy: "Երեք ընկերները միասին վայելում են իրենց ճաշը։ Նրանք զրուցում են, ծիծաղում և միմյանց զվարճալի պատմություններ պատմում։",
        ru: "Три друга вместе обедают. Они разговаривают, смеются и рассказывают друг другу смешные истории."
      },
      {
        en: "After lunch, they go to the classroom. Daniel wants to draw a picture, but he cannot find his coloured pencils. Alex sees the problem and offers him some of his pencils.",
        hy: "Ճաշից հետո նրանք գնում են դասարան։ Դանիելը ցանկանում է նկար նկարել, բայց չի կարողանում գտնել իր գունավոր մատիտները։ Ալեքսը նկատում է խնդիրը և առաջարկում նրան իր մատիտներից մի քանիսը։",
        ru: "После обеда они идут в класс. Даниэль хочет нарисовать картинку, но не может найти свои цветные карандаши. Алекс замечает проблему и предлагает ему несколько своих карандашей."
      },
      {
        en: "\"Thank you, Alex!\" says Daniel. \"You are welcome! Friends help each other,\" Alex answers.",
        hy: "«Շնորհակալությո՛ւն, Ալեքս», — ասում է Դանիելը։ «Խնդրեմ։ Ընկերներն օգնում են միմյանց», — պատասխանում է Ալեքսը։",
        ru: "«Спасибо, Алекс!» — говорит Даниэль. «Не за что! Друзья помогают друг другу», — отвечает Алекс."
      },
      {
        en: "At the end of the day, Daniel says, \"I am happy to have friends like you.\" Tom smiles and says, \"Sharing makes our friendship stronger!\"",
        hy: "Օրվա վերջում Դանիելն ասում է. «Ես ուրախ եմ, որ ձեզ նման ընկերներ ունեմ»։ Թոմը ժպտում է և ասում. «Կիսվելը մեր ընկերությունն ավելի ամուր է դարձնում»։",
        ru: "В конце дня Даниэль говорит: «Я рад, что у меня есть такие друзья, как вы». Том улыбается и говорит: «Умение делиться делает нашу дружбу крепче!»"
      },
      {
        en: "The boys learn that sharing does not mean giving away everything. It means being kind, thinking about others, and helping when someone needs it.",
        hy: "Տղաները հասկանում են, որ կիսվելը չի նշանակում ամեն ինչ տալ ուրիշներին։ Դա նշանակում է բարի լինել, մտածել ուրիշների մասին և օգնել, երբ ինչ-որ մեկն ունի դրա կարիքը։",
        ru: "Мальчики понимают, что делиться — не значит отдавать другим всё, что у тебя есть. Это значит быть добрым, думать о других и помогать, когда кому-то нужна помощь."
      }
    ],
    vocabulary: [
      { word: "lunchtime", translation: { en: "lunchtime", hy: "ճաշի ժամ", ru: "время обеда" } },
      { word: "lunchbox", translation: { en: "lunchbox", hy: "ճաշի տուփ", ru: "контейнер для еды" } },
      { word: "cheese", translation: { en: "cheese", hy: "պանիր", ru: "сыр" } },
      { word: "sandwich", translation: { en: "sandwich", hy: "սենդվիչ", ru: "бутерброд" } },
      { word: "half", translation: { en: "half", hy: "կես", ru: "половина" } },
      { word: "share", translation: { en: "share", hy: "կիսվել", ru: "делиться" } },
      { word: "kind", translation: { en: "kind", hy: "բարի", ru: "добрый" } },
      { word: "enjoy", translation: { en: "enjoy", hy: "վայելել", ru: "наслаждаться" } },
      { word: "funny story", translation: { en: "funny story", hy: "զվարճալի պատմություն", ru: "смешная история" } },
      { word: "coloured pencils", translation: { en: "coloured pencils", hy: "գունավոր մատիտներ", ru: "цветные карандаши" } },
      { word: "offer", translation: { en: "offer", hy: "առաջարկել", ru: "предлагать" } },
      { word: "problem", translation: { en: "problem", hy: "խնդիր", ru: "проблема" } },
      { word: "at the end of the day", translation: { en: "at the end of the day", hy: "օրվա վերջում", ru: "в конце дня" } },
      { word: "stronger", translation: { en: "stronger", hy: "ավելի ամուր", ru: "крепче" } },
      { word: "think about others", translation: { en: "think about others", hy: "մտածել ուրիշների մասին", ru: "думать о других" } }
    ],
    questions: [
      {
        question: { en: "Where are the three friends sitting at lunchtime?", hy: "Որտե՞ղ են երեք ընկերները նստած ճաշի ժամին:", ru: "Где три друга сидят во время обеда?" },
        options: [
          { en: "In the library", hy: "Գրադարանում", ru: "В библиотеке" },
          { en: "In the school garden", hy: "Դպրոցի այգում", ru: "В школьном саду" },
          { en: "At home", hy: "Տանը", ru: "Дома" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Tom offer Daniel?", hy: "Ի՞նչ է Թոմը առաջարկում Դանիելին:", ru: "Что Том предлагает Даниэлю?" },
        options: [
          { en: "Half of his sandwich", hy: "Իր սենդվիչի կեսը", ru: "Половину своего бутерброда" },
          { en: "An apple", hy: "Խնձոր", ru: "Яблоко" },
          { en: "A bottle of water", hy: "Շիշ ջուր", ru: "Бутылку воды" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does Alex share?", hy: "Ինչո՞վ է կիսվում Ալեքսը:", ru: "Чем делится Алекс?" },
        options: [
          { en: "His book", hy: "Իր գրքով", ru: "Своей книгой" },
          { en: "His football", hy: "Իր ֆուտբոլի գնդակով", ru: "Своим футбольным мячом" },
          { en: "His apple", hy: "Իր խնձորով", ru: "Своим яблоком" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What does Daniel want to do after lunch?", hy: "Ի՞նչ է ուզում անել Դանիելը ճաշից հետո:", ru: "Что Даниэль хочет делать после обеда?" },
        options: [
          { en: "Play football", hy: "Ֆուտբոլ խաղալ", ru: "Играть в футбол" },
          { en: "Draw a picture", hy: "Նկար նկարել", ru: "Нарисовать картинку" },
          { en: "Read a book", hy: "Գիրք կարդալ", ru: "Читать книгу" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Alex offer Daniel?", hy: "Ի՞նչ է Ալեքսը առաջարկում Դանիելին:", ru: "Что Алекс предлагает Даниэлю?" },
        options: [
          { en: "Some coloured pencils", hy: "Մի քանի գունավոր մատիտ", ru: "Несколько цветных карандашей" },
          { en: "A new schoolbag", hy: "Նոր դպրոցական պայուսակ", ru: "Новый школьный рюкзак" },
          { en: "A storybook", hy: "Հեքիաթների գիրք", ru: "Книгу сказок" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does sharing mean in the story?", hy: "Ի՞նչ է նշանակում կիսվելը պատմության մեջ:", ru: "Что значит делиться в рассказе?" },
        options: [
          { en: "Giving away everything", hy: "Ամեն ինչ տալ ուրիշներին", ru: "Отдавать всё" },
          { en: "Thinking about others and helping", hy: "Մտածել ուրիշների մասին և օգնել", ru: "Думать о других и помогать" },
          { en: "Keeping everything for yourself", hy: "Ամեն ինչ պահել ինքդ քեզ", ru: "Оставлять всё себе" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us how you share with your friends!", hy: "Պատմիր, թե ինչպես ես կիսվում ընկերներիդ հետ:", ru: "Расскажи, как ты делишься с друзьями!" },
      questions: [
        { en: "What do you like sharing with your friends?", hy: "Ինչո՞վ ես սիրում կիսվել ընկերներիդ հետ:", ru: "Чем ты любишь делиться с друзьями?" },
        { en: "Do you share your toys or books?", hy: "Կիսվու՞մ ես խաղալիքներով կամ գրքերով:", ru: "Ты делишься игрушками или книгами?" },
        { en: "How do you help your friends at school?", hy: "Ինչպե՞ս ես օգնում ընկերներիդ դպրոցում:", ru: "Как ты помогаешь друзьям в школе?" },
        { en: "What do you say when someone helps you?", hy: "Ի՞նչ ես ասում, երբ ինչ-որ մեկն օգնում է քեզ:", ru: "Что ты говоришь, когда кто-то помогает тебе?" },
        { en: "What do you say when you give something to a friend?", hy: "Ի՞նչ ես ասում, երբ ինչ-որ բան ես տալիս ընկերոջդ:", ru: "Что ты говоришь, когда даёшь что-то другу?" },
        { en: "Why is sharing important in friendship?", hy: "Ինչո՞ւ է կիսվելը կարևոր ընկերության մեջ:", ru: "Почему важно делиться в дружбе?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 4 ──────────────────────────
  {
    id: "friends_different_ideas",
    level: "A2",
    topics: ["relationships", "hobbies"],
    title: { en: "Different Ideas, One Friendship", hy: "Տարբեր կարծիքներ, մեկ ընկերություն", ru: "Разные мнения, одна дружба" },
    format: "Story",
    difficulty: 1,
    words: 180,
    minutes: 2,
    parts: 9,
    questionsCount: 6,
    paragraphs: [
      {
        en: "It is Saturday morning. Alex, Tom, and Daniel meet in the park. They want to spend the day together.",
        hy: "Շաբաթ առավոտ է։ Ալեքսը, Թոմն ու Դանիելը հանդիպում են այգում։ Նրանք ցանկանում են օրը միասին անցկացնել։",
        ru: "Субботнее утро. Алекс, Том и Даниэль встречаются в парке. Они хотят провести день вместе."
      },
      {
        en: "\"What shall we play today?\" asks Alex. \"Let's play football!\" says Tom. \"It is my favourite game.\"",
        hy: "«Ի՞նչ խաղանք այսօր», — հարցնում է Ալեքսը։ «Եկեք ֆուտբոլ խաղանք, — ասում է Թոմը։ — Դա իմ սիրելի խաղն է»։",
        ru: "«Во что мы будем играть сегодня?» — спрашивает Алекс. «Давайте играть в футбол! — говорит Том. — Это моя любимая игра»."
      },
      {
        en: "Daniel shakes his head. \"I would like to play basketball. I played it yesterday, and it was great!\"",
        hy: "Դանիելը տարուբերում է գլուխը։ «Ես կցանկանայի բասկետբոլ խաղալ։ Երեկ խաղացել եմ և շատ եմ հավանել»։",
        ru: "Даниэль качает головой. «Я хотел бы поиграть в баскетбол. Я играл вчера, и мне очень понравилось!»"
      },
      {
        en: "Alex thinks for a moment. \"I want to ride my bicycle, but I also like playing with you.\"",
        hy: "Ալեքսը մի պահ մտածում է։ «Ես ուզում եմ հեծանիվ քշել, բայց սիրում եմ նաև ձեզ հետ խաղալ»։",
        ru: "Алекс на мгновение задумывается. «Я хочу покататься на велосипеде, но мне также нравится играть с вами»."
      },
      {
        en: "The boys have different ideas. Tom wants football, Daniel wants basketball, and Alex wants to ride his bicycle. For a few minutes, nobody knows what to do.",
        hy: "Տղաները տարբեր կարծիքներ ունեն։ Թոմը ցանկանում է ֆուտբոլ խաղալ, Դանիելը՝ բասկետբոլ, իսկ Ալեքսը՝ հեծանիվ քշել։ Մի քանի րոպե ոչ ոք չգիտի՝ ինչ անել։",
        ru: "У мальчиков разные идеи. Том хочет играть в футбол, Даниэль — в баскетбол, а Алекс хочет кататься на велосипеде. Несколько минут никто не знает, что делать."
      },
      {
        en: "Then Daniel says, \"We can listen to each other and make a plan.\" \"That is a good idea!\" says Tom.",
        hy: "Հետո Դանիելն ասում է. «Մենք կարող ենք լսել միմյանց և ծրագիր կազմել»։ «Դա լավ միտք է», — ասում է Թոմը։",
        ru: "Затем Даниэль говорит: «Мы можем выслушать друг друга и составить план». «Хорошая идея!» — говорит Том."
      },
      {
        en: "They decide to play football first, then basketball. After that, they can ride their bicycles around the park. Everyone is happy with the plan.",
        hy: "Նրանք որոշում են նախ ֆուտբոլ խաղալ, հետո՝ բասկետբոլ։ Դրանից հետո կարող են հեծանիվներով շրջել այգում։ Բոլորը գոհ են այդ ծրագրից։",
        ru: "Они решают сначала поиграть в футбол, затем в баскетбол. После этого они смогут покататься на велосипедах по парку. Все довольны этим планом."
      },
      {
        en: "During the games, they cheer for each other and have lots of fun. They understand that they do not always need to choose the same thing.",
        hy: "Խաղերի ընթացքում նրանք ոգևորում են միմյանց և շատ լավ ժամանակ անցկացնում։ Նրանք հասկանում են, որ միշտ չէ, որ պետք է նույն բանն ընտրեն։",
        ru: "Во время игр они подбадривают друг друга и весело проводят время. Они понимают, что им не всегда нужно выбирать одно и то же."
      },
      {
        en: "At the end of the day, Alex says, \"We had different ideas, but we found a way to enjoy the day together.\" Tom smiles. \"Good friends listen to each other!\" Daniel agrees. \"And they respect each other's ideas.\"",
        hy: "Օրվա վերջում Ալեքսն ասում է. «Մենք տարբեր կարծիքներ ունեինք, բայց գտանք մի ձև, որ միասին լավ անցկացնենք օրը»։ Թոմը ժպտում է. «Լավ ընկերները լսում են միմյանց»։ Դանիելը համաձայնում է. «Եվ հարգում են միմյանց կարծիքները»։",
        ru: "В конце дня Алекс говорит: «У нас были разные идеи, но мы нашли способ хорошо провести день вместе». Том улыбается. «Хорошие друзья слушают друг друга!» Даниэль соглашается: «И уважают мнения друг друга»."
      }
    ],
    vocabulary: [
      { word: "meet", translation: { en: "meet", hy: "հանդիպել", ru: "встречаться" } },
      { word: "spend the day", translation: { en: "spend the day", hy: "օրն անցկացնել", ru: "провести день" } },
      { word: "favourite", translation: { en: "favourite", hy: "սիրելի", ru: "любимый" } },
      { word: "shake one's head", translation: { en: "shake one's head", hy: "գլուխը տարուբերել", ru: "качать головой" } },
      { word: "for a moment", translation: { en: "for a moment", hy: "մի պահ", ru: "на мгновение" } },
      { word: "different ideas", translation: { en: "different ideas", hy: "տարբեր կարծիքներ", ru: "разные идеи" } },
      { word: "make a plan", translation: { en: "make a plan", hy: "ծրագիր կազմել", ru: "составить план" } },
      { word: "decide", translation: { en: "decide", hy: "որոշել", ru: "решать" } },
      { word: "first", translation: { en: "first", hy: "նախ, առաջինը", ru: "сначала" } },
      { word: "then", translation: { en: "then", hy: "հետո", ru: "затем" } },
      { word: "be happy with", translation: { en: "be happy with", hy: "գոհ լինել", ru: "быть довольным" } },
      { word: "cheer for", translation: { en: "cheer for", hy: "ոգևորել, քաջալերել", ru: "подбадривать" } },
      { word: "opinion", translation: { en: "opinion", hy: "կարծիք", ru: "мнение" } },
      { word: "respect", translation: { en: "respect", hy: "հարգել", ru: "уважать" } },
      { word: "agree", translation: { en: "agree", hy: "համաձայնել", ru: "соглашаться" } },
      { word: "true friendship", translation: { en: "true friendship", hy: "իսկական ընկերություն", ru: "настоящая дружба" } }
    ],
    questions: [
      {
        question: { en: "Where do the boys meet?", hy: "Որտե՞ղ են տղաները հանդիպում:", ru: "Где встречаются мальчики?" },
        options: [
          { en: "At school", hy: "Դպրոցում", ru: "В школе" },
          { en: "In the park", hy: "Այգում", ru: "В парке" },
          { en: "At Daniel's home", hy: "Դանիելի տանը", ru: "У Даниэля дома" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Tom want to play?", hy: "Ի՞նչ է ուզում խաղալ Թոմը:", ru: "Во что Том хочет играть?" },
        options: [
          { en: "Football", hy: "Ֆուտբոլ", ru: "В футбол" },
          { en: "Basketball", hy: "Բասկետբոլ", ru: "В баскетбол" },
          { en: "Tennis", hy: "Թենիս", ru: "В теннис" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does Daniel want to play?", hy: "Ի՞նչ է ուզում խաղալ Դանիելը:", ru: "Во что Даниэль хочет играть?" },
        options: [
          { en: "Football", hy: "Ֆուտբոլ", ru: "В футбол" },
          { en: "Basketball", hy: "Բասկետբոլ", ru: "В баскетбол" },
          { en: "Volleyball", hy: "Վոլեյբոլ", ru: "В волейбол" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Alex want to do?", hy: "Ի՞նչ է ուզում անել Ալեքսը:", ru: "Что Алекс хочет делать?" },
        options: [
          { en: "Ride his bicycle", hy: "Հեծանիվ քշել", ru: "Кататься на велосипеде" },
          { en: "Play tennis", hy: "Թենիս խաղալ", ru: "Играть в теннис" },
          { en: "Read a book", hy: "Գիրք կարդալ", ru: "Читать книгу" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What do the boys decide to do?", hy: "Ի՞նչ են որոշում տղաները:", ru: "Что решают мальчики?" },
        options: [
          { en: "Go home", hy: "Գնալ տուն", ru: "Пойти домой" },
          { en: "Play only football", hy: "Խաղալ միայն ֆուտբոլ", ru: "Играть только в футбол" },
          { en: "Play both games and ride bicycles", hy: "Խաղալ երկու խաղերն էլ և հեծանիվ քշել", ru: "Играть в обе игры и кататься на велосипедах" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What do the boys learn?", hy: "Ի՞նչ են սովորում տղաները:", ru: "Чему учатся мальчики?" },
        options: [
          { en: "Friends must always agree", hy: "Ընկերները միշտ պետք է համաձայնեն", ru: "Друзья всегда должны соглашаться" },
          { en: "Friends should listen and respect each other", hy: "Ընկերները պետք է լսեն և հարգեն միմյանց", ru: "Друзья должны слушать и уважать друг друга" },
          { en: "Only one person can choose", hy: "Միայն մեկը կարող է ընտրել", ru: "Выбирать может только один" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us how you make decisions with your friends!", hy: "Պատմիր, թե ինչպես եք որոշումներ կայացնում ընկերներիդ հետ:", ru: "Расскажи, как вы принимаете решения с друзьями!" },
      questions: [
        { en: "What games do you like playing with your friends?", hy: "Ի՞նչ խաղեր ես սիրում խաղալ ընկերներիդ հետ:", ru: "В какие игры ты любишь играть с друзьями?" },
        { en: "Do you and your friends always like the same games?", hy: "Դուք և ընկերներդ միշտ նույն խաղե՞րն եք սիրում:", ru: "Вы с друзьями всегда любите одни и те же игры?" },
        { en: "What do you do when you have different ideas?", hy: "Ի՞նչ եք անում, երբ տարբեր կարծիքներ ունեք:", ru: "Что вы делаете, когда у вас разные идеи?" },
        { en: "How can you make a plan together?", hy: "Ինչպե՞ս կարող եք միասին ծրագիր կազմել:", ru: "Как вы можете вместе составить план?" },
        { en: "Why is it important to listen to your friends?", hy: "Ինչո՞ւ է կարևոր լսել ընկերներիդ:", ru: "Почему важно слушать друзей?" },
        { en: "What does a good friend do when someone has a different opinion?", hy: "Ի՞նչ է անում լավ ընկերը, երբ ինչ-որ մեկն այլ կարծիք ունի:", ru: "Что делает хороший друг, когда у кого-то другое мнение?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 5 ──────────────────────────
  {
    id: "friends_in_need",
    level: "A2",
    topics: ["relationships", "school"],
    title: { en: "A Friend in Need", hy: "Ընկերը դժվար պահին", ru: "Друг познаётся в беде" },
    format: "Story",
    difficulty: 1,
    words: 215,
    minutes: 2,
    parts: 10,
    questionsCount: 6,
    paragraphs: [
      {
        en: "It is Monday morning. Alex and Tom are walking to their classroom. They see Daniel sitting alone near the school garden. Daniel looks sad. He is not talking or playing with anyone.",
        hy: "Երկուշաբթի առավոտ է։ Ալեքսն ու Թոմը քայլում են դեպի իրենց դասարանը։ Նրանք տեսնում են, որ Դանիելը մենակ նստած է դպրոցի այգու մոտ։ Դանիելը տխուր տեսք ունի։ Նա ոչ մեկի հետ չի խոսում և չի խաղում։",
        ru: "Наступило утро понедельника. Алекс и Том идут в свой класс. Они видят, что Даниэль один сидит возле школьного сада. Даниэль выглядит грустным. Он ни с кем не разговаривает и не играет."
      },
      {
        en: "Alex walks up to him and asks, \"Hi, Daniel. Are you okay?\"",
        hy: "Ալեքսը մոտենում է նրան և հարցնում. «Բարև՛, Դանիել։ Ամեն ինչ լա՞վ է»։",
        ru: "Алекс подходит к нему и спрашивает: «Привет, Даниэль. У тебя всё хорошо?»"
      },
      {
        en: "Daniel looks down and says, \"I am a little sad. I wanted to take part in the school drawing competition, but I did not finish my picture.\"",
        hy: "Դանիելը նայում է ներքև և ասում. «Ես մի փոքր տխուր եմ։ Ցանկանում էի մասնակցել դպրոցական նկարչական մրցույթին, բայց չհասցրի ավարտել նկարս»։",
        ru: "Даниэль опускает глаза и говорит: «Мне немного грустно. Я хотел принять участие в школьном конкурсе рисунков, но не успел закончить свою картину»."
      },
      {
        en: "Tom sits next to him. \"Don't worry, Daniel. You can try again next time.\"",
        hy: "Թոմը նստում է նրա կողքին. «Մի՛ անհանգստացիր, Դանիել։ Հաջորդ անգամ կարող ես նորից փորձել»։",
        ru: "Том садится рядом с ним. «Не переживай, Даниэль. В следующий раз ты сможешь попробовать снова»."
      },
      {
        en: "\"But I worked on it for many days,\" Daniel says. \"I really wanted to show my picture.\"",
        hy: "«Բայց ես շատ օրեր եմ աշխատել այդ նկարի վրա, — ասում է Դանիելը։ — Ես իսկապես ցանկանում էի ցույց տալ իմ նկարը»։",
        ru: "«Но я работал над ней много дней, — говорит Даниэль. — Мне очень хотелось показать свой рисунок»."
      },
      {
        en: "Alex listens carefully. He does not laugh or tell Daniel that his problem is not important. \"I understand,\" Alex says. \"You worked hard, and you wanted to do your best.\"",
        hy: "Ալեքսը ուշադիր լսում է նրան։ Նա չի ծիծաղում և չի ասում, թե Դանիելի խնդիրը կարևոր չէ։ «Ես հասկանում եմ, — ասում է Ալեքսը։ — Դու շատ ես աշխատել և ցանկանում էիր հնարավորինս լավ արդյունք ունենալ»։",
        ru: "Алекс внимательно слушает его. Он не смеётся и не говорит, что проблема Даниэля не важна. «Я понимаю, — говорит Алекс. — Ты много работал и хотел показать свою лучшую работу»."
      },
      {
        en: "Tom adds, \"Maybe you can finish it after school. We can help you if you want.\" Daniel smiles a little. \"Thank you. I think I will try again.\"",
        hy: "Թոմն ավելացնում է. «Գուցե դասերից հետո կարողանաս ավարտել այն։ Եթե ցանկանաս, մենք կարող ենք օգնել քեզ»։ Դանիելը մի փոքր ժպտում է. «Շնորհակալությո՛ւն։ Կարծում եմ՝ նորից կփորձեմ»։",
        ru: "Том добавляет: «Может быть, ты сможешь закончить её после уроков. Если захочешь, мы поможем тебе». Даниэль немного улыбается. «Спасибо. Думаю, я попробую ещё раз»."
      },
      {
        en: "After their lessons, the three friends go to the art room. Alex helps Daniel choose some colours, and Tom helps him prepare the paper. Daniel finishes his picture and feels much better.",
        hy: "Դասերից հետո երեք ընկերները գնում են նկարչության սենյակ։ Ալեքսն օգնում է Դանիելին գույներ ընտրել, իսկ Թոմը՝ պատրաստել թուղթը։ Դանիելն ավարտում է իր նկարը և իրեն շատ ավելի լավ է զգում։",
        ru: "После уроков три друга идут в кабинет рисования. Алекс помогает Даниэлю выбрать цвета, а Том помогает подготовить бумагу. Даниэль заканчивает свой рисунок и чувствует себя намного лучше."
      },
      {
        en: "\"I am lucky to have friends like you,\" he says. Alex answers, \"You don't have to be happy all the time. Friends are here to listen and help.\"",
        hy: "«Ես երջանիկ եմ, որ ձեզ նման ընկերներ ունեմ», — ասում է նա։ Ալեքսը պատասխանում է. «Պետք չէ միշտ ուրախ լինել։ Ընկերները նրա համար են, որ լսեն քեզ և օգնեն»։",
        ru: "«Мне повезло, что у меня есть такие друзья, как вы», — говорит он. Алекс отвечает: «Ты не обязан всегда быть весёлым. Друзья нужны для того, чтобы выслушать тебя и помочь»."
      },
      {
        en: "The boys learn that sometimes a friend does not need a big solution. A kind word, a little time, and a listening ear can make a difficult day better.",
        hy: "Տղաները հասկանում են, որ երբեմն ընկերոջը մեծ լուծում պետք չէ։ Բարի խոսքը, մի փոքր ժամանակը և ուշադիր լսելը կարող են դժվար օրը ավելի լավը դարձնել։",
        ru: "Мальчики понимают, что иногда другу не нужно большое решение проблемы. Доброе слово, немного времени и внимательное слушание могут сделать трудный день лучше."
      }
    ],
    vocabulary: [
      { word: "alone", translation: { en: "alone", hy: "մենակ", ru: "один" } },
      { word: "sad", translation: { en: "sad", hy: "տխուր", ru: "грустный" } },
      { word: "walk up to", translation: { en: "walk up to", hy: "մոտենալ", ru: "подойти к" } },
      { word: "take part", translation: { en: "take part", hy: "մասնակցել", ru: "принимать участие" } },
      { word: "competition", translation: { en: "competition", hy: "մրցույթ", ru: "конкурс" } },
      { word: "drawing", translation: { en: "drawing", hy: "նկարչություն, նկար", ru: "рисунок" } },
      { word: "finish", translation: { en: "finish", hy: "ավարտել", ru: "заканчивать" } },
      { word: "don't worry", translation: { en: "don't worry", hy: "մի՛ անհանգստացիր", ru: "не переживай" } },
      { word: "carefully", translation: { en: "carefully", hy: "ուշադիր", ru: "внимательно" } },
      { word: "work hard", translation: { en: "work hard", hy: "շատ աշխատել", ru: "усердно работать" } },
      { word: "choose", translation: { en: "choose", hy: "ընտրել", ru: "выбирать" } },
      { word: "colour", translation: { en: "colour", hy: "գույն", ru: "цвет" } },
      { word: "lucky", translation: { en: "lucky", hy: "բախտավոր", ru: "везучий" } },
      { word: "kind word", translation: { en: "kind word", hy: "բարի խոսք", ru: "доброе слово" } },
      { word: "solution", translation: { en: "solution", hy: "լուծում", ru: "решение" } },
      { word: "feel better", translation: { en: "feel better", hy: "ավելի լավ զգալ", ru: "чувствовать себя лучше" } },
      { word: "try again", translation: { en: "try again", hy: "նորից փորձել", ru: "попробовать снова" } }
    ],
    questions: [
      {
        question: { en: "Where is Daniel sitting?", hy: "Որտե՞ղ է նստած Դանիելը:", ru: "Где сидит Даниэль?" },
        options: [
          { en: "In the library", hy: "Գրադարանում", ru: "В библиотеке" },
          { en: "Near the school garden", hy: "Դպրոցի այգու մոտ", ru: "Возле школьного сада" },
          { en: "In the classroom", hy: "Դասարանում", ru: "В классе" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Why is Daniel sad?", hy: "Ինչո՞ւ է Դանիելը տխուր:", ru: "Почему Даниэль грустный?" },
        options: [
          { en: "He lost his schoolbag", hy: "Նա կորցրել է պայուսակը", ru: "Он потерял рюкзак" },
          { en: "He did not finish his drawing", hy: "Նա չի ավարտել իր նկարը", ru: "Он не закончил свой рисунок" },
          { en: "He missed the football game", hy: "Նա բաց է թողել ֆուտբոլի խաղը", ru: "Он пропустил футбольный матч" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Tom tell Daniel?", hy: "Ի՞նչ է Թոմն ասում Դանիելին:", ru: "Что Том говорит Даниэлю?" },
        options: [
          { en: "Don't worry. You can try again", hy: "Մի՛ անհանգստացիր։ Կարող ես նորից փորձել", ru: "Не переживай. Ты можешь попробовать снова" },
          { en: "Stop drawing pictures", hy: "Դադարիր նկարել", ru: "Перестань рисовать" },
          { en: "Go home now", hy: "Հիմա գնա տուն", ru: "Иди домой сейчас" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "How does Alex help Daniel?", hy: "Ինչպե՞ս է Ալեքսը օգնում Դանիելին:", ru: "Как Алекс помогает Даниэлю?" },
        options: [
          { en: "He buys him a new picture", hy: "Նա նոր նկար է գնում նրա համար", ru: "Он покупает ему новую картину" },
          { en: "He chooses colours with him", hy: "Նա գույներ է ընտրում նրա հետ", ru: "Он выбирает цвета вместе с ним" },
          { en: "He finishes the picture for him", hy: "Նա ավարտում է նկարը նրա փոխարեն", ru: "Он заканчивает картину за него" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Where do the friends go after lessons?", hy: "Ո՞ւր են ընկերները գնում դասերից հետո:", ru: "Куда друзья идут после уроков?" },
        options: [
          { en: "To the art room", hy: "Նկարչության սենյակ", ru: "В кабинет рисования" },
          { en: "To the playground", hy: "Խաղահրապարակ", ru: "На игровую площадку" },
          { en: "To the library", hy: "Գրադարան", ru: "В библиотеку" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What can make a difficult day better?", hy: "Ի՞նչը կարող է դժվար օրը լավը դարձնել:", ru: "Что может сделать трудный день лучше?" },
        options: [
          { en: "Laughing at a friend", hy: "Ընկերոջ վրա ծիծաղելը", ru: "Смех над другом" },
          { en: "Ignoring a friend", hy: "Ընկերոջը անտեսելը", ru: "Игнорирование друга" },
          { en: "A kind word and careful listening", hy: "Բարի խոսքը և ուշադիր լսելը", ru: "Доброе слово и внимательное слушание" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us how you help a sad friend!", hy: "Պատմիր, թե ինչպես ես օգնում տխուր ընկերոջը:", ru: "Расскажи, как ты помогаешь грустному другу!" },
      questions: [
        { en: "How can you know that your friend is sad?", hy: "Ինչպե՞ս կարող ես իմանալ, որ ընկերդ տխուր է:", ru: "Как ты можешь понять, что твой друг грустит?" },
        { en: "What can you say to a sad friend?", hy: "Ի՞նչ կարող ես ասել տխուր ընկերոջը:", ru: "Что ты можешь сказать грустному другу?" },
        { en: "Why is it important to listen carefully?", hy: "Ինչո՞ւ է կարևոր ուշադիր լսել:", ru: "Почему важно внимательно слушать?" },
        { en: "How can you help a friend at school?", hy: "Ինչպե՞ս կարող ես օգնել ընկերոջը դպրոցում:", ru: "Как ты можешь помочь другу в школе?" },
        { en: "What makes you feel better when you have a difficult day?", hy: "Ի՞նչն է քեզ ավելի լավ զգացնում, երբ դժվար օր ունես:", ru: "Что помогает тебе, когда у тебя трудный день?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 6 ──────────────────────────
  {
    id: "friends_surprise",
    level: "A2",
    topics: ["relationships", "celebrations"],
    title: { en: "A Surprise for My Friend", hy: "Անակնկալ ընկերոջս համար", ru: "Сюрприз для моего друга" },
    format: "Story",
    difficulty: 1,
    words: 175,
    minutes: 2,
    parts: 8,
    questionsCount: 6,
    paragraphs: [
      {
        en: "Daniel's birthday is on Saturday. He will be ten years old. His friends, Alex and Tom, want to make a surprise for him.",
        hy: "Դանիելի ծննդյան օրը շաբաթ օրն է։ Նա դառնալու է տասը տարեկան։ Նրա ընկերները՝ Ալեքսն ու Թոմը, ցանկանում են նրա համար անակնկալ պատրաստել։",
        ru: "День рождения Даниэля — в субботу. Ему исполнится десять лет. Его друзья, Алекс и Том, хотят приготовить для него сюрприз."
      },
      {
        en: "On Friday afternoon, Alex and Tom meet at Tom's house. They have a plan. They want to decorate the room with colourful balloons and make a birthday card.",
        hy: "Ուրբաթ կեսօրին Ալեքսն ու Թոմը հանդիպում են Թոմի տանը։ Նրանք ծրագիր ունեն։ Ցանկանում են սենյակը զարդարել գունավոր փուչիկներով և պատրաստել ծննդյան բացիկ։",
        ru: "В пятницу после обеда Алекс и Том встречаются у Тома дома. У них есть план. Они хотят украсить комнату разноцветными воздушными шарами и сделать поздравительную открытку."
      },
      {
        en: "First, Alex blows up the balloons. Tom puts them around the room. Then they make a big card. They write: \"Happy Birthday, Daniel! We are happy to be your friends!\"",
        hy: "Սկզբում Ալեքսը փչում է փուչիկները։ Թոմը դրանք տեղադրում է սենյակի տարբեր մասերում։ Հետո նրանք պատրաստում են մեծ բացիկ։ Վրան գրում են. «Ծնունդդ շնորհավոր, Դանիե՛լ։ Մենք ուրախ ենք, որ քո ընկերներն ենք»։",
        ru: "Сначала Алекс надувает воздушные шары. Том развешивает их по комнате. Затем они делают большую открытку. На ней они пишут: «С днём рождения, Даниэль! Мы рады, что мы твои друзья!»"
      },
      {
        en: "Alex also brings a small present for Daniel. It is a new storybook because Daniel loves reading.",
        hy: "Ալեքսը նաև մի փոքրիկ նվեր է բերել Դանիելի համար։ Դա նոր հեքիաթագիրք է, որովհետև Դանիելը շատ է սիրում կարդալ։",
        ru: "Алекс также приносит небольшой подарок для Даниэля. Это новая книга сказок, потому что Даниэль очень любит читать."
      },
      {
        en: "On Saturday, Daniel comes to Tom's house. When he opens the door, his friends shout, \"Surprise! Happy Birthday!\" Daniel is very happy. He looks at the balloons, the card and the present.",
        hy: "Շաբաթ օրը Դանիելը գալիս է Թոմի տուն։ Երբ նա բացում է դուռը, ընկերները բացականչում են. «Անակնկա՜լ։ Ծնունդդ շնորհավո՜ր»։ Դանիելը շատ է ուրախանում։ Նա նայում է փուչիկներին, բացիկին և նվերին։",
        ru: "В субботу Даниэль приходит к Тому домой. Когда он открывает дверь, друзья кричат: «Сюрприз! С днём рождения!» Даниэль очень рад. Он смотрит на воздушные шары, открытку и подарок."
      },
      {
        en: "\"Thank you! This is wonderful!\" he says.",
        hy: "«Շնորհակա՜լ եմ։ Սա հրաշալի է», — ասում է նա։",
        ru: "«Спасибо! Это замечательно!» — говорит он."
      },
      {
        en: "Then the boys eat birthday cake, play games and tell funny stories. They have a great time together.",
        hy: "Հետո տղաները ուտում են ծննդյան տորթը, խաղեր խաղում և զվարճալի պատմություններ պատմում։ Նրանք միասին շատ լավ ժամանակ են անցկացնում։",
        ru: "Затем мальчики едят праздничный торт, играют в игры и рассказывают смешные истории. Они прекрасно проводят время вместе."
      },
      {
        en: "Daniel understands that the best present is not always something in a box. Good friends are a wonderful gift, too!",
        hy: "Դանիելը հասկանում է, որ լավագույն նվերը միշտ չէ, որ տուփի մեջ եղած իրն է։ Լավ ընկերներն էլ հրաշալի նվեր են։",
        ru: "Даниэль понимает, что лучший подарок — это не всегда вещь в коробке. Хорошие друзья тоже прекрасный подарок!"
      }
    ],
    vocabulary: [
      { word: "birthday", translation: { en: "birthday", hy: "ծննդյան օր", ru: "день рождения" } },
      { word: "surprise", translation: { en: "surprise", hy: "անակնկալ", ru: "сюрприз" } },
      { word: "present", translation: { en: "present", hy: "նվեր", ru: "подарок" } },
      { word: "balloon", translation: { en: "balloon", hy: "փուչիկ", ru: "воздушный шар" } },
      { word: "decorate", translation: { en: "decorate", hy: "զարդարել", ru: "украшать" } },
      { word: "birthday card", translation: { en: "birthday card", hy: "ծննդյան բացիկ", ru: "поздравительная открытка" } },
      { word: "storybook", translation: { en: "storybook", hy: "հեքիաթագիրք", ru: "книга сказок" } },
      { word: "blow up", translation: { en: "blow up", hy: "փչել", ru: "надувать" } },
      { word: "wonderful", translation: { en: "wonderful", hy: "հրաշալի", ru: "замечательный" } },
      { word: "cake", translation: { en: "cake", hy: "տորթ", ru: "торт" } }
    ],
    questions: [
      {
        question: { en: "When is Daniel's birthday?", hy: "Ե՞րբ է Դանիելի ծննդյան օրը:", ru: "Когда у Даниэля день рождения?" },
        options: [
          { en: "On Friday", hy: "Ուրբաթ", ru: "В пятницу" },
          { en: "On Saturday", hy: "Շաբաթ", ru: "В субботу" },
          { en: "On Sunday", hy: "Կիրակի", ru: "В воскресенье" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How old will Daniel be?", hy: "Քանի՞ տարեկան կդառնա Դանիելը:", ru: "Сколько лет исполнится Даниэлю?" },
        options: [
          { en: "Nine", hy: "Ինը", ru: "Девять" },
          { en: "Ten", hy: "Տասը", ru: "Десять" },
          { en: "Eleven", hy: "Տասնմեկ", ru: "Одиннадцать" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Where do Alex and Tom meet?", hy: "Որտե՞ղ են հանդիպում Ալեքսն ու Թոմը:", ru: "Где встречаются Алекс и Том?" },
        options: [
          { en: "At school", hy: "Դպրոցում", ru: "В школе" },
          { en: "At Daniel's house", hy: "Դանիելի տանը", ru: "У Даниэля дома" },
          { en: "At Tom's house", hy: "Թոմի տանը", ru: "У Тома дома" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What do they use to decorate the room?", hy: "Ինչո՞վ են նրանք զարդարում սենյակը:", ru: "Чем они украшают комнату?" },
        options: [
          { en: "Colourful balloons", hy: "Գունավոր փուչիկներ", ru: "Разноцветными шарами" },
          { en: "Flowers and books", hy: "Ծաղիկներ և գրքեր", ru: "Цветами и книгами" },
          { en: "Toys and pictures", hy: "Խաղալիքներ և նկարներ", ru: "Игрушками и картинками" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What present does Alex bring?", hy: "Ի՞նչ նվեր է բերում Ալեքսը:", ru: "Какой подарок приносит Алекс?" },
        options: [
          { en: "A football", hy: "Ֆուտբոլի գնդակ", ru: "Футбольный мяч" },
          { en: "A storybook", hy: "Հեքիաթագիրք", ru: "Книгу сказок" },
          { en: "A toy car", hy: "Խաղալիք մեքենա", ru: "Игрушечную машину" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Daniel say when he sees the surprise?", hy: "Ի՞նչ է ասում Դանիելը, երբ տեսնում է անակնկալը:", ru: "Что Даниэль говорит, когда видит сюрприз?" },
        options: [
          { en: "I am tired", hy: "Ես հոգնած եմ", ru: "Я устал" },
          { en: "I don't like it", hy: "Ինձ դուր չի գալիս", ru: "Мне не нравится" },
          { en: "Thank you! This is wonderful!", hy: "Շնորհակալություն։ Սա հրաշալի է", ru: "Спасибо! Это замечательно!" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about a birthday surprise!", hy: "Պատմիր ծննդյան անակնկալի մասին:", ru: "Расскажи о сюрпризе на день рождения!" },
      questions: [
        { en: "When is your birthday?", hy: "Ե՞րբ է քո ծննդյան օրը:", ru: "Когда у тебя день рождения?" },
        { en: "How old are you?", hy: "Քանի՞ տարեկան ես:", ru: "Сколько тебе лет?" },
        { en: "What do you like to do on your birthday?", hy: "Ի՞նչ ես սիրում անել ծննդյան օրդ:", ru: "Что ты любишь делать в свой день рождения?" },
        { en: "What present do you like to get?", hy: "Ի՞նչ նվեր ես սիրում ստանալ:", ru: "Какой подарок ты любишь получать?" },
        { en: "How do you celebrate your friend's birthday?", hy: "Ինչպե՞ս ես նշում ընկերոջդ ծննդյան օրը:", ru: "Как ты празднуешь день рождения друга?" },
        { en: "What is the best present for a good friend?", hy: "Ո՞րն է լավագույն նվերը լավ ընկերոջ համար:", ru: "Какой лучший подарок для хорошего друга?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 7 ──────────────────────────
  {
    id: "friends_weekend_game",
    level: "A2",
    topics: ["relationships", "hobbies"],
    title: { en: "Our Favourite Weekend Game", hy: "Մեր սիրելի հանգստյան խաղը", ru: "Наша любимая игра на выходных" },
    format: "Story",
    difficulty: 1,
    words: 155,
    minutes: 2,
    parts: 8,
    questionsCount: 6,
    paragraphs: [
      {
        en: "It is Saturday morning. Alex, Tom and Daniel meet in the park. They have no school today, so they want to play together.",
        hy: "Շաբաթ առավոտ է։ Ալեքսը, Թոմն ու Դանիելը հանդիպում են այգում։ Այսօր նրանք դպրոց չունեն, ուստի ցանկանում են միասին խաղալ։",
        ru: "Субботнее утро. Алекс, Том и Даниэль встречаются в парке. Сегодня им не нужно идти в школу, поэтому они хотят поиграть вместе."
      },
      {
        en: "\"What shall we play?\" asks Tom. \"Let's play football!\" says Alex. \"I like football, but I also want to play basketball,\" says Daniel.",
        hy: "«Ի՞նչ խաղանք», — հարցնում է Թոմը։ «Եկե՛ք ֆուտբոլ խաղանք», — ասում է Ալեքսը։ «Ես սիրում եմ ֆուտբոլ, բայց նաև ուզում եմ բասկետբոլ խաղալ», — ասում է Դանիելը։",
        ru: "«Во что будем играть?» — спрашивает Том. «Давайте играть в футбол!» — говорит Алекс. «Я люблю футбол, но ещё хочу поиграть в баскетбол», — говорит Даниэль."
      },
      {
        en: "The boys think for a moment. Then Tom has a good idea. \"Let's play both games! First, we can play football. After that, we can play basketball.\"",
        hy: "Տղաները մի պահ մտածում են։ Հետո Թոմը լավ միտք է առաջարկում. «Եկե՛ք երկու խաղն էլ խաղանք։ Սկզբում կարող ենք ֆուտբոլ խաղալ, իսկ հետո՝ բասկետբոլ»։",
        ru: "Мальчики немного думают. Затем Том предлагает хорошую идею. «Давайте сыграем в обе игры! Сначала мы можем поиграть в футбол, а потом — в баскетбол»."
      },
      {
        en: "\"Great idea!\" say Alex and Daniel. They make two small teams and start playing football. Alex runs quickly, Tom passes the ball to Daniel, and Daniel scores a goal. \"Great job, Daniel!\" says Alex.",
        hy: "«Հրաշալի միտք է», — ասում են Ալեքսն ու Դանիելը։ Նրանք կազմում են երկու փոքր թիմ և սկսում ֆուտբոլ խաղալ։ Ալեքսը արագ վազում է, Թոմը գնդակը փոխանցում է Դանիելին, իսկ Դանիելը գոլ է խփում։ «Ապրե՛ս, Դանիե՛լ», — ասում է Ալեքսը։",
        ru: "«Отличная идея!» — говорят Алекс и Даниэль. Они делятся на две небольшие команды и начинают играть в футбол. Алекс быстро бежит, Том передаёт мяч Даниэлю, а Даниэль забивает гол. «Молодец, Даниэль!» — говорит Алекс."
      },
      {
        en: "After football, they take a short break and drink some water. Then they play basketball. They count the points and laugh when the ball misses the basket.",
        hy: "Ֆուտբոլից հետո նրանք մի փոքր հանգստանում են և ջուր խմում։ Հետո բասկետբոլ են խաղում։ Նրանք հաշվում են միավորները և ծիծաղում, երբ գնդակը չի հայտնվում զամբյուղի մեջ։",
        ru: "После футбола они немного отдыхают и пьют воду. Затем играют в баскетбол. Они считают очки и смеются, когда мяч не попадает в корзину."
      },
      {
        en: "At the end of the game, Daniel's team wins. But he says: \"Today, winning is not the most important thing. We had fun together!\"",
        hy: "Խաղի վերջում Դանիելի թիմը հաղթում է։ Բայց նա ասում է. «Այսօր հաղթելն ամենակարևորը չէ։ Մենք միասին լավ ժամանակ անցկացրինք»։",
        ru: "В конце игры команда Даниэля побеждает. Но он говорит: «Сегодня победа — не самое главное. Мы хорошо провели время вместе!»"
      },
      {
        en: "His friends agree. They are happy because everyone had a chance to play and enjoy the day.",
        hy: "Նրա ընկերները համաձայնում են։ Նրանք ուրախ են, որովհետև բոլորն էլ հնարավորություն ունեցան խաղալու և հաճելի օր անցկացնելու։",
        ru: "Его друзья соглашаются. Они рады, потому что каждый смог поиграть и приятно провести день."
      },
      {
        en: "The boys decide to meet again next weekend. They already have another great idea!",
        hy: "Տղաները որոշում են հաջորդ հանգստյան օրն էլ հանդիպել։ Նրանք արդեն մեկ այլ հրաշալի միտք ունեն։",
        ru: "Мальчики решают встретиться снова в следующие выходные. У них уже есть ещё одна замечательная идея!"
      }
    ],
    vocabulary: [
      { word: "weekend", translation: { en: "weekend", hy: "հանգստյան օրեր", ru: "выходные" } },
      { word: "let's", translation: { en: "let's", hy: "եկե՛ք", ru: "давай(те)" } },
      { word: "both", translation: { en: "both", hy: "երկուսն էլ", ru: "оба" } },
      { word: "team", translation: { en: "team", hy: "թիմ", ru: "команда" } },
      { word: "pass the ball", translation: { en: "pass the ball", hy: "փոխանցել գնդակը", ru: "передать мяч" } },
      { word: "score a goal", translation: { en: "score a goal", hy: "գոլ խփել", ru: "забить гол" } },
      { word: "take a break", translation: { en: "take a break", hy: "ընդմիջում անել", ru: "сделать перерыв" } },
      { word: "point", translation: { en: "point", hy: "միավոր", ru: "очко" } },
      { word: "basket", translation: { en: "basket", hy: "զամբյուղ", ru: "корзина" } },
      { word: "win", translation: { en: "win", hy: "հաղթել", ru: "победить" } },
      { word: "chance", translation: { en: "chance", hy: "հնարավորություն", ru: "возможность" } },
      { word: "enjoy", translation: { en: "enjoy", hy: "հաճույք ստանալ", ru: "получать удовольствие" } }
    ],
    questions: [
      {
        question: { en: "When do the boys meet?", hy: "Ե՞րբ են տղաները հանդիպում:", ru: "Когда встречаются мальчики?" },
        options: [
          { en: "On Saturday morning", hy: "Շաբաթ առավոտ", ru: "В субботу утром" },
          { en: "On Monday evening", hy: "Երկուշաբթի երեկո", ru: "В понедельник вечером" },
          { en: "On Sunday night", hy: "Կիրակի գիշեր", ru: "В воскресенье ночью" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Where do they meet?", hy: "Որտե՞ղ են նրանք հանդիպում:", ru: "Где они встречаются?" },
        options: [
          { en: "At school", hy: "Դպրոցում", ru: "В школе" },
          { en: "In the park", hy: "Այգում", ru: "В парке" },
          { en: "At Tom's house", hy: "Թոմի տանը", ru: "У Тома дома" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Daniel want to play?", hy: "Ի՞նչ է ուզում խաղալ Դանիելը:", ru: "Во что Даниэль хочет играть?" },
        options: [
          { en: "Only football", hy: "Միայն ֆուտբոլ", ru: "Только футбол" },
          { en: "Only tennis", hy: "Միայն թենիս", ru: "Только теннис" },
          { en: "Football and basketball", hy: "Ֆուտբոլ և բասկետբոլ", ru: "Футбол и баскетбол" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Who scores a goal?", hy: "Ո՞վ է գոլ խփում:", ru: "Кто забивает гол?" },
        options: [
          { en: "Alex", hy: "Ալեքս", ru: "Алекс" },
          { en: "Tom", hy: "Թոմ", ru: "Том" },
          { en: "Daniel", hy: "Դանիել", ru: "Даниэль" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What do the boys do after football?", hy: "Ի՞նչ են անում տղաները ֆուտբոլից հետո:", ru: "Что мальчики делают после футбола?" },
        options: [
          { en: "They take a break and drink water", hy: "Նրանք հանգստանում են և ջուր խմում", ru: "Они делают перерыв и пьют воду" },
          { en: "They go home", hy: "Նրանք գնում են տուն", ru: "Они идут домой" },
          { en: "They eat lunch", hy: "Նրանք ճաշում են", ru: "Они обедают" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What is the most important thing for Daniel?", hy: "Ո՞րն է ամենակարևորը Դանիելի համար:", ru: "Что самое главное для Даниэля?" },
        options: [
          { en: "Winning every game", hy: "Ամեն խաղում հաղթելը", ru: "Победа в каждой игре" },
          { en: "Having fun together", hy: "Միասին լավ ժամանակ անցկացնելը", ru: "Весело проводить время вместе" },
          { en: "Getting a new ball", hy: "Նոր գնդակ ստանալը", ru: "Получение нового мяча" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about your favourite game!", hy: "Պատմիր քո սիրելի խաղի մասին:", ru: "Расскажи о своей любимой игре!" },
      questions: [
        { en: "What is your favourite game?", hy: "Ո՞րն է քո սիրելի խաղը:", ru: "Какая твоя любимая игра?" },
        { en: "Where do you like to play?", hy: "Որտե՞ղ ես սիրում խաղալ:", ru: "Где ты любишь играть?" },
        { en: "Who do you play with?", hy: "Ու՞մ հետ ես խաղում:", ru: "С кем ты играешь?" },
        { en: "What do you do when your friend wins?", hy: "Ի՞նչ ես անում, երբ ընկերդ հաղթում է:", ru: "Что ты делаешь, когда твой друг выигрывает?" },
        { en: "What is more important: winning or having fun?", hy: "Ի՞նչն է ավելի կարևոր՝ հաղթելը, թե լավ ժամանակ անցկացնելը:", ru: "Что важнее: победа или веселье?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 8 ──────────────────────────
  {
    id: "friends_picnic",
    level: "A2",
    topics: ["relationships", "nature", "food"],
    title: { en: "A Picnic with Friends", hy: "Խնջույք ընկերների հետ", ru: "Пикник с друзьями" },
    format: "Story",
    difficulty: 1,
    words: 190,
    minutes: 2,
    parts: 11,
    questionsCount: 6,
    paragraphs: [
      {
        en: "It is Sunday morning. The weather is warm and sunny. Alex, Tom and Daniel decide to have a picnic in the park.",
        hy: "Կիրակի առավոտ է։ Եղանակը տաք է և արևոտ։ Ալեքսը, Թոմն ու Դանիելը որոշում են այգում խնջույք կազմակերպել։",
        ru: "Воскресное утро. Погода тёплая и солнечная. Алекс, Том и Даниэль решают устроить пикник в парке."
      },
      {
        en: "\"Let's spend the day outside!\" says Alex. \"Great idea! I can bring some sandwiches,\" says Tom. \"I will bring fruit and water,\" says Daniel.",
        hy: "«Եկե՛ք օրն անցկացնենք դրսում», — ասում է Ալեքսը։ «Հրաշալի միտք է։ Ես կարող եմ սենդվիչներ բերել», — ասում է Թոմը։ «Ես մրգեր և ջուր կբերեմ», — ասում է Դանիելը։",
        ru: "«Давайте проведём день на свежем воздухе!» — говорит Алекс. «Отличная идея! Я могу принести бутерброды», — говорит Том. «А я принесу фрукты и воду», — говорит Даниэль."
      },
      {
        en: "Alex brings a small blanket and a ball. The boys put all the food into a picnic basket. Then they walk to the park.",
        hy: "Ալեքսը բերում է փոքրիկ ծածկոց և գնդակ։ Տղաները ամբողջ ուտելիքը դնում են խնջույքի զամբյուղի մեջ։ Հետո քայլելով գնում են այգի։",
        ru: "Алекс приносит небольшое покрывало и мяч. Мальчики кладут всю еду в корзину для пикника. Затем они идут в парк пешком."
      },
      {
        en: "They find a nice place under a big tree. They put the blanket on the grass and take the food out of the basket.",
        hy: "Նրանք մի գեղեցիկ տեղ են գտնում՝ մեծ ծառի տակ։ Ծածկոցը փռում են խոտերի վրա և զամբյուղից հանում ուտելիքը։",
        ru: "Они находят хорошее место под большим деревом. Расстилают покрывало на траве и достают еду из корзины."
      },
      {
        en: "First, they eat sandwiches and apples. Then they share some bananas and drink water. \"This is delicious!\" says Tom.",
        hy: "Սկզբում նրանք ուտում են սենդվիչներ և խնձորներ։ Հետո կիսում են բանանները և ջուր խմում։ «Շատ համեղ է», — ասում է Թոմը։",
        ru: "Сначала они едят бутерброды и яблоки. Затем делятся бананами и пьют воду. «Это очень вкусно!» — говорит Том."
      },
      {
        en: "After lunch, the boys play with their ball. They run, laugh and tell funny stories.",
        hy: "Ճաշից հետո տղաները խաղում են գնդակով։ Նրանք վազում են, ծիծաղում և զվարճալի պատմություններ պատմում։",
        ru: "После обеда мальчики играют с мячом. Они бегают, смеются и рассказывают смешные истории."
      },
      {
        en: "Suddenly, Daniel sees a small piece of paper on the grass. \"Look! Someone has left rubbish here,\" he says.",
        hy: "Հանկարծ Դանիելը խոտերի վրա տեսնում է թղթի մի փոքրիկ կտոր։ «Տեսե՛ք։ Ինչ-որ մեկը աղբ է թողել այստեղ», — ասում է նա։",
        ru: "Вдруг Даниэль замечает на траве маленький кусочек бумаги. «Смотрите! Кто-то оставил здесь мусор», — говорит он."
      },
      {
        en: "The friends decide to clean the place. They put the rubbish into a bin. \"We should keep our park clean,\" says Alex.",
        hy: "Ընկերները որոշում են մաքրել այդ վայրը։ Նրանք աղբը նետում են աղբամանը։ «Մենք պետք է մաքուր պահենք մեր այգին», — ասում է Ալեքսը։",
        ru: "Друзья решают убрать это место. Они выбрасывают мусор в мусорное ведро. «Мы должны поддерживать чистоту в нашем парке», — говорит Алекс."
      },
      {
        en: "At the end of the day, the boys pack their things and go home. They are a little tired but very happy.",
        hy: "Օրվա վերջում տղաները հավաքում են իրենց իրերը և գնում տուն։ Նրանք մի փոքր հոգնած են, բայց շատ ուրախ։",
        ru: "В конце дня мальчики собирают свои вещи и идут домой. Они немного устали, но очень довольны."
      },
      {
        en: "\"It was a wonderful picnic!\" says Daniel. They agree to have another picnic soon.",
        hy: "«Հրաշալի խնջույք էր», — ասում է Դանիելը։ Նրանք համաձայնում են շուտով ևս մեկ խնջույք կազմակերպել։",
        ru: "«Это был замечательный пикник!» — говорит Даниэль. Они договариваются скоро устроить ещё один пикник."
      },
      {
        en: "They agree to have another picnic soon.",
        hy: "Նրանք համաձայնում են շուտով ևս մեկ խնջույք կազմակերպել։",
        ru: "Они договариваются скоро устроить ещё один пикник."
      }
    ],
    vocabulary: [
      { word: "picnic", translation: { en: "picnic", hy: "խնջույք, պիկնիկ", ru: "пикник" } },
      { word: "weather", translation: { en: "weather", hy: "եղանակ", ru: "погода" } },
      { word: "sunny", translation: { en: "sunny", hy: "արևոտ", ru: "солнечный" } },
      { word: "warm", translation: { en: "warm", hy: "տաք", ru: "тёплый" } },
      { word: "outside", translation: { en: "outside", hy: "դրսում", ru: "на улице" } },
      { word: "sandwich", translation: { en: "sandwich", hy: "սենդվիչ", ru: "бутерброд" } },
      { word: "fruit", translation: { en: "fruit", hy: "միրգ", ru: "фрукты" } },
      { word: "basket", translation: { en: "basket", hy: "զամբյուղ", ru: "корзина" } },
      { word: "blanket", translation: { en: "blanket", hy: "ծածկոց", ru: "покрывало" } },
      { word: "grass", translation: { en: "grass", hy: "խոտ", ru: "трава" } },
      { word: "delicious", translation: { en: "delicious", hy: "համեղ", ru: "вкусный" } },
      { word: "rubbish", translation: { en: "rubbish", hy: "աղբ", ru: "мусор" } },
      { word: "bin", translation: { en: "bin", hy: "աղբաման", ru: "мусорное ведро" } },
      { word: "keep clean", translation: { en: "keep clean", hy: "մաքուր պահել", ru: "поддерживать чистоту" } },
      { word: "tired", translation: { en: "tired", hy: "հոգնած", ru: "уставший" } }
    ],
    questions: [
      {
        question: { en: "What day is it?", hy: "Ի՞նչ օր է:", ru: "Какой день?" },
        options: [
          { en: "Saturday", hy: "Շաբաթ", ru: "Суббота" },
          { en: "Sunday", hy: "Կիրակի", ru: "Воскресенье" },
          { en: "Friday", hy: "Ուրբաթ", ru: "Пятница" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Where do the friends have a picnic?", hy: "Որտե՞ղ են ընկերները խնջույք անում:", ru: "Где друзья устраивают пикник?" },
        options: [
          { en: "At school", hy: "Դպրոցում", ru: "В школе" },
          { en: "At Tom's house", hy: "Թոմի տանը", ru: "У Тома дома" },
          { en: "In the park", hy: "Այգում", ru: "В парке" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What does Tom bring?", hy: "Ի՞նչ է բերում Թոմը:", ru: "Что приносит Том?" },
        options: [
          { en: "Sandwiches", hy: "Սենդվիչներ", ru: "Бутерброды" },
          { en: "A cake", hy: "Տորթ", ru: "Торт" },
          { en: "Juice", hy: "Հյութ", ru: "Сок" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Where do they sit?", hy: "Որտե՞ղ են նրանք նստում:", ru: "Где они сидят?" },
        options: [
          { en: "Under a big tree", hy: "Մեծ ծառի տակ", ru: "Под большим деревом" },
          { en: "Near the school", hy: "Դպրոցի մոտ", ru: "Рядом со школой" },
          { en: "On a bench", hy: "Նստարանին", ru: "На скамейке" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What do they do when they see rubbish?", hy: "Ի՞նչ են նրանք անում, երբ աղբ են տեսնում:", ru: "Что они делают, когда видят мусор?" },
        options: [
          { en: "They leave it there", hy: "Թողնում են այնտեղ", ru: "Оставляют его там" },
          { en: "They put it in a bin", hy: "Դնում են աղբամանի մեջ", ru: "Кладут его в мусорное ведро" },
          { en: "They take it home", hy: "Տանում են տուն", ru: "Забирают домой" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How do the boys feel at the end?", hy: "Ինչպե՞ս են տղաները զգում վերջում:", ru: "Как мальчики себя чувствуют в конце?" },
        options: [
          { en: "Angry and sad", hy: "Բարկացած և տխուր", ru: "Сердитыми и грустными" },
          { en: "Bored and tired", hy: "Ձանձրացած և հոգնած", ru: "Скучающими и уставшими" },
          { en: "A little tired but happy", hy: "Մի փոքր հոգնած, բայց ուրախ", ru: "Немного уставшими, но счастливыми" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about a picnic with your friends!", hy: "Պատմիր ընկերների հետ խնջույքի մասին:", ru: "Расскажи о пикнике с друзьями!" },
      questions: [
        { en: "Do you like picnics?", hy: "Սիրու՞մ ես խնջույքներ:", ru: "Ты любишь пикники?" },
        { en: "Where do you like to have a picnic?", hy: "Որտե՞ղ ես սիրում խնջույք անել:", ru: "Где ты любишь устраивать пикник?" },
        { en: "Who do you go with?", hy: "Ու՞մ հետ ես գնում:", ru: "С кем ты ходишь?" },
        { en: "What food do you take with you?", hy: "Ի՞նչ ուտելիք ես վերցնում հետդ:", ru: "Какую еду ты берёшь с собой?" },
        { en: "What games do you play outside?", hy: "Ի՞նչ խաղեր ես խաղում դրսում:", ru: "В какие игры ты играешь на улице?" },
        { en: "How can you keep a park clean?", hy: "Ինչպե՞ս կարող ես մաքուր պահել այգին:", ru: "Как ты можешь поддерживать чистоту в парке?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 9 ──────────────────────────
  {
    id: "friends_new_student",
    level: "A2",
    topics: ["relationships", "school"],
    title: { en: "A New Student in Our Class", hy: "Նոր աշակերտ մեր դասարանում", ru: "Новый ученик в нашем классе" },
    format: "Story",
    difficulty: 1,
    words: 165,
    minutes: 2,
    parts: 9,
    questionsCount: 6,
    paragraphs: [
      {
        en: "It is Monday morning. Alex, Tom and Daniel are sitting in their classroom. Their teacher comes in with a new student.",
        hy: "Երկուշաբթի առավոտ է։ Ալեքսը, Թոմն ու Դանիելը նստած են իրենց դասարանում։ Ուսուցիչը ներս է մտնում մի նոր աշակերտի հետ։",
        ru: "Утро понедельника. Алекс, Том и Даниэль сидят в своём классе. Учитель входит вместе с новым учеником."
      },
      {
        en: "\"Good morning, everyone! This is Michael. He is new at our school,\" says the teacher. Michael smiles, but he looks a little shy. He sits at an empty desk near the window.",
        hy: "«Բարի լույս, բոլո՛րին։ Սա Մայքլն է։ Նա մեր դպրոցի նոր աշակերտն է», — ասում է ուսուցիչը։ Մայքլը ժպտում է, բայց մի փոքր ամաչկոտ է թվում։ Նա նստում է պատուհանի մոտ գտնվող ազատ նստարանին։",
        ru: "«Доброе утро, ребята! Это Майкл. Он новенький в нашей школе», — говорит учитель. Майкл улыбается, но выглядит немного застенчивым. Он садится за свободную парту возле окна."
      },
      {
        en: "During the break, Alex walks up to him. \"Hello! My name is Alex. What's your name?\" \"I'm Michael,\" he answers.",
        hy: "Դասամիջոցի ընթացքում Ալեքսը մոտենում է նրան։ «Բարև՛։ Իմ անունը Ալեքս է։ Իսկ քո անունն ի՞նչ է»։ «Ես Մայքլն եմ», — պատասխանում է նա։",
        ru: "Во время перемены Алекс подходит к нему. «Привет! Меня зовут Алекс. А как тебя зовут?» «Я Майкл», — отвечает он."
      },
      {
        en: "\"Nice to meet you! Do you like playing football?\" asks Alex. \"Yes, I do!\" says Michael.",
        hy: "«Ուրախ եմ ծանոթանալու համար։ Դու սիրո՞ւմ ես ֆուտբոլ խաղալ», — հարցնում է Ալեքսը։ «Այո՛, սիրում եմ», — ասում է Մայքլը։",
        ru: "«Приятно познакомиться! Ты любишь играть в футбол?» — спрашивает Алекс. «Да, люблю!» — говорит Майкл."
      },
      {
        en: "Tom and Daniel come over, too. \"Would you like to sit with us at lunch?\" asks Tom. \"Of course! Thank you,\" says Michael.",
        hy: "Թոմն ու Դանիելն էլ են մոտենում։ «Կցանկանա՞ս ճաշի ժամանակ մեզ հետ նստել», — հարցնում է Թոմը։ «Իհարկե՛։ Շնորհակալություն», — ասում է Մայքլը։",
        ru: "К ним также подходят Том и Даниэль. «Хочешь посидеть с нами за обедом?» — спрашивает Том. «Конечно! Спасибо», — отвечает Майкл."
      },
      {
        en: "At lunchtime, the boys sit together. They talk about their favourite games, books and school subjects.",
        hy: "Ճաշի ժամանակ տղաները միասին նստում են։ Նրանք խոսում են իրենց սիրելի խաղերի, գրքերի և դպրոցական առարկաների մասին։",
        ru: "Во время обеда мальчики сидят вместе. Они разговаривают о своих любимых играх, книгах и школьных предметах."
      },
      {
        en: "Michael tells them that he likes drawing and playing football. Daniel shows him a picture he has drawn. \"That's great! I like drawing, too,\" says Michael.",
        hy: "Մայքլը պատմում է, որ սիրում է նկարել և ֆուտբոլ խաղալ։ Դանիելը նրան ցույց է տալիս իր նկարած նկարը։ «Հրաշալի է։ Ես էլ եմ սիրում նկարել», — ասում է Մայքլը։",
        ru: "Майкл рассказывает, что любит рисовать и играть в футбол. Даниэль показывает ему свой рисунок. «Здорово! Я тоже люблю рисовать», — говорит Майкл."
      },
      {
        en: "By the end of the day, Michael feels much happier. He has made three new friends.",
        hy: "Օրվա վերջում Մայքլն իրեն շատ ավելի ուրախ է զգում։ Նա երեք նոր ընկեր է ձեռք բերել։",
        ru: "К концу дня Майкл чувствует себя намного счастливее. У него появились три новых друга."
      },
      {
        en: "When the school bell rings, the boys say goodbye. \"See you tomorrow, Michael!\" says Alex. Michael smiles. He is happy to be part of his new class.",
        hy: "Երբ հնչում է դպրոցական զանգը, տղաները հրաժեշտ են տալիս իրար։ «Կհանդիպենք վաղը, Մայքլ», — ասում է Ալեքսը։ Մայքլը ժպտում է։ Նա ուրախ է, որ դարձել է իր նոր դասարանի մի մասը։",
        ru: "Когда звенит школьный звонок, мальчики прощаются. «До завтра, Майкл!» — говорит Алекс. Майкл улыбается. Он рад, что стал частью своего нового класса."
      }
    ],
    vocabulary: [
      { word: "new student", translation: { en: "new student", hy: "նոր աշակերտ", ru: "новый ученик" } },
      { word: "shy", translation: { en: "shy", hy: "ամաչկոտ", ru: "застенчивый" } },
      { word: "empty desk", translation: { en: "empty desk", hy: "ազատ նստարան", ru: "свободная парта" } },
      { word: "walk up to", translation: { en: "walk up to", hy: "մոտենալ", ru: "подойти к" } },
      { word: "nice to meet you", translation: { en: "nice to meet you", hy: "ուրախ եմ ծանոթանալու համար", ru: "приятно познакомиться" } },
      { word: "lunchtime", translation: { en: "lunchtime", hy: "ճաշի ժամ", ru: "время обеда" } },
      { word: "drawing", translation: { en: "drawing", hy: "նկար, նկարչություն", ru: "рисунок, рисование" } },
      { word: "show", translation: { en: "show", hy: "ցույց տալ", ru: "показывать" } },
      { word: "make friends", translation: { en: "make friends", hy: "ընկերներ ձեռք բերել", ru: "заводить друзей" } },
      { word: "school bell", translation: { en: "school bell", hy: "դպրոցական զանգ", ru: "школьный звонок" } },
      { word: "say goodbye", translation: { en: "say goodbye", hy: "հրաժեշտ տալ", ru: "прощаться" } },
      { word: "tomorrow", translation: { en: "tomorrow", hy: "վաղը", ru: "завтра" } }
    ],
    questions: [
      {
        question: { en: "What day is it?", hy: "Ի՞նչ օր է:", ru: "Какой день?" },
        options: [
          { en: "Monday", hy: "Երկուշաբթի", ru: "Понедельник" },
          { en: "Friday", hy: "Ուրբաթ", ru: "Пятница" },
          { en: "Sunday", hy: "Կիրակի", ru: "Воскресенье" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What is the new student's name?", hy: "Ի՞նչ է նոր աշակերտի անունը:", ru: "Как зовут нового ученика?" },
        options: [
          { en: "Daniel", hy: "Դանիել", ru: "Даниэль" },
          { en: "Michael", hy: "Մայքլ", ru: "Майкл" },
          { en: "Tom", hy: "Թոմ", ru: "Том" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How does Michael feel at first?", hy: "Ինչպե՞ս է Մայքլն զգում սկզբում:", ru: "Как Майкл себя чувствует сначала?" },
        options: [
          { en: "Angry", hy: "Բարկացած", ru: "Сердитым" },
          { en: "Bored", hy: "Ձանձրացած", ru: "Скучающим" },
          { en: "A little shy", hy: "Մի փոքր ամաչկոտ", ru: "Немного застенчивым" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What does Michael like doing?", hy: "Ի՞նչ է սիրում անել Մայքլը:", ru: "Что Майкл любит делать?" },
        options: [
          { en: "Swimming and singing", hy: "Լողալ և երգել", ru: "Плавать и петь" },
          { en: "Drawing and playing football", hy: "Նկարել և ֆուտբոլ խաղալ", ru: "Рисовать и играть в футбол" },
          { en: "Cooking and dancing", hy: "Խոհարարություն և պարել", ru: "Готовить и танцевать" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Who shows Michael a picture?", hy: "Ո՞վ է Մայքլին նկար ցույց տալիս:", ru: "Кто показывает Майклу рисунок?" },
        options: [
          { en: "Daniel", hy: "Դանիել", ru: "Даниэль" },
          { en: "Tom", hy: "Թոմ", ru: "Том" },
          { en: "Alex", hy: "Ալեքս", ru: "Алекс" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "How many new friends does Michael make?", hy: "Քանի՞ նոր ընկեր է ձեռք բերում Մայքլը:", ru: "Сколько новых друзей у Майкла появляется?" },
        options: [
          { en: "One", hy: "Մեկ", ru: "Один" },
          { en: "Two", hy: "Երկու", ru: "Два" },
          { en: "Three", hy: "Երեք", ru: "Три" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about a new friend!", hy: "Պատմիր նոր ընկերոջ մասին:", ru: "Расскажи о новом друге!" },
      questions: [
        { en: "What is your name?", hy: "Ի՞նչ է քո անունը:", ru: "Как тебя зовут?" },
        { en: "How do you introduce yourself to a new student?", hy: "Ինչպե՞ս ես ներկայանում նոր աշակերտին:", ru: "Как ты представляешься новому ученику?" },
        { en: "What questions can you ask a new friend?", hy: "Ի՞նչ հարցեր կարող ես տալ նոր ընկերոջը:", ru: "Какие вопросы ты можешь задать новому другу?" },
        { en: "How can you help a shy student?", hy: "Ինչպե՞ս կարող ես օգնել ամաչկոտ աշակերտին:", ru: "Как ты можешь помочь застенчивому ученику?" },
        { en: "How do you feel when you make a new friend?", hy: "Ինչպե՞ս ես զգում, երբ նոր ընկեր ես ձեռք բերում:", ru: "Как ты себя чувствуешь, когда заводишь нового друга?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 10 ─────────────────────────
  {
    id: "friends_school_club",
    level: "A2",
    topics: ["relationships", "school"],
    title: { en: "The School Friendship Club", hy: "Դպրոցական ընկերության ակումբը", ru: "Школьный клуб дружбы" },
    format: "Story",
    difficulty: 1,
    words: 180,
    minutes: 2,
    parts: 9,
    questionsCount: 6,
    paragraphs: [
      {
        en: "One Monday, Alex has an interesting idea. \"Why don't we start a Friendship Club at school?\" he asks his friends. Tom, Daniel and Michael like the idea.",
        hy: "Մի երկուշաբթի Ալեքսը հետաքրքիր միտք է ունենում։ «Ինչո՞ւ դպրոցում ընկերության ակումբ չստեղծենք», — հարցնում է նա ընկերներին։ Թոմին, Դանիելին և Մայքլին դուր է գալիս այդ միտքը։",
        ru: "Однажды в понедельник Алекс придумывает интересную идею. «Почему бы нам не создать в школе Клуб дружбы?» — спрашивает он друзей. Тому, Даниэлю и Майклу нравится эта идея."
      },
      {
        en: "\"What can we do in our club?\" asks Daniel. \"We can help new students,\" says Michael. \"We can show them our school and introduce them to other children.\"",
        hy: "«Ի՞նչ կարող ենք անել մեր ակումբում», — հարցնում է Դանիելը։ «Կարող ենք օգնել նոր աշակերտներին, — ասում է Մայքլը։ — Կարող ենք նրանց ցույց տալ մեր դպրոցը և ծանոթացնել մյուս երեխաների հետ»։",
        ru: "«Что мы можем делать в нашем клубе?» — спрашивает Даниэль. «Мы можем помогать новым ученикам, — говорит Майкл. — Мы можем показать им нашу школу и познакомить их с другими детьми»."
      },
      {
        en: "\"We can also organize games during the break,\" adds Tom. Alex takes a notebook and writes down their ideas. They decide to meet every Friday after school.",
        hy: "«Կարող ենք նաև դասամիջոցներին խաղեր կազմակերպել», — ավելացնում է Թոմը։ Ալեքսը վերցնում է տետրը և գրի է առնում նրանց գաղափարները։ Նրանք որոշում են հանդիպել ամեն ուրբաթ՝ դասերից հետո։",
        ru: "«Мы также можем организовывать игры на переменах», — добавляет Том. Алекс берёт тетрадь и записывает их идеи. Они решают встречаться каждую пятницу после уроков."
      },
      {
        en: "The next day, the boys talk to their teacher. She likes their plan and offers to help them. \"That's a wonderful idea! A good school needs friendly and helpful students,\" she says.",
        hy: "Հաջորդ օրը տղաները խոսում են իրենց ուսուցչի հետ։ Նրան դուր է գալիս նրանց ծրագիրը, և նա առաջարկում է օգնել նրանց։ «Հրաշալի միտք է։ Լավ դպրոցում պետք են ընկերասեր և պատրաստակամ աշակերտներ», — ասում է նա։",
        ru: "На следующий день мальчики разговаривают со своей учительницей. Ей нравится их план, и она предлагает им свою помощь. «Это замечательная идея! В хорошей школе должны быть дружелюбные и отзывчивые ученики», — говорит она."
      },
      {
        en: "On Friday, the first club meeting begins. The boys make a colourful poster. It says: \"Everyone is welcome! Let's be kind, help each other and make new friends!\"",
        hy: "Ուրբաթ օրը սկսվում է ակումբի առաջին հանդիպումը։ Տղաները պատրաստում են գունավոր պաստառ։ Վրան գրված է. «Բոլորը կարող են միանալ մեզ։ Եկե՛ք բարի լինենք, օգնենք միմյանց և նոր ընկերներ ձեռք բերենք»։",
        ru: "В пятницу начинается первая встреча клуба. Мальчики делают красочный плакат. На нём написано: «Мы рады каждому! Давайте будем добрыми, помогать друг другу и заводить новых друзей!»"
      },
      {
        en: "A few other students come to join the club. Some want to organize sports games, while others want to read stories together.",
        hy: "Մի քանի այլ աշակերտներ գալիս են միանալու ակումբին։ Ոմանք ցանկանում են մարզական խաղեր կազմակերպել, իսկ մյուսները՝ միասին պատմություններ կարդալ։",
        ru: "Несколько других учеников приходят, чтобы присоединиться к клубу. Некоторые хотят организовывать спортивные игры, а другие хотят вместе читать рассказы."
      },
      {
        en: "The boys listen to everyone's ideas. They understand that every student can help in a different way.",
        hy: "Տղաները լսում են բոլորի գաղափարները։ Նրանք հասկանում են, որ յուրաքանչյուր աշակերտ կարող է օգնել յուրովի։",
        ru: "Мальчики выслушивают идеи каждого. Они понимают, что каждый ученик может помочь по-своему."
      },
      {
        en: "At the end of the meeting, Alex says: \"Our club is small today, but it can become something special!\"",
        hy: "Հանդիպման վերջում Ալեքսն ասում է. «Այսօր մեր ակումբը փոքր է, բայց այն կարող է դառնալ յուրահատուկ մի բան»։",
        ru: "В конце встречи Алекс говорит: «Сегодня наш клуб маленький, но он может стать чем-то особенным!»"
      },
      {
        en: "Everyone smiles. They are excited about their new project.",
        hy: "Բոլորը ժպտում են։ Նրանք ոգևորված են իրենց նոր նախագծով։",
        ru: "Все улыбаются. Они с радостью думают о своём новом проекте."
      }
    ],
    vocabulary: [
      { word: "friendship", translation: { en: "friendship", hy: "ընկերություն", ru: "дружба" } },
      { word: "club", translation: { en: "club", hy: "ակումբ", ru: "клуб" } },
      { word: "start", translation: { en: "start", hy: "սկսել", ru: "начинать" } },
      { word: "introduce", translation: { en: "introduce", hy: "ծանոթացնել", ru: "знакомить" } },
      { word: "organize", translation: { en: "organize", hy: "կազմակերպել", ru: "организовывать" } },
      { word: "notebook", translation: { en: "notebook", hy: "տետր", ru: "тетрадь" } },
      { word: "write down", translation: { en: "write down", hy: "գրի առնել", ru: "записывать" } },
      { word: "offer", translation: { en: "offer", hy: "առաջարկել", ru: "предлагать" } },
      { word: "poster", translation: { en: "poster", hy: "պաստառ", ru: "плакат" } },
      { word: "join", translation: { en: "join", hy: "միանալ", ru: "присоединяться" } },
      { word: "project", translation: { en: "project", hy: "նախագիծ", ru: "проект" } },
      { word: "excited", translation: { en: "excited", hy: "ոգևորված", ru: "воодушевлённый" } },
      { word: "special", translation: { en: "special", hy: "յուրահատուկ", ru: "особенный" } }
    ],
    questions: [
      {
        question: { en: "Who has the idea to start a Friendship Club?", hy: "Ո՞վ է ընկերության ակումբ ստեղծելու միտքը:", ru: "У кого идея создать Клуб дружбы?" },
        options: [
          { en: "Tom", hy: "Թոմ", ru: "Том" },
          { en: "Alex", hy: "Ալեքս", ru: "Алекс" },
          { en: "Michael", hy: "Մայքլ", ru: "Майкл" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "When do the boys decide to meet?", hy: "Ե՞րբ են տղաները որոշում հանդիպել:", ru: "Когда мальчики решают встречаться?" },
        options: [
          { en: "Every Monday morning", hy: "Ամեն երկուշաբթի առավոտ", ru: "Каждый понедельник утром" },
          { en: "Every Saturday", hy: "Ամեն շաբաթ", ru: "Каждую субботу" },
          { en: "Every Friday after school", hy: "Ամեն ուրբաթ դասերից հետո", ru: "Каждую пятницу после уроков" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Who offers to help the boys?", hy: "Ո՞վ է առաջարկում օգնել տղաներին:", ru: "Кто предлагает мальчикам помощь?" },
        options: [
          { en: "Their teacher", hy: "Նրանց ուսուցիչը", ru: "Их учительница" },
          { en: "The head teacher", hy: "Տնօրենը", ru: "Директор" },
          { en: "Daniel's father", hy: "Դանիելի հայրը", ru: "Отец Даниэля" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What do the boys make for the club?", hy: "Ի՞նչ են տղաները պատրաստում ակումբի համար:", ru: "Что мальчики делают для клуба?" },
        options: [
          { en: "A birthday cake", hy: "Ծննդյան տորթ", ru: "Праздничный торт" },
          { en: "A colourful poster", hy: "Գունավոր պաստառ", ru: "Красочный плакат" },
          { en: "A football team", hy: "Ֆուտբոլային թիմ", ru: "Футбольную команду" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What do some students want to do?", hy: "Ի՞նչ են ուզում անել որոշ աշակերտներ:", ru: "Что некоторые ученики хотят делать?" },
        options: [
          { en: "Go home early", hy: "Շուտ գնալ տուն", ru: "Рано идти домой" },
          { en: "Organize sports games and read stories", hy: "Կազմակերպել մարզական խաղեր և պատմություններ կարդալ", ru: "Организовывать спортивные игры и читать рассказы" },
          { en: "Build a new classroom", hy: "Կառուցել նոր դասարան", ru: "Строить новый класс" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What do the boys understand?", hy: "Ի՞նչ են հասկանում տղաները:", ru: "Что понимают мальчики?" },
        options: [
          { en: "Only one person can help", hy: "Միայն մեկ մարդ կարող է օգնել", ru: "Только один человек может помочь" },
          { en: "Everyone must do the same thing", hy: "Բոլորը պետք է նույն բանն անեն", ru: "Все должны делать одно и то же" },
          { en: "Everyone can help in a different way", hy: "Յուրաքանչյուրը կարող է օգնել յուրովի", ru: "Каждый может помочь по-своему" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Imagine that you have your own school club!", hy: "Պատկերացրու, որ դու էլ ես ստեղծում քո ակումբը:", ru: "Представь, что ты создаёшь свой школьный клуб!" },
      questions: [
        { en: "What is the name of your club?", hy: "Ի՞նչ է քո ակումբի անունը:", ru: "Как называется твой клуб?" },
        { en: "What can children do in your club?", hy: "Ի՞նչ կարող են երեխաները անել քո ակումբում:", ru: "Что дети могут делать в твоём клубе?" },
        { en: "When do you want to meet?", hy: "Ե՞րբ ես ուզում հանդիպել:", ru: "Когда ты хочешь встречаться?" },
        { en: "Who can join your club?", hy: "Ո՞վ կարող է միանալ քո ակումբին:", ru: "Кто может присоединиться к твоему клубу?" },
        { en: "How can you help new students?", hy: "Ինչպե՞ս կարող ես օգնել նոր աշակերտներին:", ru: "Как ты можешь помочь новым ученикам?" },
        { en: "Why is friendship important at school?", hy: "Ինչո՞ւ է ընկերությունը կարևոր դպրոցում:", ru: "Почему дружба важна в школе?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 11 ─────────────────────────
  {
    id: "friends_argument",
    level: "A2",
    topics: ["relationships", "school"],
    title: { en: "A Small Argument", hy: "Մի փոքրիկ վեճ", ru: "Небольшая ссора" },
    format: "Story",
    difficulty: 1,
    words: 180,
    minutes: 2,
    parts: 10,
    questionsCount: 6,
    paragraphs: [
      {
        en: "It is Friday afternoon. The Friendship Club is having a meeting at school. Alex, Tom, Daniel and Michael want to organize a game for the next meeting.",
        hy: "Ուրբաթ կեսօր է։ Դպրոցում տեղի է ունենում ընկերության ակումբի հանդիպումը։ Ալեքսը, Թոմը, Դանիելն ու Մայքլը ցանկանում են հաջորդ հանդիպման համար խաղ կազմակերպել։",
        ru: "В пятницу после обеда в школе проходит встреча Клуба дружбы. Алекс, Том, Даниэль и Майкл хотят организовать игру для следующей встречи."
      },
      {
        en: "\"I think we should play football,\" says Alex. \"Football again? I want to play basketball,\" says Daniel.",
        hy: "«Կարծում եմ՝ պետք է ֆուտբոլ խաղանք», — ասում է Ալեքսը։ «Նորի՞ց ֆուտբոլ։ Ես ուզում եմ բասկետբոլ խաղալ», — ասում է Դանիելը։",
        ru: "«Я думаю, нам стоит поиграть в футбол», — говорит Алекс. «Опять футбол? Я хочу играть в баскетбол», — говорит Даниэль."
      },
      {
        en: "\"I agree with Daniel,\" says Michael. \"Basketball is more interesting today.\" \"But I really like football,\" says Alex.",
        hy: "«Ես համաձայն եմ Դանիելի հետ։ Այսօր բասկետբոլն ավելի հետաքրքիր է», — ասում է Մայքլը։ «Բայց ես իսկապես սիրում եմ ֆուտբոլ», — ասում է Ալեքսը։",
        ru: "«Я согласен с Даниэлем. Сегодня баскетбол интереснее», — говорит Майкл. «Но я действительно люблю футбол», — говорит Алекс."
      },
      {
        en: "Tom looks at his friends. They all have different ideas. \"Let's not argue,\" he says. \"We can listen to each other and find a solution.\"",
        hy: "Թոմը նայում է ընկերներին։ Նրանք բոլորը տարբեր գաղափարներ ունեն։ «Եկե՛ք չվիճենք, — ասում է նա։ — Մենք կարող ենք լսել միմյանց և լուծում գտնել»։",
        ru: "Том смотрит на друзей. У всех разные идеи. «Давайте не будем спорить, — говорит он. — Мы можем выслушать друг друга и найти решение»."
      },
      {
        en: "Daniel thinks for a moment. \"Why don't we play football first and basketball after that?\"",
        hy: "Դանիելը մի պահ մտածում է։ «Ինչո՞ւ սկզբում ֆուտբոլ չխաղանք, իսկ հետո՝ բասկետբոլ»։",
        ru: "Даниэль немного думает. «Почему бы нам сначала не поиграть в футбол, а потом в баскетбол?»"
      },
      {
        en: "Michael likes the idea, but Alex has another suggestion. \"We can also make two teams and change the players after each game.\" \"That's fair!\" says Tom.",
        hy: "Մայքլին դուր է գալիս այդ միտքը, բայց Ալեքսը մեկ այլ առաջարկ ունի։ «Կարող ենք նաև երկու թիմ կազմել և յուրաքանչյուր խաղից հետո փոխել խաղացողներին»։ «Դա արդարացի է», — ասում է Թոմը։",
        ru: "Майклу нравится эта идея, но у Алекса есть ещё одно предложение. «Мы также можем разделиться на две команды и менять игроков после каждой игры». «Это справедливо!» — говорит Том."
      },
      {
        en: "The boys agree on the plan. They smile and continue talking about the next meeting.",
        hy: "Տղաները համաձայնում են այդ ծրագրին։ Նրանք ժպտում են և շարունակում խոսել հաջորդ հանդիպման մասին։",
        ru: "Мальчики соглашаются с этим планом. Они улыбаются и продолжают обсуждать следующую встречу."
      },
      {
        en: "Then Alex says, \"I'm sorry if I was too serious about football.\" \"That's okay,\" answers Daniel. \"We all have different favourites.\"",
        hy: "Հետո Ալեքսն ասում է. «Ներողություն, եթե ֆուտբոլի հարցում չափազանց համառ էի»։ «Ոչինչ, — պատասխանում է Դանիելը։ — Մենք բոլորս տարբեր նախասիրություններ ունենք»։",
        ru: "Затем Алекс говорит: «Прости, если я слишком настойчиво говорил о футболе». «Ничего страшного, — отвечает Даниэль. — У каждого из нас свои предпочтения»."
      },
      {
        en: "The friends understand something important: they don't have to like the same things to be good friends.",
        hy: "Ընկերները մի կարևոր բան են հասկանում. պարտադիր չէ, որ լավ ընկերներ լինելու համար նույն բաները սիրեն։",
        ru: "Друзья понимают одну важную вещь: чтобы быть хорошими друзьями, им необязательно любить одно и то же."
      },
      {
        en: "They can have different opinions, listen to each other and still enjoy being together.",
        hy: "Նրանք կարող են տարբեր կարծիքներ ունենալ, լսել միմյանց և միևնույն ժամանակ հաճույքով միասին ժամանակ անցկացնել։",
        ru: "У них могут быть разные мнения, но они могут слушать друг друга и всё равно с удовольствием проводить время вместе."
      }
    ],
    vocabulary: [
      { word: "argument", translation: { en: "argument", hy: "վեճ", ru: "спор" } },
      { word: "meeting", translation: { en: "meeting", hy: "հանդիպում", ru: "встреча" } },
      { word: "organize", translation: { en: "organize", hy: "կազմակերպել", ru: "организовывать" } },
      { word: "I think", translation: { en: "I think", hy: "ես կարծում եմ", ru: "я думаю" } },
      { word: "agree", translation: { en: "agree", hy: "համաձայնել", ru: "соглашаться" } },
      { word: "opinion", translation: { en: "opinion", hy: "կարծիք", ru: "мнение" } },
      { word: "argue", translation: { en: "argue", hy: "վիճել", ru: "спорить" } },
      { word: "solution", translation: { en: "solution", hy: "լուծում", ru: "решение" } },
      { word: "suggestion", translation: { en: "suggestion", hy: "առաջարկ", ru: "предложение" } },
      { word: "fair", translation: { en: "fair", hy: "արդարացի", ru: "справедливый" } },
      { word: "I'm sorry", translation: { en: "I'm sorry", hy: "ներողություն", ru: "прости / извините" } },
      { word: "that's okay", translation: { en: "that's okay", hy: "ոչինչ, խնդիր չկա", ru: "всё в порядке" } },
      { word: "understand", translation: { en: "understand", hy: "հասկանալ", ru: "понимать" } }
    ],
    questions: [
      {
        question: { en: "What do the boys want to organize?", hy: "Ի՞նչ են տղաները ուզում կազմակերպել:", ru: "Что мальчики хотят организовать?" },
        options: [
          { en: "A birthday party", hy: "Ծննդյան խնջույք", ru: "День рождения" },
          { en: "A game for the next meeting", hy: "Խաղ հաջորդ հանդիպման համար", ru: "Игру для следующей встречи" },
          { en: "A school trip", hy: "Դպրոցական էքսկուրսիա", ru: "Школьную экскурсию" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Alex want to play?", hy: "Ի՞նչ է ուզում խաղալ Ալեքսը:", ru: "Во что Алекс хочет играть?" },
        options: [
          { en: "Football", hy: "Ֆուտբոլ", ru: "В футбол" },
          { en: "Basketball", hy: "Բասկետբոլ", ru: "В баскетбол" },
          { en: "Tennis", hy: "Թենիս", ru: "В теннис" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does Daniel suggest?", hy: "Ի՞նչ է առաջարկում Դանիելը:", ru: "Что предлагает Даниэль?" },
        options: [
          { en: "Playing only football", hy: "Խաղալ միայն ֆուտբոլ", ru: "Играть только в футбол" },
          { en: "Going home", hy: "Գնալ տուն", ru: "Пойти домой" },
          { en: "Playing football first and basketball after", hy: "Նախ ֆուտբոլ, հետո բասկետբոլ", ru: "Сначала футбол, потом баскетбол" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Who suggests changing the players after each game?", hy: "Ո՞վ է առաջարկում փոխել խաղացողներին յուրաքանչյուր խաղից հետո:", ru: "Кто предлагает менять игроков после каждой игры?" },
        options: [
          { en: "Tom", hy: "Թոմ", ru: "Том" },
          { en: "Alex", hy: "Ալեքս", ru: "Алекс" },
          { en: "Michael", hy: "Մայքլ", ru: "Майкл" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Alex say at the end?", hy: "Ի՞նչ է ասում Ալեքսը վերջում:", ru: "Что Алекс говорит в конце?" },
        options: [
          { en: "I'm sorry", hy: "Ներողություն", ru: "Прости" },
          { en: "Goodbye", hy: "Ցտեսություն", ru: "До свидания" },
          { en: "I don't want to play", hy: "Չեմ ուզում խաղալ", ru: "Я не хочу играть" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What do the friends learn?", hy: "Ի՞նչ են սովորում ընկերները:", ru: "Чему учатся друзья?" },
        options: [
          { en: "Good friends must like the same things", hy: "Լավ ընկերները պետք է նույն բաները սիրեն", ru: "Хорошие друзья должны любить одно и то же" },
          { en: "Different opinions can exist in a friendship", hy: "Տարբեր կարծիքներ կարող են գոյություն ունենալ ընկերության մեջ", ru: "В дружбе могут существовать разные мнения" },
          { en: "It is important to win every game", hy: "Կարևոր է հաղթել ամեն խաղում", ru: "Важно побеждать в каждой игре" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us how you solve disagreements with friends!", hy: "Պատմիր, թե ինչպես ես լուծում անհամաձայնությունները ընկերներիդ հետ:", ru: "Расскажи, как ты решаешь разногласия с друзьями!" },
      questions: [
        { en: "Do you sometimes disagree with your friends?", hy: "Երբեմն համաձայն չե՞ս լինում ընկերներիդ հետ:", ru: "Ты иногда не соглашаешься с друзьями?" },
        { en: "What do you do when you have different ideas?", hy: "Ի՞նչ ես անում, երբ տարբեր կարծիքներ ունեք:", ru: "Что ты делаешь, когда у вас разные идеи?" },
        { en: "How can you listen to your friends?", hy: "Ինչպե՞ս կարող ես լսել ընկերներիդ:", ru: "Как ты можешь слушать друзей?" },
        { en: "What can you say when you make a mistake?", hy: "Ի՞նչ կարող ես ասել, երբ սխալվում ես:", ru: "Что ты можешь сказать, когда ошибаешься?" },
        { en: "Is it important to say sorry?", hy: "Կարևո՞ր է ներողություն խնդրել:", ru: "Важно ли извиняться?" },
        { en: "What makes a good friendship?", hy: "Ի՞նչն է լավ ընկերություն ստեղծում:", ru: "Что делает дружбу хорошей?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 12 ─────────────────────────
  {
    id: "friends_lost_schoolbag",
    level: "A2",
    topics: ["relationships", "school"],
    title: { en: "The Lost Schoolbag", hy: "Կորած դպրոցական պայուսակը", ru: "Потерянный школьный рюкзак" },
    format: "Story",
    difficulty: 1,
    words: 190,
    minutes: 2,
    parts: 10,
    questionsCount: 6,
    paragraphs: [
      {
        en: "It is Wednesday afternoon. The school day is over. Michael is getting ready to go home, but he cannot find his schoolbag. \"Oh no! Where is my bag?\" he asks.",
        hy: "Չորեքշաբթի կեսօր է։ Դպրոցական օրն ավարտվել է։ Մայքլը պատրաստվում է տուն գնալ, բայց չի կարողանում գտնել իր դպրոցական պայուսակը։ «Վա՜յ։ Որտե՞ղ է իմ պայուսակը», — հարցնում է նա։",
        ru: "В среду после обеда. Учебный день закончился. Майкл собирается идти домой, но не может найти свой школьный рюкзак. «О нет! Где моя сумка?» — спрашивает он."
      },
      {
        en: "He looks under his desk, behind his chair and near the classroom door. But the bag is not there.",
        hy: "Նա փնտրում է նստարանի տակ, աթոռի հետևում և դասարանի դռան մոտ։ Բայց պայուսակն այնտեղ չէ։",
        ru: "Он заглядывает под парту, за стул и возле двери класса. Но сумки там нет."
      },
      {
        en: "Alex, Tom and Daniel see that Michael is worried. \"Don't worry. We can help you,\" says Alex.",
        hy: "Ալեքսը, Թոմն ու Դանիելը նկատում են, որ Մայքլը անհանգստացած է։ «Մի՛ անհանգստացիր։ Մենք կարող ենք օգնել քեզ», — ասում է Ալեքսը։",
        ru: "Алекс, Том и Даниэль замечают, что Майкл встревожен. «Не волнуйся. Мы можем тебе помочь», — говорит Алекс."
      },
      {
        en: "\"Where did you last see your bag?\" asks Tom. \"I had it during the morning lesson,\" answers Michael. \"Then we went to the playground.\"",
        hy: "«Որտե՞ղ ես վերջին անգամ տեսել պայուսակդ», — հարցնում է Թոմը։ «Առավոտյան դասի ժամանակ այն ինձ մոտ էր, — պատասխանում է Մայքլը։ — Հետո մենք գնացինք խաղահրապարակ»։",
        ru: "«Где ты в последний раз видел свою сумку?» — спрашивает Том. «Она была со мной на утреннем уроке, — отвечает Майкл. — Потом мы пошли на игровую площадку»."
      },
      {
        en: "\"Maybe you left it there,\" says Daniel. The four friends go to the playground. They look near the benches and under the trees. But they cannot find the bag.",
        hy: "«Գուցե այն այնտեղ ես թողել», — ասում է Դանիելը։ Չորս ընկերները գնում են խաղահրապարակ։ Նրանք նայում են նստարանների մոտ և ծառերի տակ։ Բայց պայուսակը չեն գտնում։",
        ru: "«Может быть, ты оставил её там», — говорит Даниэль. Четверо друзей идут на игровую площадку. Они смотрят возле скамеек и под деревьями. Но не могут найти рюкзак."
      },
      {
        en: "Then Alex remembers something. \"Wait! We were in the library after lunch. You put your bag next to the bookshelf!\"",
        hy: "Հանկարծ Ալեքսը ինչ-որ բան է հիշում։ «Սպասի՛ր։ Ճաշից հետո մենք գրադարանում էինք։ Դու պայուսակդ դրեցիր գրապահարանի կողքին»։",
        ru: "Вдруг Алекс кое-что вспоминает. «Подожди! После обеда мы были в библиотеке. Ты поставил рюкзак рядом с книжной полкой!»"
      },
      {
        en: "They quickly go to the library. Michael looks near the bookshelf, but the bag is not there.",
        hy: "Նրանք արագ գնում են գրադարան։ Մայքլը նայում է գրապահարանի մոտ, բայց պայուսակն այնտեղ չէ։",
        ru: "Они быстро идут в библиотеку. Майкл смотрит возле книжной полки, но рюкзака там нет."
      },
      {
        en: "A librarian sees them and asks, \"Are you looking for this blue schoolbag?\" \"Yes! That's mine!\" says Michael happily. The librarian found it near a table and kept it safe.",
        hy: "Գրադարանավարը տեսնում է նրանց և հարցնում. «Այս կապույտ դպրոցական պայուսա՞կն եք փնտրում»։ «Այո՛։ Դա իմն է», — ուրախությամբ ասում է Մայքլը։ Գրադարանավարը այն գտել էր սեղանի մոտ և ապահով պահել։",
        ru: "Библиотекарь замечает их и спрашивает: «Вы ищете этот синий школьный рюкзак?» «Да! Это мой!» — радостно говорит Майкл. Библиотекарь нашла его возле стола и сохранила в безопасном месте."
      },
      {
        en: "Michael thanks her and turns to his friends. \"Thank you for helping me. I'm lucky to have friends like you!\"",
        hy: "Մայքլը շնորհակալություն է հայտնում նրան և շրջվում դեպի ընկերները։ «Շնորհակալություն, որ օգնեցիք ինձ։ Ես բախտավոր եմ, որ ձեզ նման ընկերներ ունեմ»։",
        ru: "Майкл благодарит её и поворачивается к друзьям. «Спасибо, что помогли мне. Мне повезло, что у меня есть такие друзья!»"
      },
      {
        en: "The boys smile. They are happy because they found the bag together.",
        hy: "Տղաները ժպտում են։ Նրանք ուրախ են, որ միասին գտան պայուսակը։",
        ru: "Мальчики улыбаются. Они рады, что нашли рюкзак вместе."
      }
    ],
    vocabulary: [
      { word: "lost", translation: { en: "lost", hy: "կորած", ru: "потерянный" } },
      { word: "schoolbag", translation: { en: "schoolbag", hy: "դպրոցական պայուսակ", ru: "школьная сумка" } },
      { word: "get ready", translation: { en: "get ready", hy: "պատրաստվել", ru: "готовиться" } },
      { word: "find", translation: { en: "find", hy: "գտնել", ru: "находить" } },
      { word: "under", translation: { en: "under", hy: "տակ", ru: "под" } },
      { word: "behind", translation: { en: "behind", hy: "հետևում", ru: "за" } },
      { word: "worried", translation: { en: "worried", hy: "անհանգստացած", ru: "встревоженный" } },
      { word: "last time", translation: { en: "last time", hy: "վերջին անգամ", ru: "в последний раз" } },
      { word: "remember", translation: { en: "remember", hy: "հիշել", ru: "помнить" } },
      { word: "library", translation: { en: "library", hy: "գրադարան", ru: "библиотека" } },
      { word: "bookshelf", translation: { en: "bookshelf", hy: "գրապահարան", ru: "книжная полка" } },
      { word: "librarian", translation: { en: "librarian", hy: "գրադարանավար", ru: "библиотекарь" } },
      { word: "look for", translation: { en: "look for", hy: "փնտրել", ru: "искать" } },
      { word: "keep safe", translation: { en: "keep safe", hy: "ապահով պահել", ru: "хранить в безопасности" } },
      { word: "lucky", translation: { en: "lucky", hy: "բախտավոր", ru: "удачливый" } }
    ],
    questions: [
      {
        question: { en: "What day is it?", hy: "Ի՞նչ օր է:", ru: "Какой день?" },
        options: [
          { en: "Monday", hy: "Երկուշաբթի", ru: "Понедельник" },
          { en: "Wednesday", hy: "Չորեքշաբթի", ru: "Среда" },
          { en: "Saturday", hy: "Շաբաթ", ru: "Суббота" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What can't Michael find?", hy: "Ի՞նչ չի կարողանում գտնել Մայքլը:", ru: "Что Майкл не может найти?" },
        options: [
          { en: "His schoolbag", hy: "Իր դպրոցական պայուսակը", ru: "Свой школьный рюкзак" },
          { en: "His book", hy: "Իր գիրքը", ru: "Свою книгу" },
          { en: "His jacket", hy: "Իր բաճկոնը", ru: "Свою куртку" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Where do the friends look first?", hy: "Որտե՞ղ են ընկերները նախ փնտրում:", ru: "Где друзья ищут сначала?" },
        options: [
          { en: "In the library", hy: "Գրադարանում", ru: "В библиотеке" },
          { en: "At the playground", hy: "Խաղահրապարակում", ru: "На игровой площадке" },
          { en: "At home", hy: "Տանը", ru: "Дома" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Who remembers that Michael had his bag in the library?", hy: "Ո՞վ է հիշում, որ Մայքլը պայուսակը գրադարանում էր:", ru: "Кто вспоминает, что рюкзак Майкла был в библиотеке?" },
        options: [
          { en: "Tom", hy: "Թոմ", ru: "Том" },
          { en: "Daniel", hy: "Դանիել", ru: "Даниэль" },
          { en: "Alex", hy: "Ալեքս", ru: "Алекс" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Who finds the blue schoolbag?", hy: "Ո՞վ է գտնում կապույտ պայուսակը:", ru: "Кто находит синий рюкзак?" },
        options: [
          { en: "The librarian", hy: "Գրադարանավարը", ru: "Библиотекарь" },
          { en: "The teacher", hy: "Ուսուցիչը", ru: "Учитель" },
          { en: "Tom", hy: "Թոմ", ru: "Том" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Why is Michael happy?", hy: "Ինչո՞ւ է Մայքլը ուրախ:", ru: "Почему Майкл счастлив?" },
        options: [
          { en: "He has a new bag", hy: "Նա նոր պայուսակ ունի", ru: "У него новый рюкзак" },
          { en: "He finds his bag and has helpful friends", hy: "Նա գտնում է պայուսակը և ունի օգնող ընկերներ", ru: "Он нашёл рюкзак, и у него есть отзывчивые друзья" },
          { en: "School is finished", hy: "Դպրոցն ավարտվել է", ru: "Школа закончилась" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about a lost thing!", hy: "Պատմիր կորցրած իրի մասին:", ru: "Расскажи о потерянной вещи!" },
      questions: [
        { en: "Have you ever lost something?", hy: "Երբևէ ինչ-որ բան կորցրե՞լ ես:", ru: "Ты когда-нибудь что-то терял?" },
        { en: "What things do you take to school?", hy: "Ի՞նչ իրեր ես տանում դպրոց:", ru: "Какие вещи ты берёшь в школу?" },
        { en: "Where do you usually put your schoolbag?", hy: "Որտե՞ղ ես սովորաբար դնում պայուսակդ:", ru: "Где ты обычно оставляешь свой рюкзак?" },
        { en: "What do you do when you cannot find something?", hy: "Ի՞նչ ես անում, երբ ինչ-որ բան չես գտնում:", ru: "Что ты делаешь, когда не можешь что-то найти?" },
        { en: "Who can help you find a lost thing?", hy: "Ո՞վ կարող է օգնել քեզ գտնել կորցրածը:", ru: "Кто может помочь тебе найти потерянное?" },
        { en: "How can you help a friend who has lost something?", hy: "Ինչպե՞ս կարող ես օգնել ընկերոջը, ով ինչ-որ բան կորցրել է:", ru: "Как ты можешь помочь другу, который что-то потерял?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 09. ԻՄ ԸՆԿԵՐՆԵՐԸ — ՏԵՔՍՏ 13 ─────────────────────────
  {
    id: "friends_thank_you",
    level: "A2",
    topics: ["relationships", "school"],
    title: { en: "A Special Thank You", hy: "Հատուկ շնորհակալություն", ru: "Особая благодарность" },
    format: "Story",
    difficulty: 1,
    words: 185,
    minutes: 2,
    parts: 10,
    questionsCount: 6,
    paragraphs: [
      {
        en: "It is Thursday evening. Michael is at home. He is thinking about his friends, Alex, Tom and Daniel. A few days ago, he lost his schoolbag. His friends helped him look for it, and they found it in the school library.",
        hy: "Հինգշաբթի երեկո է։ Մայքլը տանն է։ Նա մտածում է իր ընկերների՝ Ալեքսի, Թոմի և Դանիելի մասին։ Մի քանի օր առաջ նա կորցրել էր իր դպրոցական պայուսակը։ Ընկերներն օգնել էին նրան փնտրել այն, և նրանք պայուսակը գտել էին դպրոցի գրադարանում։",
        ru: "Вечер четверга. Майкл находится дома. Он думает о своих друзьях — Алексе, Томе и Даниэле. Несколько дней назад он потерял свой школьный рюкзак. Друзья помогли ему искать его, и они нашли рюкзак в школьной библиотеке."
      },
      {
        en: "Michael feels very thankful. He wants to do something special for them. \"I have an idea!\" he says.",
        hy: "Մայքլը շատ շնորհակալ է։ Նա ցանկանում է նրանց համար մի յուրահատուկ բան անել։ «Մի միտք ունեմ», — ասում է նա։",
        ru: "Майкл очень благодарен. Он хочет сделать для них что-нибудь особенное. «У меня есть идея!» — говорит он."
      },
      {
        en: "He takes some colourful paper, pencils and stickers. He decides to make three thank-you cards.",
        hy: "Նա վերցնում է գունավոր թուղթ, մատիտներ և կպչուն պիտակներ։ Որոշում է պատրաստել երեք շնորհակալական բացիկ։",
        ru: "Он берёт цветную бумагу, карандаши и наклейки. Он решает сделать три благодарственные открытки."
      },
      {
        en: "First, he makes a card for Alex. \"Thank you for remembering where my bag was,\" he writes.",
        hy: "Սկզբում նա բացիկ է պատրաստում Ալեքսի համար։ «Շնորհակալություն, որ հիշեցիր, թե որտեղ էր իմ պայուսակը», — գրում է նա։",
        ru: "Сначала он делает открытку для Алекса. «Спасибо, что ты вспомнил, где был мой рюкзак», — пишет он."
      },
      {
        en: "Then he makes a card for Tom. \"Thank you for helping me and never giving up,\" he writes.",
        hy: "Հետո բացիկ է պատրաստում Թոմի համար։ «Շնորհակալություն, որ օգնեցիր ինձ և չհանձնվեցիր», — գրում է նա։",
        ru: "Затем он делает открытку для Тома. «Спасибо, что ты помог мне и не сдавался», — пишет он."
      },
      {
        en: "Finally, he makes a card for Daniel. \"Thank you for being a kind and helpful friend,\" he writes.",
        hy: "Վերջում բացիկ է պատրաստում Դանիելի համար։ «Շնորհակալություն, որ բարի և պատրաստակամ ընկեր ես», — գրում է նա։",
        ru: "Наконец, он делает открытку для Даниэля. «Спасибо, что ты добрый и отзывчивый друг», — пишет он."
      },
      {
        en: "The next morning, Michael brings the cards to school. \"Good morning, everyone! I have something for you,\" he says. The boys open their cards and read the messages.",
        hy: "Հաջորդ առավոտ Մայքլը բացիկները բերում է դպրոց։ «Բարի լույս, բոլո՛րին։ Ես ձեզ համար մի բան ունեմ», — ասում է նա։ Տղաները բացում են բացիկները և կարդում գրությունները։",
        ru: "На следующее утро Майкл приносит открытки в школу. «Доброе утро, ребята! У меня кое-что есть для вас», — говорит он. Мальчики открывают открытки и читают послания."
      },
      {
        en: "\"Wow! These are beautiful!\" says Alex. \"Thank you, Michael. You are a great friend, too,\" says Tom.",
        hy: "«Վա՜յ։ Սրանք շատ գեղեցիկ են», — ասում է Ալեքսը։ «Շնորհակալություն, Մայքլ։ Դու էլ ես հրաշալի ընկեր», — ասում է Թոմը։",
        ru: "«Вот это да! Они очень красивые!» — говорит Алекс. «Спасибо, Майкл. Ты тоже замечательный друг», — говорит Том."
      },
      {
        en: "Daniel smiles and says, \"We are happy to help you. That's what friends do!\" Michael is happy. He understands that saying thank you can make people feel special.",
        hy: "Դանիելը ժպտում է և ասում. «Մենք ուրախ ենք քեզ օգնելու համար։ Ընկերներն այդպես են վարվում»։ Մայքլը ուրախ է։ Նա հասկանում է, որ շնորհակալություն ասելը կարող է մարդկանց առանձնահատուկ զգացնել։",
        ru: "Даниэль улыбается и говорит: «Мы рады тебе помогать. Ведь друзья именно так и поступают!» Майкл счастлив. Он понимает, что слова благодарности могут сделать людей особенными."
      },
      {
        en: "The four friends put their cards in their schoolbags. They want to keep them as a happy memory.",
        hy: "Չորս ընկերներն իրենց բացիկները դնում են դպրոցական պայուսակների մեջ։ Նրանք ցանկանում են դրանք պահել որպես ուրախ հիշողություն։",
        ru: "Четверо друзей кладут открытки в свои школьные сумки. Они хотят сохранить их на память о счастливом дне."
      }
    ],
    vocabulary: [
      { word: "special", translation: { en: "special", hy: "յուրահատուկ", ru: "особенный" } },
      { word: "thank you", translation: { en: "thank you", hy: "շնորհակալություն", ru: "спасибо" } },
      { word: "thankful", translation: { en: "thankful", hy: "շնորհակալ", ru: "благодарный" } },
      { word: "thank-you card", translation: { en: "thank-you card", hy: "շնորհակալական բացիկ", ru: "благодарственная открытка" } },
      { word: "colourful", translation: { en: "colourful", hy: "գունավոր", ru: "разноцветный" } },
      { word: "paper", translation: { en: "paper", hy: "թուղթ", ru: "бумага" } },
      { word: "pencil", translation: { en: "pencil", hy: "մատիտ", ru: "карандаш" } },
      { word: "sticker", translation: { en: "sticker", hy: "կպչուն պիտակ", ru: "наклейка" } },
      { word: "decide", translation: { en: "decide", hy: "որոշել", ru: "решать" } },
      { word: "message", translation: { en: "message", hy: "գրություն, ուղերձ", ru: "послание" } },
      { word: "helpful", translation: { en: "helpful", hy: "պատրաստակամ, օգնող", ru: "отзывчивый" } },
      { word: "never give up", translation: { en: "never give up", hy: "երբեք չհանձնվել", ru: "никогда не сдаваться" } },
      { word: "memory", translation: { en: "memory", hy: "հիշողություն", ru: "воспоминание" } },
      { word: "keep", translation: { en: "keep", hy: "պահել", ru: "хранить" } },
      { word: "feel special", translation: { en: "feel special", hy: "իրեն առանձնահատուկ զգալ", ru: "чувствовать себя особенным" } }
    ],
    questions: [
      {
        question: { en: "What day is it at the beginning of the story?", hy: "Ի՞նչ օր է պատմության սկզբում:", ru: "Какой день в начале рассказа?" },
        options: [
          { en: "Monday evening", hy: "Երկուշաբթի երեկո", ru: "Вечер понедельника" },
          { en: "Thursday evening", hy: "Հինգշաբթի երեկո", ru: "Вечер четверга" },
          { en: "Saturday morning", hy: "Շաբաթ առավոտ", ru: "Субботнее утро" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Why is Michael thankful?", hy: "Ինչո՞ւ է Մայքլը շնորհակալ:", ru: "Почему Майкл благодарен?" },
        options: [
          { en: "His friends helped him find his schoolbag", hy: "Ընկերներն օգնեցին գտնել պայուսակը", ru: "Друзья помогли ему найти рюкзак" },
          { en: "His friends bought him a new book", hy: "Ընկերները նոր գիրք գնեցին նրա համար", ru: "Друзья купили ему новую книгу" },
          { en: "His teacher gave him a present", hy: "Ուսուցիչը նրան նվեր տվեց", ru: "Учитель дал ему подарок" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "How many thank-you cards does Michael make?", hy: "Քանի՞ շնորհակալական բացիկ է պատրաստում Մայքլը:", ru: "Сколько благодарственных открыток делает Майкл?" },
        options: [
          { en: "Two", hy: "Երկու", ru: "Две" },
          { en: "Four", hy: "Չորս", ru: "Четыре" },
          { en: "Three", hy: "Երեք", ru: "Три" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What does Michael write to Alex?", hy: "Ի՞նչ է Մայքլը գրում Ալեքսին:", ru: "Что Майкл пишет Алексу?" },
        options: [
          { en: "Thank you for the new book", hy: "Շնորհակալություն նոր գրքի համար", ru: "Спасибо за новую книгу" },
          { en: "Thank you for remembering where my bag was", hy: "Շնորհակալություն, որ հիշեցիր, թե որտեղ էր պայուսակս", ru: "Спасибо, что вспомнил, где был мой рюкзак" },
          { en: "Thank you for playing football", hy: "Շնորհակալություն ֆուտբոլ խաղալու համար", ru: "Спасибо за игру в футбол" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Tom say to Michael?", hy: "Ի՞նչ է ասում Թոմը Մայքլին:", ru: "Что Том говорит Майклу?" },
        options: [
          { en: "You are a great friend, too", hy: "Դու էլ ես հրաշալի ընկեր", ru: "Ты тоже замечательный друг" },
          { en: "I don't like cards", hy: "Ինձ բացիկները դուր չեն գալիս", ru: "Мне не нравятся открытки" },
          { en: "Let's go home", hy: "Եկեք գնանք տուն", ru: "Пойдём домой" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What do the friends want to do with the cards?", hy: "Ի՞նչ են ուզում անել ընկերները բացիկների հետ:", ru: "Что друзья хотят сделать с открытками?" },
        options: [
          { en: "Throw them away", hy: "Դեն նետել", ru: "Выбросить" },
          { en: "Give them to the teacher", hy: "Տալ ուսուցչին", ru: "Отдать учителю" },
          { en: "Keep them as a happy memory", hy: "Պահել որպես ուրախ հիշողություն", ru: "Хранить как счастливое воспоминание" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Write a special thank-you message!", hy: "Գրիր հատուկ շնորհակալական ուղերձ:", ru: "Напиши особое благодарственное послание!" },
      questions: [
        { en: "Who do you want to thank?", hy: "Ու՞մ ես ուզում շնորհակալություն հայտնել:", ru: "Кого ты хочешь поблагодарить?" },
        { en: "Why are you thankful to this person?", hy: "Ինչո՞ւ ես շնորհակալ այս մարդուն:", ru: "Почему ты благодарен этому человеку?" },
        { en: "How does your friend help you?", hy: "Ինչպե՞ս է ընկերդ օգնում քեզ:", ru: "Как твой друг помогает тебе?" },
        { en: "What kind words can you say to your friend?", hy: "Ի՞նչ բարի խոսքեր կարող ես ասել ընկերոջդ:", ru: "Какие добрые слова ты можешь сказать другу?" },
        { en: "What would you write on the card?", hy: "Ի՞նչ կգրեիր բացիկի վրա:", ru: "Что бы ты написал на открытке?" },
        { en: "Why is it important to say thank you?", hy: "Ինչո՞ւ է կարևոր շնորհակալություն ասել:", ru: "Почему важно говорить спасибо?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 14. ԻՄ ՍԻՐԵԼԻ ԽԱՂԵՐՆ ՈՒ ԶԲԱՂՄՈՒՆՔՆԵՐԸ (A2) ─────────────
  {
    id: "hobbies_michael",
    level: "A2",
    topics: ["hobbies", "daily"],
    title: { en: "What I Like to Do in My Free Time", hy: "Ինչ եմ սիրում անել ազատ ժամանակ", ru: "Чем я люблю заниматься в свободное время" },
    format: "Essay",
    difficulty: 2,
    words: 265,
    minutes: 3,
    parts: 10,
    questionsCount: 6,
    paragraphs: [
      {
        en: "My name is Michael. I am ten years old, and I have many hobbies. I like doing different things after school and at the weekend. My hobbies make me happy, and they help me learn new skills.",
        hy: "Իմ անունը Մայքլ է։ Ես տասը տարեկան եմ և ունեմ բազմաթիվ նախասիրություններ։ Ես սիրում եմ տարբեր զբաղմունքներ ունենալ դասերից հետո և հանգստյան օրերին։ Իմ սիրելի զբաղմունքներն ինձ ուրախացնում են և օգնում նոր հմտություններ սովորել։",
        ru: "Меня зовут Майкл. Мне десять лет, и у меня много увлечений. Я люблю заниматься разными делами после школы и в выходные дни. Мои увлечения радуют меня и помогают приобретать новые навыки."
      },
      {
        en: "My favourite game is football. I usually play football with my friends in the park. We make two teams and try to score goals. Sometimes we win, and sometimes the other team wins. But the most important thing is to have fun and play together.",
        hy: "Իմ սիրելի խաղը ֆուտբոլն է։ Ես սովորաբար ընկերներիս հետ ֆուտբոլ եմ խաղում այգում։ Մենք բաժանվում ենք երկու թիմի և փորձում գոլեր խփել։ Երբեմն մենք ենք հաղթում, իսկ երբեմն՝ մյուս թիմը։ Բայց ամենակարևորը հաճույքով և միասին խաղալն է։",
        ru: "Моя любимая игра — футбол. Обычно я играю в футбол с друзьями в парке. Мы делимся на две команды и стараемся забить голы. Иногда побеждаем мы, а иногда другая команда. Но самое главное — получать удовольствие от игры и играть вместе."
      },
      {
        en: "I also love drawing and painting. I often draw animals, houses, trees, and funny characters. My sister Anna likes painting, too. We sometimes sit at the same table and use many different colours.",
        hy: "Ես նաև շատ եմ սիրում նկարել և գունավորել։ Հաճախ նկարում եմ կենդանիներ, տներ, ծառեր և զվարճալի կերպարներ։ Քույրս՝ Աննան, նույնպես սիրում է նկարել։ Երբեմն մենք նստում ենք նույն սեղանի շուրջ և օգտագործում տարբեր գույներ։",
        ru: "Я также очень люблю рисовать и раскрашивать. Я часто рисую животных, дома, деревья и забавных персонажей. Моя сестра Анна тоже любит рисовать. Иногда мы сидим за одним столом и используем много разных цветов."
      },
      {
        en: "Another hobby of mine is building things with blocks. I can make tall towers, small houses, bridges, and even a little town. I like thinking about new ideas and creating something with my hands.",
        hy: "Իմ մյուս նախասիրություններից մեկը շինարարական խորանարդիկներով տարբեր իրեր կառուցելն է։ Ես կարողանում եմ պատրաստել բարձր աշտարակներ, փոքրիկ տներ, կամուրջներ և նույնիսկ մի ամբողջ փոքրիկ քաղաք։ Ես սիրում եմ նոր գաղափարներ մտածել և սեփական ձեռքերով ինչ-որ բան ստեղծել։",
        ru: "Ещё одно моё увлечение — строить разные вещи из кубиков. Я могу создавать высокие башни, маленькие домики, мосты и даже целый маленький город. Мне нравится придумывать новые идеи и создавать что-нибудь своими руками."
      },
      {
        en: "When the weather is bad, I prefer staying at home. I read storybooks, play board games with my family, or build puzzles. My favourite board game is a game about finding hidden treasures.",
        hy: "Երբ եղանակը վատ է լինում, նախընտրում եմ մնալ տանը։ Ես կարդում եմ հեքիաթների և պատմությունների գրքեր, ընտանիքիս հետ սեղանի խաղեր խաղում կամ գլուխկոտրուկներ հավաքում։ Իմ սիրելի սեղանի խաղը թաքնված գանձեր գտնելու մասին է։",
        ru: "Когда погода плохая, я предпочитаю оставаться дома. Я читаю книги со сказками и рассказами, играю с семьёй в настольные игры или собираю пазлы. Моя любимая настольная игра — игра о поиске спрятанных сокровищ."
      },
      {
        en: "I also enjoy riding my bicycle. I usually ride it with my father in the park. We always wear our helmets and follow the safety rules.",
        hy: "Ես նաև սիրում եմ հեծանիվ վարել։ Սովորաբար հայրիկիս հետ հեծանիվ եմ վարում այգում։ Մենք միշտ սաղավարտ ենք կրում և պահպանում անվտանգության կանոնները։",
        ru: "Я также люблю кататься на велосипеде. Обычно я катаюсь на нём с папой в парке. Мы всегда надеваем шлемы и соблюдаем правила безопасности."
      },
      {
        en: "My best friend David likes playing chess. He sometimes teaches me new moves. I am not very good at chess yet, but I practise because I want to improve.",
        hy: "Իմ լավագույն ընկեր Դավիթը սիրում է շախմատ խաղալ։ Նա երբեմն ինձ նոր քայլեր է սովորեցնում։ Ես դեռ այնքան էլ լավ չեմ խաղում շախմատ, բայց մարզվում եմ, որովհետև ուզում եմ ավելի լավ խաղալ։",
        ru: "Мой лучший друг Давид любит играть в шахматы. Иногда он учит меня новым ходам. Я пока не очень хорошо играю в шахматы, но тренируюсь, потому что хочу стать лучше."
      },
      {
        en: "I don't have only one favourite hobby. I enjoy many activities because each one is different. Football helps me work with others, drawing develops my imagination, and reading teaches me new things.",
        hy: "Ես միայն մեկ սիրելի զբաղմունք չունեմ։ Ինձ դուր են գալիս շատ տարբեր զբաղմունքներ, որովհետև դրանցից յուրաքանչյուրը յուրահատուկ է։ Ֆուտբոլն օգնում է ինձ համագործակցել ուրիշների հետ, նկարչությունը զարգացնում է երևակայությունս, իսկ ընթերցանությունն ինձ նոր բաներ է սովորեցնում։",
        ru: "У меня нет только одного любимого увлечения. Мне нравятся разные занятия, потому что каждое из них особенное. Футбол помогает мне сотрудничать с другими, рисование развивает моё воображение, а чтение учит меня новому."
      },
      {
        en: "I think hobbies make our free time interesting. We can learn, play, create, and spend happy moments with the people we love.",
        hy: "Կարծում եմ՝ նախասիրությունները մեր ազատ ժամանակը հետաքրքիր են դարձնում։ Մենք կարող ենք սովորել, խաղալ, ստեղծագործել և ուրախ պահեր անցկացնել մեր սիրելի մարդկանց հետ։",
        ru: "Я думаю, что увлечения делают наш досуг интересным. Мы можем учиться, играть, создавать что-то новое и проводить счастливые минуты с любимыми людьми."
      }
    ],
    vocabulary: [
      { word: "hobby", translation: { en: "hobby", hy: "նախասիրություն, զբաղմունք", ru: "увлечение" } },
      { word: "free time", translation: { en: "free time", hy: "ազատ ժամանակ", ru: "свободное время" } },
      { word: "team", translation: { en: "team", hy: "թիմ", ru: "команда" } },
      { word: "score a goal", translation: { en: "score a goal", hy: "գոլ խփել", ru: "забить гол" } },
      { word: "draw", translation: { en: "draw", hy: "նկարել", ru: "рисовать" } },
      { word: "painting", translation: { en: "painting", hy: "նկարչություն, գունավորում", ru: "рисование, раскрашивание" } },
      { word: "imagination", translation: { en: "imagination", hy: "երևակայություն", ru: "воображение" } },
      { word: "building blocks", translation: { en: "building blocks", hy: "շինարարական խորանարդիկներ", ru: "строительные кубики" } },
      { word: "tower", translation: { en: "tower", hy: "աշտարակ", ru: "башня" } },
      { word: "bridge", translation: { en: "bridge", hy: "կամուրջ", ru: "мост" } },
      { word: "create", translation: { en: "create", hy: "ստեղծել", ru: "создавать" } },
      { word: "board game", translation: { en: "board game", hy: "սեղանի խաղ", ru: "настольная игра" } },
      { word: "puzzle", translation: { en: "puzzle", hy: "գլուխկոտրուկ", ru: "головоломка" } },
      { word: "treasure", translation: { en: "treasure", hy: "գանձ", ru: "сокровище" } },
      { word: "bicycle", translation: { en: "bicycle", hy: "հեծանիվ", ru: "велосипед" } },
      { word: "helmet", translation: { en: "helmet", hy: "սաղավարտ", ru: "шлем" } },
      { word: "safety rules", translation: { en: "safety rules", hy: "անվտանգության կանոններ", ru: "правила безопасности" } },
      { word: "chess", translation: { en: "chess", hy: "շախմատ", ru: "шахматы" } },
      { word: "practise", translation: { en: "practise", hy: "մարզվել, վարժվել", ru: "тренироваться" } },
      { word: "improve", translation: { en: "improve", hy: "բարելավել", ru: "улучшать" } },
      { word: "skill", translation: { en: "skill", hy: "հմտություն", ru: "навык" } }
    ],
    questions: [
      {
        question: { en: "What is Michael's favourite game?", hy: "Ո՞րն է Մայքլի սիրելի խաղը:", ru: "Какая любимая игра Майкла?" },
        options: [
          { en: "Chess", hy: "Շախմատ", ru: "Шахматы" },
          { en: "Football", hy: "Ֆուտբոլ", ru: "Футбол" },
          { en: "Basketball", hy: "Բասկետբոլ", ru: "Баскетбол" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Where does Michael usually play football?", hy: "Որտե՞ղ է Մայքլը սովորաբար ֆուտբոլ խաղում:", ru: "Где Майкл обычно играет в футбол?" },
        options: [
          { en: "At school", hy: "Դպրոցում", ru: "В школе" },
          { en: "At home", hy: "Տանը", ru: "Дома" },
          { en: "In the park", hy: "Այգում", ru: "В парке" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What does Michael like building with blocks?", hy: "Ի՞նչ է Մայքլը սիրում կառուցել խորանարդիկներով:", ru: "Что Майкл любит строить из кубиков?" },
        options: [
          { en: "A small town", hy: "Փոքրիկ քաղաք", ru: "Маленький город" },
          { en: "A real car", hy: "Իրական մեքենա", ru: "Настоящую машину" },
          { en: "A big ship", hy: "Մեծ նավ", ru: "Большой корабль" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does Michael do when the weather is bad?", hy: "Ի՞նչ է անում Մայքլը, երբ եղանակը վատ է:", ru: "Что Майкл делает, когда погода плохая?" },
        options: [
          { en: "Goes swimming", hy: "Գնում է լողալու", ru: "Идёт плавать" },
          { en: "Reads books and plays board games", hy: "Կարդում է գրքեր և սեղանի խաղեր խաղում", ru: "Читает книги и играет в настольные игры" },
          { en: "Plays football outside", hy: "Դրսում ֆուտբոլ է խաղում", ru: "Играет в футбол на улице" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Who teaches Michael new chess moves?", hy: "Ո՞վ է Մայքլին նոր շախմատային քայլեր սովորեցնում:", ru: "Кто учит Майкла новым шахматным ходам?" },
        options: [
          { en: "His father", hy: "Նրա հայրը", ru: "Его отец" },
          { en: "His sister", hy: "Նրա քույրը", ru: "Его сестра" },
          { en: "His friend David", hy: "Նրա ընկեր Դավիթը", ru: "Его друг Давид" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What does drawing develop?", hy: "Ի՞նչ է զարգացնում նկարչությունը:", ru: "Что развивает рисование?" },
        options: [
          { en: "His imagination", hy: "Նրա երևակայությունը", ru: "Его воображение" },
          { en: "His speed", hy: "Նրա արագությունը", ru: "Его скорость" },
          { en: "His strength", hy: "Նրա ուժը", ru: "Его силу" }
        ],
        correctIndex: 0
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about your favourite games and hobbies!", hy: "Պատմիր քո սիրելի խաղերի և զբաղմունքների մասին:", ru: "Расскажи о своих любимых играх и увлечениях!" },
      questions: [
        { en: "What do you like doing after school?", hy: "Ի՞նչ ես սիրում անել դասերից հետո:", ru: "Что ты любишь делать после школы?" },
        { en: "What is your favourite game?", hy: "Ո՞րն է քո սիրելի խաղը:", ru: "Какая твоя любимая игра?" },
        { en: "Do you like drawing or painting?", hy: "Սիրու՞մ ես նկարել, թե՞ գունավորել:", ru: "Ты любишь рисовать или раскрашивать?" },
        { en: "Do you play football with your friends?", hy: "Ֆուտբոլ խաղու՞մ ես ընկերներիդ հետ:", ru: "Ты играешь в футбол с друзьями?" },
        { en: "What do you do when the weather is bad?", hy: "Ի՞նչ ես անում, երբ եղանակը վատ է:", ru: "Что ты делаешь, когда погода плохая?" },
        { en: "What new hobby would you like to try?", hy: "Ի՞նչ նոր հոբբի կուզենայիր փորձել:", ru: "Какое новое хобби ты хотел бы попробовать?" }
      ]
    }
  },

    // ─── A2 ԹԵՄԱ 15. ԹՎԵՐ, ՕՐԵՐ, ԱՄԻՍՆԵՐ ԵՎ ԺԱՄԵՐ (A2) ─────────────────
  {
    id: "time_michael",
    level: "A2",
    topics: ["daily", "time"],
    title: { en: "My Calendar and My Week", hy: "Իմ օրացույցն ու իմ շաբաթը", ru: "Мой календарь и моя неделя" },
    format: "Story",
    difficulty: 2,
    words: 265,
    minutes: 3,
    parts: 10,
    questionsCount: 6,
    paragraphs: [
      {
        en: "My name is Michael, and I am ten years old. I like knowing what day it is and what I need to do. My family has a big calendar on the kitchen wall. Every morning, I look at it before I go to school.",
        hy: "Իմ անունը Մայքլ է, և ես տասը տարեկան եմ։ Ես սիրում եմ իմանալ, թե այսօր շաբաթվա որ օրն է և ինչ պետք է անեմ։ Մեր ընտանիքը խոհանոցի պատին մեծ օրացույց ունի։ Ամեն առավոտ դպրոց գնալուց առաջ նայում եմ դրան։",
        ru: "Меня зовут Майкл, и мне десять лет. Мне нравится знать, какой сегодня день и что мне нужно делать. У нашей семьи на кухонной стене висит большой календарь. Каждое утро перед школой я смотрю на него."
      },
      {
        en: "There are seven days in a week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and Sunday. I go to school from Monday to Friday.",
        hy: "Մեկ շաբաթում կա յոթ օր՝ երկուշաբթի, երեքշաբթի, չորեքշաբթի, հինգշաբթի, ուրբաթ, շաբաթ և կիրակի։ Ես դպրոց եմ գնում երկուշաբթիից ուրբաթ։",
        ru: "В одной неделе семь дней: понедельник, вторник, среда, четверг, пятница, суббота и воскресенье. Я хожу в школу с понедельника по пятницу."
      },
      {
        en: "On Monday, I have English and Maths. On Tuesday, I have Art and Science. Wednesday is a busy day because I have music lessons after school. On Thursday, I play football with my friends. Friday is my favourite school day because the weekend is near!",
        hy: "Երկուշաբթի օրերին ունեմ անգլերեն և մաթեմատիկա։ Երեքշաբթի օրերին ունեմ նկարչություն և բնագիտություն։ Չորեքշաբթին զբաղված օր է, որովհետև դասերից հետո երաժշտության դասերի եմ հաճախում։ Հինգշաբթի օրերին ընկերներիս հետ ֆուտբոլ եմ խաղում։ Ուրբաթն իմ սիրելի դպրոցական օրն է, որովհետև հանգստյան օրերն արդեն մոտ են։",
        ru: "В понедельник у меня английский язык и математика. Во вторник — рисование и естествознание. Среда — насыщенный день, потому что после школы у меня музыкальные занятия. В четверг я играю в футбол с друзьями. Пятница — мой любимый учебный день, потому что выходные уже близко!"
      },
      {
        en: "Saturday and Sunday are the weekend. I don't go to school on these days. I usually help my parents, play games, read books, or visit my grandparents.",
        hy: "Շաբաթն ու կիրակին հանգստյան օրեր են։ Այդ օրերին դպրոց չեմ գնում։ Սովորաբար օգնում եմ ծնողներիս, խաղում եմ, գրքեր եմ կարդում կամ այցելում տատիկիս ու պապիկիս։",
        ru: "Суббота и воскресенье — выходные дни. В эти дни я не хожу в школу. Обычно я помогаю родителям, играю, читаю книги или навещаю бабушку и дедушку."
      },
      {
        en: "There are twelve months in a year. January is the first month, and December is the last month.",
        hy: "Մեկ տարում կա տասներկու ամիս։ Հունվարը տարվա առաջին ամիսն է, իսկ դեկտեմբերը՝ վերջինը։",
        ru: "В году двенадцать месяцев. Январь — первый месяц года, а декабрь — последний."
      },
      {
        en: "My birthday is in April. I was born on the fifteenth of April. Every year, my family celebrates my birthday with a cake, balloons, and presents. My sister Anna's birthday is in September. She is happy because her birthday comes in autumn.",
        hy: "Իմ ծննդյան օրը ապրիլին է։ Ես ծնվել եմ ապրիլի տասնհինգին։ Ամեն տարի ընտանիքս նշում է իմ ծննդյան օրը՝ տորթով, փուչիկներով և նվերներով։ Քույրիկիս՝ Աննայի ծննդյան օրը սեպտեմբերին է։ Նա ուրախ է, որովհետև իր ծննդյան օրը աշնանն է։",
        ru: "Мой день рождения в апреле. Я родился пятнадцатого апреля. Каждый год моя семья отмечает мой день рождения с тортом, воздушными шарами и подарками. День рождения моей сестры Анны — в сентябре. Она рада, потому что её день рождения бывает осенью."
      },
      {
        en: "I also like looking at the clock. There are sixty minutes in one hour and twenty-four hours in one day.",
        hy: "Ես նաև սիրում եմ նայել ժամացույցին։ Մեկ ժամում կա վաթսուն րոպե, իսկ մեկ օրում՝ քսանչորս ժամ։",
        ru: "Мне также нравится смотреть на часы. В одном часе шестьдесят минут, а в одних сутках — двадцать четыре часа."
      },
      {
        en: "I wake up at seven o'clock in the morning. I have breakfast at half past seven. School starts at eight thirty. I usually come home at three o'clock in the afternoon.",
        hy: "Ես արթնանում եմ առավոտյան ժամը յոթին։ Նախաճաշում եմ յոթն անց կեսին։ Դպրոցը սկսվում է ութն անց երեսունին։ Սովորաբար տուն եմ վերադառնում կեսօրից հետո ժամը երեքին։",
        ru: "Я просыпаюсь в семь часов утра. Завтракаю в половине восьмого. Уроки в школе начинаются в восемь тридцать. Обычно я возвращаюсь домой в три часа дня."
      },
      {
        en: "At six o'clock, my family has dinner. In the evening, I do my homework, read a little, and prepare my schoolbag for the next day. I go to bed at nine o'clock.",
        hy: "Ժամը վեցին մեր ընտանիքը ընթրում է։ Երեկոյան ես կատարում եմ տնային առաջադրանքներս, մի փոքր կարդում և պատրաստում դպրոցական պայուսակս հաջորդ օրվա համար։ Ես քնում եմ ժամը իննին։",
        ru: "В шесть часов наша семья ужинает. Вечером я делаю домашнее задание, немного читаю и собираю школьный рюкзак на следующий день. Я ложусь спать в девять часов."
      },
      {
        en: "Last Sunday, Dad asked me, \"Michael, what day is tomorrow?\" \"Tomorrow is Monday,\" I answered. \"Good! And what is the date?\" \"It is the twenty-first of November.\" Dad smiled. \"You know your days, months, and dates very well!\" I like my calendar because it helps me remember important days and plan my time. Every day brings something new!",
        hy: "Անցած կիրակի հայրիկը հարցրեց ինձ. «Մայքլ, վաղը շաբաթվա ո՞ր օրն է»։ «Վաղը երկուշաբթի է», — պատասխանեցի ես։ «Լավ։ Իսկ ամսի քանի՞սն է»։ «Նոյեմբերի քսանմեկն է»։ Հայրիկը ժպտաց. «Դու շատ լավ գիտես շաբաթվա օրերը, ամիսներն ու ամսաթվերը»։ Ես սիրում եմ մեր օրացույցը, որովհետև այն օգնում է ինձ հիշել կարևոր օրերը և պլանավորել ժամանակս։ Ամեն օր իր հետ ինչ-որ նոր բան է բերում։",
        ru: "В прошлое воскресенье папа спросил меня: «Майкл, какой день будет завтра?» «Завтра понедельник», — ответил я. «Хорошо! А какое сегодня число?» «Двадцать первое ноября». Папа улыбнулся. «Ты очень хорошо знаешь дни недели, месяцы и даты!» Мне нравится наш календарь, потому что он помогает мне помнить важные дни и планировать своё время. Каждый день приносит что-то новое!"
      }
    ],
    vocabulary: [
      { word: "calendar", translation: { en: "calendar", hy: "օրացույց", ru: "календарь" } },
      { word: "week", translation: { en: "week", hy: "շաբաթ", ru: "неделя" } },
      { word: "day", translation: { en: "day", hy: "օր", ru: "день" } },
      { word: "month", translation: { en: "month", hy: "ամիս", ru: "месяц" } },
      { word: "year", translation: { en: "year", hy: "տարի", ru: "год" } },
      { word: "birthday", translation: { en: "birthday", hy: "ծննդյան օր", ru: "день рождения" } },
      { word: "date", translation: { en: "date", hy: "ամսաթիվ", ru: "дата" } },
      { word: "clock", translation: { en: "clock", hy: "ժամացույց", ru: "часы" } },
      { word: "hour", translation: { en: "hour", hy: "ժամ", ru: "час" } },
      { word: "minute", translation: { en: "minute", hy: "րոպե", ru: "минута" } },
      { word: "morning", translation: { en: "morning", hy: "առավոտ", ru: "утро" } },
      { word: "afternoon", translation: { en: "afternoon", hy: "կեսօրից հետո", ru: "день" } },
      { word: "evening", translation: { en: "evening", hy: "երեկո", ru: "вечер" } },
      { word: "weekend", translation: { en: "weekend", hy: "հանգստյան օրեր", ru: "выходные" } },
      { word: "tomorrow", translation: { en: "tomorrow", hy: "վաղը", ru: "завтра" } },
      { word: "plan", translation: { en: "plan", hy: "ծրագիր", ru: "план" } }
    ],
    questions: [
      {
        question: { en: "How many days are there in a week?", hy: "Քանի՞ օր կա մեկ շաբաթում:", ru: "Сколько дней в неделе?" },
        options: [
          { en: "Five", hy: "Հինգ", ru: "Пять" },
          { en: "Seven", hy: "Յոթ", ru: "Семь" },
          { en: "Ten", hy: "Տասը", ru: "Десять" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Which day is Michael's favourite school day?", hy: "Ո՞րն է Մայքլի սիրելի դպրոցական օրը:", ru: "Какой любимый учебный день Майкла?" },
        options: [
          { en: "Monday", hy: "Երկուշաբթի", ru: "Понедельник" },
          { en: "Wednesday", hy: "Չորեքշաբթի", ru: "Среда" },
          { en: "Friday", hy: "Ուրբաթ", ru: "Пятница" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "How many months are there in a year?", hy: "Քանի՞ ամիս կա մեկ տարում:", ru: "Сколько месяцев в году?" },
        options: [
          { en: "Twelve", hy: "Տասներկու", ru: "Двенадцать" },
          { en: "Ten", hy: "Տասը", ru: "Десять" },
          { en: "Fourteen", hy: "Տասնչորս", ru: "Четырнадцать" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "When is Michael's birthday?", hy: "Ե՞րբ է Մայքլի ծննդյան օրը:", ru: "Когда у Майкла день рождения?" },
        options: [
          { en: "In January", hy: "Հունվարին", ru: "В январе" },
          { en: "In April", hy: "Ապրիլին", ru: "В апреле" },
          { en: "In September", hy: "Սեպտեմբերին", ru: "В сентябре" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What time does Michael wake up?", hy: "Ժամը քանիսի՞ն է Մայքլը արթնանում:", ru: "Во сколько Майкл просыпается?" },
        options: [
          { en: "At six o'clock", hy: "Ժամը վեցին", ru: "В шесть часов" },
          { en: "At seven o'clock", hy: "Ժամը յոթին", ru: "В семь часов" },
          { en: "At eight o'clock", hy: "Ժամը ութին", ru: "В восемь часов" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How many minutes are there in one hour?", hy: "Քանի՞ րոպե կա մեկ ժամում:", ru: "Сколько минут в одном часе?" },
        options: [
          { en: "Thirty", hy: "Երեսուն", ru: "Тридцать" },
          { en: "Forty-five", hy: "Քառասունհինգ", ru: "Сорок пять" },
          { en: "Sixty", hy: "Վաթսուն", ru: "Шестьдесят" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about your calendar and your week!", hy: "Պատմիր քո օրացույցի և շաբաթվա մասին:", ru: "Расскажи о своём календаре и своей неделе!" },
      questions: [
        { en: "What day is it today?", hy: "Այսօր շաբաթվա ո՞ր օրն է:", ru: "Какой сегодня день недели?" },
        { en: "What is your favourite day of the week?", hy: "Ո՞րն է քո սիրելի օրը շաբաթվա մեջ:", ru: "Какой твой любимый день недели?" },
        { en: "How many months are there in a year?", hy: "Քանի՞ ամիս կա մեկ տարում:", ru: "Сколько месяцев в году?" },
        { en: "When is your birthday?", hy: "Ե՞րբ է քո ծննդյան օրը:", ru: "Когда у тебя день рождения?" },
        { en: "What time do you wake up?", hy: "Ժամը քանիսի՞ն ես արթնանում:", ru: "Во сколько ты просыпаешься?" },
        { en: "What is your favourite month and why?", hy: "Ո՞րն է քո սիրելի ամիսը և ինչու:", ru: "Какой твой любимый месяц и почему?" }
      ]
    }
  }
];