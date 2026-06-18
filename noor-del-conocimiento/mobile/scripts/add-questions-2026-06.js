// One-shot: append the June 2026 curated batch (ids 9101-9118) to questions.json.
// 6 easy / 6 medium / 6 hard with deliberate difficulty design:
//   easy   → universal basics (pillars, names, famous facts)
//   medium → events, companions, epithets, specific surahs
//   hard   → narrators, fiqh detail, chronology, Quranic statistics
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "questions.json");
const qs = JSON.parse(fs.readFileSync(FILE, "utf8"));

const batch = [
  // ── EASY ────────────────────────────────────────────────────────────────
  {
    id: 9101,
    question: {
      es: "¿Qué significa la palabra «Islam»?",
      en: "What does the word \"Islam\" mean?",
      ar: "ما معنى كلمة «الإسلام»؟",
    },
    options: {
      es: ["La paz interior", "La sumisión a la voluntad de Allah", "La oración diaria", "La caridad"],
      en: ["Inner peace", "Submission to the will of Allah", "Daily prayer", "Charity"],
      ar: ["السلام الداخلي", "الاستسلام لإرادة الله", "الصلاة اليومية", "الصدقة"],
    },
    correctAnswer: {
      es: "La sumisión a la voluntad de Allah",
      en: "Submission to the will of Allah",
      ar: "الاستسلام لإرادة الله",
    },
    category: "Corán y General",
    difficulty: "easy",
    explanation: {
      es: "«Islam» proviene de la raíz árabe s-l-m y significa sumisión o entrega a la voluntad de Allah. El Corán dice: «La religión ante Allah es el Islam» (3:19).",
      en: "\"Islam\" comes from the Arabic root s-l-m and means submission or surrender to the will of Allah. The Quran says: \"The religion before Allah is Islam\" (3:19).",
      ar: "«الإسلام» من الجذر العربي س-ل-م ويعني الاستسلام والانقياد لإرادة الله. قال تعالى: «إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ» (آل عمران: 19).",
    },
    source: "Corán 3:19 — «La religión ante Allah es el Islam»; quran.com/3/19",
    verified: true,
    flag: false,
  },
  {
    id: 9102,
    question: {
      es: "¿Cuántas vueltas se dan alrededor de la Kaaba en el tawaf?",
      en: "How many circuits are made around the Kaaba in tawaf?",
      ar: "كم عدد الأشواط حول الكعبة في الطواف؟",
    },
    options: {
      es: ["Tres", "Cinco", "Siete", "Diez"],
      en: ["Three", "Five", "Seven", "Ten"],
      ar: ["ثلاثة", "خمسة", "سبعة", "عشرة"],
    },
    correctAnswer: { es: "Siete", en: "Seven", ar: "سبعة" },
    category: "Corán y General",
    difficulty: "easy",
    explanation: {
      es: "El tawaf consiste en siete vueltas alrededor de la Kaaba en sentido contrario a las agujas del reloj, comenzando desde la Piedra Negra, tal como lo hizo el Profeta (ﷺ).",
      en: "Tawaf consists of seven counter-clockwise circuits around the Kaaba, starting from the Black Stone, as performed by the Prophet (ﷺ).",
      ar: "الطواف سبعة أشواط حول الكعبة عكس عقارب الساعة، تبدأ من الحجر الأسود، كما فعل النبي ﷺ.",
    },
    source: "Sahih al-Bukhari 1603 — el Profeta ﷺ circunvaló la Kaaba siete veces; sunnah.com/bukhari:1603",
    verified: true,
    flag: false,
  },
  {
    id: 9103,
    question: {
      es: "¿Qué montura milagrosa llevó al Profeta (ﷺ) en el Viaje Nocturno (Isra)?",
      en: "Which miraculous mount carried the Prophet (ﷺ) on the Night Journey (Isra)?",
      ar: "ما الدابة التي حملت النبي ﷺ في رحلة الإسراء؟",
    },
    options: {
      es: ["Al-Qaswa", "Al-Buraq", "Duldul", "Al-Adha"],
      en: ["Al-Qaswa", "Al-Buraq", "Duldul", "Al-Adha"],
      ar: ["القصواء", "البُراق", "دلدل", "الأضحى"],
    },
    correctAnswer: { es: "Al-Buraq", en: "Al-Buraq", ar: "البُراق" },
    category: "Seerah",
    difficulty: "easy",
    explanation: {
      es: "Al-Buraq fue la montura blanca que llevó al Profeta (ﷺ) de La Meca a Jerusalén en el Viaje Nocturno. Al-Qaswa era su camella y Duldul su mula.",
      en: "Al-Buraq was the white mount that carried the Prophet (ﷺ) from Mecca to Jerusalem on the Night Journey. Al-Qaswa was his she-camel and Duldul his mule.",
      ar: "البُراق هو الدابة البيضاء التي حملت النبي ﷺ من مكة إلى بيت المقدس في الإسراء. أما القصواء فناقته ودلدل بغلته.",
    },
    source: "Sahih al-Bukhari 3887 — descripción de al-Buraq en el Isra; sunnah.com/bukhari:3887",
    verified: true,
    flag: false,
  },
  {
    id: 9104,
    question: {
      es: "¿Qué profeta es conocido como «el padre de los profetas»?",
      en: "Which prophet is known as \"the father of the prophets\"?",
      ar: "من هو النبي المعروف بـ«أبي الأنبياء»؟",
    },
    options: {
      es: ["El Profeta Nuh", "El Profeta Ibrahim", "El Profeta Musa", "El Profeta Adam"],
      en: ["Prophet Nuh", "Prophet Ibrahim", "Prophet Musa", "Prophet Adam"],
      ar: ["النبي نوح", "النبي إبراهيم", "النبي موسى", "النبي آدم"],
    },
    correctAnswer: { es: "El Profeta Ibrahim", en: "Prophet Ibrahim", ar: "النبي إبراهيم" },
    category: "Profetas",
    difficulty: "easy",
    explanation: {
      es: "Ibrahim (AS) es llamado «padre de los profetas» porque de su descendencia vinieron numerosos profetas, incluidos Ismail, Ishaq, Yaqub, Yusuf, Musa, Isa y Muhammad (ﷺ). El Corán lo llama «vuestro padre Ibrahim» (22:78).",
      en: "Ibrahim (AS) is called \"father of the prophets\" because many prophets descended from him, including Ismail, Ishaq, Yaqub, Yusuf, Musa, Isa and Muhammad (ﷺ). The Quran calls him \"your father Ibrahim\" (22:78).",
      ar: "سُمّي إبراهيم عليه السلام «أبا الأنبياء» لأن من ذريته جاء كثير من الأنبياء، منهم إسماعيل وإسحاق ويعقوب ويوسف وموسى وعيسى ومحمد ﷺ. وسمّاه القرآن «أبيكم إبراهيم» (الحج: 78).",
    },
    source: "Corán 22:78 — «la religión de vuestro padre Ibrahim»; quran.com/22/78",
    verified: true,
    flag: false,
  },
  {
    id: 9105,
    question: {
      es: "¿Quién era el padre del Profeta Yusuf?",
      en: "Who was the father of Prophet Yusuf?",
      ar: "من هو والد النبي يوسف؟",
    },
    options: {
      es: ["El Profeta Yaqub", "El Profeta Ishaq", "El Profeta Ibrahim", "El Profeta Harun"],
      en: ["Prophet Yaqub", "Prophet Ishaq", "Prophet Ibrahim", "Prophet Harun"],
      ar: ["النبي يعقوب", "النبي إسحاق", "النبي إبراهيم", "النبي هارون"],
    },
    correctAnswer: { es: "El Profeta Yaqub", en: "Prophet Yaqub", ar: "النبي يعقوب" },
    category: "Profetas",
    difficulty: "easy",
    explanation: {
      es: "Yusuf (AS) era hijo del Profeta Yaqub (AS). La Sura Yusuf comienza con el joven contando su sueño a su padre: «Cuando Yusuf dijo a su padre: ¡Padre mío! He visto once estrellas...» (12:4).",
      en: "Yusuf (AS) was the son of Prophet Yaqub (AS). Surah Yusuf opens with the young boy telling his dream to his father: \"When Yusuf said to his father: O my father! I saw eleven stars...\" (12:4).",
      ar: "يوسف عليه السلام هو ابن النبي يعقوب عليه السلام. تبدأ سورة يوسف بقوله لأبيه: «يَا أَبَتِ إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا...» (يوسف: 4).",
    },
    source: "Corán 12:4 — Yusuf relata su sueño a su padre Yaqub; quran.com/12/4",
    verified: true,
    flag: false,
  },
  {
    id: 9106,
    question: {
      es: "¿A qué tribu de La Meca pertenecía el Profeta Muhammad (ﷺ)?",
      en: "To which tribe of Mecca did Prophet Muhammad (ﷺ) belong?",
      ar: "إلى أي قبيلة من قبائل مكة ينتمي النبي محمد ﷺ؟",
    },
    options: {
      es: ["Banu Tamim", "Quraysh", "Banu Khazraj", "Banu Aws"],
      en: ["Banu Tamim", "Quraysh", "Banu Khazraj", "Banu Aws"],
      ar: ["بنو تميم", "قريش", "بنو الخزرج", "بنو الأوس"],
    },
    correctAnswer: { es: "Quraysh", en: "Quraysh", ar: "قريش" },
    category: "Seerah",
    difficulty: "easy",
    explanation: {
      es: "El Profeta (ﷺ) nació en la tribu de Quraysh, en el clan de Banu Hashim. Quraysh custodiaba la Kaaba y una sura del Corán lleva su nombre (Sura 106). Khazraj y Aws eran las tribus de Medina.",
      en: "The Prophet (ﷺ) was born into the Quraysh tribe, in the clan of Banu Hashim. Quraysh were custodians of the Kaaba and a surah of the Quran bears their name (Surah 106). Khazraj and Aws were the tribes of Medina.",
      ar: "وُلد النبي ﷺ في قبيلة قريش، من بني هاشم. كانت قريش سَدَنة الكعبة وسُمّيت سورة من القرآن باسمها (سورة 106). أما الخزرج والأوس فقبيلتا المدينة.",
    },
    source: "Corán 106 (Sura Quraysh) y Sahih al-Bukhari 3491 — linaje del Profeta ﷺ; sunnah.com/bukhari:3491",
    verified: true,
    flag: false,
  },

  // ── MEDIUM ──────────────────────────────────────────────────────────────
  {
    id: 9107,
    question: {
      es: "¿Qué sura del Corán lleva el nombre de una mujer?",
      en: "Which surah of the Quran is named after a woman?",
      ar: "ما السورة التي سُمّيت باسم امرأة في القرآن؟",
    },
    options: {
      es: ["Sura Maryam", "Sura Fatimah", "Sura Khadijah", "Sura Aisha"],
      en: ["Surah Maryam", "Surah Fatimah", "Surah Khadijah", "Surah Aisha"],
      ar: ["سورة مريم", "سورة فاطمة", "سورة خديجة", "سورة عائشة"],
    },
    correctAnswer: { es: "Sura Maryam", en: "Surah Maryam", ar: "سورة مريم" },
    category: "Corán y General",
    difficulty: "medium",
    explanation: {
      es: "La Sura 19, Maryam, es la única sura del Corán que lleva el nombre de una mujer: Maryam (María), madre del Profeta Isa. Es además la única mujer mencionada por su nombre en el Corán.",
      en: "Surah 19, Maryam, is the only surah of the Quran named after a woman: Maryam (Mary), mother of Prophet Isa. She is also the only woman mentioned by name in the Quran.",
      ar: "سورة 19، مريم، هي السورة الوحيدة في القرآن المسماة باسم امرأة: مريم أم النبي عيسى. وهي أيضاً المرأة الوحيدة المذكورة باسمها في القرآن.",
    },
    source: "Corán 19 (Sura Maryam) — única sura con nombre de mujer; quran.com/19",
    verified: true,
    flag: false,
  },
  {
    id: 9108,
    question: {
      es: "¿A qué batalla llama el Corán «el día del Furqan (el Criterio)»?",
      en: "Which battle does the Quran call \"the day of the Furqan (the Criterion)\"?",
      ar: "أي معركة سمّاها القرآن «يوم الفرقان»؟",
    },
    options: {
      es: ["La Batalla de Uhud", "La Batalla de Badr", "La Batalla del Foso", "La Batalla de Hunayn"],
      en: ["The Battle of Uhud", "The Battle of Badr", "The Battle of the Trench", "The Battle of Hunayn"],
      ar: ["غزوة أُحد", "غزوة بدر", "غزوة الخندق", "غزوة حُنين"],
    },
    correctAnswer: { es: "La Batalla de Badr", en: "The Battle of Badr", ar: "غزوة بدر" },
    category: "Corán y General",
    difficulty: "medium",
    explanation: {
      es: "El Corán llama a Badr «el día del Furqan, el día en que se encontraron los dos ejércitos» (8:41), porque distinguió la verdad de la falsedad con la primera gran victoria del Islam.",
      en: "The Quran calls Badr \"the day of the Furqan, the day the two armies met\" (8:41), because it separated truth from falsehood with Islam's first great victory.",
      ar: "سمّى القرآن بدراً «يوم الفرقان يوم التقى الجمعان» (الأنفال: 41)، لأنه فرّق بين الحق والباطل بأول نصر عظيم للإسلام.",
    },
    source: "Corán 8:41 — «el día del Furqan, el día en que se encontraron los dos ejércitos»; quran.com/8/41",
    verified: true,
    flag: false,
  },
  {
    id: 9109,
    question: {
      es: "¿Qué compañera fue apodada «Dhat an-Nitaqayn» (la de los dos cinturones)?",
      en: "Which female companion was nicknamed \"Dhat an-Nitaqayn\" (she of the two waistbands)?",
      ar: "من الصحابية الملقبة بـ«ذات النطاقين»؟",
    },
    options: {
      es: ["Asma bint Abi Bakr", "Aisha bint Abi Bakr", "Fatimah bint Muhammad", "Umm Salamah"],
      en: ["Asma bint Abi Bakr", "Aisha bint Abi Bakr", "Fatimah bint Muhammad", "Umm Salamah"],
      ar: ["أسماء بنت أبي بكر", "عائشة بنت أبي بكر", "فاطمة بنت محمد", "أم سلمة"],
    },
    correctAnswer: {
      es: "Asma bint Abi Bakr",
      en: "Asma bint Abi Bakr",
      ar: "أسماء بنت أبي بكر",
    },
    category: "Seerah",
    difficulty: "medium",
    explanation: {
      es: "Durante la Hégira, Asma bint Abi Bakr partió su cinturón en dos para atar las provisiones del Profeta (ﷺ) y de su padre Abu Bakr en la cueva de Zawr. Por ello fue apodada «la de los dos cinturones».",
      en: "During the Hijra, Asma bint Abi Bakr tore her waistband in two to tie the provisions of the Prophet (ﷺ) and her father Abu Bakr at the cave of Thawr. Hence her nickname \"she of the two waistbands\".",
      ar: "في الهجرة شقّت أسماء بنت أبي بكر نطاقها نصفين لتربط زاد النبي ﷺ وأبيها أبي بكر عند غار ثور، فلُقّبت بـ«ذات النطاقين».",
    },
    source: "Sahih al-Bukhari 3907 — Asma y las provisiones de la Hégira; sunnah.com/bukhari:3907",
    verified: true,
    flag: false,
  },
  {
    id: 9110,
    question: {
      es: "¿Qué esposa del Profeta (ﷺ) era hija de Umar ibn al-Khattab?",
      en: "Which wife of the Prophet (ﷺ) was the daughter of Umar ibn al-Khattab?",
      ar: "أي زوجة للنبي ﷺ كانت ابنة عمر بن الخطاب؟",
    },
    options: {
      es: ["Hafsa", "Aisha", "Zaynab bint Jahsh", "Safiyyah"],
      en: ["Hafsa", "Aisha", "Zaynab bint Jahsh", "Safiyyah"],
      ar: ["حفصة", "عائشة", "زينب بنت جحش", "صفية"],
    },
    correctAnswer: { es: "Hafsa", en: "Hafsa", ar: "حفصة" },
    category: "Seerah",
    difficulty: "medium",
    explanation: {
      es: "Hafsa bint Umar se casó con el Profeta (ﷺ) tras enviudar. A ella se le confió la custodia del primer mushaf (copia compilada del Corán) tras la muerte de Abu Bakr.",
      en: "Hafsa bint Umar married the Prophet (ﷺ) after being widowed. She was entrusted with the first compiled mushaf (copy of the Quran) after Abu Bakr's death.",
      ar: "تزوّج النبي ﷺ حفصة بنت عمر بعد ترمّلها. وقد عُهد إليها بحفظ المصحف الأول المجموع بعد وفاة أبي بكر.",
    },
    source: "Sahih al-Bukhari 4986 — el mushaf quedó bajo custodia de Hafsa; sunnah.com/bukhari:4986",
    verified: true,
    flag: false,
  },
  {
    id: 9111,
    question: {
      es: "¿Qué profeta pidió a Allah «un reino que nadie después de mí pueda tener»?",
      en: "Which prophet asked Allah for \"a kingdom such as none after me shall have\"?",
      ar: "أي نبي سأل الله «مُلكاً لا ينبغي لأحد من بعدي»؟",
    },
    options: {
      es: ["El Profeta Dawud", "El Profeta Sulayman", "El Profeta Yusuf", "El Profeta Musa"],
      en: ["Prophet Dawud", "Prophet Sulayman", "Prophet Yusuf", "Prophet Musa"],
      ar: ["النبي داود", "النبي سليمان", "النبي يوسف", "النبي موسى"],
    },
    correctAnswer: { es: "El Profeta Sulayman", en: "Prophet Sulayman", ar: "النبي سليمان" },
    category: "Profetas",
    difficulty: "medium",
    explanation: {
      es: "Sulayman (AS) suplicó: «¡Señor mío! Perdóname y concédeme un reino que nadie después de mí pueda tener» (38:35). Allah le concedió el dominio del viento y de los yinn.",
      en: "Sulayman (AS) prayed: \"My Lord! Forgive me and grant me a kingdom such as none after me shall have\" (38:35). Allah granted him command of the wind and the jinn.",
      ar: "دعا سليمان عليه السلام: «رَبِّ اغْفِرْ لِي وَهَبْ لِي مُلْكًا لَّا يَنبَغِي لِأَحَدٍ مِّن بَعْدِي» (ص: 35). فسخّر الله له الريح والجن.",
    },
    source: "Corán 38:35 — la súplica de Sulayman; quran.com/38/35",
    verified: true,
    flag: false,
  },
  {
    id: 9112,
    question: {
      es: "¿Qué profeta fue enviado al pueblo de Madyan?",
      en: "Which prophet was sent to the people of Madyan?",
      ar: "أي نبي أُرسل إلى أهل مدين؟",
    },
    options: {
      es: ["El Profeta Shuayb", "El Profeta Hud", "El Profeta Salih", "El Profeta Lut"],
      en: ["Prophet Shuayb", "Prophet Hud", "Prophet Salih", "Prophet Lut"],
      ar: ["النبي شعيب", "النبي هود", "النبي صالح", "النبي لوط"],
    },
    correctAnswer: { es: "El Profeta Shuayb", en: "Prophet Shuayb", ar: "النبي شعيب" },
    category: "Profetas",
    difficulty: "medium",
    explanation: {
      es: "Shuayb (AS) fue enviado a Madyan, un pueblo de comerciantes que estafaba en los pesos y medidas: «Y a Madyan, a su hermano Shuayb» (7:85). Les ordenó la justicia en el comercio.",
      en: "Shuayb (AS) was sent to Madyan, a trading people who cheated in weights and measures: \"And to Madyan, their brother Shuayb\" (7:85). He commanded them to be just in trade.",
      ar: "أُرسل شعيب عليه السلام إلى مدين، قومٍ تجّارٍ كانوا يبخسون المكيال والميزان: «وَإِلَىٰ مَدْيَنَ أَخَاهُمْ شُعَيْبًا» (الأعراف: 85)، فأمرهم بالعدل في التجارة.",
    },
    source: "Corán 7:85 — «Y a Madyan, a su hermano Shuayb»; quran.com/7/85",
    verified: true,
    flag: false,
  },

  // ── HARD ────────────────────────────────────────────────────────────────
  {
    id: 9113,
    question: {
      es: "¿Qué compañero narró el hadiz «Las obras no son sino según las intenciones»?",
      en: "Which companion narrated the hadith \"Actions are but by intentions\"?",
      ar: "من الصحابي الذي روى حديث «إنما الأعمال بالنيات»؟",
    },
    options: {
      es: ["Abu Hurayrah", "Umar ibn al-Khattab", "Anas ibn Malik", "Abdullah ibn Umar"],
      en: ["Abu Hurayrah", "Umar ibn al-Khattab", "Anas ibn Malik", "Abdullah ibn Umar"],
      ar: ["أبو هريرة", "عمر بن الخطاب", "أنس بن مالك", "عبد الله بن عمر"],
    },
    correctAnswer: {
      es: "Umar ibn al-Khattab",
      en: "Umar ibn al-Khattab",
      ar: "عمر بن الخطاب",
    },
    category: "Corán y General",
    difficulty: "hard",
    explanation: {
      es: "Este hadiz, el primero del Sahih al-Bukhari y de los 40 de an-Nawawi, fue narrado por Umar ibn al-Khattab. Es uno de los pocos hadices célebres transmitidos por él, pese a su rango.",
      en: "This hadith, the first in Sahih al-Bukhari and in an-Nawawi's 40, was narrated by Umar ibn al-Khattab. It is one of the few famous hadiths transmitted by him despite his rank.",
      ar: "هذا الحديث، أول حديث في صحيح البخاري وفي أربعين النووي، رواه عمر بن الخطاب. وهو من الأحاديث المشهورة القليلة المروية عنه رغم مكانته.",
    },
    source: "Sahih al-Bukhari 1 — narrado por Umar ibn al-Khattab; sunnah.com/bukhari:1",
    verified: true,
    flag: false,
  },
  {
    id: 9114,
    question: {
      es: "¿Cuál fue la última sura completa en ser revelada?",
      en: "Which was the last complete surah to be revealed?",
      ar: "ما آخر سورة كاملة نزلت من القرآن؟",
    },
    options: {
      es: ["Sura al-Ikhlas", "Sura an-Nasr", "Sura al-Falaq", "Sura al-Kawthar"],
      en: ["Surah al-Ikhlas", "Surah an-Nasr", "Surah al-Falaq", "Surah al-Kawthar"],
      ar: ["سورة الإخلاص", "سورة النصر", "سورة الفلق", "سورة الكوثر"],
    },
    correctAnswer: { es: "Sura an-Nasr", en: "Surah an-Nasr", ar: "سورة النصر" },
    category: "Corán y General",
    difficulty: "hard",
    explanation: {
      es: "Según el hadiz de Ibn Abbas en Sahih Muslim, an-Nasr (110) fue la última sura completa revelada. Ojo: an-Nas (114) es la última en el orden del mushaf, no en orden de revelación.",
      en: "According to Ibn Abbas's hadith in Sahih Muslim, an-Nasr (110) was the last complete surah revealed. Note: an-Nas (114) is last in mushaf order, not in order of revelation.",
      ar: "وفق حديث ابن عباس في صحيح مسلم، كانت سورة النصر (110) آخر سورة كاملة نزلت. تنبيه: سورة الناس (114) هي الأخيرة في ترتيب المصحف لا في ترتيب النزول.",
    },
    source: "Sahih Muslim 3024 — an-Nasr, última sura completa revelada; sunnah.com/muslim:3024",
    verified: true,
    flag: false,
  },
  {
    id: 9115,
    question: {
      es: "¿Qué profeta es mencionado por su nombre más veces en el Corán?",
      en: "Which prophet is mentioned by name the most times in the Quran?",
      ar: "أي نبي ذُكر باسمه أكثر من غيره في القرآن؟",
    },
    options: {
      es: ["El Profeta Ibrahim", "El Profeta Musa", "El Profeta Isa", "El Profeta Nuh"],
      en: ["Prophet Ibrahim", "Prophet Musa", "Prophet Isa", "Prophet Nuh"],
      ar: ["النبي إبراهيم", "النبي موسى", "النبي عيسى", "النبي نوح"],
    },
    correctAnswer: { es: "El Profeta Musa", en: "Prophet Musa", ar: "النبي موسى" },
    category: "Profetas",
    difficulty: "hard",
    explanation: {
      es: "Musa (AS) es el profeta más mencionado por nombre en el Corán: unas 136 veces. Le siguen Ibrahim (~69) e Nuh (~43). Su historia con el Faraón se repite en numerosas suras.",
      en: "Musa (AS) is the prophet most mentioned by name in the Quran: about 136 times. He is followed by Ibrahim (~69) and Nuh (~43). His story with Pharaoh recurs across many surahs.",
      ar: "موسى عليه السلام هو أكثر الأنبياء ذكراً بالاسم في القرآن: نحو 136 مرة، يليه إبراهيم (~69) ونوح (~43). وتتكرر قصته مع فرعون في سور كثيرة.",
    },
    source: "Recuento coránico estándar (concordancia del mushaf) — Musa: ~136 menciones; corpus.quran.com",
    verified: true,
    flag: false,
  },
  {
    id: 9116,
    question: {
      es: "¿Qué compañero era conocido como el guardián del secreto del Profeta (ﷺ)?",
      en: "Which companion was known as the keeper of the Prophet's (ﷺ) secret?",
      ar: "من الصحابي المعروف بصاحب سرّ النبي ﷺ؟",
    },
    options: {
      es: ["Hudhayfah ibn al-Yaman", "Abu Dharr al-Ghifari", "Salman al-Farisi", "Ammar ibn Yasir"],
      en: ["Hudhayfah ibn al-Yaman", "Abu Dharr al-Ghifari", "Salman al-Farisi", "Ammar ibn Yasir"],
      ar: ["حذيفة بن اليمان", "أبو ذر الغفاري", "سلمان الفارسي", "عمار بن ياسر"],
    },
    correctAnswer: {
      es: "Hudhayfah ibn al-Yaman",
      en: "Hudhayfah ibn al-Yaman",
      ar: "حذيفة بن اليمان",
    },
    category: "Seerah",
    difficulty: "hard",
    explanation: {
      es: "El Profeta (ﷺ) confió a Hudhayfah los nombres de los hipócritas (munafiqun) de Medina, secreto que no reveló a nadie. Por ello se le conoce como «Sahib as-Sirr» (el del secreto). Umar le consultaba sobre ello.",
      en: "The Prophet (ﷺ) entrusted Hudhayfah with the names of the hypocrites (munafiqun) of Medina, a secret he revealed to no one. Hence he is known as \"Sahib as-Sirr\" (keeper of the secret). Umar would consult him about it.",
      ar: "أسرّ النبي ﷺ إلى حذيفة بأسماء المنافقين في المدينة، فلم يُفشِ السر لأحد، ولذلك عُرف بـ«صاحب السر». وكان عمر يستشيره في ذلك.",
    },
    source: "Sahih al-Bukhari, Libro de los Méritos de los Compañeros — Hudhayfah, sahib as-sirr; sunnah.com/bukhari/62",
    verified: true,
    flag: false,
  },
  {
    id: 9117,
    question: {
      es: "¿Cuántos takbir tiene la oración fúnebre (Salat al-Yanazah)?",
      en: "How many takbirs are there in the funeral prayer (Salat al-Janazah)?",
      ar: "كم تكبيرة في صلاة الجنازة؟",
    },
    options: {
      es: ["Dos", "Tres", "Cuatro", "Cinco"],
      en: ["Two", "Three", "Four", "Five"],
      ar: ["اثنتان", "ثلاث", "أربع", "خمس"],
    },
    correctAnswer: { es: "Cuatro", en: "Four", ar: "أربع" },
    category: "Corán y General",
    difficulty: "hard",
    explanation: {
      es: "La Salat al-Yanazah tiene cuatro takbir y se reza de pie, sin ruku ni suyud. El Profeta (ﷺ) rezó así por el Négus (an-Nayashi) de Abisinia, pronunciando cuatro takbir.",
      en: "Salat al-Janazah has four takbirs and is prayed standing, with no ruku or sujud. The Prophet (ﷺ) prayed this way for the Negus (an-Najashi) of Abyssinia, saying four takbirs.",
      ar: "صلاة الجنازة أربع تكبيرات وتُصلّى قياماً بلا ركوع ولا سجود. وقد صلّى النبي ﷺ على النجاشي ملك الحبشة فكبّر أربعاً.",
    },
    source: "Sahih al-Bukhari 1333 — oración por el Négus con cuatro takbir; sunnah.com/bukhari:1333",
    verified: true,
    flag: false,
  },
  {
    id: 9118,
    question: {
      es: "¿Cuál de estos eventos de la Seerah ocurrió primero?",
      en: "Which of these Seerah events happened first?",
      ar: "أي هذه الأحداث في السيرة وقع أولاً؟",
    },
    options: {
      es: ["El cambio de la Qibla", "La Batalla de Badr", "La Batalla de Uhud", "El Tratado de Hudaybiyyah"],
      en: ["The change of the Qibla", "The Battle of Badr", "The Battle of Uhud", "The Treaty of Hudaybiyyah"],
      ar: ["تحويل القبلة", "غزوة بدر", "غزوة أُحد", "صلح الحديبية"],
    },
    correctAnswer: {
      es: "El cambio de la Qibla",
      en: "The change of the Qibla",
      ar: "تحويل القبلة",
    },
    category: "Seerah",
    difficulty: "hard",
    explanation: {
      es: "La Qibla cambió de Jerusalén a La Meca en Shaban del 2 AH, unos 16-17 meses después de la Hégira y poco antes de Badr (Ramadán 2 AH). Uhud fue en 3 AH y Hudaybiyyah en 6 AH.",
      en: "The Qibla changed from Jerusalem to Mecca in Shaban 2 AH, about 16-17 months after the Hijra and shortly before Badr (Ramadan 2 AH). Uhud was in 3 AH and Hudaybiyyah in 6 AH.",
      ar: "تحوّلت القبلة من بيت المقدس إلى مكة في شعبان سنة 2هـ، بعد نحو 16-17 شهراً من الهجرة وقبيل بدر (رمضان 2هـ). أما أُحد فسنة 3هـ والحديبية سنة 6هـ.",
    },
    source: "Sahih al-Bukhari 40 — el cambio de Qibla a los 16-17 meses de la Hégira; sunnah.com/bukhari:40",
    verified: true,
    flag: false,
  },
];

// Safety: no id collisions
const existing = new Set(qs.map((q) => q.id));
for (const q of batch) {
  if (existing.has(q.id)) {
    console.error("ID collision:", q.id);
    process.exit(1);
  }
}

fs.writeFileSync(FILE, JSON.stringify([...qs, ...batch], null, 2) + "\n");
console.log("added", batch.length, "questions — new total:", qs.length + batch.length);
