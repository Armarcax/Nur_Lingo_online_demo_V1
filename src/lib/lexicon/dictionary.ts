/**
 * NUR Lingo — Ընդլայնված Բառարան v2
 * 100+ entries: Ընտանիք, Կենցաղային, Ամենօրյա, Շրջապատ, Ուսուցում, Երկիր
 */
export type GrammarType = "noun"|"verb"|"adjective"|"adverb"|"pronoun"|"preposition"|"conjunction"|"interjection"|"numeral"|"particle";
export type SemanticCategory = "home_living"|"food_drink"|"family_relationships"|"travel_movement"|"emotions_feelings"|"time_calendar"|"colors_appearance"|"nature_environment"|"work_profession"|"education_learning"|"health_body"|"numbers_math"|"greetings_politeness"|"verbs_motion"|"verbs_communication"|"verbs_cognition"|"pronouns_core"|"adjectives_basic"|"clothing"|"weather"|"animals"|"city_transport"|"daily_routine"|"shopping"|"hobbies"|"technology";
export interface ExampleSentence { armenian:string; english:string; level:1|2|3; acceptable_variants?:string[]; }
export interface LexiconEntry { id:string; word:string; english:string[]; synonyms:string[]; antonyms?:string[]; grammar_type:GrammarType; difficulty:1|2|3|4|5; examples:ExampleSentence[]; embedding_group:SemanticCategory; lesson_tags:string[]; related_forms?:string[]; notes?:string; frequency_rank?:number; gender_note?:string; }
export interface SentencePattern { id:string; english_template:string; armenian_variants:string[]; grammar_note?:string; difficulty:1|2|3|4|5; lesson_tags:string[]; semantic_group:string; }

// ─── HELPER ─────────────────────────────────────────────────────────

function createEntry(
  word: string,
  english: string | string[],
  id: string,
  grammar_type: GrammarType = "noun",
  embedding_group: SemanticCategory = "greetings_politeness",
  lesson_tags: string[] = ["lesson_1"],
  difficulty: 1 | 2 | 3 | 4 | 5 = 1,
  examples?: ExampleSentence[],
  synonyms: string[] = [],
  related_forms?: string[],
  notes?: string,
  frequency_rank?: number,
  antonyms?: string[],
  gender_note?: string
): LexiconEntry {
  // ✅ English-ը միշտ կա
  const englishArray = Array.isArray(english) ? english : [english];
  const validEnglish = englishArray.filter(e => e && e.trim().length > 0);
  const fallbackEnglish = validEnglish.length > 0 ? validEnglish : [word];

  return {
    id,
    word,
    english: fallbackEnglish,
    synonyms,
    antonyms,
    grammar_type,
    difficulty,
    examples: examples || [{ armenian: word, english: fallbackEnglish[0], level: 1 }],
    embedding_group,
    lesson_tags,
    related_forms,
    notes,
    frequency_rank: frequency_rank || 50,
    gender_note,
  };
}

// ─── MAIN LEXICON ────────────────────────────────────────────────────

