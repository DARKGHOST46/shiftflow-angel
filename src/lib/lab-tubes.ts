export type Lang = "en" | "ar" | "fr";

/** Multilingual string. */
export type ML = { en: string; ar: string; fr: string };
/** Multilingual list of strings. */
export type MLArr = { en: string[]; ar: string[]; fr: string[] };

export type LabTube = {
  id: string;
  colorKey: string; // semantic id
  colorName: ML; // tube cap colour / name
  swatch: string; // hex for the cap indicator
  glow: string; // shadow color
  additive: ML;
  tests: MLArr; // common tests
  sample: ML;
  notes: ML;
  warnings: MLArr;
  inversions?: number;
  order?: number; // order of draw
};

export const LAB_TUBES: LabTube[] = [
  {
    id: "lavender",
    colorKey: "lavender",
    colorName: { en: "Lavender / Purple", ar: "بنفسجي", fr: "Lavande / Violet" },
    swatch: "#8b5cf6",
    glow: "139,92,246",
    additive: {
      en: "EDTA (K2 / K3)",
      ar: "EDTA (مضاد تخثر)",
      fr: "EDTA (K2 / K3)",
    },
    tests: {
      en: [
        "CBC",
        "Hemoglobin",
        "Hematocrit",
        "Platelet count",
        "Reticulocytes",
        "HbA1c",
        "Blood typing",
      ],
      ar: [
        "تعداد الدم الكامل",
        "الهيموغلوبين",
        "الهيماتوكريت",
        "تعداد الصفائح الدموية",
        "الخلايا الشبكية",
        "السكر التراكمي (HbA1c)",
        "تحديد فصيلة الدم",
      ],
      fr: [
        "NFS (hémogramme)",
        "Hémoglobine",
        "Hématocrite",
        "Numération plaquettaire",
        "Réticulocytes",
        "HbA1c",
        "Groupage sanguin",
      ],
    },
    sample: { en: "Whole blood", ar: "دم كامل", fr: "Sang total" },
    notes: {
      en: "Invert gently 8–10 times immediately after collection.",
      ar: "اقلب الأنبوب برفق 8–10 مرات فور السحب.",
      fr: "Retourner doucement 8 à 10 fois juste après le prélèvement.",
    },
    warnings: {
      en: [
        "Do NOT shake — causes hemolysis",
        "Fill to indicated line",
        "Do not centrifuge for CBC",
      ],
      ar: [
        "لا ترجّ الأنبوب — يسبب انحلال الدم",
        "املأ حتى الخط المحدد",
        "لا تستخدم الطرد المركزي لتعداد الدم الكامل",
      ],
      fr: [
        "Ne PAS agiter — provoque une hémolyse",
        "Remplir jusqu'au trait indiqué",
        "Ne pas centrifuger pour la NFS",
      ],
    },
    inversions: 10,
    order: 6,
  },
  {
    id: "lightblue",
    colorKey: "lightblue",
    colorName: { en: "Light Blue", ar: "أزرق فاتح", fr: "Bleu clair" },
    swatch: "#38bdf8",
    glow: "56,189,248",
    additive: {
      en: "Sodium citrate 3.2%",
      ar: "سيترات الصوديوم 3.2%",
      fr: "Citrate de sodium 3,2 %",
    },
    tests: {
      en: ["PT / INR", "aPTT", "Fibrinogen", "D-dimer", "Coagulation panel"],
      ar: [
        "زمن البروثرومبين (PT / INR)",
        "زمن الثرومبوبلاستين (aPTT)",
        "الفيبرينوجين",
        "D-dimer",
        "فحص التخثر",
      ],
      fr: ["TP / INR", "TCA (aPTT)", "Fibrinogène", "D-dimères", "Bilan de coagulation"],
    },
    sample: {
      en: "Plasma (citrated)",
      ar: "بلازما (مع السيترات)",
      fr: "Plasma (citraté)",
    },
    notes: {
      en: "Must be filled completely to maintain 9:1 blood-to-anticoagulant ratio.",
      ar: "يجب ملؤه بالكامل للحفاظ على نسبة 9:1 بين الدم ومضاد التخثر.",
      fr: "Doit être rempli complètement pour garder le ratio 9:1 sang/anticoagulant.",
    },
    warnings: {
      en: [
        "Underfilled tubes invalidate results",
        "Invert 3–4 times gently",
        "Process within 1 hour",
      ],
      ar: [
        "الأنابيب غير الممتلئة تُبطل النتائج",
        "اقلب 3–4 مرات برفق",
        "عالج العينة خلال ساعة واحدة",
      ],
      fr: [
        "Un tube sous-rempli invalide les résultats",
        "Retourner 3 à 4 fois doucement",
        "Traiter dans l'heure",
      ],
    },
    inversions: 4,
    order: 2,
  },
  {
    id: "red",
    colorKey: "red",
    colorName: { en: "Red", ar: "أحمر", fr: "Rouge" },
    swatch: "#ef4444",
    glow: "239,68,68",
    additive: {
      en: "None / clot activator",
      ar: "بدون / منشّط التخثر",
      fr: "Aucun / activateur de coagulation",
    },
    tests: {
      en: ["Serology", "Blood bank", "Drug levels", "Cross-match", "Viral markers"],
      ar: [
        "الفحوص المصلية",
        "بنك الدم",
        "مستويات الأدوية",
        "التوافق المتبادل",
        "الواسمات الفيروسية",
      ],
      fr: [
        "Sérologie",
        "Banque du sang",
        "Dosage de médicaments",
        "Compatibilité croisée",
        "Marqueurs viraux",
      ],
    },
    sample: { en: "Serum", ar: "مصل", fr: "Sérum" },
    notes: {
      en: "Allow to clot 30 minutes upright before centrifugation.",
      ar: "اتركه يتخثر 30 دقيقة بوضع عمودي قبل الطرد المركزي.",
      fr: "Laisser coaguler 30 minutes à la verticale avant centrifugation.",
    },
    warnings: {
      en: ["Do not invert if plain glass", "Avoid hemolysis", "Keep upright"],
      ar: ["لا تقلبه إذا كان زجاجياً عادياً", "تجنّب انحلال الدم", "احفظه بوضع عمودي"],
      fr: ["Ne pas retourner si verre simple", "Éviter l'hémolyse", "Garder à la verticale"],
    },
    inversions: 0,
    order: 3,
  },
  {
    id: "gold",
    colorKey: "gold",
    colorName: { en: "Gold / SST", ar: "ذهبي / SST", fr: "Or / SST" },
    swatch: "#eab308",
    glow: "234,179,8",
    additive: {
      en: "Clot activator + gel separator",
      ar: "منشّط التخثر + هلام فاصل",
      fr: "Activateur de coagulation + gel séparateur",
    },
    tests: {
      en: [
        "Biochemistry",
        "Urea",
        "Creatinine",
        "Electrolytes",
        "LFTs",
        "Lipid panel",
        "Hormones (TSH, T3, T4)",
        "Cardiac markers",
      ],
      ar: [
        "الكيمياء الحيوية",
        "اليوريا",
        "الكرياتينين",
        "الشوارد (الكهارل)",
        "وظائف الكبد",
        "صورة الدهون",
        "الهرمونات (TSH، T3، T4)",
        "الواسمات القلبية",
      ],
      fr: [
        "Biochimie",
        "Urée",
        "Créatinine",
        "Électrolytes",
        "Bilan hépatique",
        "Bilan lipidique",
        "Hormones (TSH, T3, T4)",
        "Marqueurs cardiaques",
      ],
    },
    sample: { en: "Serum", ar: "مصل", fr: "Sérum" },
    notes: {
      en: "Invert 5 times. Clot 30 min then centrifuge 10 min @ 3000 rpm.",
      ar: "اقلب 5 مرات. اتركه يتخثر 30 دقيقة ثم اطرده مركزياً 10 دقائق عند 3000 دورة/دقيقة.",
      fr: "Retourner 5 fois. Coaguler 30 min puis centrifuger 10 min à 3000 tr/min.",
    },
    warnings: {
      en: ["Do not freeze with gel", "Centrifuge once only", "Avoid prolonged tourniquet"],
      ar: ["لا تجمّده مع الهلام", "اطرده مركزياً مرة واحدة فقط", "تجنّب العاصبة لمدة طويلة"],
      fr: [
        "Ne pas congeler avec le gel",
        "Centrifuger une seule fois",
        "Éviter un garrot prolongé",
      ],
    },
    inversions: 5,
    order: 4,
  },
  {
    id: "green",
    colorKey: "green",
    colorName: { en: "Green", ar: "أخضر", fr: "Vert" },
    swatch: "#22c55e",
    glow: "34,197,94",
    additive: {
      en: "Lithium / Sodium heparin",
      ar: "هيبارين الليثيوم / الصوديوم",
      fr: "Héparine de lithium / sodium",
    },
    tests: {
      en: [
        "Plasma chemistry",
        "Ammonia",
        "Electrolytes (STAT)",
        "Ionized calcium",
        "Cortisol",
        "Chromosome studies",
      ],
      ar: [
        "كيمياء البلازما",
        "الأمونيا",
        "الشوارد (عاجل)",
        "الكالسيوم المتأين",
        "الكورتيزول",
        "دراسات الكروموسومات",
      ],
      fr: [
        "Chimie plasmatique",
        "Ammoniaque",
        "Électrolytes (urgent)",
        "Calcium ionisé",
        "Cortisol",
        "Étude chromosomique",
      ],
    },
    sample: {
      en: "Plasma (heparinized)",
      ar: "بلازما (مع الهيبارين)",
      fr: "Plasma (hépariné)",
    },
    notes: {
      en: "Invert 8–10 times immediately. Suitable for STAT chemistry.",
      ar: "اقلب 8–10 مرات فوراً. مناسب للتحاليل الكيميائية العاجلة.",
      fr: "Retourner 8 à 10 fois immédiatement. Adapté à la chimie urgente.",
    },
    warnings: {
      en: ["Not for coagulation tests", "Avoid for lithium level (use Na heparin)"],
      ar: ["لا يُستخدم لفحوص التخثر", "تجنّبه لقياس الليثيوم (استخدم هيبارين الصوديوم)"],
      fr: [
        "Pas pour les tests de coagulation",
        "Éviter pour le dosage du lithium (utiliser héparine Na)",
      ],
    },
    inversions: 10,
    order: 5,
  },
  {
    id: "gray",
    colorKey: "gray",
    colorName: { en: "Gray", ar: "رمادي", fr: "Gris" },
    swatch: "#9ca3af",
    glow: "156,163,175",
    additive: {
      en: "Sodium fluoride + potassium oxalate",
      ar: "فلوريد الصوديوم + أوكسالات البوتاسيوم",
      fr: "Fluorure de sodium + oxalate de potassium",
    },
    tests: {
      en: ["Glucose (fasting / GTT)", "Lactate", "Alcohol level", "Glycolysis inhibition"],
      ar: ["الغلوكوز (صائم / تحمل السكر)", "اللاكتات", "مستوى الكحول", "تثبيط تحلل السكر"],
      fr: ["Glycémie (à jeun / HGPO)", "Lactate", "Alcoolémie", "Inhibition de la glycolyse"],
    },
    sample: { en: "Plasma", ar: "بلازما", fr: "Plasma" },
    notes: {
      en: "Invert 8–10 times. Preserves glucose by inhibiting glycolysis.",
      ar: "اقلب 8–10 مرات. يحافظ على الغلوكوز بتثبيط تحلل السكر.",
      fr: "Retourner 8 à 10 fois. Préserve le glucose en inhibant la glycolyse.",
    },
    warnings: {
      en: ["Not for electrolytes", "Send to lab promptly"],
      ar: ["لا يُستخدم لقياس الشوارد", "أرسله إلى المختبر بسرعة"],
      fr: ["Pas pour les électrolytes", "Envoyer rapidement au laboratoire"],
    },
    inversions: 10,
    order: 7,
  },
  {
    id: "black",
    colorKey: "black",
    colorName: { en: "Black", ar: "أسود", fr: "Noir" },
    swatch: "#1f2937",
    glow: "31,41,55",
    additive: {
      en: "Sodium citrate 3.8%",
      ar: "سيترات الصوديوم 3.8%",
      fr: "Citrate de sodium 3,8 %",
    },
    tests: {
      en: ["ESR (Westergren)"],
      ar: ["سرعة ترسب الكريات (ESR - ويسترغرين)"],
      fr: ["VS (Westergren)"],
    },
    sample: { en: "Whole blood", ar: "دم كامل", fr: "Sang total" },
    notes: {
      en: "Fill completely. Invert 8–10 times. Run within 2 hours.",
      ar: "املأه بالكامل. اقلب 8–10 مرات. حلّله خلال ساعتين.",
      fr: "Remplir complètement. Retourner 8 à 10 fois. Analyser dans les 2 heures.",
    },
    warnings: {
      en: ["Underfilling invalidates ESR", "Keep at room temperature"],
      ar: ["النقص في الملء يُبطل فحص ESR", "احفظه في درجة حرارة الغرفة"],
      fr: ["Un sous-remplissage invalide la VS", "Conserver à température ambiante"],
    },
    inversions: 10,
    order: 8,
  },
  {
    id: "royalblue",
    colorKey: "royalblue",
    colorName: { en: "Royal Blue", ar: "أزرق ملكي", fr: "Bleu royal" },
    swatch: "#1d4ed8",
    glow: "29,78,216",
    additive: {
      en: "Trace-metal free (EDTA or plain)",
      ar: "خالٍ من المعادن النزرة (EDTA أو عادي)",
      fr: "Sans métaux traces (EDTA ou simple)",
    },
    tests: {
      en: ["Trace elements", "Zinc", "Copper", "Lead", "Toxicology"],
      ar: ["العناصر النزرة", "الزنك", "النحاس", "الرصاص", "علم السموم"],
      fr: ["Oligoéléments", "Zinc", "Cuivre", "Plomb", "Toxicologie"],
    },
    sample: { en: "Serum / Plasma", ar: "مصل / بلازما", fr: "Sérum / Plasma" },
    notes: {
      en: "Use only certified trace-metal tubes to avoid contamination.",
      ar: "استخدم فقط أنابيب معتمدة خالية من المعادن لتجنّب التلوث.",
      fr: "Utiliser uniquement des tubes certifiés sans métaux pour éviter la contamination.",
    },
    warnings: {
      en: ["Do not transfer to another tube", "Use dedicated needle set"],
      ar: ["لا تنقل العينة إلى أنبوب آخر", "استخدم مجموعة إبر مخصصة"],
      fr: ["Ne pas transférer dans un autre tube", "Utiliser un set d'aiguilles dédié"],
    },
    inversions: 8,
  },
  {
    id: "yellow",
    colorKey: "yellow",
    colorName: { en: "Yellow (ACD)", ar: "أصفر (ACD)", fr: "Jaune (ACD)" },
    swatch: "#facc15",
    glow: "250,204,21",
    additive: {
      en: "ACD (Acid Citrate Dextrose)",
      ar: "ACD (حمض السيترات والدكستروز)",
      fr: "ACD (Acide Citrate Dextrose)",
    },
    tests: {
      en: ["HLA typing", "Paternity testing", "DNA studies", "Blood culture (SPS variant)"],
      ar: ["تنميط HLA", "اختبار الأبوة", "دراسات الحمض النووي (DNA)", "زرع الدم (نوع SPS)"],
      fr: ["Typage HLA", "Test de paternité", "Études ADN", "Hémoculture (variante SPS)"],
    },
    sample: { en: "Whole blood", ar: "دم كامل", fr: "Sang total" },
    notes: {
      en: "Invert 8 times. Protect from extreme temperatures.",
      ar: "اقلب 8 مرات. احمِه من درجات الحرارة القصوى.",
      fr: "Retourner 8 fois. Protéger des températures extrêmes.",
    },
    warnings: {
      en: ["SPS variant is for cultures only", "Do not confuse with SST"],
      ar: ["نوع SPS مخصص للزرع فقط", "لا تخلط بينه وبين SST"],
      fr: ["La variante SPS est réservée aux cultures", "Ne pas confondre avec le SST"],
    },
    inversions: 8,
  },
  {
    id: "pink",
    colorKey: "pink",
    colorName: { en: "Pink", ar: "وردي", fr: "Rose" },
    swatch: "#ec4899",
    glow: "236,72,153",
    additive: { en: "EDTA (K2)", ar: "EDTA (K2)", fr: "EDTA (K2)" },
    tests: {
      en: ["Blood bank / Type & Screen", "Cross-match"],
      ar: ["بنك الدم / تحديد الفصيلة والفرز", "التوافق المتبادل"],
      fr: ["Banque du sang / Groupage & RAI", "Compatibilité croisée"],
    },
    sample: { en: "Whole blood", ar: "دم كامل", fr: "Sang total" },
    notes: {
      en: "Required by most blood banks for transfusion compatibility.",
      ar: "مطلوب من معظم بنوك الدم للتأكد من توافق نقل الدم.",
      fr: "Exigé par la plupart des banques du sang pour la compatibilité transfusionnelle.",
    },
    warnings: {
      en: ["Label at bedside per protocol", "Two patient identifiers required"],
      ar: ["وسّم الأنبوب بجانب المريض حسب البروتوكول", "مطلوب معرّفان للمريض"],
      fr: ["Étiqueter au lit du patient selon le protocole", "Deux identifiants patient requis"],
    },
    inversions: 8,
  },
];

