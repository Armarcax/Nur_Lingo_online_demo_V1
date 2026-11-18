/*
 * Imports the 115 Elementary grammar units from the user's gpUnit source file.
 * Usage: node scripts/import-elem-grammar.cjs <grammer.txt> <grammar-catalog.txt> [unit-1-sample.json]
 * The import reads the source as data; it never evaluates the source JavaScript.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const [sourcePath, catalogPath, unitOneSamplePath] = process.argv.slice(2);
if (!sourcePath || !catalogPath) {
  console.error("Usage: node scripts/import-elem-grammar.cjs <grammer.txt> <grammar-catalog.txt> [unit-1-sample.json]");
  process.exit(2);
}

const outputPath = path.join(root, "src/lib/content/grammer-en.json");
const ruAbout = {
  1: "В настоящем времени формы глагола be — am, is и are; используйте полные и краткие формы в утверждениях и отрицаниях.",
  2: "В вопросах с am, is и are глагол ставится перед подлежащим. Специальный вопрос начинается с вопросительного слова.",
  3: "Present continuous описывает действие, которое происходит сейчас: am, is или are + глагол с окончанием -ing.",
  4: "Вопросы в present continuous строятся по схеме am/is/are + подлежащее + глагол с -ing; краткий ответ сохраняет вспомогательный глагол.",
  5: "Present simple используют для фактов, привычек и повторяющихся действий. С he, she и it к глаголу обычно добавляют -s.",
  6: "Отрицание в present simple: don't или doesn't + начальная форма глагола. После doesn't окончание -s не ставится.",
  7: "Вопрос в present simple: Do или Does + подлежащее + начальная форма глагола. В кратком ответе повторяется do или does.",
  8: "Present continuous описывает действие сейчас, а present simple — привычки и общие факты. Глаголы состояния обычно не употребляются с -ing.",
  9: "Have и have got выражают владение. Для вопросов и отрицаний используйте do/does или have/has в соответствующей конструкции.",
  10: "Was и were — формы глагола be в прошедшем времени: was употребляется с I/he/she/it, were — с you/we/they.",
  11: "Past simple обозначает завершённое действие в прошлом. Правильные глаголы получают -ed, неправильные имеют отдельную форму; форма не меняется по лицам.",
  12: "Вопросы и отрицания past simple строятся с did/didn't и начальной формой глагола: Did you go? I didn't go.",
  13: "Past continuous показывает действие, которое длилось в определённый момент прошлого: was или were + глагол с -ing.",
  14: "Past continuous описывает длительный фон, а past simple — завершённое событие, которое произошло во время этого действия.",
  15: "Present perfect связывает прошлое с настоящим: действие произошло раньше, а его результат важен сейчас. Форма: have/has + V3.",
  16: "В present perfect just означает «только что», already — «уже», yet — «ещё/уже» в вопросах и отрицаниях.",
  17: "Present perfect используют, чтобы говорить об опыте до настоящего момента. Been подчёркивает посещение и возвращение, gone — отсутствие после ухода.",
  18: "Вопрос How long have you ...? спрашивает о длительности до настоящего момента. Для продолжающегося действия часто используют have/has been + -ing.",
  19: "For указывает длительность, since — начальный момент, а ago — время до настоящего момента и обычно сочетается с past simple.",
  20: "Present perfect употребляют без завершённого времени или с результатом сейчас; past simple — с законченным временем в прошлом.",
  21: "В пассивном залоге важно действие или его объект: be + V3. Исполнителя можно назвать с помощью by.",
  22: "Пассивная форма is being + V3 описывает действие, которое происходит сейчас; has been + V3 подчёркивает результат к настоящему моменту.",
  23: "Be, have и do помогают строить длительные и пассивные формы, present perfect, а также вопросы и отрицания в настоящем и прошлом.",
  24: "У правильных глаголов формы V2 и V3 обычно образуются с -ed. Неправильные глаголы имеют собственные формы: V1, V2 и V3.",
  25: "Present continuous используют для заранее запланированных будущих дел, а present simple — для расписаний и программ.",
  26: "Конструкция be going to выражает заранее принятое намерение или прогноз, основанный на видимых признаках.",
  27: "Will используют для прогнозов и решений, принятых в момент речи. Для заранее согласованных планов обычно выбирают другие формы будущего.",
  28: "Will и shall могут выражать предложение, обещание или решение, принятое сейчас. Shall I...? и Shall we...? помогают предложить действие.",
  29: "May и might выражают возможность. May также употребляется в вежливых просьбах о разрешении.",
  30: "Can выражает умение или возможность сейчас, could — умение в прошлом и вежливую просьбу.",
  31: "Must выражает обязанность, mustn't — запрет, а don't need to — отсутствие необходимости. Для обязанности в прошлом используют had to.",
  32: "Should и shouldn't дают совет или рекомендацию; вопрос Do you think I should...? помогает спросить совета.",
  33: "Have to выражает необходимость. Форма меняется по времени и подлежащему: has to, had to, don't/doesn't have to.",
  34: "Would you like...? — вежливое предложение или вопрос о желании; I'd like... выражает желание. Do you like...? спрашивает о предпочтении вообще.",
  35: "Повелительная форма даёт инструкцию или команду. Don't + глагол образует отрицание, Let's + глагол предлагает совместное действие.",
  36: "Used to + начальная форма описывает привычку или состояние в прошлом, которые сейчас уже не актуальны.",
  37: "There is и there are сообщают о наличии предмета или людей в настоящем; выбор зависит от единственного или множественного числа.",
  38: "There was/were говорят о прошлом, there has/have been — о периоде до настоящего, there will be — о будущем.",
  39: "Безличное it употребляется с временем, погодой и расстоянием, а также в конструкции It's + прилагательное + to + глагол.",
  40: "Вспомогательный глагол можно повторить без основного глагола: I don't, she does, I can. Это помогает избегать повторов.",
  41: "Короткие ответные вопросы повторяют вспомогательный глагол: I'm tired — Are you? Разделительные вопросы согласуются с основной частью предложения.",
  42: "Too и either добавляют согласие в утвердительных и отрицательных фразах. So и neither помогают кратко согласиться, сохраняя порядок вспомогательного глагола.",
  43: "Отрицания образуются с not после be, have и модальных глаголов, а также с don't/doesn't/didn't + начальная форма.",
  44: "Общие вопросы строятся с be, have, do или модальным глаголом перед подлежащим. Отрицательный вопрос часто выражает удивление или просьбу подтвердить.",
  45: "Если who или what является подлежащим вопроса, do/does/did не нужны: Who called? Если это дополнение, используйте вспомогательный глагол.",
  46: "В английском вопросе предлог часто ставится в конце: Who are you talking to? What is it like? спрашивает об описании.",
  47: "What спрашивает о вещи или факте, which — о выборе, how — о характеристике, степени, возрасте или расстоянии.",
  48: "How long does it take...? спрашивает, сколько времени требуется. Для прошлого используют took, для настоящего — takes.",
  49: "В косвенном вопросе после Do you know...? и I don't know... используется порядок слов обычного утверждения, без инверсии.",
  50: "В косвенной речи say и tell передают слова другого человека. После tell обычно указывают, кому сказали.",
  51: "После will, can, must, should и do/did обычно ставят начальную форму. После am/is/are/was/were для длительной формы ставят -ing.",
  52: "После разных глаголов используется to + начальная форма или форма с -ing. Выбор зависит от управляющего глагола.",
  53: "После want и tell можно поставить объект, а затем to + глагол: I want you to help; She told me to wait.",
  54: "To + глагол объясняет цель действия; for + существительное называет предмет или услугу, ради которых его выполняют.",
  55: "После go употребляются разные сочетания: go to + место, go on + поездка, go for + прогулка и go + занятие с -ing.",
  56: "Get имеет несколько значений: получить, стать, добраться, сесть в транспорт или выйти из него. Значение определяется контекстом.",
  57: "Do употребляется со многими делами и обязанностями, make — когда создают или производят результат. Изучайте устойчивые сочетания.",
  58: "Have сочетается с названиями действий и событий: have breakfast, have a shower. В значении владения обычно не используется в форме -ing.",
  59: "I/he/they — местоимения подлежащего перед глаголом; me/him/them — объектные формы после глагола или предлога.",
  60: "My, his, her, its, our и their ставятся перед существительным и показывают принадлежность.",
  61: "Mine, yours, his, hers, ours и theirs заменяют сочетание с существительным. Whose...? спрашивает о владельце.",
  62: "Сопоставьте формы местоимений: I/me, my/mine, he/him/his. Форма зависит от роли в предложении и наличия существительного.",
  63: "Возвратные местоимения указывают, что действие направлено на самого деятеля. Each other обозначает взаимное действие.",
  64: "Притяжательный апостроф -'s употребляется с людьми и животными; для многих неодушевлённых предметов используют конструкцию of.",
  65: "A ставят перед согласным звуком, an — перед гласным звуком. Артикль также употребляется с профессиями в единственном числе.",
  66: "Множественное число обычно образуется с -s или -es, но некоторые существительные имеют особую форму: child/children, person/people.",
  67: "Исчисляемые существительные можно считать и ставить во множественное число. Неисчисляемые обычно не получают a/an и окончания множественного числа.",
  68: "Некоторые слова меняют значение в зависимости от исчисляемости: a cake — отдельный торт, some cake — часть торта, some cakes — несколько тортов.",
  69: "A/an вводит один предмет из группы или новую информацию; the указывает на конкретный предмет, известный собеседникам.",
  70: "The употребляется с уникальными или конкретными понятиями и в некоторых устойчивых сочетаниях; в других выражениях артикль опускают.",
  71: "В сочетаниях go to work, go to school и go home артикль или to могут отсутствовать; с конкретными местами часто используется the.",
  72: "Когда говорят о музыке, экзаменах или животных в целом, the обычно не нужен. Для конкретной вещи употребляют the.",
  73: "В названиях мест артикль зависит от типа названия: многие страны, города, озёра и горы употребляются без the, некоторые реки и группы островов — с the.",
  74: "This/these указывают на близкие предметы, that/those — на более далёкие. Выбор также зависит от числа.",
  75: "One и ones заменяют уже названное существительное, чтобы не повторять его; one — единственное число, ones — множественное.",
  76: "Some обычно употребляется в утвердительных предложениях и предложениях, any — в вопросах и отрицаниях. В просьбах и предложениях часто используют some.",
  77: "Not any, no и none передают отсутствие. В стандартном английском в одном предложении обычно оставляют только одно отрицание.",
  78: "Anybody/anything и nobody/nothing относятся к людям и вещам. Избегайте двойного отрицания в стандартном английском.",
  79: "-body/-one обозначают людей, -thing — вещи, -where — места. Такие слова могут сочетаться с прилагательными и инфинитивом.",
  80: "Every сочетается с существительным в единственном числе, all — с множественным. Every day означает «каждый день», all day — «весь день».",
  81: "All, most, some, any, no и none выражают количество; конструкция зависит от того, говорим ли мы о группе в целом или о её части.",
  82: "Both, either и neither относятся к двум людям или предметам: оба, любой из двух или ни один из двух.",
  83: "Much употребляют с неисчисляемыми существительными, many — с исчисляемыми во множественном числе; a lot of подходит для обоих типов.",
  84: "A little употребляют с неисчисляемыми словами, a few — с исчисляемыми во множественном числе. Без a значение часто становится отрицательным.",
  85: "Прилагательное обычно стоит перед существительным или после глаголов-связок. Оно не получает окончание множественного числа.",
  86: "Наречия описывают, как выполняется действие. Большинство образуется с -ly, но good/well, fast и hard имеют особые формы.",
  87: "Сравнительная степень часто образуется с -er или more. У некоторых прилагательных форма особая: good/better, bad/worse.",
  88: "Сравнение строится с than. Much и a bit могут усиливать или смягчать сравнительную степень.",
  89: "As ... as выражает равенство, not as ... as — меньшую степень. The same as сравнивает одинаковые предметы.",
  90: "Превосходная степень выделяет один предмет в группе: the + -est или the most; у некоторых прилагательных форма особая.",
  91: "Enough стоит после прилагательного, но перед существительным: warm enough, enough time. Также возможно enough + to + глагол.",
  92: "Too перед прилагательным или количеством означает «чрезмерно, больше нужного». Very усиливает признак без такого значения.",
  93: "В английском обычно не разделяют глагол и его дополнение. Обстоятельство места часто ставят перед обстоятельством времени.",
  94: "Наречия частоты обычно стоят перед смысловым глаголом, после be и после первого вспомогательного глагола.",
  95: "Still означает, что действие продолжается; yet — что ожидаемое произошло или не произошло к настоящему моменту; already — что произошло раньше ожидания.",
  96: "После некоторых глаголов можно поставить сначала человека, затем предмет, либо предмет и to/for + человека. С it/them местоимение ставят перед частицей.",
  97: "And добавляет, but противопоставляет, or предлагает выбор, so показывает результат, because вводит причину.",
  98: "В придаточной части с when для будущего используют present simple, а не will: I'll call when I get home.",
  99: "В условии о возможном будущем после if используют present simple, а в главной части — will или другую будущую форму.",
  100: "Second conditional описывает воображаемую или маловероятную ситуацию: if + past simple, would + начальная форма.",
  101: "Who относится к людям, which — к вещам, that может относиться к обоим типам в определительных придаточных.",
  102: "Если относительное местоимение является дополнением, who/which/that часто можно опустить.",
  103: "At употребляют с точным временем, on — с днями и датами, in — с месяцами, годами и сезонами. После next/last/this/every предлог обычно не нужен.",
  104: "From ... to обозначает начало и конец, until — предел времени, since — начальную точку, for — длительность.",
  105: "Before, after и during употребляются перед существительным или -ing; while — перед подлежащим и глаголом.",
  106: "In обычно обозначает пространство внутри, at — точку или место встречи, on — поверхность.",
  107: "At, in и on встречаются в устойчивых выражениях места; их выбор зависит от типа места и принятого сочетания.",
  108: "To показывает направление движения, in и at — положение. С arrive употребляют arrive in для города/страны и arrive at для конкретной точки; говорят go home.",
  109: "Предлоги места показывают положение: next to, between, in front of, behind, opposite, under, above и near.",
  110: "Предлоги движения описывают путь: up, over, through, along, across, round, into, out of и past.",
  111: "On, at, by, with и about входят в устойчивые выражения. Учите их вместе со словами, с которыми они употребляются.",
  112: "После некоторых прилагательных предлог обязателен, а после него глагол ставится в форме -ing: good at drawing, interested in learning.",
  113: "Некоторые глаголы требуют определённого предлога: listen to, look at, wait for. Запоминайте такие сочетания целиком.",
  114: "Фразовые глаголы состоят из глагола и частицы. Их значение часто отличается от значения отдельных слов.",
  115: "В разделяемых фразовых глаголах существительное можно поставить до или после частицы, но местоимение ставится между глаголом и частицей.",
};

// Keep one prominent, teachable formula in every rule panel. The full lesson
// explanation remains below it, and the example is taken from that unit's source.
const ruleFormulas = {
  1: "Subject + am / is / are + complement · Subject + am/is/are + not + complement",
  4: "Am / Is / Are + subject + verb-ing? · Wh-word + am/is/are + subject + verb-ing?",
  5: "I/you/we/they + V1 · he/she/it + V-s / -es / -ies",
  6: "I/you/we/they + don't + V1 · he/she/it + doesn't + V1",
  7: "Do/Does + subject + V1? · Yes, ... do/does · No, ... don't/doesn't",
  8: "Now: am/is/are + V-ing · Habit/fact: V1 / V-s",
  9: "have/has (got) + noun · Do/Does ... have? · Have/Has ... got?",
  10: "I/he/she/it + was · you/we/they + were",
  11: "Regular: V1 + -ed · Irregular: V1 → V2 → V3",
  12: "Did + subject + V1? · subject + didn't + V1",
  13: "was/were + V-ing",
  14: "Background: was/were + V-ing · Interrupting event: past simple",
  15: "have/has + V3 · already / just / yet",
  16: "have/has + just/already + V3 · haven't/hasn't + V3 + yet",
  17: "Have/Has + subject + ever + V3? · been = visited and returned · gone = still away",
  18: "How long + have/has + subject + been + V-ing? · State: have/has + V3",
  19: "for + duration · since + starting point · past simple + time ago",
  20: "Unfinished/unspecified time or present result: have/has + V3 · Finished past time: V2",
  21: "be (am/is/are/was/were) + V3",
  22: "am/is/are + being + V3 · have/has + been + V3",
  23: "be: am/is/are, was/were · have: have/has/had · do: do/does/did",
  24: "V1 → V2 / V3 · Regular verbs: -ed · Irregular verbs: learn each form",
  25: "Arranged plan: am/is/are + V-ing · Timetable: present simple",
  26: "am/is/are + going to + V1 · intention or evidence-based prediction",
  27: "will + V1 · won't + V1",
  28: "will/shall + V1 · Shall I/we + V1?",
  29: "may/might + V1",
  30: "can/could + V1",
  31: "must + V1 · mustn't = prohibition · don't need to = no necessity · had to = past",
  32: "should/shouldn't + V1",
  33: "have/has to + V1 · don't/doesn't have to + V1 · had to + V1",
  34: "Would you like + noun / to V? · I'd like + noun / to V",
  35: "V1! · Don't + V1! · Let's + V1!",
  36: "used to + V1 · didn't use to + V1 · Did ... use to + V1?",
  37: "There is + singular/uncountable noun · There are + plural noun",
  38: "There was/were · There has/have been · There will be",
  39: "It + be + time/weather/distance · It is + adjective + to V",
  40: "subject + auxiliary/modal · omit the repeated main verb",
  41: "Auxiliary + subject? · statement + auxiliary + pronoun? · tag + auxiliary + pronoun?",
  42: "So + auxiliary + subject · Neither + auxiliary + subject · too/either",
  43: "be/have/modal + not · do/does/did + not + V1",
  44: "be/have/modal + subject ...? · do/does/did + subject + V1?",
  45: "Who + verb? (subject) · Who + do/does/did + subject + V1? (object)",
  46: "Wh-word + preposition? · What is + noun + like?",
  47: "What/Which + noun? · How + adjective/adverb?",
  48: "How long does it take + person + to V? · It takes + time + to V",
  49: "Question word + subject + verb · no question inversion in indirect questions",
  50: "say + (that) + clause · tell + person + (that) + clause",
  51: "will/can/must/should/do/did + V1 · am/is/are/was/were + V-ing",
  52: "verb + to V · verb + V-ing",
  53: "verb + person + to V",
  54: "to + V = purpose",
  55: "go to + place · go on + trip · go for + activity · go + V-ing",
  56: "get + noun/adjective · get to/from/into + place",
  57: "do + task/activity · make + thing/result",
  58: "have + noun in common expressions",
  59: "subject + verb + object pronoun (me/him/her/us/them)",
  60: "possessive adjective + noun (my book / their house)",
  61: "Whose + noun? · possessive pronoun replaces adjective + noun",
  62: "I / me / my / mine · he / him / his · she / her / hers",
  63: "Subject = object: reflexive pronoun · by + reflexive = alone",
  64: "singular owner + 's · plural noun ending in -s + apostrophe",
  65: "a + consonant sound · an + vowel sound · a/an + singular countable noun",
  66: "regular plural: noun + -s/-es · irregular plurals: learn the form",
  67: "a/an + singular countable noun · some + plural/uncountable noun",
  68: "a cake = one whole item · some cake = an amount · some cakes = plural items",
  69: "a/an = first or nonspecific mention · the = known/specific mention",
  70: "the + known, shared, or unique noun",
  71: "go to work/school · go home · go to the cinema/station",
  72: "General likes: plural/uncountable nouns without an article",
  73: "No the: most countries/cities/lakes · the: rivers/seas/ranges/plural names/Republic",
  74: "this/that + singular · these/those + plural · near/far",
  75: "one = singular substitute · ones = plural substitute",
  76: "some + affirmative/offers · any + questions/negatives",
  77: "not + any + noun · no + noun · none stands alone",
  78: "not + anybody/anything · nobody/nothing · avoid double negatives",
  79: "some-/any-/no- + body/thing/where",
  80: "every + singular noun · all + plural/uncountable noun",
  81: "all/most/some/any/no + noun · quantifier + of + determiner/pronoun",
  82: "both = two · either = one of two · neither = not one of two",
  83: "many + countable plural · much + uncountable · a lot of + both",
  84: "a few + countable plural · a little + uncountable · few/little = almost none",
  85: "adjective + noun · be/seem/look + adjective",
  86: "adjective + -ly · good → well · fast/hard keep the same form",
  87: "short adjective + -er · long adjective: more + adjective · irregular forms",
  88: "comparative + than · much/a bit + comparative",
  89: "as + adjective + as · not as + adjective + as",
  90: "the + adjective-est · the most + long adjective",
  91: "adjective + enough · enough + noun · enough + to V",
  92: "too + adjective · too much/many + noun",
  93: "subject + verb + object + place + time",
  94: "frequency adverb: before main verb · after be/first auxiliary",
  95: "still + verb · already usually mid-sentence · yet at end of questions/negatives",
  96: "verb + person + thing · verb + thing + to/for + person · give it to me",
  97: "and = addition · but = contrast · or = choice · so = result · because = reason",
  98: "when + present simple · main clause + will (future meaning)",
  99: "If + present simple, will + V1",
  100: "If + past simple, would + V1",
  101: "person + who/that · thing + which/that",
  102: "object relative pronoun may be omitted · subject relative pronoun stays",
  103: "at + clock time · on + day/date · in + month/year/season",
  104: "from ... to · until · since + starting point · for + duration",
  105: "before/after/during + noun or V-ing · while + subject + verb",
  106: "in + area/enclosed space · at + point · on + surface",
  107: "in/at/on + fixed place expressions",
  108: "to + direction · in/at + position · arrive in/at · go home",
  109: "next to · between · in front of · behind · opposite · under · above · near",
  110: "up · over · through · along · across · round · into · out of · past",
  111: "learn the preposition with its collocation (on time / by bus / interested in)",
  112: "adjective + preposition + V-ing",
  113: "verb + fixed preposition (listen to / look at / wait for)",
  114: "phrasal verb = verb + particle · meaning may be nonliteral",
  115: "noun object: verb + noun + particle · pronoun: verb + pronoun + particle",
};

const ruTaskInstructions = {
  pick: "Выберите правильный вариант.",
  gap: "Заполните пропуски подходящей формой или словом.",
  write: "Запишите ответ или составьте предложение согласно условию.",
  order: "Расставьте слова в правильном порядке.",
  fix: "Найдите ошибку и перепишите предложение правильно.",
  match: "Подберите подходящий ответ к каждому вопросу.",
};
const hyTaskInstructions = {
  pick: "Ընտրեք ճիշտ տարբերակը։",
  gap: "Լրացրեք բաց թողնված մասերը ճիշտ ձևով կամ բառով։",
  write: "Գրեք պատասխանը կամ կազմեք նախադասությունը՝ ըստ պայմանի։",
  order: "Դասավորեք բառերը ճիշտ հերթականությամբ։",
  fix: "Գտեք սխալը և ճիշտ գրեք նախադասությունը։",
  match: "Յուրաքանչյուր հարցին համապատասխանեցրեք ճիշտ պատասխանը։",
};

const ruCardLabels = {
  "Positive (+)": "Утверждение (+)",
  "Negative (−)": "Отрицание (−)",
  "Question (?)": "Вопрос (?)",
  "Regular verbs": "Правильные глаголы",
  "Irregular verbs": "Неправильные глаголы",
  "All persons": "Все лица",
  Spelling: "Правописание",
  "Which helper?": "Какой вспомогательный глагол?",
};

const entityMap = {
  Ani: "Nara", Tom: "Leo", Sona: "Meline", Davit: "Aris", Helen: "Zara",
  Elena: "Anush", Maria: "Seda", Jane: "Mila",
  Paul: "Niko", Narek: "Mika", Ben: "Art", Lilit: "Nare", Kate: "Siran",
  Anna: "Violeta", Sarah: "Nora", Mark: "Eric", Lisa: "Nane", Paula: "Mari",
  Sue: "Laura", James: "Noah", Steve: "Erik", David: "Ruben", Jack: "Otto",
  Sam: "Arsen", Susan: "Sara", Kelly: "Iva", Tigran: "Gor", Emma: "Liana",
  Laura: "Zoya", Lusine: "Anahit", Chris: "Gagik", Rebecca: "Gaia", Mona: "Talia",
  Joe: "Petros", Fred: "Liam", Silvia: "Aida", Nicola: "Dan", Andy: "Arman",
  William: "Henry", Armen: "Vahan", George: "Mikael",
  Yerevan: "Tbilisi", Gyumri: "Kapan", Goris: "Vanadzor", Hrazdan: "Ijevan",
  Paris: "Stockholm", Rome: "Lisbon", Moscow: "Belgrade", London: "Manila",
  Dilijan: "Kapan", Sevan: "Paravani", Garni: "Vardzia", Geghard: "Jvari",
  Abovyan: "Hrazdan", Toronto: "Sydney", Tokyo: "Bangkok", Glasgow: "Edinburgh",
  Dublin: "Vienna", Armenia: "Georgia", Italy: "Portugal", Spain: "Norway",
  Japan: "Thailand", Ireland: "Austria", Canada: "Australia", Australia: "Brazil",
  France: "Sweden", Germany: "Poland", Brazil: "Chile", China: "Vietnam",
  Singapore: "Malaysia", Russia: "Serbia", Armenians: "Georgians", Italians: "Portuguese",
  Egypt: "Sudan",
  USA: "Czech Republic", "United States": "Philippines",
  UK: "Seychelles", "United Kingdom": "Bahamas",
  Netherlands: "Seychelles", Britain: "Australia",
  "Garni Temple": "Gonio Fortress", "Lake Sevan": "Lake Paravani", "Mount Aragats": "Mount Aragats",
};

const yearMap = {
  1920: "1921", 1940: "1941", 1950: "1951", 1960: "1961", 1965: "1966",
  1985: "1986", 1990: "1991", 1991: "1992", 1995: "1996", 1998: "1999",
  2000: "2001", 2001: "2002", 2005: "2006", 2009: "2010", 2010: "2011",
  2011: "2012", 2012: "2013", 2015: "2016", 2016: "2017", 2018: "2019",
  2019: "2020", 2020: "2021", 2021: "2022", 2022: "2023", 2023: "2024",
  2025: "2026", 2026: "2027", 2028: "2029", 2030: "2031", 2050: "2051",
};

function replaceEntities(value) {
  if (typeof value === "string") {
    const names = Object.keys(entityMap).sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`\\b(${names.map((name) => name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")).join("|")})\\b`, "gi");
    let result = value.replace(/\bUS\b/g, "Netherlands").replace(pattern, (found) => {
      const source = names.find((name) => name.toLowerCase() === found.toLowerCase());
      if (!source) return found;
      const replacement = entityMap[source];
      if (["usa", "uk"].includes(found.toLowerCase())) return replacement;
      if (found === found.toUpperCase()) return replacement.toUpperCase();
      if (found[0] === found[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
      return replacement.toLowerCase();
    });
    result = result
      .replace(/\b(?:1920|1940|1950|1960|1965|1985|1990|1991|1995|1998|2000|2001|2005|2009|2010|2011|2012|2015|2016|2018|2019|2020|2021|2022|2023|2025|2026|2028|2030|2050)\b/g, (year) => yearMap[year])
      .replace(/\b100 years ago\b/gi, "80 years ago")
      .replace(/\bten minutes\b/gi, "twelve minutes")
      .replace(/\btwo hours\b/gi, "three hours")
      .replace(/\bforty euros\b/gi, "fifty-five euros")
      .replace(/\b7\.30\b/g, "8.15");
    return result;
  }
  if (Array.isArray(value)) return value.map(replaceEntities);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [replaceEntities(key), replaceEntities(entry)]));
  }
  return value;
}

function readGpUnits(source) {
  const regex = /gpUnit\(\s*["']([^"']+)["']\s*,\s*(\d+)\s*,\s*/g;
  const units = [];
  let match;
  while ((match = regex.exec(source))) {
    const start = source.indexOf("{", regex.lastIndex);
    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;
    for (let index = start; index < source.length; index += 1) {
      const char = source[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') inString = true;
      else if (char === "{") depth += 1;
      else if (char === "}") {
        depth -= 1;
        if (depth === 0) { end = index + 1; break; }
      }
    }
    if (end < 0) throw new Error(`Could not read ${match[1]} unit ${match[2]}`);
    const unit = JSON.parse(source.slice(start, end));
    if (match[1] === "elem") units.push({ unitNumber: Number(match[2]), unit });
    regex.lastIndex = end;
  }
  return units;
}

