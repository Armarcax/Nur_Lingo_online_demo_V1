// src/lib/content/alphabets.ts

export interface AlphabetLetter {
  id: string;
  order: number;
  capital: string;
  lowercase: string;
  ipa: string;
  letterName: { en: string; hy: string; ru: string };
  example: {
    word: string;
    ipa: string;
    translation: { en: string; hy: string; ru: string };
  };
}

export interface AlphabetLesson {
  id: string;
  languageCode: "en" | "hy" | "ru";
  title: { en: string; hy: string; ru: string };
  icon: string;
  color: string;
  letterCount: number;
  theory: {
    intro: { en: string; hy: string; ru: string };
    facts: Array<{ en: string; hy: string; ru: string }>;
  };
  letters: AlphabetLetter[];
}

export const ALPHABETS: AlphabetLesson[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🇬🇧 ENGLISH ALPHABET
  // ═══════════════════════════════════════════════════════════════
  {
    id: "english",
    languageCode: "en",
    title: { en: "English Alphabet", hy: "Անգլերեն Այբուբեն", ru: "Английский Алфавит" },
    icon: "🇬🇧",
    color: "from-blue-500 to-cyan-400",
    letterCount: 26,
    theory: {
      intro: {
        en: "The English alphabet has 26 letters: 5 vowels (A, E, I, O, U) and 21 consonants.",
        hy: "Անգլերեն այբուբենն ունի 26 տառ՝ 5 ձայնավոր (A, E, I, O, U) և 21 բաղաձայն:",
        ru: "В английском алфавите 26 букв: 5 гласных (A, E, I, O, U) и 21 согласная."
      },
      facts: [
        {
          en: "A letter's name is not always the same as its sound in a word. For example, A is called /eɪ/, but in 'cat' it sounds like /æ/.",
          hy: "Տառի անունը միշտ չէ, որ նույնն է, ինչ նրա հնչյունը բառի մեջ: Օրինակ՝ A-ն կոչվում է /eɪ/, բայց 'cat'-ում հնչում է /æ/:",
          ru: "Название буквы не всегда совпадает с её звуком в слове. Например, A называется /eɪ/, но в слове 'cat' звучит как /æ/."
        },
        {
          en: "Knowing the alphabet helps you spell words and use dictionaries.",
          hy: "Այբուբենն իմանալը օգնում է բառերը հեգել և օգտվել բառարաններից:",
          ru: "Знание алфавита помогает произносить слова по буквам и пользоваться словарями."
        }
      ]
    },
    letters: [
      { id: "a", order: 1, capital: "A", lowercase: "a", ipa: "[eɪ]", letterName: { en: "Ay", hy: "էյ", ru: "эй" }, example: { word: "apple", ipa: "[ˈæpl]", translation: { en: "apple", hy: "խնձոր", ru: "яблоко" } } },
      { id: "b", order: 2, capital: "B", lowercase: "b", ipa: "[biː]", letterName: { en: "Bee", hy: "բի", ru: "би" }, example: { word: "book", ipa: "[bʊk]", translation: { en: "book", hy: "գիրք", ru: "книга" } } },
      { id: "c", order: 3, capital: "C", lowercase: "c", ipa: "[siː]", letterName: { en: "See", hy: "սի", ru: "си" }, example: { word: "cat", ipa: "[kæt]", translation: { en: "cat", hy: "կատու", ru: "кошка" } } },
      { id: "d", order: 4, capital: "D", lowercase: "d", ipa: "[diː]", letterName: { en: "Dee", hy: "դի", ru: "ди" }, example: { word: "dog", ipa: "[dɒɡ]", translation: { en: "dog", hy: "շուն", ru: "собака" } } },
      { id: "e", order: 5, capital: "E", lowercase: "e", ipa: "[iː]", letterName: { en: "Ee", hy: "ի", ru: "и" }, example: { word: "egg", ipa: "[eɡ]", translation: { en: "egg", hy: "ձու", ru: "яйцо" } } },
      { id: "f", order: 6, capital: "F", lowercase: "f", ipa: "[ef]", letterName: { en: "Ef", hy: "էֆ", ru: "эф" }, example: { word: "fish", ipa: "[fɪʃ]", translation: { en: "fish", hy: "ձուկ", ru: "рыба" } } },
      { id: "g", order: 7, capital: "G", lowercase: "g", ipa: "[dʒiː]", letterName: { en: "Gee", hy: "ջի", ru: "джи" }, example: { word: "girl", ipa: "[ɡɜːl]", translation: { en: "girl", hy: "աղջիկ", ru: "девочка" } } },
      { id: "h", order: 8, capital: "H", lowercase: "h", ipa: "[eɪtʃ]", letterName: { en: "Aitch", hy: "էյչ", ru: "эйч" }, example: { word: "house", ipa: "[haʊs]", translation: { en: "house", hy: "տուն", ru: "дом" } } },
      { id: "i", order: 9, capital: "I", lowercase: "i", ipa: "[aɪ]", letterName: { en: "Eye", hy: "այ", ru: "ай" }, example: { word: "ice", ipa: "[aɪs]", translation: { en: "ice", hy: "սառույց", ru: "лёд" } } },
      { id: "j", order: 10, capital: "J", lowercase: "j", ipa: "[dʒeɪ]", letterName: { en: "Jay", hy: "ջեյ", ru: "джей" }, example: { word: "jam", ipa: "[dʒæm]", translation: { en: "jam", hy: "ջեմ", ru: "варенье" } } },
      { id: "k", order: 11, capital: "K", lowercase: "k", ipa: "[keɪ]", letterName: { en: "Kay", hy: "քեյ", ru: "кей" }, example: { word: "key", ipa: "[kiː]", translation: { en: "key", hy: "բանալի", ru: "ключ" } } },
      { id: "l", order: 12, capital: "L", lowercase: "l", ipa: "[el]", letterName: { en: "El", hy: "էլ", ru: "эл" }, example: { word: "lion", ipa: "[ˈlaɪən]", translation: { en: "lion", hy: "առյուծ", ru: "лев" } } },
      { id: "m", order: 13, capital: "M", lowercase: "m", ipa: "[em]", letterName: { en: "Em", hy: "էմ", ru: "эм" }, example: { word: "moon", ipa: "[muːn]", translation: { en: "moon", hy: "լուսին", ru: "луна" } } },
      { id: "n", order: 14, capital: "N", lowercase: "n", ipa: "[en]", letterName: { en: "En", hy: "էն", ru: "эн" }, example: { word: "nose", ipa: "[nəʊz]", translation: { en: "nose", hy: "քիթ", ru: "нос" } } },
      { id: "o", order: 15, capital: "O", lowercase: "o", ipa: "[əʊ]", letterName: { en: "Oh", hy: "օու", ru: "оу" }, example: { word: "orange", ipa: "[ˈɒrɪndʒ]", translation: { en: "orange", hy: "նարինջ", ru: "апельсин" } } },
      { id: "p", order: 16, capital: "P", lowercase: "p", ipa: "[piː]", letterName: { en: "Pee", hy: "փի", ru: "пи" }, example: { word: "pen", ipa: "[pen]", translation: { en: "pen", hy: "գրիչ", ru: "ручка" } } },
      { id: "q", order: 17, capital: "Q", lowercase: "q", ipa: "[kjuː]", letterName: { en: "Cue", hy: "քյու", ru: "кью" }, example: { word: "queen", ipa: "[kwiːn]", translation: { en: "queen", hy: "թագուհի", ru: "королева" } } },
      { id: "r", order: 18, capital: "R", lowercase: "r", ipa: "[ɑː]", letterName: { en: "Ar", hy: "ար", ru: "ар" }, example: { word: "rabbit", ipa: "[ˈræbɪt]", translation: { en: "rabbit", hy: "ճագար", ru: "кролик" } } },
      { id: "s", order: 19, capital: "S", lowercase: "s", ipa: "[es]", letterName: { en: "Ess", hy: "էս", ru: "эс" }, example: { word: "sun", ipa: "[sʌn]", translation: { en: "sun", hy: "արև", ru: "солнце" } } },
      { id: "t", order: 20, capital: "T", lowercase: "t", ipa: "[tiː]", letterName: { en: "Tee", hy: "թի", ru: "ти" }, example: { word: "tree", ipa: "[triː]", translation: { en: "tree", hy: "ծառ", ru: "дерево" } } },
      { id: "u", order: 21, capital: "U", lowercase: "u", ipa: "[juː]", letterName: { en: "You", hy: "յու", ru: "ю" }, example: { word: "umbrella", ipa: "[ʌmˈbrelə]", translation: { en: "umbrella", hy: "անձրևանոց", ru: "зонт" } } },
      { id: "v", order: 22, capital: "V", lowercase: "v", ipa: "[viː]", letterName: { en: "Vee", hy: "վի", ru: "ви" }, example: { word: "van", ipa: "[væn]", translation: { en: "van", hy: "ֆուրգոն", ru: "фургон" } } },
      { id: "w", order: 23, capital: "W", lowercase: "w", ipa: "[ˈdʌbəl.juː]", letterName: { en: "Double-U", hy: "դաբլ-յու", ru: "дабл-ю" }, example: { word: "water", ipa: "[ˈwɔːtə]", translation: { en: "water", hy: "ջուր", ru: "вода" } } },
      { id: "x", order: 24, capital: "X", lowercase: "x", ipa: "[eks]", letterName: { en: "Ex", hy: "էքս", ru: "экс" }, example: { word: "box", ipa: "[bɒks]", translation: { en: "box", hy: "տուփ", ru: "коробка" } } },
      { id: "y", order: 25, capital: "Y", lowercase: "y", ipa: "[waɪ]", letterName: { en: "Why", hy: "ուայ", ru: "уай" }, example: { word: "yellow", ipa: "[ˈjeləʊ]", translation: { en: "yellow", hy: "դեղին", ru: "жёлтый" } } },
      { id: "z", order: 26, capital: "Z", lowercase: "z", ipa: "[zed]", letterName: { en: "Zed / Zee", hy: "զեդ", ru: "зед" }, example: { word: "zebra", ipa: "[ˈzebrə]", translation: { en: "zebra", hy: "զեբրա", ru: "зебра" } } }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // 🇦🇲 ARMENIAN ALPHABET (Հայոց Այբուբեն)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "armenian",
    languageCode: "hy",
    title: { en: "Armenian Alphabet", hy: "Հայոց Այբուբեն", ru: "Армянский Алфавит" },
    icon: "🇦🇲",
    color: "from-red-500 to-orange-400",
    letterCount: 39,
    theory: {
      intro: {
        en: "The Armenian alphabet was created by Mesrop Mashtots in 405 AD. It has 39 letters: 8 vowels and 31 consonants.",
        hy: "Հայոց այբուբենը ստեղծել է Մեսրոպ Մաշտոցը 405 թվականին: Այն ունի 39 տառ՝ 8 ձայնավոր և 31 բաղաձայն:",
        ru: "Армянский алфавит был создан Месропом Маштоцем в 405 году. В нём 39 букв: 8 гласных и 31 согласная."
      },
      facts: [
        {
          en: "Each Armenian letter has a traditional name (Ayben, Ben, Gim, etc.) which is still used today when spelling words.",
          hy: "Յուրաքանչյուր հայերեն տառ ունի ավանդական անուն (Այբ, Բեն, Գիմ և այլն), որն օգտագործվում է բառերը հեգելիս:",
          ru: "Каждая армянская буква имеет традиционное название (Айб, Бен, Гим и т.д.), которое используется при произношении слов по буквам."
        },
        {
          en: "The Armenian alphabet has been used continuously for over 1600 years, almost without changes.",
          hy: "Հայոց այբուբենը շարունակաբար օգտագործվում է ավելի քան 1600 տարի՝ գրեթե առանց փոփոխությունների:",
          ru: "Армянский алфавит непрерывно используется более 1600 лет, почти без изменений."
        }
      ]
    },
    letters: [
      { id: "ayb", order: 1, capital: "Ա", lowercase: "ա", ipa: "[ɑ]", letterName: { en: "Ayb", hy: "Այբ", ru: "Айб" }, example: { word: "արև", ipa: "[ɑɾɛv]", translation: { en: "sun", hy: "արև", ru: "солнце" } } },
      { id: "ben", order: 2, capital: "Բ", lowercase: "բ", ipa: "[b]", letterName: { en: "Ben", hy: "Բեն", ru: "Бен" }, example: { word: "բանան", ipa: "[bɑnɑn]", translation: { en: "banana", hy: "բանան", ru: "банан" } } },
      { id: "gim", order: 3, capital: "Գ", lowercase: "գ", ipa: "[g]", letterName: { en: "Gim", hy: "Գիմ", ru: "Гим" }, example: { word: "գիրք", ipa: "[giɾkʰ]", translation: { en: "book", hy: "գիրք", ru: "книга" } } },
      { id: "da", order: 4, capital: "Դ", lowercase: "դ", ipa: "[d]", letterName: { en: "Da", hy: "Դա", ru: "Да" }, example: { word: "դուռ", ipa: "[dur]", translation: { en: "door", hy: "դուռ", ru: "дверь" } } },
      { id: "yech", order: 5, capital: "Ե", lowercase: "ե", ipa: "[jɛ]", letterName: { en: "Yech", hy: "Եչ", ru: "Еч" }, example: { word: "երկիր", ipa: "[jɛɾkiɾ]", translation: { en: "country", hy: "երկիր", ru: "страна" } } },
      { id: "za", order: 6, capital: "Զ", lowercase: "զ", ipa: "[z]", letterName: { en: "Za", hy: "Զա", ru: "За" }, example: { word: "զեբրա", ipa: "[zɛbɾɑ]", translation: { en: "zebra", hy: "զեբրա", ru: "зебра" } } },
      { id: "eh", order: 7, capital: "Է", lowercase: "է", ipa: "[ɛ]", letterName: { en: "Eh", hy: "Է", ru: "Э" }, example: { word: "էջ", ipa: "[ɛdʒ]", translation: { en: "page", hy: "էջ", ru: "страница" } } },
      { id: "yht", order: 8, capital: "Ը", lowercase: "ը", ipa: "[ə]", letterName: { en: "Yht", hy: "Ըթ", ru: "Ыт" }, example: { word: "ընկեր", ipa: "[ənkɛɾ]", translation: { en: "friend", hy: "ընկեր", ru: "друг" } } },
      { id: "to", order: 9, capital: "Թ", lowercase: "թ", ipa: "[tʰ]", letterName: { en: "To", hy: "Թո", ru: "То" }, example: { word: "թռչուն", ipa: "[tʰərtʃʰun]", translation: { en: "bird", hy: "թռչուն", ru: "птица" } } },
      { id: "zhe", order: 10, capital: "Ժ", lowercase: "ժ", ipa: "[ʒ]", letterName: { en: "Zhe", hy: "Ժե", ru: "Же" }, example: { word: "ժամ", ipa: "[ʒɑm]", translation: { en: "hour", hy: "ժամ", ru: "час" } } },
      { id: "ini", order: 11, capital: "Ի", lowercase: "ի", ipa: "[i]", letterName: { en: "Ini", hy: "Ինի", ru: "Ини" }, example: { word: "իմաստ", ipa: "[imɑst]", translation: { en: "meaning", hy: "իմաստ", ru: "смысл" } } },
      { id: "lyun", order: 12, capital: "Լ", lowercase: "լ", ipa: "[l]", letterName: { en: "Lyun", hy: "Լյուն", ru: "Люн" }, example: { word: "լույս", ipa: "[lujs]", translation: { en: "light", hy: "լույս", ru: "свет" } } },
      { id: "khe", order: 13, capital: "Խ", lowercase: "խ", ipa: "[χ]", letterName: { en: "Khe", hy: "Խե", ru: "Хе" }, example: { word: "խնձոր", ipa: "[χəndzoɾ]", translation: { en: "apple", hy: "խնձոր", ru: "яблоко" } } },
      { id: "tsa", order: 14, capital: "Ծ", lowercase: "ծ", ipa: "[ts]", letterName: { en: "Tsa", hy: "Ծա", ru: "Ца" }, example: { word: "ծառ", ipa: "[tsɑr]", translation: { en: "tree", hy: "ծառ", ru: "дерево" } } },
      { id: "ken", order: 15, capital: "Կ", lowercase: "կ", ipa: "[k]", letterName: { en: "Ken", hy: "Կեն", ru: "Кен" }, example: { word: "կատու", ipa: "[kɑtu]", translation: { en: "cat", hy: "կատու", ru: "кошка" } } },
      { id: "ho", order: 16, capital: "Հ", lowercase: "հ", ipa: "[h]", letterName: { en: "Ho", hy: "Հո", ru: "Хо" }, example: { word: "հայր", ipa: "[hɑjɾ]", translation: { en: "father", hy: "հայր", ru: "отец" } } },
      { id: "dza", order: 17, capital: "Ձ", lowercase: "ձ", ipa: "[dz]", letterName: { en: "Dza", hy: "Ձա", ru: "Дза" }, example: { word: "ձու", ipa: "[dzu]", translation: { en: "egg", hy: "ձու", ru: "яйцо" } } },
      { id: "ghat", order: 18, capital: "Ղ", lowercase: "ղ", ipa: "[ʁ]", letterName: { en: "Ghat", hy: "Ղատ", ru: "Гхат" }, example: { word: "ղեկ", ipa: "[ʁɛk]", translation: { en: "rudder", hy: "ղեկ", ru: "руль" } } },
      { id: "che", order: 19, capital: "Ճ", lowercase: "ճ", ipa: "[tʃ]", letterName: { en: "Che", hy: "Ճե", ru: "Че" }, example: { word: "ճանապարհ", ipa: "[tʃɑnɑpɑɾ]", translation: { en: "road", hy: "ճանապարհ", ru: "дорога" } } },
      { id: "men", order: 20, capital: "Մ", lowercase: "մ", ipa: "[m]", letterName: { en: "Men", hy: "Մեն", ru: "Мен" }, example: { word: "մայր", ipa: "[mɑjɾ]", translation: { en: "mother", hy: "մայր", ru: "мать" } } },
      { id: "yi", order: 21, capital: "Յ", lowercase: "յ", ipa: "[j]", letterName: { en: "Yi", hy: "Յի", ru: "Йи" }, example: { word: "յոթ", ipa: "[jotʰ]", translation: { en: "seven", hy: "յոթ", ru: "семь" } } },
      { id: "nu", order: 22, capital: "Ն", lowercase: "ն", ipa: "[n]", letterName: { en: "Nu", hy: "Նու", ru: "Ну" }, example: { word: "նուռ", ipa: "[nur]", translation: { en: "pomegranate", hy: "նուռ", ru: "гранат" } } },
      { id: "sha", order: 23, capital: "Շ", lowercase: "շ", ipa: "[ʃ]", letterName: { en: "Sha", hy: "Շա", ru: "Ша" }, example: { word: "շուն", ipa: "[ʃun]", translation: { en: "dog", hy: "շուն", ru: "собака" } } },
      { id: "vo", order: 24, capital: "Ո", lowercase: "ո", ipa: "[o]", letterName: { en: "Vo", hy: "Ո", ru: "Во" }, example: { word: "ոտք", ipa: "[otkʰ]", translation: { en: "foot", hy: "ոտք", ru: "нога" } } },
      { id: "cha", order: 25, capital: "Չ", lowercase: "չ", ipa: "[tʃʰ]", letterName: { en: "Cha", hy: "Չա", ru: "Ча" }, example: { word: "չորս", ipa: "[tʃʰoɾs]", translation: { en: "four", hy: "չորս", ru: "четыре" } } },
      { id: "pe", order: 26, capital: "Պ", lowercase: "պ", ipa: "[p]", letterName: { en: "Pe", hy: "Պե", ru: "Пе" }, example: { word: "պապիկ", ipa: "[pɑpik]", translation: { en: "grandfather", hy: "պապիկ", ru: "дедушка" } } },
      { id: "je", order: 27, capital: "Ջ", lowercase: "ջ", ipa: "[dʒ]", letterName: { en: "Je", hy: "Ջե", ru: "Дже" }, example: { word: "ջուր", ipa: "[dʒuɾ]", translation: { en: "water", hy: "ջուր", ru: "вода" } } },
      { id: "ra", order: 28, capital: "Ռ", lowercase: "ռ", ipa: "[r]", letterName: { en: "Ra", hy: "Ռա", ru: "Ра" }, example: { word: "ռումբ", ipa: "[rumb]", translation: { en: "bomb", hy: "ռումբ", ru: "бомба" } } },
      { id: "se", order: 29, capital: "Ս", lowercase: "ս", ipa: "[s]", letterName: { en: "Se", hy: "Սե", ru: "Се" }, example: { word: "սեր", ipa: "[sɛɾ]", translation: { en: "love", hy: "սեր", ru: "любовь" } } },
      { id: "vev", order: 30, capital: "Վ", lowercase: "վ", ipa: "[v]", letterName: { en: "Vev", hy: "Վեվ", ru: "Вев" }, example: { word: "վագր", ipa: "[vɑgɾ]", translation: { en: "tiger", hy: "վագր", ru: "тигр" } } },
      { id: "tyun", order: 31, capital: "Տ", lowercase: "տ", ipa: "[t]", letterName: { en: "Tyun", hy: "Տյուն", ru: "Тюн" }, example: { word: "տուն", ipa: "[tun]", translation: { en: "house", hy: "տուն", ru: "дом" } } },
      { id: "re", order: 32, capital: "Ր", lowercase: "ր", ipa: "[ɾ]", letterName: { en: "Re", hy: "Րե", ru: "Ре" }, example: { word: "րոպե", ipa: "[ɾopɛ]", translation: { en: "minute", hy: "րոպե", ru: "минута" } } },
      { id: "tso", order: 33, capital: "Ց", lowercase: "ց", ipa: "[tsʰ]", letterName: { en: "Tso", hy: "Ցո", ru: "Цо" }, example: { word: "ցորեն", ipa: "[tsʰoɾɛn]", translation: { en: "wheat", hy: "ցորեն", ru: "пшеница" } } },
      { id: "hyun", order: 34, capital: "Ւ", lowercase: "ւ", ipa: "[w]", letterName: { en: "Hyun", hy: "Հյուն", ru: "Хюн" }, example: { word: "անուն", ipa: "[ɑnun]", translation: { en: "name", hy: "անուն", ru: "имя" } } },
      { id: "pyur", order: 35, capital: "Փ", lowercase: "փ", ipa: "[pʰ]", letterName: { en: "Pyur", hy: "Փյուր", ru: "Пюр" }, example: { word: "փող", ipa: "[pʰoʁ]", translation: { en: "money", hy: "փող", ru: "деньги" } } },
      { id: "ke", order: 36, capital: "Ք", lowercase: "ք", ipa: "[kʰ]", letterName: { en: "Ke", hy: "Քե", ru: "Ке" }, example: { word: "քաղաք", ipa: "[kʰɑʁɑkʰ]", translation: { en: "city", hy: "քաղաք", ru: "город" } } },
      { id: "o", order: 37, capital: "Օ", lowercase: "օ", ipa: "[o]", letterName: { en: "O", hy: "Օ", ru: "О" }, example: { word: "օդ", ipa: "[od]", translation: { en: "air", hy: "օդ", ru: "воздух" } } },
      { id: "fe", order: 38, capital: "Ֆ", lowercase: "ֆ", ipa: "[f]", letterName: { en: "Fe", hy: "Ֆե", ru: "Фе" }, example: { word: "ֆիլմ", ipa: "[film]", translation: { en: "film", hy: "ֆիլմ", ru: "фильм" } } },
      { id: "yev", order: 39, capital: "և", lowercase: "և", ipa: "[jɛv]", letterName: { en: "Yev", hy: "Եվ", ru: "Ев" }, example: { word: "և", ipa: "[jɛv]", translation: { en: "and", hy: "և", ru: "и" } } }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // 🇷🇺 RUSSIAN ALPHABET (Русский Алфавит)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "russian",
    languageCode: "ru",
    title: { en: "Russian Alphabet", hy: "Ռուսերեն Այբուբեն", ru: "Русский Алфавит" },
    icon: "🇷🇺",
    color: "from-indigo-500 to-purple-500",
    letterCount: 33,
    theory: {
      intro: {
        en: "The Russian alphabet (Cyrillic) has 33 letters: 10 vowels, 21 consonants, and 2 signs (soft and hard) that don't have their own sounds.",
        hy: "Ռուսական այբուբենը (կիրիլիցա) ունի 33 տառ՝ 10 ձայնավոր, 21 բաղաձայն և 2 նշան (փափուկ և կոշտ), որոնք ինքնուրույն հնչյուն չունեն:",
        ru: "В русском алфавите 33 буквы: 10 гласных, 21 согласная и 2 знака (мягкий и твёрдый), не имеющих своего звука."
      },
      facts: [
        {
          en: "The Russian alphabet is based on the Cyrillic script, created in the 9th century.",
          hy: "Ռուսական այբուբենը հիմնված է կիրիլիցա գրի վրա, որը ստեղծվել է 9-րդ դարում:",
          ru: "Русский алфавит основан на кириллице, созданной в 9 веке."
        },
        {
          en: "Some Russian letters look like Latin ones but are pronounced differently. For example, 'Р' is 'R', and 'С' is 'S'.",
          hy: "Որոշ ռուսերեն տառեր նման են լատինականներին, բայց այլ կերպ են արտասանվում: Օրինակ՝ 'Р'-ն 'R' է, իսկ 'С'-ն՝ 'S':",
          ru: "Некоторые русские буквы похожи на латинские, но читаются иначе. Например, 'Р' — это 'R', а 'С' — это 'S'."
        }
      ]
    },
    letters: [
      { id: "a", order: 1, capital: "А", lowercase: "а", ipa: "[a]", letterName: { en: "A", hy: "Ա", ru: "А" }, example: { word: "арбуз", ipa: "[ɐrˈbus]", translation: { en: "watermelon", hy: "ձմերուկ", ru: "арбуз" } } },
      { id: "be", order: 2, capital: "Б", lowercase: "б", ipa: "[b]", letterName: { en: "Be", hy: "Բե", ru: "Бэ" }, example: { word: "банан", ipa: "[bɐˈnan]", translation: { en: "banana", hy: "բանան", ru: "банан" } } },
      { id: "ve", order: 3, capital: "В", lowercase: "в", ipa: "[v]", letterName: { en: "Ve", hy: "Վե", ru: "Вэ" }, example: { word: "вода", ipa: "[vɐˈda]", translation: { en: "water", hy: "ջուր", ru: "вода" } } },
      { id: "ge", order: 4, capital: "Г", lowercase: "г", ipa: "[g]", letterName: { en: "Ge", hy: "Գե", ru: "Гэ" }, example: { word: "город", ipa: "[ˈgorət]", translation: { en: "city", hy: "քաղաք", ru: "город" } } },
      { id: "de", order: 5, capital: "Д", lowercase: "д", ipa: "[d]", letterName: { en: "De", hy: "Դե", ru: "Дэ" }, example: { word: "дом", ipa: "[dom]", translation: { en: "house", hy: "տուն", ru: "дом" } } },
      { id: "ye", order: 6, capital: "Е", lowercase: "е", ipa: "[je]", letterName: { en: "Ye", hy: "Ե", ru: "Е" }, example: { word: "ель", ipa: "[jelʲ]", translation: { en: "spruce", hy: "եղևնի", ru: "ель" } } },
      { id: "yo", order: 7, capital: "Ё", lowercase: "ё", ipa: "[jo]", letterName: { en: "Yo", hy: "Յո", ru: "Ё" }, example: { word: "ёж", ipa: "[joʃ]", translation: { en: "hedgehog", hy: "ոզնի", ru: "ёж" } } },
      { id: "zhe", order: 8, capital: "Ж", lowercase: "ж", ipa: "[ʐ]", letterName: { en: "Zhe", hy: "Ժե", ru: "Жэ" }, example: { word: "жук", ipa: "[ʒuk]", translation: { en: "beetle", hy: "բզեզ", ru: "жук" } } },
      { id: "ze", order: 9, capital: "З", lowercase: "з", ipa: "[z]", letterName: { en: "Ze", hy: "Զե", ru: "Зэ" }, example: { word: "зима", ipa: "[zʲɪˈma]", translation: { en: "winter", hy: "ձմեռ", ru: "зима" } } },
      { id: "i", order: 10, capital: "И", lowercase: "и", ipa: "[i]", letterName: { en: "I", hy: "Ի", ru: "И" }, example: { word: "игра", ipa: "[ɪˈgra]", translation: { en: "game", hy: "խաղ", ru: "игра" } } },
      { id: "y", order: 11, capital: "Й", lowercase: "й", ipa: "[j]", letterName: { en: "Short I", hy: "Կարճ Ի", ru: "И краткое" }, example: { word: "йогурт", ipa: "[ˈjogʊrt]", translation: { en: "yogurt", hy: "յոգուրտ", ru: "йогурт" } } },
      { id: "ka", order: 12, capital: "К", lowercase: "к", ipa: "[k]", letterName: { en: "Ka", hy: "Կա", ru: "Ка" }, example: { word: "кот", ipa: "[kot]", translation: { en: "cat", hy: "կատու", ru: "кот" } } },
      { id: "el", order: 13, capital: "Л", lowercase: "л", ipa: "[l]", letterName: { en: "El", hy: "Էլ", ru: "Эль" }, example: { word: "луна", ipa: "[lʊˈna]", translation: { en: "moon", hy: "լուսին", ru: "луна" } } },
      { id: "em", order: 14, capital: "М", lowercase: "м", ipa: "[m]", letterName: { en: "Em", hy: "Էմ", ru: "Эм" }, example: { word: "мама", ipa: "[ˈmamə]", translation: { en: "mom", hy: "մայրիկ", ru: "мама" } } },
      { id: "en", order: 15, capital: "Н", lowercase: "н", ipa: "[n]", letterName: { en: "En", hy: "Էն", ru: "Эн" }, example: { word: "нос", ipa: "[nos]", translation: { en: "nose", hy: "քիթ", ru: "нос" } } },
      { id: "o", order: 16, capital: "О", lowercase: "о", ipa: "[o]", letterName: { en: "O", hy: "Օ", ru: "О" }, example: { word: "окно", ipa: "[ɐkˈno]", translation: { en: "window", hy: "պատուհան", ru: "окно" } } },
      { id: "pe", order: 17, capital: "П", lowercase: "п", ipa: "[p]", letterName: { en: "Pe", hy: "Պե", ru: "Пэ" }, example: { word: "папа", ipa: "[ˈpapə]", translation: { en: "dad", hy: "հայրիկ", ru: "папа" } } },
      { id: "er", order: 18, capital: "Р", lowercase: "р", ipa: "[r]", letterName: { en: "Er", hy: "Էր", ru: "Эр" }, example: { word: "рыба", ipa: "[ˈrɨbə]", translation: { en: "fish", hy: "ձուկ", ru: "рыба" } } },
      { id: "es", order: 19, capital: "С", lowercase: "с", ipa: "[s]", letterName: { en: "Es", hy: "Էս", ru: "Эс" }, example: { word: "солнце", ipa: "[ˈsontsə]", translation: { en: "sun", hy: "արև", ru: "солнце" } } },
      { id: "te", order: 20, capital: "Т", lowercase: "т", ipa: "[t]", letterName: { en: "Te", hy: "Թե", ru: "Тэ" }, example: { word: "тигр", ipa: "[tʲigr]", translation: { en: "tiger", hy: "վագր", ru: "тигр" } } },
      { id: "u", order: 21, capital: "У", lowercase: "у", ipa: "[u]", letterName: { en: "U", hy: "Ու", ru: "У" }, example: { word: "утро", ipa: "[ˈutrə]", translation: { en: "morning", hy: "առավոտ", ru: "утро" } } },
      { id: "ef", order: 22, capital: "Ф", lowercase: "ф", ipa: "[f]", letterName: { en: "Ef", hy: "Էֆ", ru: "Эф" }, example: { word: "фрукт", ipa: "[frukt]", translation: { en: "fruit", hy: "միրգ", ru: "фрукт" } } },
      { id: "kha", order: 23, capital: "Х", lowercase: "х", ipa: "[x]", letterName: { en: "Kha", hy: "Խա", ru: "Ха" }, example: { word: "хлеб", ipa: "[xlʲep]", translation: { en: "bread", hy: "հաց", ru: "хлеб" } } },
      { id: "tse", order: 24, capital: "Ц", lowercase: "ц", ipa: "[ts]", letterName: { en: "Tse", hy: "Ցե", ru: "Цэ" }, example: { word: "цветок", ipa: "[tsvʲɪˈtok]", translation: { en: "flower", hy: "ծաղիկ", ru: "цветок" } } },
      { id: "che", order: 25, capital: "Ч", lowercase: "ч", ipa: "[tɕ]", letterName: { en: "Che", hy: "Չե", ru: "Че" }, example: { word: "час", ipa: "[tɕas]", translation: { en: "hour", hy: "ժամ", ru: "час" } } },
      { id: "sha", order: 26, capital: "Ш", lowercase: "ш", ipa: "[ʂ]", letterName: { en: "Sha", hy: "Շա", ru: "Ша" }, example: { word: "шар", ipa: "[ʃar]", translation: { en: "ball", hy: "գնդակ", ru: "шар" } } },
      { id: "shcha", order: 27, capital: "Щ", lowercase: "щ", ipa: "[ɕː]", letterName: { en: "Shcha", hy: "Շչա", ru: "Ща" }, example: { word: "щи", ipa: "[ɕːi]", translation: { en: "cabbage soup", hy: "շչի ապուր", ru: "щи" } } },
      { id: "hardSign", order: 28, capital: "Ъ", lowercase: "ъ", ipa: "—", letterName: { en: "Hard sign", hy: "Կոշտ նշան", ru: "Твёрдый знак" }, example: { word: "объект", ipa: "[ɐbˈjekt]", translation: { en: "object", hy: "օբյեկտ", ru: "объект" } } },
      { id: "yery", order: 29, capital: "Ы", lowercase: "ы", ipa: "[ɨ]", letterName: { en: "Yery", hy: "Ը", ru: "Ы" }, example: { word: "сыр", ipa: "[sɨr]", translation: { en: "cheese", hy: "պանիր", ru: "сыр" } } },
      { id: "softSign", order: 30, capital: "Ь", lowercase: "ь", ipa: "—", letterName: { en: "Soft sign", hy: "Փափուկ նշան", ru: "Мягкий знак" }, example: { word: "соль", ipa: "[solʲ]", translation: { en: "salt", hy: "աղ", ru: "соль" } } },
      { id: "e", order: 31, capital: "Э", lowercase: "э", ipa: "[e]", letterName: { en: "E", hy: "Է", ru: "Э" }, example: { word: "это", ipa: "[ˈɛtə]", translation: { en: "this", hy: "սա", ru: "это" } } },
      { id: "yu", order: 32, capital: "Ю", lowercase: "ю", ipa: "[ju]", letterName: { en: "Yu", hy: "Յու", ru: "Ю" }, example: { word: "юг", ipa: "[juk]", translation: { en: "south", hy: "հարավ", ru: "юг" } } },
      { id: "ya", order: 33, capital: "Я", lowercase: "я", ipa: "[ja]", letterName: { en: "Ya", hy: "Յա", ru: "Я" }, example: { word: "яблоко", ipa: "[ˈjabləkə]", translation: { en: "apple", hy: "խնձոր", ru: "яблоко" } } }
    ]
  }
];