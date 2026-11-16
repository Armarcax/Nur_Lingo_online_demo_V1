// src/lib/content/reading-texts-A1.ts

import type { ReadingText } from "./reading-types";

export const A1_TEXTS: ReadingText[] = [
  // 0. FAMILY
  {
    id: "family_alex",
    level: "A1",
    topics: ["people", "relationships"],
    title: { en: "This Is My Family", hy: "Սա իմ ընտանիքն է", ru: "Это моя семья" },
    format: "Story",
    difficulty: 1,
    words: 65,
    minutes: 1,
    parts: 5,
    questionsCount: 3,
    paragraphs: [
      {
        en: "My name is Alex. I am nine years old. I live with my family in a nice house.",
        hy: "Իմ անունը Ալեքս է։ Ես ինը տարեկան եմ։ Ես ընտանիքիս հետ ապրում եմ գեղեցիկ տանը։",
        ru: "Меня зовут Алекс. Мне девять лет. Я живу со своей семьёй в красивом доме."
      },
      {
        en: "My father's name is David. He is a teacher. My mother's name is Anna. She is a doctor.",
        hy: "Հայրիկիս անունը Դավիթ է։ Նա ուսուցիչ է։ Մայրիկիս անունը Աննա է։ Նա բժիշկ է։",
        ru: "Моего папу зовут Давид. Он учитель. Мою маму зовут Анна. Она врач."
      },
      {
        en: "I have one sister. Her name is Emma. She is six years old. We play together every day.",
        hy: "Ես մեկ քույր ունեմ։ Նրա անունը Էմմա է։ Նա վեց տարեկան է։ Մենք ամեն օր միասին խաղում ենք։",
        ru: "У меня есть сестра. Её зовут Эмма. Ей шесть лет. Мы каждый день играем вместе."
      },
      {
        en: "We also have a little dog. His name is Max. He is very funny.",
        hy: "Մենք նաև փոքրիկ շուն ունենք։ Նրա անունը Մաքս է։ Նա շատ զվարճալի է։",
        ru: "У нас также есть маленькая собака. Её зовут Макс. Она очень забавная."
      },
      {
        en: "I love my family. We are happy together.",
        hy: "Ես սիրում եմ իմ ընտանիքը։ Մենք միասին երջանիկ ենք։",
        ru: "Я люблю свою семью. Вместе мы счастливы."
      }
    ],
    vocabulary: [
      { word: "family", translation: { en: "family", hy: "ընտանիք", ru: "семья" } },
      { word: "parents", translation: { en: "parents", hy: "ծնողներ", ru: "родители" } },
      { word: "sister", translation: { en: "sister", hy: "քույր", ru: "сестра" } },
      { word: "together", translation: { en: "together", hy: "միասին", ru: "вместе" } },
      { word: "funny", translation: { en: "funny", hy: "զվարճալի", ru: "забавный" } },
      { word: "live", translation: { en: "live", hy: "ապրել", ru: "жить" } }
    ],
    questions: [
      {
        question: { en: "How old is Alex?", hy: "Քանի՞ տարեկան է Ալեքսը:", ru: "Сколько лет Алексу?" },
        options: [
          { en: "Six years old", hy: "Վեց տարեկան", ru: "Шесть лет" },
          { en: "Nine years old", hy: "Ինը տարեկան", ru: "Девять лет" },
          { en: "Ten years old", hy: "Տասը տարեկան", ru: "Десять лет" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Alex's mother do?", hy: "Ի՞նչ է անում Ալեքսի մայրիկը:", ru: "Чем занимается мама Алекса?" },
        options: [
          { en: "She is a teacher", hy: "Նա ուսուցիչ է", ru: "Она учительница" },
          { en: "She is a doctor", hy: "Նա բժիշկ է", ru: "Она врач" },
          { en: "She is a nurse", hy: "Նա բուժքույր է", ru: "Она медсестра" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What can we understand about Alex's family?", hy: "Ի՞նչ կարող ենք հասկանալ Ալեքսի ընտանիքի մասին:", ru: "Что мы можем понять о семье Алекса?" },
        options: [
          { en: "They enjoy spending time together", hy: "Նրանք սիրում են միասին ժամանակ անցկացնել", ru: "Они любят проводить время вместе" },
          { en: "They live in different houses", hy: "Նրանք ապրում են տարբեր տներում", ru: "Они живут в разных домах" },
          { en: "They do not have a pet", hy: "Նրանք ընտանի կենդանի չունեն", ru: "У них нет домашнего животного" }
        ],
        correctIndex: 0
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about your family!", hy: "Հիմա պատմիր քո ընտանիքի մասին:", ru: "А теперь расскажи о своей семье!" },
      questions: [
        { en: "What is your name?", hy: "Ի՞նչ է քո անունը:", ru: "Как тебя зовут?" },
        { en: "How old are you?", hy: "Քանի՞ տարեկան ես:", ru: "Сколько тебе лет?" },
        { en: "How many people are in your family?", hy: "Քանի՞ հոգի կա քո ընտանիքում:", ru: "Сколько человек в твоей семье?" },
        { en: "Do you have a pet?", hy: "Ընտանի կենդանի ունե՞ս:", ru: "У тебя есть домашний питомец?" }
      ]
    }
  },

  // 02. APPEARANCE & CHARACTER
  {
    id: "appearance_friends",
    level: "A1",
    topics: ["people", "appearance"],
    title: { en: "My Friend and I", hy: "Իմ ընկերն ու ես", ru: "Мой друг и я" },
    format: "Story",
    difficulty: 1,
    words: 83,
    minutes: 1,
    parts: 4,
    questionsCount: 3,
    paragraphs: [
      {
        en: "My name is Lily. I am eight years old. I have long brown hair and green eyes. I am a happy and friendly girl.",
        hy: "Իմ անունը Լիլի է։ Ես ութ տարեկան եմ։ Ես երկար, շագանակագույն մազեր և կանաչ աչքեր ունեմ։ Ես ուրախ և ընկերասեր աղջիկ եմ։",
        ru: "Меня зовут Лили. Мне восемь лет. У меня длинные каштановые волосы и зелёные глаза. Я весёлая и дружелюбная девочка."
      },
      {
        en: "My best friend is Tom. He is nine years old. He has short black hair and brown eyes. Tom is funny and kind.",
        hy: "Իմ լավագույն ընկերը Թոմն է։ Նա ինը տարեկան է։ Նա կարճ, սև մազեր և շագանակագույն աչքեր ունի։ Թոմը զվարճալի և բարի է։",
        ru: "Мой лучший друг — Том. Ему девять лет. У него короткие чёрные волосы и карие глаза. Том весёлый и добрый."
      },
      {
        en: "We are different, but we are good friends. I like drawing, and Tom likes playing football.",
        hy: "Մենք տարբեր ենք, բայց լավ ընկերներ ենք։ Ես սիրում եմ նկարել, իսկ Թոմը՝ ֆուտբոլ խաղալ։",
        ru: "Мы разные, но мы хорошие друзья. Я люблю рисовать, а Том любит играть в футбол."
      },
      {
        en: "Sometimes we have different ideas, but we always help each other. I am happy to have such a good friend!",
        hy: "Երբեմն մենք տարբեր կարծիքներ ենք ունենում, բայց միշտ օգնում ենք միմյանց։ Ես ուրախ եմ, որ այսպիսի լավ ընկեր ունեմ։",
        ru: "Иногда у нас разные мнения, но мы всегда помогаем друг другу. Я рада, что у меня есть такой хороший друг!"
      }
    ],
    vocabulary: [
      { word: "appearance", translation: { en: "appearance", hy: "արտաքին տեսք", ru: "внешность" } },
      { word: "friendly", translation: { en: "friendly", hy: "ընկերասեր", ru: "дружелюбный" } },
      { word: "kind", translation: { en: "kind", hy: "բարի", ru: "добрый" } },
      { word: "different", translation: { en: "different", hy: "տարբեր", ru: "разный" } },
      { word: "hair", translation: { en: "hair", hy: "մազեր", ru: "волосы" } },
      { word: "eyes", translation: { en: "eyes", hy: "աչքեր", ru: "глаза" } }
    ],
    questions: [
      {
        question: { en: "What color are Lily's eyes?", hy: "Ի՞նչ գույնի են Լիլիի աչքերը:", ru: "Какого цвета глаза у Лили?" },
        options: [
          { en: "Brown", hy: "Շագանակագույն", ru: "Карие" },
          { en: "Green", hy: "Կանաչ", ru: "Зелёные" },
          { en: "Blue", hy: "Կապույտ", ru: "Голубые" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Tom like doing?", hy: "Ի՞նչ է սիրում անել Թոմը:", ru: "Что Том любит делать?" },
        options: [
          { en: "Drawing", hy: "Նկարել", ru: "Рисовать" },
          { en: "Swimming", hy: "Լողալ", ru: "Плавать" },
          { en: "Playing football", hy: "Ֆուտբոլ խաղալ", ru: "Играть в футбол" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Why are Lily and Tom good friends?", hy: "Ինչո՞ւ են Լիլին և Թոմը լավ ընկերներ:", ru: "Почему Лили и Том хорошие друзья?" },
        options: [
          { en: "They are exactly the same", hy: "Նրանք լրիվ նույնն են", ru: "Они абсолютно одинаковые" },
          { en: "They help each other despite their differences", hy: "Նրանք օգնում են միմյանց՝ չնայած տարբերություններին", ru: "Они помогают друг другу, несмотря на различия" },
          { en: "They always have the same ideas", hy: "Նրանք միշտ նույն կարծիքն ունեն", ru: "У них всегда одинаковые идеи" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Describe yourself!", hy: "Նկարագրիր ինքդ քեզ:", ru: "Опиши себя!" },
      questions: [
        { en: "What is your name?", hy: "Ի՞նչ է քո անունը:", ru: "Как тебя зовут?" },
        { en: "How old are you?", hy: "Քանի՞ տարեկան ես:", ru: "Сколько тебе лет?" },
        { en: "What color are your eyes?", hy: "Ի՞նչ գույնի են քո աչքերը:", ru: "Какого цвета твои глаза?" },
        { en: "What is your hair like?", hy: "Ինչպիսի՞ն են քո մազերը:", ru: "Какие у тебя волосы?" },
        { en: "Are you kind, friendly, or funny?", hy: "Դու բարի՞, ընկերասե՞ր, թե՞ զվարճալի ես:", ru: "Ты добрый, дружелюбный или весёлый?" }
      ]
    }
  },

  // 03. MY HOME
  {
    id: "home_lovely",
    level: "A1",
    topics: ["home", "daily"],
    title: { en: "My Lovely Home", hy: "Իմ սիրելի տունը", ru: "Мой любимый дом" },
    format: "Story",
    difficulty: 1,
    words: 116,
    minutes: 1,
    parts: 6,
    questionsCount: 4,
    paragraphs: [
      {
        en: "I live in a nice house with my family. Our house is not very big, but it is warm and comfortable.",
        hy: "Ես ընտանիքիս հետ ապրում եմ գեղեցիկ տանը։ Մեր տունը շատ մեծ չէ, բայց ջերմ ու հարմարավետ է։",
        ru: "Я живу со своей семьёй в красивом доме. Наш дом не очень большой, но в нём тепло и уютно."
      },
      {
        en: "There are four rooms in our house. We have a living room, a kitchen, two bedrooms, and a bathroom.",
        hy: "Մեր տանն ունենք հյուրասենյակ, խոհանոց, երկու ննջասենյակ և լոգասենյակ։",
        ru: "В нашем доме есть гостиная, кухня, две спальни и ванная комната."
      },
      {
        en: "In the living room, there is a big sofa, a television, and a small table. My family likes sitting together and watching films.",
        hy: "Հյուրասենյակում կա մեծ բազմոց, հեռուստացույց և փոքրիկ սեղան։ Մեր ընտանիքը սիրում է միասին նստել և ֆիլմեր դիտել։",
        ru: "В гостиной стоят большой диван, телевизор и маленький столик. Моя семья любит сидеть вместе и смотреть фильмы."
      },
      {
        en: "My bedroom is my favorite room. I have a blue bed, a desk, a chair, and many books. My toys are in a big box next to my bed.",
        hy: "Իմ ննջասենյակն իմ ամենասիրելի սենյակն է։ Այնտեղ ունեմ կապույտ մահճակալ, գրասեղան, աթոռ և շատ գրքեր։ Խաղալիքներս մահճակալիս կողքին դրված մեծ արկղի մեջ են։",
        ru: "Моя спальня — моя любимая комната. В ней есть синяя кровать, письменный стол, стул и много книг. Мои игрушки лежат в большой коробке рядом с кроватью."
      },
      {
        en: "My mother cooks in the kitchen, and my father likes drinking tea there.",
        hy: "Մայրիկս խոհանոցում է ճաշ պատրաստում, իսկ հայրիկս սիրում է այնտեղ թեյ խմել։",
        ru: "Мама готовит на кухне, а папа любит пить там чай."
      },
      {
        en: "I love my home because my family is always near me.",
        hy: "Ես սիրում եմ մեր տունը, որովհետև ընտանիքս միշտ իմ կողքին է։",
        ru: "Я люблю наш дом, потому что моя семья всегда рядом со мной."
      }
    ],
    vocabulary: [
      { word: "house", translation: { en: "house", hy: "տուն", ru: "дом" } },
      { word: "living room", translation: { en: "living room", hy: "հյուրասենյակ", ru: "гостиная" } },
      { word: "kitchen", translation: { en: "kitchen", hy: "խոհանոց", ru: "кухня" } },
      { word: "bedroom", translation: { en: "bedroom", hy: "ննջասենյակ", ru: "спальня" } },
      { word: "comfortable", translation: { en: "comfortable", hy: "հարմարավետ", ru: "уютный" } },
      { word: "sofa", translation: { en: "sofa", hy: "բազմոց", ru: "диван" } },
      { word: "desk", translation: { en: "desk", hy: "գրասեղան", ru: "письменный стол" } },
      { word: "next to", translation: { en: "next to", hy: "կողքին", ru: "рядом с" } }
    ],
    questions: [
      {
        question: { en: "Which room is the child's favorite?", hy: "Ո՞ր սենյակն է երեխայի ամենասիրելին:", ru: "Какая комната — любимая у ребёнка?" },
        options: [
          { en: "The kitchen", hy: "Խոհանոցը", ru: "Кухня" },
          { en: "The bedroom", hy: "Ննջասենյակը", ru: "Спальня" },
          { en: "The living room", hy: "Հյուրասենյակը", ru: "Гостиная" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Where are the toys?", hy: "Որտե՞ղ են խաղալիքները:", ru: "Где находятся игрушки?" },
        options: [
          { en: "Under the sofa", hy: "Բազմոցի տակ", ru: "Под диваном" },
          { en: "On the desk", hy: "Գրասեղանի վրա", ru: "На столе" },
          { en: "In a box next to the bed", hy: "Մահճակալի կողքին արկղի մեջ", ru: "В коробке рядом с кроватью" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Why does the child love the house?", hy: "Ինչո՞ւ է երեխան սիրում տունը:", ru: "Почему ребёнок любит дом?" },
        options: [
          { en: "Because it is very big", hy: "Որովհետև այն շատ մեծ է", ru: "Потому что он очень большой" },
          { en: "Because the family is always nearby", hy: "Որովհետև ընտանիքը միշտ մոտիկ է", ru: "Потому что семья всегда рядом" },
          { en: "Because there are many televisions", hy: "Որովհետև շատ հեռուստացույցներ կան", ru: "Потому что там много телевизоров" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does the father like doing in the kitchen?", hy: "Ի՞նչ է սիրում անել հայրիկը խոհանոցում:", ru: "Что папа любит делать на кухне?" },
        options: [
          { en: "Reading books", hy: "Գրքեր կարդալ", ru: "Читать книги" },
          { en: "Drinking tea", hy: "Թեյ խմել", ru: "Пить чай" },
          { en: "Cooking dinner", hy: "Ընթրիք պատրաստել", ru: "Готовить ужин" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Describe your room!", hy: "Նկարագրիր քո սենյակը:", ru: "Опиши свою комнату!" },
      questions: [
        { en: "Is your room big or small?", hy: "Քո սենյակը մե՞ծ է, թե՞ փոքր:", ru: "Твоя комната большая или маленькая?" },
        { en: "What furniture is in your room?", hy: "Ի՞նչ կահույք կա քո սենյակում:", ru: "Какая мебель есть в твоей комнате?" },
        { en: "Where are your books?", hy: "Որտե՞ղ են քո գրքերը:", ru: "Где твои книги?" },
        { en: "Where are your toys?", hy: "Որտե՞ղ են քո խաղալիքները:", ru: "Где твои игрушки?" },
        { en: "What is your favorite thing in your room?", hy: "Ո՞րն է քո սիրելի իրը սենյակում:", ru: "Что твоё самое любимое в комнате?" }
      ]
    }
  },

  // 04. MY PET
  {
    id: "pet_max",
    level: "A1",
    topics: ["pets", "nature"],
    title: { en: "My Little Dog Max", hy: "Իմ փոքրիկ շունը՝ Մաքսը", ru: "Моя маленькая собака Макс" },
    format: "Story",
    difficulty: 1,
    words: 107,
    minutes: 1,
    parts: 4,
    questionsCount: 3,
    paragraphs: [
      {
        en: "My name is Ben. I have a little dog. His name is Max. He is two years old. Max is brown and white. He has big ears and a long tail.",
        hy: "Իմ անունը Բեն է։ Ես փոքրիկ շուն ունեմ։ Նրա անունը Մաքս է։ Նա երկու տարեկան է։ Մաքսը շագանակագույն և սպիտակ է։ Նա մեծ ականջներ և երկար պոչ ունի։",
        ru: "Меня зовут Бен. У меня есть маленькая собака. Её зовут Макс. Ей два года. Макс коричнево-белого окраса. У него большие уши и длинный хвост."
      },
      {
        en: "Every morning, I give Max some food and fresh water. After breakfast, we go for a walk in the park. Max loves running and playing with a ball.",
        hy: "Ամեն առավոտ ես Մաքսին ուտելիք և թարմ ջուր եմ տալիս։ Նախաճաշից հետո մենք զբոսնում ենք այգում։ Մաքսը շատ է սիրում վազել և գնդակով խաղալ։",
        ru: "Каждое утро я даю Максу еду и свежую воду. После завтрака мы гуляем в парке. Макс очень любит бегать и играть с мячом."
      },
      {
        en: "In the afternoon, he sleeps near my bed. Sometimes he takes my socks and hides them under the sofa. My mother says, \"Max, where are Ben's socks?\" I laugh every time!",
        hy: "Կեսօրից հետո նա քնում է իմ մահճակալի մոտ։ Երբեմն նա վերցնում է գուլպաներս և թաքցնում բազմոցի տակ։ Մայրիկս հարցնում է. «Մա՛քս, որտե՞ղ են Բենի գուլպաները»։ Ես ամեն անգամ ծիծաղում եմ։",
        ru: "Днём он спит возле моей кровати. Иногда он берёт мои носки и прячет их под диваном. Мама спрашивает: «Макс, где носки Бена?» Я каждый раз смеюсь!"
      },
      {
        en: "Max is not just my pet. He is my best animal friend. I love him very much.",
        hy: "Մաքսն ինձ համար պարզապես ընտանի կենդանի չէ։ Նա իմ լավագույն կենդանի ընկերն է։ Ես նրան շատ եմ սիրում։",
        ru: "Макс для меня не просто домашний питомец. Он мой лучший четвероногий друг. Я очень его люблю."
      }
    ],
    vocabulary: [
      { word: "pet", translation: { en: "pet", hy: "ընտանի կենդանի", ru: "домашний питомец" } },
      { word: "tail", translation: { en: "tail", hy: "պոչ", ru: "хвост" } },
      { word: "ears", translation: { en: "ears", hy: "ականջներ", ru: "уши" } },
      { word: "fresh water", translation: { en: "fresh water", hy: "թարմ ջուր", ru: "свежая вода" } },
      { word: "walk", translation: { en: "walk", hy: "զբոսանք", ru: "прогулка" } },
      { word: "hide", translation: { en: "hide", hy: "թաքցնել", ru: "прятать" } }
    ],
    questions: [
      {
        question: { en: "What does Ben give Max every morning?", hy: "Ի՞նչ է Բենը տալիս Մաքսին ամեն առավոտ:", ru: "Что Бен даёт Максу каждое утро?" },
        options: [
          { en: "Milk and bread", hy: "Կաթ և հաց", ru: "Молоко и хлеб" },
          { en: "Food and fresh water", hy: "Ուտելիք և թարմ ջուր", ru: "Еду и свежую воду" },
          { en: "A ball and a toy", hy: "Գնդակ և խաղալիք", ru: "Мяч и игрушку" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Why does Ben laugh?", hy: "Ինչո՞ւ է Բենը ծիծաղում:", ru: "Почему Бен смеётся?" },
        options: [
          { en: "Max hides his socks under the sofa", hy: "Մաքսը թաքցնում է գուլպաները բազմոցի տակ", ru: "Макс прячет его носки под диваном" },
          { en: "Max runs away from the park", hy: "Մաքսը փախչում է այգուց", ru: "Макс убегает из парка" },
          { en: "Max sleeps all day", hy: "Մաքսը քնում է ամբողջ օրը", ru: "Макс спит весь день" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does the story tell us about Ben?", hy: "Ի՞նչ է պատմում պատմությունը Բենի մասին:", ru: "Что история рассказывает нам о Бене?" },
        options: [
          { en: "He is afraid of dogs", hy: "Նա վախենում է շներից", ru: "Он боится собак" },
          { en: "He does not like walking", hy: "Նա չի սիրում զբոսնել", ru: "Он не любит гулять" },
          { en: "He takes care of his dog", hy: "Նա հոգ է տանում իր շան մասին", ru: "Он заботится о своей собаке" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about your pet!", hy: "Պատմիր քո ընտանի կենդանու մասին:", ru: "Расскажи о своём питомце!" },
      questions: [
        { en: "Do you have a pet?", hy: "Ընտանի կենդանի ունե՞ս:", ru: "У тебя есть питомец?" },
        { en: "What is its name?", hy: "Ի՞նչ է նրա անունը:", ru: "Как его зовут?" },
        { en: "How old is it?", hy: "Քանի՞ տարեկան է նա:", ru: "Сколько ему лет?" },
        { en: "What does it like to do?", hy: "Ի՞նչ է սիրում անել:", ru: "Что он любит делать?" },
        { en: "How do you take care of it?", hy: "Ինչպե՞ս ես հոգ տանում նրա մասին:", ru: "Как ты о нём заботишься?" }
      ]
    }
  },

  // 05. FAVORITE ANIMALS
  {
    id: "animals_around",
    level: "A1",
    topics: ["nature", "animals"],
    title: { en: "Animals Around Us", hy: "Կենդանիները մեր շուրջը", ru: "Животные вокруг нас" },
    format: "Essay",
    difficulty: 1,
    words: 104,
    minutes: 1,
    parts: 5,
    questionsCount: 4,
    paragraphs: [
      {
        en: "I love animals. There are many beautiful animals in the world. Some animals live with people, and others live in forests, mountains, and fields.",
        hy: "Ես սիրում եմ կենդանիներին։ Աշխարհում շատ գեղեցիկ կենդանիներ կան։ Որոշ կենդանիներ ապրում են մարդկանց հետ, իսկ մյուսները՝ անտառներում, լեռներում և դաշտերում։",
        ru: "Я люблю животных. В мире есть много красивых животных. Некоторые живут рядом с людьми, а другие — в лесах, горах и на равнинах."
      },
      {
        en: "My favorite animal is the elephant. It is very big and has a long trunk. Elephants eat plants, leaves, and fruit.",
        hy: "Իմ ամենասիրելի կենդանին փիղն է։ Այն շատ մեծ է և երկար կնճիթ ունի։ Փղերը սնվում են բույսերով, տերևներով և մրգերով։",
        ru: "Моё любимое животное — слон. Он очень большой и у него длинный хобот. Слоны питаются растениями, листьями и фруктами."
      },
      {
        en: "I also like lions. Lions are strong animals. They live in groups and eat meat.",
        hy: "Ես նաև առյուծներ եմ սիրում։ Առյուծները ուժեղ կենդանիներ են։ Նրանք ապրում են խմբերով և սնվում մսով։",
        ru: "Мне также нравятся львы. Львы — сильные животные. Они живут группами и питаются мясом."
      },
      {
        en: "In Armenia, we can see many interesting wild animals. Bears live in mountain forests. Foxes have beautiful tails, and mouflons live in rocky mountain areas.",
        hy: "Հայաստանում նույնպես շատ հետաքրքիր վայրի կենդանիներ կան։ Արջերն ապրում են լեռնային անտառներում։ Աղվեսները գեղեցիկ պոչեր ունեն, իսկ մուֆլոններն ապրում են քարքարոտ լեռնային վայրերում։",
        ru: "В Армении тоже можно встретить много интересных диких животных. Медведи живут в горных лесах. У лис красивые хвосты, а муфлоны обитают в скалистых горных районах."
      },
      {
        en: "I want to learn more about animals and help protect them. Animals are an important part of our world.",
        hy: "Ես ուզում եմ ավելին իմանալ կենդանիների մասին և օգնել պահպանել նրանց։ Կենդանիները մեր աշխարհի կարևոր մասն են։",
        ru: "Я хочу больше узнавать о животных и помогать защищать их. Животные — важная часть нашего мира."
      }
    ],
    vocabulary: [
      { word: "elephant", translation: { en: "elephant", hy: "փիղ", ru: "слон" } },
      { word: "trunk", translation: { en: "trunk", hy: "կնճիթ", ru: "хобот" } },
      { word: "lion", translation: { en: "lion", hy: "առյուծ", ru: "лев" } },
      { word: "forest", translation: { en: "forest", hy: "անտառ", ru: "лес" } },
      { word: "fox", translation: { en: "fox", hy: "աղվես", ru: "лиса" } },
      { word: "bear", translation: { en: "bear", hy: "արջ", ru: "медведь" } },
      { word: "mouflon", translation: { en: "mouflon", hy: "մուֆլոն", ru: "муфлон" } },
      { word: "protect", translation: { en: "protect", hy: "պաշտպանել", ru: "защищать" } }
    ],
    questions: [
      {
        question: { en: "What is the child's favorite animal?", hy: "Ո՞րն է երեխայի ամենասիրելի կենդանին:", ru: "Какое любимое животное у ребёнка?" },
        options: [
          { en: "The lion", hy: "Առյուծը", ru: "Лев" },
          { en: "The elephant", hy: "Փիղը", ru: "Слон" },
          { en: "The bear", hy: "Արջը", ru: "Медведь" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What do elephants eat?", hy: "Ի՞նչ են ուտում փղերը:", ru: "Что едят слоны?" },
        options: [
          { en: "Only meat", hy: "Միայն միս", ru: "Только мясо" },
          { en: "Fish and bread", hy: "Ձուկ և հաց", ru: "Рыбу и хлеб" },
          { en: "Plants, leaves, and fruit", hy: "Բույսեր, տերևներ և մրգեր", ru: "Растения, листья и фрукты" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Where do mouflons live?", hy: "Որտե՞ղ են ապրում մուֆլոնները:", ru: "Где живут муфлоны?" },
        options: [
          { en: "In rocky mountain areas", hy: "Քարքարոտ լեռնային վայրերում", ru: "В скалистых горных районах" },
          { en: "In the sea", hy: "Ծովում", ru: "В море" },
          { en: "In city houses", hy: "Քաղաքային տներում", ru: "В городских домах" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Why does the child want to learn more about animals?", hy: "Ինչո՞ւ է երեխան ուզում ավելին իմանալ կենդանիների մասին:", ru: "Почему ребёнок хочет больше узнать о животных?" },
        options: [
          { en: "To buy all the animals", hy: "Բոլոր կենդանիներին գնելու համար", ru: "Чтобы купить всех животных" },
          { en: "To help protect them", hy: "Որպեսզի օգնի պահպանել նրանց", ru: "Чтобы помочь защитить их" },
          { en: "To take them home", hy: "Նրանց տուն տանելու համար", ru: "Чтобы забрать их домой" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "My Favorite Animal", hy: "Իմ սիրելի կենդանին", ru: "Моё любимое животное" },
      questions: [
        { en: "What is your favorite animal?", hy: "Ո՞րն է քո ամենասիրելի կենդանին:", ru: "Какое твоё любимое животное?" },
        { en: "Where does it live?", hy: "Որտե՞ղ է նա ապրում:", ru: "Где оно живёт?" },
        { en: "What does it eat?", hy: "Ի՞նչ է նա ուտում:", ru: "Что оно ест?" },
        { en: "What color is it?", hy: "Ի՞նչ գույնի է նա:", ru: "Какого оно цвета?" },
        { en: "Why do you like it?", hy: "Ինչո՞ւ է նա քեզ դուր գալիս:", ru: "Почему оно тебе нравится?" }
      ]
    }
  },

  // 06. MY MORNING
  {
    id: "morning_busy",
    level: "A1",
    topics: ["daily"],
    title: { en: "A Busy Morning", hy: "Զբաղված առավոտ", ru: "Занятное утро" },
    format: "Story",
    difficulty: 1,
    words: 103,
    minutes: 1,
    parts: 5,
    questionsCount: 4,
    paragraphs: [
      {
        en: "My name is Daniel. I get up at seven o'clock every morning. First, I open the window and let fresh air into my room.",
        hy: "Իմ անունը Դանիել է։ Ամեն առավոտ ժամը յոթին արթնանում եմ։ Սկզբում բացում եմ պատուհանը և սենյակս թարմ օդ թողնում։",
        ru: "Меня зовут Даниэль. Каждое утро я встаю в семь часов. Сначала я открываю окно и впускаю в комнату свежий воздух."
      },
      {
        en: "Then I wash my face and brush my teeth. I put on my clothes and make my bed.",
        hy: "Հետո լվանում եմ դեմքս և մաքրում ատամներս։ Հագնվում եմ և հարդարում անկողինս։",
        ru: "Затем я умываюсь и чищу зубы. Одеваюсь и заправляю кровать."
      },
      {
        en: "At half past seven, I have breakfast with my family. I usually eat eggs, bread, and cheese. I drink a glass of milk.",
        hy: "Յոթն անց կեսին ընտանիքիս հետ նախաճաշում եմ։ Սովորաբար ուտում եմ ձու, հաց և պանիր։ Մի բաժակ կաթ եմ խմում։",
        ru: "В половине восьмого я завтракаю вместе с семьёй. Обычно я ем яйца, хлеб и сыр. Я выпиваю стакан молока."
      },
      {
        en: "My school bag is ready. I check my books and notebooks before I leave home.",
        hy: "Դպրոցական պայուսակս պատրաստ է։ Տնից դուրս գալուց առաջ ստուգում եմ գրքերս և տետրերս։",
        ru: "Мой школьный рюкзак готов. Перед выходом из дома я проверяю свои книги и тетради."
      },
      {
        en: "At eight o'clock, I say goodbye to my parents and go to school. I like mornings because every new day brings something interesting!",
        hy: "Ժամը ութին հրաժեշտ եմ տալիս ծնողներիս և գնում դպրոց։ Ես սիրում եմ առավոտները, որովհետև ամեն նոր օր հետաքրքիր մի բան է բերում։",
        ru: "В восемь часов я прощаюсь с родителями и иду в школу. Я люблю утро, потому что каждый новый день приносит что-то интересное!"
      }
    ],
    vocabulary: [
      { word: "get up", translation: { en: "get up", hy: "արթնանալ / վեր կենալ", ru: "вставать" } },
      { word: "fresh air", translation: { en: "fresh air", hy: "մաքուր օդ", ru: "свежий воздух" } },
      { word: "wash", translation: { en: "wash", hy: "լվանալ", ru: "мыть" } },
      { word: "brush my teeth", translation: { en: "brush my teeth", hy: "մաքրել ատամներս", ru: "чистить зубы" } },
      { word: "get dressed", translation: { en: "get dressed", hy: "հագնվել", ru: "одеваться" } },
      { word: "make my bed", translation: { en: "make my bed", hy: "հարդարել անկողինս", ru: "заправлять кровать" } },
      { word: "breakfast", translation: { en: "breakfast", hy: "նախաճաշ", ru: "завтрак" } },
      { word: "leave home", translation: { en: "leave home", hy: "տնից դուրս գալ", ru: "выходить из дома" } }
    ],
    questions: [
      {
        question: { en: "What time does Daniel get up?", hy: "Ժամը քանիսի՞ն է Դանիելը արթնանում:", ru: "Во сколько Даниэль встаёт?" },
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
          { en: "Eggs, bread, and cheese", hy: "Ձու, հաց և պանիր", ru: "Яйца, хлеб и сыр" },
          { en: "Fish and rice", hy: "Ձուկ և բրինձ", ru: "Рыбу и рис" },
          { en: "Apples and soup", hy: "Խնձոր և ապուր", ru: "Яблоки и суп" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What does Daniel check before leaving home?", hy: "Ի՞նչ է ստուգում Դանիելը տնից դուրս գալուց առաջ:", ru: "Что Даниэль проверяет перед выходом из дома?" },
        options: [
          { en: "His toys", hy: "Իր խաղալիքները", ru: "Свои игрушки" },
          { en: "His clothes", hy: "Իր հագուստը", ru: "Свою одежду" },
          { en: "His books and notebooks", hy: "Իր գրքերն ու տետրերը", ru: "Свои книги и тетради" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Why does Daniel like mornings?", hy: "Ինչո՞ւ է Դանիելը սիրում առավոտները:", ru: "Почему Даниэль любит утро?" },
        options: [
          { en: "He does not go to school", hy: "Նա դպրոց չի գնում", ru: "Он не ходит в школу" },
          { en: "Every new day brings something interesting", hy: "Ամեն նոր օր հետաքրքիր մի բան է բերում", ru: "Каждый новый день приносит что-то интересное" },
          { en: "He sleeps until noon", hy: "Նա քնում է մինչև կեսօր", ru: "Он спит до полудня" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about your morning!", hy: "Պատմիր քո առավոտվա մասին:", ru: "Расскажи о своём утре!" },
      questions: [
        { en: "What time do you get up?", hy: "Ժամը քանիսի՞ն ես արթնանում:", ru: "Во сколько ты встаёшь?" },
        { en: "What do you do first?", hy: "Ի՞նչ ես անում սկզբում:", ru: "Что ты делаешь сначала?" },
        { en: "What do you eat for breakfast?", hy: "Ի՞նչ ես ուտում նախաճաշին:", ru: "Что ты ешь на завтрак?" },
        { en: "When do you go to school?", hy: "Ե՞րբ ես գնում դպրոց:", ru: "Когда ты идёшь в школу?" },
        { en: "How do you go to school?", hy: "Ինչպե՞ս ես գնում դպրոց:", ru: "Как ты идёшь в школу?" }
      ]
    }
  },

  // 07. MY SCHOOL
  {
    id: "school_day",
    level: "A1",
    topics: ["school", "learning"],
    title: { en: "My School Day", hy: "Իմ դպրոցական օրը", ru: "Мой школьный день" },
    format: "Story",
    difficulty: 1,
    words: 124,
    minutes: 1,
    parts: 5,
    questionsCount: 4,
    paragraphs: [
      {
        en: "My name is Oliver. I am nine years old, and I am a student. I go to Green School. My school is big and beautiful. There are many classrooms, a library, and a playground.",
        hy: "Իմ անունը Օլիվեր է։ Ես ինը տարեկան եմ և աշակերտ եմ։ Ես հաճախում եմ Գրին դպրոց։ Իմ դպրոցը մեծ է և գեղեցիկ։ Այնտեղ կան բազմաթիվ դասասենյակներ, գրադարան և խաղահրապարակ։",
        ru: "Меня зовут Оливер. Мне девять лет, и я ученик. Я учусь в школе «Грин». Моя школа большая и красивая. В ней много классов, есть библиотека и игровая площадка."
      },
      {
        en: "My classroom is bright. There are twenty students in my class. Our teacher's name is Mrs. Brown. She is kind and friendly. She helps us when we have questions.",
        hy: "Իմ դասասենյակը լուսավոր է։ Մեր դասարանում քսան աշակերտ կա։ Մեր ուսուցչուհու անունը տիկին Բրաուն է։ Նա բարի է և ընկերասեր։ Երբ հարցեր ենք ունենում, նա օգնում է մեզ։",
        ru: "Мой класс светлый. В нашем классе двадцать учеников. Нашу учительницу зовут миссис Браун. Она добрая и дружелюбная. Она помогает нам, когда у нас возникают вопросы."
      },
      {
        en: "My favorite subjects are English and Art. I like learning new words and drawing pictures. My best friend, Jack, sits next to me. We study and play together.",
        hy: "Իմ սիրելի առարկաներն են անգլերենը և կերպարվեստը։ Ես սիրում եմ նոր բառեր սովորել և նկարներ նկարել։ Իմ լավագույն ընկերը՝ Ջեքը, նստում է իմ կողքին։ Մենք միասին սովորում և խաղում ենք։",
        ru: "Мои любимые предметы — английский язык и рисование. Мне нравится учить новые слова и рисовать картинки. Мой лучший друг Джек сидит рядом со мной. Мы вместе учимся и играем."
      },
      {
        en: "During the break, we go to the playground. Sometimes we play football or talk about our favorite games.",
        hy: "Դասամիջոցին մենք գնում ենք խաղահրապարակ։ Երբեմն ֆուտբոլ ենք խաղում կամ զրուցում մեր սիրելի խաղերի մասին։",
        ru: "Во время перемены мы выходим на игровую площадку. Иногда мы играем в футбол или разговариваем о наших любимых играх."
      },
      {
        en: "I like my school because I learn new things and meet my friends every day.",
        hy: "Ես սիրում եմ իմ դպրոցը, որովհետև ամեն օր նոր բաներ եմ սովորում և հանդիպում ընկերներիս։",
        ru: "Я люблю свою школу, потому что каждый день узнаю что-то новое и встречаюсь с друзьями."
      }
    ],
    vocabulary: [
      { word: "student", translation: { en: "student", hy: "աշակերտ", ru: "ученик" } },
      { word: "classroom", translation: { en: "classroom", hy: "դասասենյակ", ru: "класс" } },
      { word: "library", translation: { en: "library", hy: "գրադարան", ru: "библиотека" } },
      { word: "playground", translation: { en: "playground", hy: "խաղահրապարակ", ru: "игровая площадка" } },
      { word: "subject", translation: { en: "subject", hy: "ուսումնական առարկա", ru: "учебный предмет" } },
      { word: "teacher", translation: { en: "teacher", hy: "ուսուցիչ", ru: "учитель" } },
      { word: "break", translation: { en: "break", hy: "դասամիջոց", ru: "перемена" } },
      { word: "next to", translation: { en: "next to", hy: "կողքին", ru: "рядом с" } }
    ],
    questions: [
      {
        question: { en: "How many students are in Oliver's class?", hy: "Քանի՞ աշակերտ կա Օլիվերի դասարանում:", ru: "Сколько учеников в классе Оливера?" },
        options: [
          { en: "Fifteen", hy: "Տասնհինգ", ru: "Пятнадцать" },
          { en: "Twenty", hy: "Քսան", ru: "Двадцать" },
          { en: "Twenty-five", hy: "Քսանհինգ", ru: "Двадцать пять" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What are Oliver's favorite subjects?", hy: "Ո՞րն են Օլիվերի սիրելի առարկաները:", ru: "Какие любимые предметы у Оливера?" },
        options: [
          { en: "Math and Science", hy: "Մաթեմատիկա և բնագիտություն", ru: "Математика и естествознание" },
          { en: "Music and PE", hy: "Երաժշտություն և ֆիզկուլտուրա", ru: "Музыка и физкультура" },
          { en: "English and Art", hy: "Անգլերեն և կերպարվեստ", ru: "Английский и рисование" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Where does Jack sit?", hy: "Որտե՞ղ է նստում Ջեքը:", ru: "Где сидит Джек?" },
        options: [
          { en: "Next to Oliver", hy: "Օլիվերի կողքին", ru: "Рядом с Оливером" },
          { en: "Behind the teacher", hy: "Ուսուցչի հետևում", ru: "За учителем" },
          { en: "Near the library", hy: "Գրադարանի մոտ", ru: "Возле библиотеки" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Why does Oliver like his school?", hy: "Ինչո՞ւ է Օլիվերը սիրում իր դպրոցը:", ru: "Почему Оливер любит свою школу?" },
        options: [
          { en: "Because he never has homework", hy: "Որովհետև նա երբեք տնային չի ունենում", ru: "Потому что у него никогда нет домашнего задания" },
          { en: "Because he learns new things and meets friends", hy: "Որովհետև նա նոր բաներ է սովորում և հանդիպում ընկերներին", ru: "Потому что он узнаёт новое и встречает друзей" },
          { en: "Because he has a very big classroom", hy: "Որովհետև նա շատ մեծ դասասենյակ ունի", ru: "Потому что у него очень большой класс" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Tell us about your school!", hy: "Պատմիր քո դպրոցի մասին:", ru: "Расскажи о своей школе!" },
      questions: [
        { en: "What is the name of your school?", hy: "Ի՞նչ է քո դպրոցի անունը:", ru: "Как называется твоя школа?" },
        { en: "How old are you?", hy: "Քանի՞ տարեկան ես:", ru: "Сколько тебе лет?" },
        { en: "What is your favorite subject?", hy: "Ո՞րն է քո սիրելի առարկան:", ru: "Какой твой любимый предмет?" },
        { en: "Who is your best friend at school?", hy: "Ո՞վ է քո լավագույն ընկերը դպրոցում:", ru: "Кто твой лучший друг в школе?" },
        { en: "What do you do during the break?", hy: "Ի՞նչ ես անում դասամիջոցին:", ru: "Что ты делаешь на перемене?" }
      ]
    }
  },

  // DAILY ROUTINE
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
    ],
    creativeTask: {
      prompt: { en: "Tell us about your morning routine!", hy: "Պատմիր քո առավոտյան առօրյայի մասին:", ru: "Расскажи о своей утренней рутине!" },
      questions: [
        { en: "What time do you get up?", hy: "Ժամը քանիսի՞ն ես արթնանում:", ru: "Во сколько ты встаёшь?" },
        { en: "What do you eat for breakfast?", hy: "Ի՞նչ ես ուտում նախաճաշին:", ru: "Что ты ешь на завтрак?" },
        { en: "Who do you usually spend the morning with?", hy: "Ու՞մ հետ ես սովորաբար անցկացնում առավոտը:", ru: "С кем ты обычно проводишь утро?" }
      ]
    }
  },

    // ─── A1 ԹԵՄԱ 13. ԲԱՆՋԱՐԵՂԵՆ ────────────────────────────────────────
  {
    id: "vegetables_market",
    level: "A1",
    topics: ["food", "vegetables"],
    title: { en: "Vegetables", hy: "Բանջարեղեն", ru: "Овощи" },
    format: "Story",
    difficulty: 1,
    words: 96,
    minutes: 1,
    parts: 7,
    questionsCount: 5,
    paragraphs: [
      {
        en: "My name is Jack. I like vegetables.",
        hy: "Իմ անունը Ջեք է։ Ես սիրում եմ բանջարեղեն։",
        ru: "Меня зовут Джек. Я люблю овощи."
      },
      {
        en: "My mother and I go to the market every Saturday. We buy tomatoes, cucumbers, carrots, potatoes and onions.",
        hy: "Ես և մայրիկս ամեն շաբաթ օր գնում ենք շուկա։ Մենք գնում ենք լոլիկ, վարունգ, գազար, կարտոֆիլ և սոխ։",
        ru: "Каждую субботу мы с мамой ходим на рынок. Мы покупаем помидоры, огурцы, морковь, картофель и лук."
      },
      {
        en: "Tomatoes are red. Cucumbers are green and long. Carrots are orange. Potatoes grow under the ground.",
        hy: "Լոլիկները կարմիր են։ Վարունգները կանաչ են և երկար։ Գազարները նարնջագույն են։ Կարտոֆիլն աճում է հողի տակ։",
        ru: "Помидоры красные. Огурцы зелёные и длинные. Морковь оранжевая. Картофель растёт под землёй."
      },
      {
        en: "My favourite vegetable is the carrot. It is crunchy and sweet.",
        hy: "Իմ սիրելի բանջարեղենը գազարն է։ Այն խրթխրթան է և քաղցր։",
        ru: "Мой любимый овощ — морковь. Она хрустящая и сладкая."
      },
      {
        en: "My mother makes delicious vegetable soup. I help her wash the vegetables and put them in a bowl.",
        hy: "Մայրիկս համեղ բանջարեղենային ապուր է պատրաստում։ Ես օգնում եմ նրան լվանալ բանջարեղենը և դնել ամանի մեջ։",
        ru: "Моя мама готовит вкусный овощной суп. Я помогаю ей мыть овощи и класть их в миску."
      },
      {
        en: "We also have a small vegetable garden. My father grows tomatoes, cucumbers and peppers there.",
        hy: "Մենք նաև փոքրիկ բանջարանոց ունենք։ Հայրիկս այնտեղ լոլիկ, վարունգ և պղպեղ է աճեցնում։",
        ru: "У нас также есть небольшой огород. Мой папа выращивает там помидоры, огурцы и перец."
      },
      {
        en: "I like fresh vegetables. They are colourful and delicious!",
        hy: "Ես սիրում եմ թարմ բանջարեղեն։ Դրանք գունավոր և համեղ են։",
        ru: "Я люблю свежие овощи. Они яркие и вкусные!"
      }
    ],
    vocabulary: [
      { word: "vegetable", translation: { en: "vegetable", hy: "բանջարեղեն", ru: "овощ" } },
      { word: "tomato", translation: { en: "tomato", hy: "լոլիկ", ru: "помидор" } },
      { word: "cucumber", translation: { en: "cucumber", hy: "վարունգ", ru: "огурец" } },
      { word: "carrot", translation: { en: "carrot", hy: "գազար", ru: "морковь" } },
      { word: "potato", translation: { en: "potato", hy: "կարտոֆիլ", ru: "картофель" } },
      { word: "onion", translation: { en: "onion", hy: "սոխ", ru: "лук" } },
      { word: "pepper", translation: { en: "pepper", hy: "պղպեղ", ru: "перец" } },
      { word: "market", translation: { en: "market", hy: "շուկա", ru: "рынок" } },
      { word: "vegetable garden", translation: { en: "vegetable garden", hy: "բանջարանոց", ru: "огород" } },
      { word: "crunchy", translation: { en: "crunchy", hy: "խրթխրթան", ru: "хрустящий" } },
      { word: "fresh", translation: { en: "fresh", hy: "թարմ", ru: "свежий" } },
      { word: "grow", translation: { en: "grow", hy: "աճեցնել", ru: "выращивать" } }
    ],
    questions: [
      {
        question: { en: "When do Jack and his mother go to the market?", hy: "Ե՞րբ են Ջեքը և մայրիկը գնում շուկա:", ru: "Когда Джек и его мама ходят на рынок?" },
        options: [
          { en: "Every Monday", hy: "Ամեն երկուշաբթի", ru: "Каждый понедельник" },
          { en: "Every Saturday", hy: "Ամեն շաբաթ օր", ru: "Каждую субботу" },
          { en: "Every Sunday", hy: "Ամեն կիրակի", ru: "Каждое воскресенье" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What colour are carrots?", hy: "Ի՞նչ գույնի են գազարները:", ru: "Какого цвета морковь?" },
        options: [
          { en: "Red", hy: "Կարմիր", ru: "Красная" },
          { en: "Green", hy: "Կանաչ", ru: "Зелёная" },
          { en: "Orange", hy: "Նարնջագույն", ru: "Оранжевая" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "Where do potatoes grow?", hy: "Որտե՞ղ է աճում կարտոֆիլը:", ru: "Где растёт картофель?" },
        options: [
          { en: "Under the ground", hy: "Հողի տակ", ru: "Под землёй" },
          { en: "On trees", hy: "Ծառերի վրա", ru: "На деревьях" },
          { en: "In the water", hy: "Ջրի մեջ", ru: "В воде" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What is Jack's favourite vegetable?", hy: "Ո՞րն է Ջեքի սիրելի բանջարեղենը:", ru: "Какой любимый овощ у Джека?" },
        options: [
          { en: "Cucumber", hy: "Վարունգ", ru: "Огурец" },
          { en: "Carrot", hy: "Գազար", ru: "Морковь" },
          { en: "Tomato", hy: "Լոլիկ", ru: "Помидор" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Jack's father grow in the garden?", hy: "Ի՞նչ է աճեցնում Ջեքի հայրիկը բանջարանոցում:", ru: "Что выращивает папа Джека в огороде?" },
        options: [
          { en: "Apples and bananas", hy: "Խնձոր և բանան", ru: "Яблоки и бананы" },
          { en: "Strawberries and grapes", hy: "Ելակ և խաղող", ru: "Клубнику и виноград" },
          { en: "Tomatoes, cucumbers and peppers", hy: "Լոլիկ, վարունգ և պղպեղ", ru: "Помидоры, огурцы и перец" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about your favourite vegetables!", hy: "Հիմա պատմիր քո սիրելի բանջարեղենի մասին:", ru: "А теперь расскажи о своих любимых овощах!" },
      questions: [
        { en: "What is your favourite vegetable?", hy: "Ո՞րն է քո սիրելի բանջարեղենը:", ru: "Какой твой любимый овощ?" },
        { en: "Do you like tomatoes?", hy: "Սիրու՞մ ես լոլիկ:", ru: "Ты любишь помидоры?" },
        { en: "What colour is a cucumber?", hy: "Ի՞նչ գույնի է վարունգը:", ru: "Какого цвета огурец?" },
        { en: "Do you help your parents in the garden?", hy: "Օգնու՞մ ես ծնողներիդ այգում:", ru: "Помогаешь ли ты родителям в саду?" },
        { en: "What vegetables do you eat at home?", hy: "Ի՞նչ բանջարեղեն ես ուտում տանը:", ru: "Какие овощи ты ешь дома?" }
      ]
    }
  },

    // ─── A1 ԹԵՄԱ 14. ԻՄ ՍԻՐԵԼԻ ԽԱՂԵՐՆ ՈՒ ԶԲԱՂՄՈՒՆՔՆԵՐԸ ────────────────────
  {
    id: "hobbies_games",
    level: "A1",
    topics: ["hobbies", "daily"],
    title: { en: "My Favourite Games and Hobbies", hy: "Իմ սիրելի խաղերն ու զբաղմունքները", ru: "Мои любимые игры и увлечения" },
    format: "Story",
    difficulty: 1,
    words: 99,
    minutes: 1,
    parts: 6,
    questionsCount: 5,
    paragraphs: [
      {
        en: "My name is Daniel. I am nine years old. I have many hobbies.",
        hy: "Իմ անունը Դանիել է։ Ես ինը տարեկան եմ։ Ես շատ զբաղմունքներ ունեմ։",
        ru: "Меня зовут Даниэль. Мне девять лет. У меня много увлечений."
      },
      {
        en: "I like playing football with my friends. We play in the park after school. Sometimes we ride our bicycles and play hide-and-seek.",
        hy: "Ես սիրում եմ ընկերներիս հետ ֆուտբոլ խաղալ։ Մենք դասերից հետո խաղում ենք այգում։ Երբեմն մենք հեծանիվ ենք քշում և պահմտոցի խաղում։",
        ru: "Я люблю играть в футбол с друзьями. Мы играем в парке после школы. Иногда мы катаемся на велосипедах и играем в прятки."
      },
      {
        en: "I also like drawing pictures. I draw animals, houses, trees and funny characters. My favourite colour is blue.",
        hy: "Ես նաև սիրում եմ նկարել։ Ես նկարում եմ կենդանիներ, տներ, ծառեր և զվարճալի կերպարներ։ Իմ սիրելի գույնը կապույտն է։",
        ru: "Я также люблю рисовать. Я рисую животных, дома, деревья и забавных персонажей. Мой любимый цвет — синий."
      },
      {
        en: "At home, I enjoy reading storybooks and playing board games with my sister. We sometimes build houses with toy blocks.",
        hy: "Տանը ես հաճույքով կարդում եմ հեքիաթների գրքեր և քրոջս հետ սեղանի խաղեր խաղում։ Երբեմն մենք խաղալիք խորանարդիկներով տներ ենք կառուցում։",
        ru: "Дома мне нравится читать сказки и играть в настольные игры с сестрой. Иногда мы строим домики из игрушечных кубиков."
      },
      {
        en: "On weekends, I visit my grandparents. We play games and have fun together.",
        hy: "Հանգստյան օրերին ես այցելում եմ տատիկիս ու պապիկիս։ Մենք խաղեր ենք խաղում և միասին ուրախ ժամանակ անցկացնում։",
        ru: "По выходным я навещаю бабушку и дедушку. Мы играем и весело проводим время вместе."
      },
      {
        en: "I like trying new things. My hobbies make me happy!",
        hy: "Ես սիրում եմ նոր բաներ փորձել։ Իմ սիրելի զբաղմունքներն ինձ ուրախացնում են։",
        ru: "Я люблю пробовать что-то новое. Мои увлечения делают меня счастливым!"
      }
    ],
    vocabulary: [
      { word: "hobby", translation: { en: "hobby", hy: "զբաղմունք, հոբբի", ru: "увлечение" } },
      { word: "free time", translation: { en: "free time", hy: "ազատ ժամանակ", ru: "свободное время" } },
      { word: "play football", translation: { en: "play football", hy: "ֆուտբոլ խաղալ", ru: "играть в футбол" } },
      { word: "ride a bicycle", translation: { en: "ride a bicycle", hy: "հեծանիվ քշել", ru: "кататься на велосипеде" } },
      { word: "hide-and-seek", translation: { en: "hide-and-seek", hy: "պահմտոցի", ru: "прятки" } },
      { word: "draw", translation: { en: "draw", hy: "նկարել", ru: "рисовать" } },
      { word: "storybook", translation: { en: "storybook", hy: "հեքիաթների գիրք", ru: "книга сказок" } },
      { word: "board game", translation: { en: "board game", hy: "սեղանի խաղ", ru: "настольная игра" } },
      { word: "toy blocks", translation: { en: "toy blocks", hy: "խաղալիք խորանարդիկներ", ru: "игрушечные кубики" } },
      { word: "build", translation: { en: "build", hy: "կառուցել", ru: "строить" } },
      { word: "visit", translation: { en: "visit", hy: "այցելել", ru: "навещать" } },
      { word: "weekend", translation: { en: "weekend", hy: "հանգստյան օրեր", ru: "выходные" } }
    ],
    questions: [
      {
        question: { en: "How old is Daniel?", hy: "Քանի՞ տարեկան է Դանիելը:", ru: "Сколько лет Даниэлю?" },
        options: [
          { en: "Seven years old", hy: "Յոթ տարեկան", ru: "Семь лет" },
          { en: "Nine years old", hy: "Ինը տարեկան", ru: "Девять лет" },
          { en: "Eleven years old", hy: "Տասնմեկ տարեկան", ru: "Одиннадцать лет" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "Where does Daniel play football?", hy: "Որտե՞ղ է Դանիելը ֆուտբոլ խաղում:", ru: "Где Даниэль играет в футбол?" },
        options: [
          { en: "At school", hy: "Դպրոցում", ru: "В школе" },
          { en: "In the park", hy: "Այգում", ru: "В парке" },
          { en: "At home", hy: "Տանը", ru: "Дома" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Daniel like drawing?", hy: "Ի՞նչ է սիրում նկարել Դանիելը:", ru: "Что Даниэль любит рисовать?" },
        options: [
          { en: "Only cars", hy: "Միայն մեքենաներ", ru: "Только машины" },
          { en: "Animals, houses, trees and funny characters", hy: "Կենդանիներ, տներ, ծառեր և զվարճալի կերպարներ", ru: "Животных, дома, деревья и забавных персонажей" },
          { en: "Only flowers", hy: "Միայն ծաղիկներ", ru: "Только цветы" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "What does Daniel play with his sister?", hy: "Ի՞նչ է Դանիելը խաղում քրոջ հետ:", ru: "Во что Даниэль играет с сестрой?" },
        options: [
          { en: "Board games", hy: "Սեղանի խաղեր", ru: "В настольные игры" },
          { en: "Football", hy: "Ֆուտբոլ", ru: "В футбол" },
          { en: "Basketball", hy: "Բասկետբոլ", ru: "В баскетбол" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "Who does Daniel visit on weekends?", hy: "Ու՞մ է Դանիելը այցելում հանգստյան օրերին:", ru: "Кого Даниэль навещает по выходным?" },
        options: [
          { en: "His friends", hy: "Իր ընկերներին", ru: "Своих друзей" },
          { en: "His teachers", hy: "Իր ուսուցիչներին", ru: "Своих учителей" },
          { en: "His grandparents", hy: "Իր տատիկին ու պապիկին", ru: "Своих бабушку и дедушку" }
        ],
        correctIndex: 2
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about your favourite games and hobbies!", hy: "Հիմա պատմիր քո սիրելի խաղերի և զբաղմունքների մասին:", ru: "А теперь расскажи о своих любимых играх и увлечениях!" },
      questions: [
        { en: "What do you like doing in your free time?", hy: "Ի՞նչ ես սիրում անել ազատ ժամանակ:", ru: "Что ты любишь делать в свободное время?" },
        { en: "Do you like playing football?", hy: "Սիրու՞մ ես ֆուտբոլ խաղալ:", ru: "Ты любишь играть в футбол?" },
        { en: "Can you ride a bicycle?", hy: "Կարողանու՞մ ես հեծանիվ քշել:", ru: "Ты умеешь кататься на велосипеде?" },
        { en: "Do you like drawing or reading?", hy: "Սիրու՞մ ես նկարել, թե՞ կարդալ:", ru: "Ты любишь рисовать или читать?" },
        { en: "What games do you play with your friends?", hy: "Ի՞նչ խաղեր ես խաղում ընկերներիդ հետ:", ru: "В какие игры ты играешь с друзьями?" },
        { en: "What do you do on weekends?", hy: "Ի՞նչ ես անում հանգստյան օրերին:", ru: "Что ты делаешь по выходным?" }
      ]
    }
  },

    // ─── A1 ԹԵՄԱ 15. ԹՎԵՐ, ՕՐԵՐ, ԱՄԻՍՆԵՐ ԵՎ ԺԱՄԵՐ ────────────────────────
  {
    id: "time_calendar",
    level: "A1",
    topics: ["daily", "time"],
    title: { en: "Numbers, Days, Months and Time", hy: "Թվեր, օրեր, ամիսներ և ժամեր", ru: "Числа, дни, месяцы и время" },
    format: "Story",
    difficulty: 1,
    words: 130,
    minutes: 2,
    parts: 8,
    questionsCount: 6,
    paragraphs: [
      {
        en: "My name is Peter. I am nine years old.",
        hy: "Իմ անունը Փիթեր է։ Ես ինը տարեկան եմ։",
        ru: "Меня зовут Питер. Мне девять лет."
      },
      {
        en: "There are seven days in a week. Monday, Tuesday, Wednesday, Thursday, Friday, Saturday and Sunday.",
        hy: "Մեկ շաբաթում կա յոթ օր՝ երկուշաբթի, երեքշաբթի, չորեքշաբթի, հինգշաբթի, ուրբաթ, շաբաթ և կիրակի։",
        ru: "В неделе семь дней: понедельник, вторник, среда, четверг, пятница, суббота и воскресенье."
      },
      {
        en: "I go to school from Monday to Friday. On Saturday and Sunday, I do not go to school. I play with my friends and visit my grandparents.",
        hy: "Ես երկուշաբթիից ուրբաթ գնում եմ դպրոց։ Շաբաթ և կիրակի օրերին ես դպրոց չեմ գնում։ Ես խաղում եմ ընկերներիս հետ և այցելում տատիկիս ու պապիկիս։",
        ru: "С понедельника по пятницу я хожу в школу. В субботу и воскресенье я не хожу в школу. Я играю с друзьями и навещаю бабушку и дедушку."
      },
      {
        en: "There are twelve months in a year. January is the first month, and December is the last month.",
        hy: "Մեկ տարում կա տասներկու ամիս։ Հունվարը տարվա առաջին ամիսն է, իսկ դեկտեմբերը՝ վերջինը։",
        ru: "В году двенадцать месяцев. Январь — первый месяц, а декабрь — последний."
      },
      {
        en: "My birthday is in May. I like May because the weather is warm and sunny.",
        hy: "Իմ ծննդյան օրը մայիսին է։ Ես սիրում եմ մայիսը, որովհետև եղանակը տաք է և արևոտ։",
        ru: "Мой день рождения в мае. Я люблю май, потому что погода тёплая и солнечная."
      },
      {
        en: "I get up at seven o'clock every morning. I have breakfast at half past seven. School starts at nine o'clock.",
        hy: "Ես ամեն առավոտ արթնանում եմ ժամը յոթին։ Ժամը յոթն անց կեսին նախաճաշում եմ։ Դպրոցը սկսվում է ժամը իննին։",
        ru: "Каждое утро я встаю в семь часов. В половине восьмого я завтракаю. Школа начинается в девять часов."
      },
      {
        en: "I go to bed at nine o'clock in the evening.",
        hy: "Ես երեկոյան քնելու եմ գնում ժամը իննին։",
        ru: "Вечером я ложусь спать в девять часов."
      },
      {
        en: "I like learning numbers, days and months. They help me understand time!",
        hy: "Ես սիրում եմ սովորել թվեր, շաբաթվա օրեր և ամիսներ։ Դրանք օգնում են ինձ հասկանալ ժամանակը։",
        ru: "Мне нравится учить числа, дни недели и месяцы. Они помогают мне понимать время!"
      }
    ],
    vocabulary: [
      { word: "time", translation: { en: "time", hy: "ժամանակ", ru: "время" } },
      { word: "clock", translation: { en: "clock", hy: "ժամացույց", ru: "часы" } },
      { word: "hour", translation: { en: "hour", hy: "ժամ", ru: "час" } },
      { word: "minute", translation: { en: "minute", hy: "րոպե", ru: "минута" } },
      { word: "morning", translation: { en: "morning", hy: "առավոտ", ru: "утро" } },
      { word: "evening", translation: { en: "evening", hy: "երեկո", ru: "вечер" } },
      { word: "week", translation: { en: "week", hy: "շաբաթ", ru: "неделя" } },
      { word: "month", translation: { en: "month", hy: "ամիս", ru: "месяц" } },
      { word: "year", translation: { en: "year", hy: "տարի", ru: "год" } },
      { word: "birthday", translation: { en: "birthday", hy: "ծննդյան օր", ru: "день рождения" } },
      { word: "Monday", translation: { en: "Monday", hy: "երկուշաբթի", ru: "понедельник" } },
      { word: "January", translation: { en: "January", hy: "հունվար", ru: "январь" } },
      { word: "May", translation: { en: "May", hy: "մայիս", ru: "май" } },
      { word: "December", translation: { en: "December", hy: "դեկտեմբեր", ru: "декабрь" } }
    ],
    questions: [
      {
        question: { en: "How old is Peter?", hy: "Քանի՞ տարեկան է Փիթերը:", ru: "Сколько лет Питеру?" },
        options: [
          { en: "Eight years old", hy: "Ութ տարեկան", ru: "Восемь лет" },
          { en: "Nine years old", hy: "Ինը տարեկան", ru: "Девять лет" },
          { en: "Ten years old", hy: "Տասը տարեկան", ru: "Десять лет" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "How many days are there in a week?", hy: "Քանի՞ օր կա մեկ շաբաթում:", ru: "Сколько дней в неделе?" },
        options: [
          { en: "Five", hy: "Հինգ", ru: "Пять" },
          { en: "Six", hy: "Վեց", ru: "Шесть" },
          { en: "Seven", hy: "Յոթ", ru: "Семь" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "When does Peter go to school?", hy: "Ե՞րբ է Փիթերը գնում դպրոց:", ru: "Когда Питер ходит в школу?" },
        options: [
          { en: "From Monday to Friday", hy: "Երկուշաբթիից ուրբաթ", ru: "С понедельника по пятницу" },
          { en: "Only on Saturday", hy: "Միայն շաբաթ օրը", ru: "Только в субботу" },
          { en: "Every Sunday", hy: "Ամեն կիրակի", ru: "Каждое воскресенье" }
        ],
        correctIndex: 0
      },
      {
        question: { en: "What is the first month of the year?", hy: "Ո՞րն է տարվա առաջին ամիսը:", ru: "Какой первый месяц года?" },
        options: [
          { en: "December", hy: "Դեկտեմբեր", ru: "Декабрь" },
          { en: "January", hy: "Հունվար", ru: "Январь" },
          { en: "May", hy: "Մայիս", ru: "Май" }
        ],
        correctIndex: 1
      },
      {
        question: { en: "When is Peter's birthday?", hy: "Ե՞րբ է Փիթերի ծննդյան օրը:", ru: "Когда у Питера день рождения?" },
        options: [
          { en: "In January", hy: "Հունվարին", ru: "В январе" },
          { en: "In September", hy: "Սեպտեմբերին", ru: "В сентябре" },
          { en: "In May", hy: "Մայիսին", ru: "В мае" }
        ],
        correctIndex: 2
      },
      {
        question: { en: "What time does Peter get up?", hy: "Ժամը քանիսի՞ն է Փիթերը արթնանում:", ru: "Во сколько Питер встаёт?" },
        options: [
          { en: "At six o'clock", hy: "Ժամը վեցին", ru: "В шесть часов" },
          { en: "At seven o'clock", hy: "Ժամը յոթին", ru: "В семь часов" },
          { en: "At nine o'clock", hy: "Ժամը իննին", ru: "В девять часов" }
        ],
        correctIndex: 1
      }
    ],
    creativeTask: {
      prompt: { en: "Now tell us about your time and calendar!", hy: "Հիմա պատմիր քո ժամանակի և օրացույցի մասին:", ru: "А теперь расскажи о своём времени и календаре!" },
      questions: [
        { en: "How old are you?", hy: "Քանի՞ տարեկան ես:", ru: "Сколько тебе лет?" },
        { en: "What day is today?", hy: "Այսօր ի՞նչ օր է:", ru: "Какой сегодня день?" },
        { en: "What is your favourite day of the week?", hy: "Ո՞րն է քո սիրելի օրը շաբաթվա մեջ:", ru: "Какой твой любимый день недели?" },
        { en: "When is your birthday?", hy: "Ե՞րբ է քո ծննդյան օրը:", ru: "Когда у тебя день рождения?" },
        { en: "What month is your favourite?", hy: "Ո՞ր ամիսն է քո սիրելին:", ru: "Какой твой любимый месяц?" },
        { en: "What time do you get up?", hy: "Ժամը քանիսի՞ն ես արթնանում:", ru: "Во сколько ты встаёшь?" },
        { en: "What time do you go to bed?", hy: "Ժամը քանիսի՞ն ես քնում:", ru: "Во сколько ты ложишься спать?" }
      ]
    }
  }
];