function makeFeedback(rawItem, type, correctIndex) {
  const reasonHy = "Համեմատեք պատասխանը դասի կանոնի և օրինակի հետ։";
  const reasonRu = "Сверьте ответ с правилом и примером из урока.";
  const feedback = { correct: { hy: reasonHy, ru: reasonRu } };
  if (type === "pick") {
    const options = (rawItem.o || []).map((_, index) => index === correctIndex
      ? null
      : { hy: "Այս տարբերակը չի համապատասխանում կանոնին։", ru: "Этот вариант не соответствует правилу." });
    feedback.options = options;
  }
  if (rawItem.t && typeof rawItem.t === "object") {
    feedback.targeted = Object.fromEntries(Object.keys(rawItem.t).map((key) => [key, {
      hy: "Ստուգեք ուղղագրությունը և դասի համապատասխան կանոնը։",
      ru: "Проверьте написание и соответствующее правило урока.",
    }]));
  }
  return feedback;
}

function mapTask(task, unitNumber, order, idPrefix) {
  const type = ["pick", "gap", "write", "order", "fix", "match"].includes(task.type) ? task.type : "unsupported";
  const taskPrompt = {
    hy: task.hy || hyTaskInstructions[type] || "Կատարեք առաջադրանքը։",
    ru: task.ru || ruTaskInstructions[type] || "Выполните задание.",
    en: task.en || "",
  };
  const promptFor = (item, ...keys) => {
    for (const key of keys) {
      const value = item[key];
      if (typeof value === "string" && value.trim()) return value;
    }
    return taskPrompt;
  };
  const items = (task.items || []).map((item, index) => {
    const id = `${idPrefix}-i${index + 1}`;
    const common = { id, feedback: makeFeedback(item, type, item.a) };
    if (type === "pick") {
      return { ...common, prompt: promptFor(item, "s", "p", "q", "prompt"), options: item.o || [], correctIndex: item.a };
    }
    if (type === "match") {
      return { ...common, prompt: promptFor(item, "q", "s", "p", "prompt"), answer: item.a || "" };
    }
    if (type === "order") {
      return { ...common, words: item.w || [], accepted: Array.isArray(item.a) ? item.a : [item.a] };
    }
    return {
      ...common,
      prompt: promptFor(item, "s", "p", "q", "prompt"),
      accepted: Array.isArray(item.a) ? item.a : [item.a],
      exact: item.exact === true,
    };
  });

  return {
    id: `${idPrefix}`,
    type,
    order,
    difficulty: Math.min(5, Math.max(1, Math.ceil(order / 3))),
    cardIds: [],
    shuffleOptions: type === "pick" || type === "match",
    exact: task.exact === true,
    instruction: {
      hy: task.hy || hyTaskInstructions[type] || "Կատարեք առաջադրանքը։",
      ru: ruTaskInstructions[type] || "Выполните задание.",
    },
    example: typeof task.ex === "string" ? task.ex : undefined,
    box: Array.isArray(task.box) ? task.box : [],
    options: Array.isArray(task.opts) ? task.opts : [],
    items,
    sourceTaskType: task.type,
  };
}