export const LEXICON: LexiconEntry[] = [
  // ===== PRONOUNS =====
  createEntry("ես", ["I", "me"], "pron_001", "pronoun", "pronouns_core", ["lesson_1"], 1,
    [{ armenian: "Ես հայ եմ", english: "I am Armenian", level: 1, acceptable_variants: ["Հայ եմ"] }],
    [], [], undefined, 1
  ),
  createEntry("դու", ["you (singular)"], "pron_002", "pronoun", "pronouns_core", ["lesson_1"], 1,
    [{ armenian: "Դու լավ ես", english: "You are fine", level: 1 }],
    [], [], undefined, 3
  ),
  createEntry("նա", ["he", "she", "it"], "pron_003", "pronoun", "pronouns_core", ["lesson_1"], 1,
    [{ armenian: "Նա գնում է", english: "He/She is going", level: 1 }],
    [], [], "Հայերենում երրորդ դեմքում սեռ չկա", 5
  ),
  createEntry("մենք", ["we"], "pron_004", "pronoun", "pronouns_core", ["lesson_1"], 1,
    [{ armenian: "Մենք հայ ենք", english: "We are Armenian", level: 1 }],
    [], [], undefined, 8
  ),
  createEntry("դուք", ["you (plural/formal)"], "pron_005", "pronoun", "pronouns_core", ["lesson_1"], 1,
    [{ armenian: "Դուք հայ եք", english: "You are Armenian (pl.)", level: 1 }],
    [], [], undefined, 10
  ),
  createEntry("նրանք", ["they"], "pron_006", "pronoun", "pronouns_core", ["lesson_1"], 1,
    [{ armenian: "Նրանք Երևանում են", english: "They are in Yerevan", level: 1 }],
    [], [], undefined, 9
  ),

  // ===== FAMILY =====
  createEntry("մայր", ["mother"], "fam_001", "noun", "family_relationships", ["lesson_4"], 1,
    [{ armenian: "Մայրս բժշկուհի է", english: "My mother is a doctor", level: 1, acceptable_variants: ["Իմ մայրը բժիշկ է", "Մայրիկս բժշկուհի է", "Մայրս բժիշկ է"] }],
    ["մամա", "մայրիկ"], ["մոր", "մայրս", "մայրիկս"], "մայրս = իմ մայրը", 18
  ),
  createEntry("հայր", ["father"], "fam_002", "noun", "family_relationships", ["lesson_4"], 1,
    [{ armenian: "Հայրս ուսուցիչ է", english: "My father is a teacher", level: 1, acceptable_variants: ["Իմ հայրը ուսուցիչ է"] }],
    ["բաբա", "հայրիկ"], ["հոր", "հայրս", "հայրիկիս"], "հայրս = իմ հայրը", 19
  ),
  createEntry("մայրիկ", ["mom", "mommy"], "fam_003", "noun", "family_relationships", ["lesson_4"], 1,
    [{ armenian: "Մայրիկս շատ լավ է", english: "My mom is very kind", level: 1 }],
    ["մայր", "մամա"], ["մայրիկիս", "մայրիկս"], undefined, 22
  ),
  createEntry("հայրիկ", ["dad", "daddy"], "fam_004", "noun", "family_relationships", ["lesson_4"], 1,
    [{ armenian: "Հայրիկս տուն եկավ", english: "My dad came home", level: 1 }],
    ["հայր", "բաբա"], ["հայրիկս"], undefined, 23
  ),
  createEntry("քույր", ["sister"], "fam_005", "noun", "family_relationships", ["lesson_4"], 1,
    [{ armenian: "Քույրս ուսանող է", english: "My sister is a student", level: 1 }],
    [], ["քրոջ", "քույրս"], undefined, 30
  ),
  createEntry("եղբայր", ["brother"], "fam_006", "noun", "family_relationships", ["lesson_4"], 1,
    [{ armenian: "Եղբայրս Երևանում է", english: "My brother is in Yerevan", level: 1 }],
    [], ["եղբոր", "եղբայրս"], undefined, 31
  ),
  createEntry("պապիկ", ["grandfather", "grandpa"], "fam_007", "noun", "family_relationships", ["lesson_4"], 1,
    [{ armenian: "Պապիկս 70 տարեկան է", english: "My grandfather is 70 years old", level: 2 }],
    [], [], undefined, 35
  ),
  createEntry("տատիկ", ["grandmother", "grandma"], "fam_008", "noun", "family_relationships", ["lesson_4"], 1,
    [{ armenian: "Տատիկս հաց է թխում", english: "My grandma is baking bread", level: 2 }],
    [], [], undefined, 36
  ),
  createEntry("երեխա", ["child", "kid"], "fam_009", "noun", "family_relationships", ["lesson_4"], 1,
    [{ armenian: "Երեխան փոքր է", english: "The child is small", level: 1 }],
    [], [], undefined, 28
  ),
  createEntry("ընկեր", ["friend"], "fam_010", "noun", "family_relationships", ["lesson_4"], 1,
    [{ armenian: "Ընկերս լավ մարդ է", english: "My friend is a good person", level: 1, acceptable_variants: ["Իմ ընկերը լավ մարդ է"] }],
    ["բարեկամ"], ["ընկերոջ", "ընկերս"], undefined, 22
  ),
  createEntry("ամուսին", ["husband"], "fam_011", "noun", "family_relationships", ["lesson_6"], 2,
    [{ armenian: "Ամուսինս Երևանում է աշխատում", english: "My husband works in Yerevan", level: 2 }],
    [], [], undefined, 45
  ),
  createEntry("կին", ["wife"], "fam_012", "noun", "family_relationships", ["lesson_6"], 2,
    [{ armenian: "Կինս նկարիչ է", english: "My wife is an artist", level: 2 }],
    [], [], undefined, 46
  ),

  // ===== HOME =====
  createEntry("տուն", ["home", "house"], "home_001", "noun", "home_living", ["lesson_2"], 1,
    [{ armenian: "Ես գնում եմ տուն", english: "I am going home", level: 1, acceptable_variants: ["Ես տուն եմ գնում", "Տուն եմ գնում"] }],
    ["բնակարան"], ["տան", "տնից", "տներ"], undefined, 12
  ),
  createEntry("սենյակ", ["room", "bedroom"], "home_002", "noun", "home_living", ["lesson_2"], 1,
    [{ armenian: "Իմ սենյակում եմ", english: "I am in my room", level: 1 }],
    [], ["սենյակի", "սենյակում"], undefined, 38
  ),
  createEntry("խոհանոց", ["kitchen"], "home_003", "noun", "home_living", ["lesson_2"], 1,
    [{ armenian: "Մայրս խոհանոցում է", english: "My mom is in the kitchen", level: 1 }],
    [], [], undefined, 42
  ),
  createEntry("դուռ", ["door"], "home_004", "noun", "home_living", ["lesson_2"], 1,
    [{ armenian: "Դուռը բաց է", english: "The door is open", level: 1 }],
    [], [], undefined, 33
  ),
  createEntry("պատուհան", ["window"], "home_005", "noun", "home_living", ["lesson_2"], 1,
    [{ armenian: "Պատուհանը փակ է", english: "The window is closed", level: 1 }],
    [], [], undefined, 37
  ),
  createEntry("մահճակալ", ["bed"], "home_006", "noun", "home_living", ["lesson_2"], 1,
    [{ armenian: "Ես քնում եմ մահճակալին", english: "I am sleeping in bed", level: 1 }],
    [], [], undefined, 40
  ),
  createEntry("սեղան", ["table", "desk"], "home_007", "noun", "home_living", ["lesson_2"], 1,
    [{ armenian: "Գիրքը սեղանին է", english: "The book is on the table", level: 1 }],
    [], [], undefined, 36
  ),
  createEntry("աթոռ", ["chair"], "home_008", "noun", "home_living", ["lesson_2"], 1,
    [{ armenian: "Նստիր աթոռին", english: "Sit on the chair", level: 1 }],
    [], [], undefined, 39
  ),
  createEntry("հեռուստացույց", ["TV", "television"], "home_009", "noun", "home_living", ["lesson_2"], 1,
    [{ armenian: "Հեռուստացույց ենք նայում", english: "We are watching TV", level: 1 }],
    ["տելեվիզոր"], [], undefined, 30
  ),

  // ===== FOOD =====
  createEntry("ջուր", ["water"], "food_001", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Ես ջուր եմ խմում", english: "I am drinking water", level: 1 }],
    [], ["ջրի", "ջրից"], undefined, 15
  ),
  createEntry("հաց", ["bread", "food"], "food_002", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Ես հաց եմ ուտում", english: "I am eating bread", level: 1 }],
    ["կերակուր"], [], undefined, 20
  ),
  createEntry("կաթ", ["milk"], "food_003", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Երեխան կաթ է խմում", english: "The child is drinking milk", level: 1 }],
    [], [], undefined, 32
  ),
  createEntry("ձու", ["egg", "eggs"], "food_004", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Առավոտյան ձու ենք ուտում", english: "We eat eggs in the morning", level: 1 }],
    [], [], undefined, 35
  ),
  createEntry("միս", ["meat"], "food_005", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Խորովածը միս է", english: "Խորոված is meat", level: 1 }],
    [], [], undefined, 38
  ),
  createEntry("մածուն", ["yogurt (Armenian մածուն)"], "food_006", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Մածունը համով է", english: "Մածուն is tasty", level: 1 }],
    ["բան"], [], "Traditional Armenian yogurt — cultural staple", 40
  ),
  createEntry("միրգ", ["fruit"], "food_007", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Ես միրգ եմ սիրում", english: "I love fruit", level: 1 }],
    [], [], undefined, 36
  ),
  createEntry("բանջարեղեն", ["vegetable"], "food_008", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Բանջարեղենը առողջարար է", english: "Vegetables are healthy", level: 1 }],
    [], [], undefined, 37
  ),
  createEntry("սուրջ", ["coffee"], "food_009", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Ես հայկական սուրջ եմ խմում", english: "I drink Armenian coffee", level: 1 }],
    [], [], "Armenian coffee culture is central to daily life", 25
  ),
  createEntry("թեյ", ["tea"], "food_010", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Ես թեյ եմ խմում", english: "I am drinking tea", level: 1 }],
    [], [], undefined, 26
  ),
  createEntry("համով", ["tasty", "delicious"], "food_011", "adjective", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Խորովածը շատ համով է", english: "The barbecue is very tasty", level: 1 }],
    [], [], undefined, 30
  ),
  createEntry("նուռ", ["pomegranate"], "food_012", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Նուռը Հայաստանի խորհրդանիշն է", english: "The pomegranate is the symbol of Armenia", level: 2 }],
    [], [], "NUR Lingo mascot named after pomegranate — Armenia's national symbol", 44
  ),
  createEntry("ծիրան", ["apricot"], "food_013", "noun", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Հայաստանը ծիրանով է հայտնի", english: "Armenia is famous for its apricots", level: 2 }],
    [], [], "Armenia is historically the birthplace of the apricot", 45
  ),

  // ===== DAILY ROUTINE =====
  createEntry("առավոտ", ["morning"], "daily_001", "noun", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Բարի առավոտ", english: "Good morning", level: 1, acceptable_variants: ["Բարի լույս"] }],
    ["այգ"], [], undefined, 20
  ),
  createEntry("կեսօր", ["afternoon", "noon"], "daily_002", "noun", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Բարի կեսօր", english: "Good afternoon", level: 1 }],
    [], [], undefined, 25
  ),
  createEntry("երեկո", ["evening"], "daily_003", "noun", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Բարի երեկո", english: "Good evening", level: 1 }],
    [], [], undefined, 22
  ),
  createEntry("գիշեր", ["night"], "daily_004", "noun", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Բարի գիշեր", english: "Good night", level: 1 }],
    [], [], undefined, 23
  ),
  createEntry("օր", ["day"], "daily_005", "noun", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Այսօր լավ օր է", english: "Today is a good day", level: 1 }],
    [], ["օրվա", "օրից", "օրեր"], undefined, 14
  ),
  createEntry("այսօր", ["today"], "daily_006", "adverb", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Այսօր արև կա", english: "It is sunny today", level: 1 }],
    [], [], undefined, 13
  ),
  createEntry("վաղը", ["tomorrow"], "daily_007", "adverb", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Վաղը դպրոց եմ գնում", english: "I am going to school tomorrow", level: 1 }],
    [], [], undefined, 16
  ),
  createEntry("երեկ", ["yesterday"], "daily_008", "adverb", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Երեկ տանն էի", english: "I was at home yesterday", level: 1 }],
    [], [], undefined, 17
  ),
  createEntry("զարթնել", ["to wake up"], "daily_009", "verb", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Ես վաղ եմ զարթնում", english: "I wake up early", level: 1 }],
    [], ["զարթնում եմ", "զարթնեցի"], undefined, 35
  ),
  createEntry("քնել", ["to sleep"], "daily_010", "verb", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Ես ուզում եմ քնել", english: "I want to sleep", level: 1 }],
    [], ["քնում եմ", "քնեցի"], undefined, 33
  ),
  createEntry("լվացվել", ["to wash", "to bathe"], "daily_011", "verb", "daily_routine", ["lesson_6"], 1,
    [{ armenian: "Առավոտյան լվացվում եմ", english: "I wash up in the morning", level: 1 }],
    [], ["լվացվում եմ"], undefined, 40
  ),
  createEntry("աշխատել", ["to work"], "daily_012", "verb", "work_profession", ["lesson_7"], 1,
    [{ armenian: "Ես աշխատում եմ Երևանում", english: "I work in Yerevan", level: 1 }],
    [], ["աշխատում եմ", "աշխատեցի"], undefined, 14
  ),

  // ===== CORE VERBS =====
  createEntry("գնալ", ["to go", "to leave"], "verb_001", "verb", "verbs_motion", ["lesson_2"], 1,
    [{ armenian: "Ես գնում եմ տուն", english: "I am going home", level: 1, acceptable_variants: ["Ես տուն եմ գնում", "Տուն եմ գնում"] }],
    ["մեկնել"], ["գնում եմ", "գնում ես", "գնում է", "գնացի", "գնաց", "կգնամ"], undefined, 7
  ),
  createEntry("գալ", ["to come"], "verb_002", "verb", "verbs_motion", ["lesson_2"], 1,
    [{ armenian: "Ես գալիս եմ", english: "I am coming", level: 1 }],
    [], ["գալիս եմ", "եկա", "եկավ", "կգամ"], undefined, 9
  ),
  createEntry("լինել", ["to be", "to exist", "to become"], "verb_003", "verb", "verbs_cognition", ["lesson_1"], 1,
    [
      { armenian: "Ես ուսանող եմ", english: "I am a student", level: 1 },
      { armenian: "Մայրս բժշկուհի է", english: "My mother is a doctor", level: 1 }
    ],
    [], ["եմ", "ես", "է", "ենք", "եք", "են", "էի", "էր", "եղա", "եղավ", "կլինեմ"], undefined, 2
  ),
  createEntry("ուտել", ["to eat"], "verb_004", "verb", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Ես հաց եմ ուտում", english: "I am eating bread", level: 1, acceptable_variants: ["Ես ուտում եմ հաց", "Հաց եմ ուտում"] }],
    [], ["ուտում եմ", "ուտում ես", "ուտում է", "կերա", "կերավ"], undefined, 28
  ),
  createEntry("խմել", ["to drink"], "verb_005", "verb", "food_drink", ["lesson_3"], 1,
    [{ armenian: "Ես սուրջ եմ խմում", english: "I am drinking coffee", level: 1 }],
    [], ["խմում եմ", "խմում է", "խմեցի"], undefined, 29
  ),
  createEntry("խոսել", ["to speak", "to talk"], "verb_006", "verb", "verbs_communication", ["lesson_2"], 1,
    [{ armenian: "Ես հայերեն եմ խոսում", english: "I speak Armenian", level: 1 }],
    ["ասել"], ["խոսում եմ", "խոսում ես", "խոսում է", "խոսեցի"], undefined, 20
  ),
  createEntry("սիրել", ["to love", "to like"], "verb_007", "verb", "emotions_feelings", ["lesson_4"], 1,
    [{ armenian: "Ես սիրում եմ Հայաստանը", english: "I love Armenia", level: 1, acceptable_variants: ["Հայաստանը սիրում եմ"] }],
    ["հավանել"], ["սիրում եմ", "սիրում ես", "սիրում է", "սիրեցի"], undefined, 16
  ),
  createEntry("կարդալ", ["to read"], "verb_008", "verb", "education_learning", ["lesson_5"], 1,
    [{ armenian: "Ես գիրք եմ կարդում", english: "I am reading a book", level: 1, acceptable_variants: ["Ես կարդում եմ գիրք", "Գիրք եմ կարդում"] }],
    [], ["կարդում եմ", "կարդում ես", "կարդացի"], undefined, 35
  ),
  createEntry("գրել", ["to write"], "verb_009", "verb", "education_learning", ["lesson_5"], 1,
    [{ armenian: "Ես նամակ եմ գրում", english: "I am writing a letter", level: 1 }],
    [], ["գրում եմ", "գրում ես", "գրեցի"], undefined, 32
  ),
  createEntry("ուզել", ["to want", "to wish"], "verb_010", "verb", "emotions_feelings", ["lesson_3"], 1,
    [{ armenian: "Ես ջուր եմ ուզում", english: "I want water", level: 1, acceptable_variants: ["Ջուր եմ ուզում"] }],
    ["ցանկանալ"], ["ուզում եմ", "ուզում ես", "ուզեցի"], undefined, 13
  ),
  createEntry("ապրել", ["to live", "to reside"], "verb_011", "verb", "home_living", ["lesson_2"], 1,
    [{ armenian: "Ես Երևանում եմ ապրում", english: "I live in Yerevan", level: 1, acceptable_variants: ["Ես ապրում եմ Երևանում", "Երևանում եմ ապրում"] }],
    ["բնակվել"], ["ապրում եմ", "ապրում ես", "ապրում է", "ապրեցի"], undefined, 21
  ),
  createEntry("հասկանալ", ["to understand"], "verb_012", "verb", "verbs_cognition", ["lesson_1"], 1,
    [{ armenian: "Ես հասկանում եմ", english: "I understand", level: 1, acceptable_variants: ["Հասկանում եմ"] }],
    [], ["հասկանում եմ", "հասկանում ես", "հասկացա"], undefined, 15
  ),
  createEntry("սովորել", ["to learn", "to study"], "verb_013", "verb", "education_learning", ["lesson_5"], 1,
    [{ armenian: "Ես հայերեն եմ սովորում", english: "I am learning Armenian", level: 1 }],
    [], ["սովորում եմ", "սովորում ես", "սովորեցի"], undefined, 20
  ),
  createEntry("տալ", ["to give"], "verb_014", "verb", "verbs_communication", ["lesson_5"], 1,
    [{ armenian: "Ինձ ջուր տուր", english: "Give me water", level: 2 }],
    [], ["տալիս եմ", "տալիս ես", "տվեցի", "տվեց"], undefined, 18
  ),
  createEntry("տեսնել", ["to see", "to look", "to watch"], "verb_015", "verb", "verbs_cognition", ["lesson_2"], 1,
    [{ armenian: "Ես հեռուստացույց եմ նայում", english: "I am watching TV", level: 1 }],
    ["նայել"], ["տեսնում եմ", "տեսնում ես", "տեսա", "կտեսնեմ"], undefined, 17
  ),

  // ===== ADJECTIVES =====
  createEntry("մեծ", ["big", "large", "great", "old"], "adj_001", "adjective", "adjectives_basic", ["lesson_2"], 1,
    [{ armenian: "Տունը մեծ է", english: "The house is big", level: 1 }],
    ["խոշոր"], [], undefined, 11, ["փոքր"]
  ),
  createEntry("փոքր", ["small", "little", "young"], "adj_002", "adjective", "adjectives_basic", ["lesson_2"], 1,
    [{ armenian: "Երեխան փոքր է", english: "The child is small", level: 1 }],
    [], [], undefined, 17, ["մեծ"]
  ),
  createEntry("լավ", ["good", "well", "fine"], "adj_003", "adjective", "adjectives_basic", ["lesson_1"], 1,
    [{ armenian: "Շատ լավ է", english: "Very good", level: 1 }],
    ["բարի", "հիանալի"], [], undefined, 6, ["վատ"]
  ),
  createEntry("վատ", ["bad", "poor", "wrong"], "adj_004", "adjective", "adjectives_basic", ["lesson_2"], 1,
    [{ armenian: "Վատ է", english: "It is bad", level: 1 }],
    [], [], undefined, 19, ["լավ"]
  ),
  createEntry("նոր", ["new"], "adj_005", "adjective", "adjectives_basic", ["lesson_2"], 1,
    [{ armenian: "Սա նոր գիրք է", english: "This is a new book", level: 1 }],
    [], [], undefined, 23, ["հին"]
  ),
  createEntry("հին", ["old", "ancient"], "adj_006", "adjective", "adjectives_basic", ["lesson_2"], 1,
    [{ armenian: "Հին քաղաքը գեղեցիկ է", english: "The old city is beautiful", level: 2 }],
    [], [], undefined, 24, ["նոր"]
  ),
  createEntry("շատ", ["very", "much", "many", "a lot"], "adj_007", "adverb", "adjectives_basic", ["lesson_1"], 1,
    [{ armenian: "Շատ եմ սիրում", english: "I love it very much", level: 1 }],
    [], [], undefined, 7
  ),
  createEntry("գեղեցիկ", ["beautiful", "gorgeous", "lovely"], "adj_008", "adjective", "adjectives_basic", ["lesson_2"], 1,
    [{ armenian: "Հայաստանը գեղեցիկ է", english: "Armenia is beautiful", level: 1 }],
    [], [], undefined, 22
  ),
  createEntry("առողջ", ["healthy"], "adj_009", "adjective", "health_body", ["lesson_5"], 1,
    [{ armenian: "Ձուկն առողջարար է", english: "Fish is healthy", level: 1 }],
    [], [], undefined, 35
  ),

  // ===== EDUCATION =====
  createEntry("դպրոց", ["school"], "edu_001", "noun", "education_learning", ["lesson_5"], 1,
    [{ armenian: "Ես դպրոց եմ գնում", english: "I am going to school", level: 1, acceptable_variants: ["Դպրոց եմ գնում"] }],
    [], ["դպրոցում", "դպրոցից"], undefined, 25
  ),
  createEntry("գիրք", ["book"], "edu_002", "noun", "education_learning", ["lesson_5"], 1,
    [{ armenian: "Ես գիրք եմ կարդում", english: "I am reading a book", level: 1 }],
    [], ["գրքի", "գրքից", "գրքով", "գրքում", "գրքեր"], undefined, 30
  ),
  createEntry("ուսանող", ["student (university)"], "edu_003", "noun", "education_learning", ["lesson_5"], 1,
    [{ armenian: "Ես ուսանող եմ", english: "I am a student", level: 1 }],
    ["աշակերտ"], [], undefined, 28
  ),
  createEntry("աշակերտ", ["student (school)", "pupil"], "edu_004", "noun", "education_learning", ["lesson_5"], 1,
    [{ armenian: "Աշակերտները լավ են սովորում", english: "The students are studying well", level: 1 }],
    ["ուսանող"], [], undefined, 29
  ),

  // ===== PROFESSIONS =====
  createEntry("բժիշկ", ["doctor (male/general)"], "prof_001", "noun", "work_profession", ["lesson_8"], 2,
    [{ armenian: "Բժիշկը եկավ", english: "The doctor came", level: 1 }],
    [], [], undefined, 45, undefined, "masculine/general"
  ),
  createEntry("բժշկուհի", ["female doctor"], "prof_002", "noun", "work_profession", ["lesson_8"], 2,
    [{ armenian: "Մայրս բժշկուհի է", english: "My mother is a doctor", level: 1, acceptable_variants: ["Մայրս բժիշկ է", "Իմ մայրը բժշկուհի է"] }],
    ["բժիշկ"], [], "More natural when referring to female doctor", 46, undefined, "feminine"
  ),
  createEntry("ուսուցիչ", ["teacher (male/general)"], "prof_003", "noun", "education_learning", ["lesson_5"], 1,
    [{ armenian: "Հայրս ուսուցիչ է", english: "My father is a teacher", level: 1 }],
    [], [], undefined, 35, undefined, "masculine/general"
  ),
  createEntry("ուսուցչուհի", ["female teacher"], "prof_004", "noun", "education_learning", ["lesson_5"], 2,
    [{ armenian: "Մայրս ուսուցչուհի է", english: "My mother is a teacher", level: 1 }],
    ["ուսուցիչ"], [], undefined, 36, undefined, "feminine"
  ),

  // ===== CITY =====
  createEntry("Հայաստան", ["Armenia"], "city_001", "noun", "nature_environment", ["lesson_1"], 1,
    [{ armenian: "Ես սիրում եմ Հայաստանը", english: "I love Armenia", level: 1 }],
    [], ["Հայաստանի", "Հայաստանից", "Հայաստանում"], undefined, 10
  ),
  createEntry("Երևան", ["Yerevan"], "city_002", "noun", "city_transport", ["lesson_1"], 1,
    [{ armenian: "Ես ապրում եմ Երևանում", english: "I live in Yerevan", level: 1 }],
    [], ["Երևանի", "Երևանից", "Երևանում"], undefined, 11
  ),
  createEntry("փողոց", ["street", "road"], "city_003", "noun", "city_transport", ["lesson_7"], 1,
    [{ armenian: "Փողոցը մեծ է", english: "The street is big", level: 1 }],
    [], [], undefined, 28
  ),
  createEntry("խանութ", ["store", "shop"], "city_004", "noun", "shopping", ["lesson_7"], 1,
    [{ armenian: "Խանութ եմ գնում", english: "I am going to the store", level: 1 }],
    [], [], undefined, 30
  ),
  createEntry("գին", ["price"], "city_005", "noun", "shopping", ["lesson_7"], 1,
    [{ armenian: "Ի՞նչ արժե", english: "How much does it cost?", level: 1 }],
    [], [], undefined, 35
  ),
  createEntry("շուկա", ["market", "bazaar"], "city_006", "noun", "shopping", ["lesson_7"], 1,
    [{ armenian: "Շուկա եմ գնում", english: "I am going to the market", level: 1 }],
    [], [], undefined, 32
  ),
  createEntry("ավտոբուս", ["bus"], "city_007", "noun", "city_transport", ["lesson_7"], 1,
    [{ armenian: "Ավտոբուսով եմ գնում", english: "I am going by bus", level: 1 }],
    [], [], undefined, 33
  ),
  createEntry("մետրո", ["subway", "metro"], "city_008", "noun", "city_transport", ["lesson_7"], 1,
    [{ armenian: "Երևանը մետրո ունի", english: "Yerevan has a metro", level: 1 }],
    [], [], undefined, 36
  ),
  createEntry("այգի", ["park"], "city_009", "noun", "nature_environment", ["lesson_7"], 1,
    [{ armenian: "Այգի ենք գնում", english: "We are going to the park", level: 1 }],
    [], [], undefined, 38
  ),

  // ===== NATURE =====
  createEntry("արև", ["sun"], "nat_001", "noun", "nature_environment", ["lesson_8"], 1,
    [{ armenian: "Արևը փայլում է", english: "The sun is shining", level: 1 }],
    [], [], undefined, 28
  ),
  createEntry("անձրև", ["rain"], "nat_002", "noun", "weather", ["lesson_8"], 1,
    [{ armenian: "Անձրև է գալիս", english: "It is raining", level: 1 }],
    [], [], undefined, 30
  ),
  createEntry("ծով", ["lake", "sea"], "nat_003", "noun", "nature_environment", ["lesson_8"], 1,
    [{ armenian: "Սևանա լիճը գեղեցիկ է", english: "Lake Sevan is beautiful", level: 1 }],
    [], [], "Sevan is the famous Armenian lake", 35
  ),
  createEntry("լեռ", ["mountain"], "nat_004", "noun", "nature_environment", ["lesson_8"], 1,
    [{ armenian: "Արարատ լեռը շատ մեծ է", english: "Mount Ararat is very big", level: 1 }],
    [], [], "Aragats and Ararat are iconic Armenian mountains", 32
  ),
  createEntry("ծառ", ["tree"], "nat_005", "noun", "nature_environment", ["lesson_8"], 1,
    [{ armenian: "Ծառը մեծ է", english: "The tree is big", level: 1 }],
    [], [], undefined, 38
  ),
  createEntry("ծաղիկ", ["flower"], "nat_006", "noun", "nature_environment", ["lesson_8"], 1,
    [{ armenian: "Ծաղիկը գեղեցիկ է", english: "The flower is beautiful", level: 1 }],
    [], [], undefined, 40
  ),
  createEntry("երկինք", ["sky"], "nat_007", "noun", "nature_environment", ["lesson_8"], 1,
    [{ armenian: "Երկինքը կապույտ է", english: "The sky is blue", level: 1 }],
    [], [], undefined, 33
  ),
  createEntry("ձյուն", ["snow"], "nat_008", "noun", "weather", ["lesson_8"], 1,
    [{ armenian: "Ձյունը սպիտակ է", english: "The snow is white", level: 1 }],
    [], [], undefined, 42
  ),

  // ===== COLORS =====
  createEntry("կարմիր", ["red"], "col_001", "adjective", "colors_appearance", ["lesson_9"], 1,
    [{ armenian: "Կարմիր ծաղիկը գեղեցիկ է", english: "The red flower is beautiful", level: 1 }],
    [], [], "Armenian flag — top stripe", 30
  ),
  createEntry("կապույտ", ["blue"], "col_002", "adjective", "colors_appearance", ["lesson_9"], 1,
    [{ armenian: "Երկինքը կապույտ է", english: "The sky is blue", level: 1 }],
    [], [], "Armenian flag — middle stripe", 31
  ),
  createEntry("նարնջագույն", ["orange", "apricot color"], "col_003", "adjective", "colors_appearance", ["lesson_9"], 1,
    [{ armenian: "Ծիրանը նարնջագույն է", english: "The apricot is orange", level: 1 }],
    [], [], "Armenian flag — bottom stripe", 35
  ),
  createEntry("սպիտակ", ["white"], "col_004", "adjective", "colors_appearance", ["lesson_9"], 1,
    [{ armenian: "Ձյունը սպիտակ է", english: "The snow is white", level: 1 }],
    [], [], undefined, 32
  ),
  createEntry("սև", ["black"], "col_005", "adjective", "colors_appearance", ["lesson_9"], 1,
    [{ armenian: "Գիշերը սև է", english: "The night is black", level: 1 }],
    [], [], undefined, 33
  ),
  createEntry("կանաչ", ["green"], "col_006", "adjective", "colors_appearance", ["lesson_9"], 1,
    [{ armenian: "Խոտը կանաչ է", english: "The grass is green", level: 1 }],
    [], [], undefined, 36
  ),
  createEntry("դեղին", ["yellow"], "col_007", "adjective", "colors_appearance", ["lesson_9"], 1,
    [{ armenian: "Արևը դեղին է", english: "The sun is yellow", level: 1 }],
    [], [], undefined, 37
  ),

  // ===== NUMBERS =====
  createEntry("մեկ", ["one", "1"], "num_001", "numeral", "numbers_math", ["lesson_9"], 1,
    [{ armenian: "Մեկ հաց", english: "One bread", level: 1 }],
    [], [], undefined, 20
  ),
  createEntry("երկու", ["two", "2"], "num_002", "numeral", "numbers_math", ["lesson_9"], 1,
    [{ armenian: "Երկու ձու", english: "Two eggs", level: 1 }],
    [], [], undefined, 21
  ),
  createEntry("երեք", ["three", "3"], "num_003", "numeral", "numbers_math", ["lesson_9"], 1,
    [{ armenian: "Երեք ծառ", english: "Three trees", level: 1 }],
    [], [], undefined, 22
  ),
  createEntry("չորս", ["four", "4"], "num_004", "numeral", "numbers_math", ["lesson_9"], 1,
    [{ armenian: "Չորս աթոռ", english: "Four chairs", level: 1 }],
    [], [], undefined, 23
  ),
  createEntry("հինգ", ["five", "5"], "num_005", "numeral", "numbers_math", ["lesson_9"], 1,
    [{ armenian: "Հինգ օր", english: "Five days", level: 1 }],
    [], [], undefined, 24
  ),
  createEntry("վեց", ["six", "6"], "num_006", "numeral", "numbers_math", ["lesson_9"], 1,
    [{ armenian: "Վեց ժամ", english: "Six hours", level: 1 }],
    [], [], undefined, 25
  ),
  createEntry("յոթ", ["seven", "7"], "num_007", "numeral", "numbers_math", ["lesson_9"], 1,
    [{ armenian: "Շաբաթը յոթ օր ունի", english: "A week has seven days", level: 1 }],
    [], [], undefined, 26
  ),
  createEntry("ութ", ["eight", "8"], "num_008", "numeral", "numbers_math", ["lesson_9"], 1,
    [{ armenian: "Ժամը ութն է", english: "It is eight o'clock", level: 1 }],
    [], [], undefined, 27
  ),
  createEntry("ինը", ["nine", "9"], "num_009", "numeral", "numbers_math", ["lesson_9"], 1,
    [{ armenian: "Ինը ամիս", english: "Nine months", level: 1 }],
    [], [], undefined, 28
  ),
  createEntry("տասը", ["ten", "10"], "num_010", "numeral", "numbers_math", ["lesson_9"], 1,
    [{ armenian: "Տասը ՀԱՅՔ", english: "Ten HAYQ", level: 1 }],
    [], [], undefined, 29
  ),

  // ===== GREETINGS =====
  createEntry("բարև", ["hello", "hi", "bye (informal)"], "greet_001", "interjection", "greetings_politeness", ["lesson_1"], 1,
    [{ armenian: "Բարև, ի՞նչ կա", english: "Hello, what's up?", level: 1 }],
    ["ողջույն"], [], undefined, 4
  ),
  createEntry("ողջույն", ["greetings", "hello (formal)"], "greet_002", "interjection", "greetings_politeness", ["lesson_1"], 1,
    [{ armenian: "Ողջույն, բարև ձեզ", english: "Greetings to you", level: 1 }],
    ["բարև"], [], undefined, 14
  ),
  createEntry("շնորհակալություն", ["thank you", "thanks"], "greet_003", "interjection", "greetings_politeness", ["lesson_1"], 1,
    [{ armenian: "Շնորհակալություն, շատ լավ է", english: "Thank you, very good", level: 1 }],
    [], [], undefined, 16
  ),
  createEntry("ներողություն", ["sorry", "excuse me"], "greet_004", "interjection", "greetings_politeness", ["lesson_1"], 1,
    [{ armenian: "Ներողություն, չհասկացա", english: "Sorry, I didn't understand", level: 1 }],
    [], [], undefined, 20
  ),
  createEntry("այո", ["yes"], "greet_005", "particle", "greetings_politeness", ["lesson_1"], 1,
    [{ armenian: "Այո, հասկացա", english: "Yes, I understand", level: 1 }],
    [], [], undefined, 5
  ),
  createEntry("ոչ", ["no"], "greet_006", "particle", "greetings_politeness", ["lesson_1"], 1,
    [{ armenian: "Ոչ, չեմ հասկանում", english: "No, I don't understand", level: 1 }],
    [], [], undefined, 6
  ),

  // ===== TECHNOLOGY =====
  createEntry("հեռախոս", ["phone", "telephone"], "tech_001", "noun", "technology", ["lesson_10"], 1,
    [{ armenian: "Իմ հեռախոսը լիցքավորված է", english: "My phone is charged", level: 1 }],
    [], [], undefined, 22
  ),
  createEntry("համակարգիչ", ["computer"], "tech_002", "noun", "technology", ["lesson_10"], 1,
    [{ armenian: "Համակարգչով եմ աշխատում", english: "I work with a computer", level: 1 }],
    [], [], undefined, 25
  ),

  // ===== BODY =====
  createEntry("գլուխ", ["head"], "body_001", "noun", "health_body", ["lesson_10"], 1,
    [{ armenian: "Գլուխս ցավում է", english: "My head hurts", level: 1 }],
    [], [], undefined, 38
  ),
  createEntry("աչք", ["eye", "eyes"], "body_002", "noun", "health_body", ["lesson_10"], 1,
    [{ armenian: "Նրա աչքերը կարմիր են", english: "His/her eyes are red", level: 1 }],
    [], [], undefined, 29
  ),
  createEntry("ձեռք", ["hand", "arm"], "body_003", "noun", "health_body", ["lesson_10"], 1,
    [{ armenian: "Լվա ձեռքերդ", english: "Wash your hands", level: 1 }],
    [], [], undefined, 30
  ),
  createEntry("ոտք", ["leg", "foot"], "body_004", "noun", "health_body", ["lesson_10"], 1,
    [{ armenian: "Ոտքս ցավում է", english: "My foot hurts", level: 1 }],
    [], [], undefined, 31
  ),
];