export type RapidLookup = { id: string; test: ML; tubeIds: string[]; hint: ML };

export const RAPID_LOOKUP: RapidLookup[] = [
  {
    id: "cbc",
    test: { en: "CBC", ar: "تعداد الدم الكامل", fr: "NFS" },
    tubeIds: ["lavender"],
    hint: { en: "Lavender EDTA", ar: "بنفسجي EDTA", fr: "Lavande EDTA" },
  },
  {
    id: "pt-inr",
    test: { en: "PT / INR", ar: "زمن البروثرومبين", fr: "TP / INR" },
    tubeIds: ["lightblue"],
    hint: { en: "Light blue citrate", ar: "أزرق فاتح سيترات", fr: "Bleu clair citrate" },
  },
  {
    id: "aptt",
    test: { en: "aPTT", ar: "زمن الثرومبوبلاستين", fr: "TCA" },
    tubeIds: ["lightblue"],
    hint: { en: "Light blue citrate", ar: "أزرق فاتح سيترات", fr: "Bleu clair citrate" },
  },
  {
    id: "creatinine",
    test: { en: "Creatinine", ar: "الكرياتينين", fr: "Créatinine" },
    tubeIds: ["gold", "green"],
    hint: { en: "Gold SST or Green", ar: "ذهبي SST أو أخضر", fr: "Or SST ou Vert" },
  },
  {
    id: "urea",
    test: { en: "Urea (BUN)", ar: "اليوريا", fr: "Urée" },
    tubeIds: ["gold"],
    hint: { en: "Gold SST", ar: "ذهبي SST", fr: "Or SST" },
  },
  {
    id: "electrolytes",
    test: { en: "Electrolytes", ar: "الشوارد", fr: "Électrolytes" },
    tubeIds: ["gold", "green"],
    hint: { en: "SST or Heparin", ar: "SST أو هيبارين", fr: "SST ou héparine" },
  },
  {
    id: "glucose",
    test: { en: "Glucose", ar: "الغلوكوز", fr: "Glycémie" },
    tubeIds: ["gray"],
    hint: { en: "Gray fluoride", ar: "رمادي فلوريد", fr: "Gris fluorure" },
  },
  {
    id: "hba1c",
    test: { en: "HbA1c", ar: "السكر التراكمي", fr: "HbA1c" },
    tubeIds: ["lavender"],
    hint: { en: "Lavender EDTA", ar: "بنفسجي EDTA", fr: "Lavande EDTA" },
  },
  {
    id: "esr",
    test: { en: "ESR", ar: "سرعة الترسب", fr: "VS" },
    tubeIds: ["black"],
    hint: { en: "Black citrate", ar: "أسود سيترات", fr: "Noir citrate" },
  },
  {
    id: "crossmatch",
    test: { en: "Cross-match", ar: "التوافق المتبادل", fr: "Compatibilité croisée" },
    tubeIds: ["pink", "red"],
    hint: { en: "Pink EDTA / Red", ar: "وردي EDTA / أحمر", fr: "Rose EDTA / Rouge" },
  },
  {
    id: "troponin",
    test: { en: "Troponin", ar: "التروبونين", fr: "Troponine" },
    tubeIds: ["gold"],
    hint: { en: "Gold SST", ar: "ذهبي SST", fr: "Or SST" },
  },
  {
    id: "thyroid",
    test: { en: "TSH / T3 / T4", ar: "هرمونات الغدة الدرقية", fr: "TSH / T3 / T4" },
    tubeIds: ["gold"],
    hint: { en: "Gold SST", ar: "ذهبي SST", fr: "Or SST" },
  },
  {
    id: "lfts",
    test: { en: "LFTs", ar: "وظائف الكبد", fr: "Bilan hépatique" },
    tubeIds: ["gold"],
    hint: { en: "Gold SST", ar: "ذهبي SST", fr: "Or SST" },
  },
  {
    id: "lipids",
    test: { en: "Lipid panel", ar: "صورة الدهون", fr: "Bilan lipidique" },
    tubeIds: ["gold"],
    hint: { en: "Gold SST (fasting)", ar: "ذهبي SST (صائم)", fr: "Or SST (à jeun)" },
  },
  {
    id: "ammonia",
    test: { en: "Ammonia", ar: "الأمونيا", fr: "Ammoniaque" },
    tubeIds: ["green"],
    hint: {
      en: "Green heparin (on ice)",
      ar: "أخضر هيبارين (على الثلج)",
      fr: "Vert héparine (sur glace)",
    },
  },
  {
    id: "lactate",
    test: { en: "Lactate", ar: "اللاكتات", fr: "Lactate" },
    tubeIds: ["gray"],
    hint: { en: "Gray (on ice)", ar: "رمادي (على الثلج)", fr: "Gris (sur glace)" },
  },
  {
    id: "ddimer",
    test: { en: "D-dimer", ar: "D-dimer", fr: "D-dimères" },
    tubeIds: ["lightblue"],
    hint: { en: "Light blue citrate", ar: "أزرق فاتح سيترات", fr: "Bleu clair citrate" },
  },
  {
    id: "bloodtyping",
    test: { en: "Blood typing", ar: "تحديد فصيلة الدم", fr: "Groupage sanguin" },
    tubeIds: ["lavender", "pink"],
    hint: { en: "EDTA tubes", ar: "أنابيب EDTA", fr: "Tubes EDTA" },
  },
];