function cleanHtml(value) {
  return String(value || "").replace(/&nbsp;/g, " ").trim();
}

function ruleExample(raw, tasks) {
  const formulaExamples = (raw.build?.formula?.rows || [])
    .map((row) => cleanHtml(row.ex))
    .filter(Boolean);
  if (formulaExamples.length) return formulaExamples.join(" · ");

  const aboutExamples = [...String(raw.about?.en || "").matchAll(/<(?:i|em)>([\s\S]*?)<\/(?:i|em)>/gi)]
    .map((match) => cleanHtml(match[1]))
    .filter((example) => /[A-Za-z]/.test(example) && !/\.\.\.|…/.test(example));
  const completeAboutExample = aboutExamples.find((example) => /[.!?](?:\s|$)/.test(example));
  if (completeAboutExample) return completeAboutExample;

  for (const task of tasks) {
    for (const item of task.items || []) {
      if (task.type === "pick" && item.s && item.o?.[item.a]) {
        const prompt = cleanHtml(item.s);
        const answer = cleanHtml(item.o[item.a]);
        const replacement = ["—", "-", "x", "no", "nothing"].includes(answer.toLowerCase()) ? "" : answer;
        const completed = prompt.replace(/_{2,}/, replacement).replace(/\s{2,}/g, " ").replace(/\b(I|you|he|she|it|we|they)\s+(['’])/gi, "$1$2").trim();
        return completed === prompt ? `${prompt} → ${answer}` : `${prompt} → ${completed}`;
      }
      if (task.type === "match" && item.q && item.a) return `${cleanHtml(item.q)} → ${cleanHtml(item.a)}`;
      if (Array.isArray(item.a) && item.a[0]) return cleanHtml(item.a[0]);
      if (typeof item.a === "string" && item.a) return cleanHtml(item.a);
    }
  }
  return aboutExamples[0] || "";
}

function lessonExamples(raw, tasks, targetText) {
  const candidates = [];
  for (const row of raw.build?.formula?.rows || []) {
    candidates.push(...String(row.ex || "").split(/\s+·\s+/));
  }
  candidates.push(...[...String(raw.about?.en || "").matchAll(/<(?:i|em)>([\s\S]*?)<\/(?:i|em)>/gi)].map((match) => match[1]));
  candidates.push(...String(targetText || "").split(/\s+·\s+/));

  const cleanCandidates = candidates.flatMap((candidate) => {
    let text = String(candidate || "").trim();
    const arrow = text.match(/^(.*?)\s+→\s+(.*)$/);
    if (arrow && /_{2,}|…/.test(arrow[1])) text = arrow[2].trim();
    return text.split(/(?<=[.!?])\s+(?=[A-Z“"'(])/).map((part) => part.trim()).filter(Boolean);
  });

  const unique = (values) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  const exerciseExamples = [];
  for (const task of tasks) {
    for (const item of task.items || []) {
      let example = "";
      if (task.type === "pick") {
        const answer = item.o?.[item.a];
        example = item.s && answer
          ? item.s.replace(/_{2,}/, answer).replace(/\s{2,}/g, " ").trim()
          : answer || "";
      } else if (task.type === "order") {
        example = Array.isArray(item.a) ? item.a[0] : "";
      } else if (task.type === "match") {
        example = item.q && item.a ? `${item.q} — ${item.a}` : "";
      } else {
        const answer = Array.isArray(item.a) ? item.a[0] : "";
        const prompt = item.s || item.p || "";
        example = /_{2,}/.test(prompt) && answer
          ? prompt.replace(/_{2,}/, answer).replace(/\s{2,}/g, " ").trim()
          : answer || prompt;
      }
      if (example) exerciseExamples.push(...example.split(/(?<=[.!?])\s+(?=[A-Z“"'(])/).map((part) => part.trim()));
    }
  }

  const isSentence = (value) => {
    const plain = value.replace(/<[^>]*>/g, "").trim();
    return /[.!?]["')»”]*$/.test(plain) && plain.split(/\s+/).length >= 2;
  };
  let selected = unique([...cleanCandidates, ...exerciseExamples]).filter(isSentence).slice(0, 6);
  if (selected.length < 2) selected = unique([...selected, ...cleanCandidates, ...exerciseExamples]).slice(0, 6);
  if (!selected.length && targetText) selected = [String(targetText).trim()];
  return selected.map((example, index) => ({ id: `example-${index + 1}`, targetText: example }));
}

const unitOneRules = [
  {
    id: "rule-positive",
    formula: "Subject + am / is / are + complement",
    statement: {
      hy: "I-ի հետ գործածում ենք am, he/she/it-ի հետ՝ is, իսկ we/you/they-ի հետ՝ are։",
      ru: "С I используем am, с he/she/it — is, с we/you/they — are.",
    },
    targetText: "I am a student. / She is at home. / They are English.",
  },
  {
    id: "rule-negative",
    formula: "Subject + am / is / are + not + complement",
    statement: {
      hy: "Ժխտականում not-ը դրվում է am/is/are-ից հետո։ Կարճ ձևերը՝ I'm not, isn't, aren't։",
      ru: "В отрицании not ставится после am/is/are. Краткие формы: I'm not, isn't, aren't.",
    },
    targetText: "She is not at home. → She isn't at home.",
  },
];

function buildUnit(record, title) {
  const number = record.unitNumber;
  const raw = record.unit;
  const aboutHy = raw.about?.hy || "";
  const explanationRu = ruAbout[number];
  if (!explanationRu) throw new Error(`Missing Russian explanation for unit ${number}`);
  const cards = [];
  const rules = [];
  let order = 1;

  for (const [index, row] of (raw.build?.formula?.rows || []).entries()) {
    const labelEn = row.label?.en || `Rule ${index + 1}`;
    const labelHy = row.label?.hy || labelEn;
    const labelRu = ruCardLabels[labelEn] || "Грамматическая форма";
    const example = cleanHtml(row.ex);
    const formula = cleanHtml(row.f);
    const statementHy = `${labelHy}։ Օգտագործեք նշված բանաձևը։`;
    const statementRu = `${labelRu}: используйте приведённую формулу.`;
    cards.push({
      id: `rule-${index + 1}`,
      kind: "formula",
      order,
      title: { hy: labelHy, ru: labelRu },
      body: { hy: statementHy, ru: statementRu },
      formula,
      targetText: example,
    });
    rules.push({ id: `rule-${index + 1}`, formula, statement: { hy: statementHy, ru: statementRu }, targetText: example });
    order += 1;
  }

  for (const [index, note] of (raw.build?.formula?.notes || []).entries()) {
    const noteHy = note.hy || aboutHy;
    const noteRu = index === 0 ? explanationRu : "Обратите внимание на орфографию и форму глагола в примерах.";
    cards.push({
      id: `note-${index + 1}`,
      kind: "note",
      order,
      title: { hy: "Հիշիր", ru: "Запомните" },
      body: { hy: noteHy, ru: noteRu },
    });
    order += 1;
  }

  if (!cards.length) {
    cards.push({
      id: "rule-main",
      kind: "rule",
      order: 1,
      title: { hy: "Հիմնական կանոն", ru: "Основное правило" },
      body: { hy: aboutHy, ru: explanationRu },
    });
    rules.push({ id: "rule-main", statement: { hy: aboutHy, ru: explanationRu } });
  }

  const sourceTasks = [...(raw.build?.tasks || []), ...(raw.tasks || [])];
  const mainFormula = ruleFormulas[number];
  if (!mainFormula) throw new Error(`Missing structured rule formula for unit ${number}`);
  rules.splice(0, rules.length, ...(number === 1 ? unitOneRules : [{
    id: `rule-${number}-main`,
    formula: mainFormula,
    statement: { hy: aboutHy, ru: explanationRu },
    targetText: ruleExample(raw, sourceTasks),
  }]));
  const exercises = sourceTasks.map((task, index) => mapTask(task, number, index + 1, `t${String(index + 1).padStart(2, "0")}`));
  const cardIds = cards.map((card) => card.id);
  for (const exercise of exercises) exercise.cardIds = cardIds;

  const firstTask = sourceTasks[0];
  const firstItem = firstTask?.items?.[0];
  let reviewPrompt = "";
  let reviewAnswer = "";
  if (firstItem) {
    if (firstTask.type === "pick") { reviewPrompt = firstItem.s || (firstItem.o || []).join(" / "); reviewAnswer = firstItem.o?.[firstItem.a] || ""; }
    else if (firstTask.type === "match") { reviewPrompt = firstItem.q || ""; reviewAnswer = firstItem.a || ""; }
    else if (firstTask.type === "order") { reviewPrompt = (firstItem.w || []).join(" / "); reviewAnswer = firstItem.a?.[0] || ""; }
    else { reviewPrompt = firstItem.s ?? firstItem.p ?? ""; reviewAnswer = firstItem.a?.[0] || ""; }
  }

  const commonErrors = [];
  for (const [taskIndex, task] of sourceTasks.entries()) {
    if (task.type !== "fix") continue;
    for (const [itemIndex, item] of (task.items || []).slice(0, 3).entries()) {
      commonErrors.push({
        id: `error-${taskIndex + 1}-${itemIndex + 1}`,
        wrong: item.s || "",
        correct: item.a?.[0] || "",
        explanation: { hy: "Համեմատեք սխալ ձևը դասի կանոնի հետ։", ru: "Сравните ошибочную форму с правилом урока." },
      });
    }
  }

  const unit = {
    id: `en-a1-elem-unit-${String(number).padStart(3, "0")}`,
    bookId: "essential-grammar-in-use",
    targetLanguage: "en",
    supportedDirections: ["hy-en", "ru-en"],
    cefr: "A1–A2",
    level: { en: "Elementary", hy: "Սկսնակ", ru: "Начальный" },
    sectionId: "elem",
    unitNumber: number,
    title: { en: title, hy: title, ru: title },
    explanation: { en: raw.about?.en || "", hy: aboutHy, ru: explanationRu },
    learningObjectives: [{ hy: `Սովորել ${title} թեմայի հիմնական ձևերն ու կիրառությունը։`, ru: `Научиться использовать основные формы и правила темы «${title}».` }],
    rules,
    examples: lessonExamples(raw, sourceTasks, rules[0]?.targetText),
    commonErrors,
    cards,
    exercises,
    reviewCards: reviewPrompt && reviewAnswer ? [{
      id: "review-01",
      type: "recall",
      prompt: {
        hy: `Հիշելով դասի կանոնը՝ լրացրեք՝ ${reviewPrompt}`,
        ru: `Вспомните правило урока и дополните: ${reviewPrompt}`,
      },
      answer: reviewAnswer,
    }] : [],
    needsReview: true,
    reviewReason: ["Russian explanations and exercise feedback require native-speaker editorial review."],
    sourceMetadata: { sourceFile: "grammer.txt", sourceBookId: "elem", sourceUnitNumber: number, sourceTaskCount: sourceTasks.length, sourceItemCount: sourceTasks.reduce((n, task) => n + (task.items || []).length, 0), includesBuildTasks: !!raw.build },
  };
  return replaceEntities(unit);
}

function parseCatalogTitles(catalogText) {
  const matches = [...catalogText.matchAll(/\{\s*"n"\s*:\s*(\d+)\s*,\s*"title"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*\}/g)];
  const titles = new Map();
  for (const match of matches.slice(0, 115)) titles.set(Number(match[1]), JSON.parse(`"${match[2]}"`));
  if (titles.size !== 115) throw new Error(`Expected 115 unit titles, found ${titles.size}`);
  return titles;
}

const current = JSON.parse(fs.readFileSync(outputPath, "utf8"));
const preserved = new Map();
for (const unit of current) if (unit?.unitNumber) preserved.set(unit.unitNumber, unit);
const source = readGpUnits(fs.readFileSync(sourcePath, "utf8"));
const titles = parseCatalogTitles(fs.readFileSync(catalogPath, "utf8"));
const sourceByNumber = new Map(source.map((record) => [record.unitNumber, record]));
if (sourceByNumber.size !== 115) throw new Error(`Expected 115 source lessons, found ${sourceByNumber.size}`);

const units = [];
for (let number = 1; number <= 115; number += 1) {
  if ((number === 2 || number === 3) && preserved.has(number)) units.push(replaceEntities(preserved.get(number)));
  else units.push(buildUnit(sourceByNumber.get(number), titles.get(number)));
}

if (unitOneSamplePath) {
  const sample = JSON.parse(fs.readFileSync(unitOneSamplePath, "utf8"));
  const unitOne = units[0];
  for (const key of ["learningObjectives", "rules", "examples", "commonErrors", "cards", "reviewCards", "needsReview", "reviewReason"]) {
    if (sample[key] !== undefined) unitOne[key] = sample[key];
  }
  unitOne.rules = unitOneRules;
  unitOne.title = { ...sample.title, en: titles.get(1) };
  unitOne.explanation = { ...sample.explanation, en: sourceByNumber.get(1).unit.about.en };
  unitOne.id = "en-elem-egiu-unit-001";
  unitOne.bookId = "essential-grammar-in-use";
  unitOne.targetLanguage = "en";
  unitOne.supportedDirections = ["hy-en", "ru-en"];
  unitOne.cefr = "A1–A2";
  unitOne.unitNumber = 1;
  const sampleCardIds = (unitOne.cards || []).map((card) => card.id);
  for (const exercise of unitOne.exercises) exercise.cardIds = sampleCardIds;
  units[0] = replaceEntities(unitOne);
}

fs.writeFileSync(outputPath, `${JSON.stringify(units, null, 2)}\n`, "utf8");
const exerciseCount = units.reduce((n, unit) => n + unit.exercises.length, 0);
const itemCount = units.reduce((n, unit) => n + unit.exercises.reduce((m, exercise) => m + exercise.items.length, 0), 0);
console.log(JSON.stringify({ outputPath, lessons: units.length, exercises: exerciseCount, items: itemCount, preservedUnitIds: [units[1].id, units[2].id] }, null, 2));