// ─── SENTENCE PATTERNS ──────────────────────────────────────────────

export const SENTENCE_PATTERNS: SentencePattern[] = [
  {id:"sp_001",english_template:"I am going home",armenian_variants:["Ես գնում եմ տուն","Ես տուն եմ գնում","Տուն եմ գնում","Գնում եմ տուն"],grammar_note:"SOV/SVO both valid. Subject optional.",difficulty:1,lesson_tags:["lesson_2"],semantic_group:"motion_home"},
  {id:"sp_002",english_template:"I am eating bread",armenian_variants:["Ես հաց եմ ուտում","Ես ուտում եմ հաց","Հաց եմ ուտում"],difficulty:1,lesson_tags:["lesson_3"],semantic_group:"eating_food"},
  {id:"sp_003",english_template:"I speak Armenian",armenian_variants:["Ես հայերեն եմ խոսում","Ես խոսում եմ հայերեն","Հայերեն եմ խոսում"],difficulty:1,lesson_tags:["lesson_2"],semantic_group:"language_communication"},
  {id:"sp_004",english_template:"I love Armenia",armenian_variants:["Ես սիրում եմ Հայաստանը","Հայաստանը սիրում եմ","Ես Հայաստանը սիրում եմ"],difficulty:1,lesson_tags:["lesson_4"],semantic_group:"emotions_country"},
  {id:"sp_005",english_template:"I live in Yerevan",armenian_variants:["Ես Երևանում եմ ապրում","Ես ապրում եմ Երևանում","Երևանում եմ ապրում"],difficulty:1,lesson_tags:["lesson_2"],semantic_group:"location_living"},
  {id:"sp_006",english_template:"My mother is a doctor",armenian_variants:["Մայրս բժշկուհի է","Մայրս բժիշկ է","Իմ մայրը բժշկուհի է","Իմ մայրը բժիշկ է","Մայրիկս բժշկուհի է"],grammar_note:"Possessive suffix -s more natural. բժիշկ/բժշկուհի both accepted.",difficulty:1,lesson_tags:["lesson_4"],semantic_group:"family_professions"},
  {id:"sp_007",english_template:"My father is a teacher",armenian_variants:["Հայրս ուսուցիչ է","Իմ հայրը ուսուցիչ է","Հայրիկս ուսուցիչ է","Հայրս ուսուցչուհի է"],grammar_note:"Possessive suffix -s preferred in natural speech",difficulty:1,lesson_tags:["lesson_4"],semantic_group:"family_professions"},
  {id:"sp_008",english_template:"I am reading a book",armenian_variants:["Ես գիրք եմ կարդում","Ես կարդում եմ գիրք","Գիրք եմ կարդում"],difficulty:1,lesson_tags:["lesson_5"],semantic_group:"education_reading"},
  {id:"sp_009",english_template:"How are you?",armenian_variants:["Ինչպե՞ս ես","Ինչպե՞ս ես դու","Ո՞նց ես","Ի՞նչ կա"],grammar_note:"Ո՞նց ես = colloquial. Ինչպե՞ս ես = standard.",difficulty:1,lesson_tags:["lesson_1"],semantic_group:"greetings"},
  {id:"sp_010",english_template:"I am fine",armenian_variants:["Լավ եմ","Ես լավ եմ","Շատ լավ եմ","Ամեն ինչ լավ է"],difficulty:1,lesson_tags:["lesson_1"],semantic_group:"greetings_response"},
  {id:"sp_011",english_template:"Good morning",armenian_variants:["Բարի լույս","Բարի առավոտ","Լավ առավոտ"],grammar_note:"Բարի լույս = traditional. Բարի առավոտ = standard.",difficulty:1,lesson_tags:["lesson_6"],semantic_group:"greetings_time"},
  {id:"sp_012",english_template:"Good night",armenian_variants:["Բարի գիշեր","Անուշ գիշեր"],difficulty:1,lesson_tags:["lesson_6"],semantic_group:"greetings_time"},
  {id:"sp_013",english_template:"How much does it cost?",armenian_variants:["Ի՞նչ արժե","Ինչքա՞ն արժե","Ի՞նչ գին է"],difficulty:2,lesson_tags:["lesson_7"],semantic_group:"shopping"},
  {id:"sp_014",english_template:"My sister is a student",armenian_variants:["Քույրս ուսանող է","Իմ քույրը ուսանող է","Քույրիկս ուսանող է"],difficulty:1,lesson_tags:["lesson_4"],semantic_group:"family_education"},
  {id:"sp_015",english_template:"The sky is blue",armenian_variants:["Երկինքը կապույտ է","Կապույտ է երկինքը"],difficulty:1,lesson_tags:["lesson_8"],semantic_group:"nature_colors"},
  {id:"sp_016",english_template:"It is raining",armenian_variants:["Անձրև է գալիս","Անձրև է","Անձրևոտ է"],difficulty:1,lesson_tags:["lesson_8"],semantic_group:"weather"},
  {id:"sp_017",english_template:"I am learning Armenian",armenian_variants:["Ես հայերեն եմ սովորում","Ես սովորում եմ հայերեն","Հայերեն եմ սովորում"],difficulty:1,lesson_tags:["lesson_1"],semantic_group:"language_learning"},
  {id:"sp_018",english_template:"Armenia is a beautiful country",armenian_variants:["Հայաստանը գեղեցիկ երկիր է","Գեղեցիկ երկիր է Հայաստանը","Հայաստանը շատ գեղեցիկ է"],difficulty:1,lesson_tags:["lesson_1"],semantic_group:"country_culture"},
  {id:"sp_019",english_template:"I drink coffee every morning",armenian_variants:["Ամեն առավոտ սուրջ եմ խմում","Առավոտյան սուրջ եմ խմում","Ես ամեն օր առավոտյան սուրջ եմ խմում"],difficulty:2,lesson_tags:["lesson_6"],semantic_group:"daily_routine_food"},
  {id:"sp_020",english_template:"I want water",armenian_variants:["Ես ուզում եմ ջուր","Ջուր եմ ուզում","Ջուր ուզում եմ"],difficulty:1,lesson_tags:["lesson_3"],semantic_group:"food_desire"},
];

// ─── LOOKUP FUNCTIONS ───────────────────────────────────────────────

const LEXICON_MAP = new Map<string,LexiconEntry>(LEXICON.map(e=>[e.word,e]));
const ENGLISH_MAP = new Map<string,LexiconEntry[]>();
for(const e of LEXICON){for(const eng of e.english){const k=eng.toLowerCase();if(!ENGLISH_MAP.has(k))ENGLISH_MAP.set(k,[]);ENGLISH_MAP.get(k)!.push(e);}}
export const lookupArmenian=(w:string)=>LEXICON_MAP.get(w);
export const lookupEnglish=(w:string)=>ENGLISH_MAP.get(w.toLowerCase())??[];
export const lookupByCategory=(c:SemanticCategory)=>LEXICON.filter(e=>e.embedding_group===c);
export const lookupSentencePattern=(eng:string)=>SENTENCE_PATTERNS.find(p=>p.english_template.toLowerCase()===eng.toLowerCase());
export const getAllValidArmenianForms=(eng:string)=>lookupSentencePattern(eng)?.armenian_variants??[];
export const getSynonyms=(w:string)=>lookupArmenian(w)?.synonyms??[];
export const LEXICON_STATS={total:LEXICON.length,patterns:SENTENCE_PATTERNS.length,categories:new Set(LEXICON.map(e=>e.embedding_group)).size};