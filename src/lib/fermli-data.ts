// Fermli — Urgent nursing knowledge base + Algerian nurse law digest
// All entries are localized in 3 languages. Content is for educational
// reference and never replaces hospital protocols.

export type FermliLang = "en" | "ar" | "fr";

export type FermliCard = {
  id: string;
  category: "vitals" | "emergency" | "drug" | "calculation" | "triage" | "infection";
  title: { en: string; ar: string; fr: string };
  summary: { en: string; ar: string; fr: string };
  body: { en: string; ar: string; fr: string };
  tags?: string[];
};

export type AlgerianLaw = {
  id: string;
  ref: string; // legal reference (decree / law number)
  title: { en: string; ar: string; fr: string };
  summary: { en: string; ar: string; fr: string };
  body: { en: string; ar: string; fr: string };
};

export const FERMLI_CARDS: FermliCard[] = [
  {
    id: "vitals-adult",
    category: "vitals",
    title: {
      en: "Adult Vital Signs",
      ar: "العلامات الحيوية للبالغين",
      fr: "Constantes Adulte",
    },
    summary: {
      en: "HR · BP · RR · SpO₂ · Temp",
      ar: "النبض · الضغط · التنفس · الأكسجين · الحرارة",
      fr: "FC · PA · FR · SpO₂ · Temp",
    },
    body: {
      en: "• HR: 60–100 bpm\n• BP: 90/60 – 120/80 mmHg\n• RR: 12–20 / min\n• SpO₂: > 95% (88–92% if COPD)\n• Temp: 36.5 – 37.5 °C\n• Capillary refill: < 2 s",
      ar: "• النبض: 60-100/د\n• الضغط: 90/60 - 120/80\n• التنفس: 12-20/د\n• الأكسجين: > 95% (88-92% للانسداد الرئوي المزمن)\n• الحرارة: 36.5 - 37.5°م\n• امتلاء الشعيرات: < 2ث",
      fr: "• FC : 60-100/min\n• PA : 90/60 – 120/80 mmHg\n• FR : 12-20/min\n• SpO₂ : > 95% (88-92% si BPCO)\n• Temp : 36,5 – 37,5 °C\n• TRC : < 2 s",
    },
    tags: ["vitals", "normal"],
  },
  {
    id: "vitals-pediatric",
    category: "vitals",
    title: {
      en: "Pediatric Vital Signs",
      ar: "العلامات الحيوية للأطفال",
      fr: "Constantes Pédiatriques",
    },
    summary: {
      en: "By age group",
      ar: "حسب العمر",
      fr: "Par tranche d'âge",
    },
    body: {
      en: "Neonate: HR 120-160 · RR 30-60\nInfant (<1y): HR 100-160 · RR 25-50\nToddler (1-3y): HR 90-150 · RR 20-30\nPreschool: HR 80-140 · RR 20-25\nSchool: HR 70-120 · RR 15-22\nTeen: HR 60-100 · RR 12-20",
      ar: "حديث الولادة: نبض 120-160 · تنفس 30-60\nرضيع: نبض 100-160 · تنفس 25-50\nطفل صغير: نبض 90-150 · تنفس 20-30\nقبل المدرسة: نبض 80-140 · تنفس 20-25\nمدرسي: نبض 70-120 · تنفس 15-22\nمراهق: نبض 60-100 · تنفس 12-20",
      fr: "Nouveau-né : FC 120-160 · FR 30-60\nNourrisson : FC 100-160 · FR 25-50\nPetit enfant : FC 90-150 · FR 20-30\nPré-scolaire : FC 80-140 · FR 20-25\nÉcolier : FC 70-120 · FR 15-22\nAdolescent : FC 60-100 · FR 12-20",
    },
  },
  {
    id: "emerg-cpr",
    category: "emergency",
    title: {
      en: "Adult CPR — BLS",
      ar: "الإنعاش القلبي للبالغين",
      fr: "RCP Adulte — BLS",
    },
    summary: {
      en: "100-120/min · 5-6 cm · 30:2",
      ar: "100-120/د · 5-6 سم · 30:2",
      fr: "100-120/min · 5-6 cm · 30:2",
    },
    body: {
      en: "1. Check responsiveness + breathing (≤10s)\n2. Call code / activate emergency\n3. Compressions: rate 100-120/min, depth 5-6 cm, full recoil\n4. Ratio 30:2 (no advanced airway)\n5. Rotate compressor every 2 min\n6. Defibrillate ASAP if VF/pVT\n7. Adrenaline 1 mg IV/IO every 3-5 min\n8. Amiodarone 300 mg IV after 3rd shock",
      ar: "1. تحقق من الاستجابة والتنفس (≤10ث)\n2. نادِ على الفريق وفعّل الطوارئ\n3. الضغطات: 100-120/د، عمق 5-6 سم، ارتداد كامل\n4. النسبة 30:2 (بدون مجرى هواء متقدم)\n5. تبديل الضاغط كل دقيقتين\n6. صدمة كهربائية فوراً عند VF/pVT\n7. أدرينالين 1 ملغ وريدي كل 3-5 د\n8. أميودارون 300 ملغ وريدي بعد الصدمة الثالثة",
      fr: "1. Conscience + ventilation (≤10s)\n2. Alerte / appel code\n3. Compressions : 100-120/min, 5-6 cm, relâchement complet\n4. Ratio 30:2 (sans intubation)\n5. Relais toutes les 2 min\n6. Défibrillation immédiate si FV/TV sans pouls\n7. Adrénaline 1 mg IV/IO toutes les 3-5 min\n8. Amiodarone 300 mg IV après 3e choc",
    },
    tags: ["urgent", "code blue"],
  },
  {
    id: "emerg-anaphylaxis",
    category: "emergency",
    title: {
      en: "Anaphylaxis",
      ar: "الصدمة التحسسية",
      fr: "Anaphylaxie",
    },
    summary: {
      en: "Adrenaline IM 0.5 mg first",
      ar: "أدرينالين عضلي 0.5 ملغ أولاً",
      fr: "Adrénaline IM 0,5 mg en 1er",
    },
    body: {
      en: "1. Remove trigger · call code\n2. Adrenaline 0.5 mg IM (1:1000) anterolateral thigh — repeat every 5 min PRN\n3. High-flow O₂ · supine + legs raised\n4. IV access · fluid bolus NS 500-1000 mL\n5. Hydrocortisone 200 mg IV · Chlorphenamine 10 mg IV\n6. Salbutamol nebulizer if wheeze\n7. Continuous SpO₂, BP, ECG",
      ar: "1. أزل المسبب · فعّل الطوارئ\n2. أدرينالين 0.5 ملغ عضلي (1:1000) في الفخذ الأمامي الخارجي — يكرر كل 5 د حسب الحاجة\n3. أكسجين عالي التدفق · استلقاء مع رفع الساقين\n4. وصول وريدي · سوائل 500-1000 مل\n5. هيدروكورتيزون 200 ملغ وريدي · كلورفينامين 10 ملغ وريدي\n6. سالبوتامول بخار عند الصفير\n7. مراقبة مستمرة للأكسجين والضغط والقلب",
      fr: "1. Retirer l'allergène · appel code\n2. Adrénaline 0,5 mg IM (1:1000) face antéro-externe cuisse — répéter toutes les 5 min\n3. O₂ haut débit · décubitus + jambes surélevées\n4. Voie IV · bolus 500-1000 mL NS\n5. Hydrocortisone 200 mg IV · Chlorphénamine 10 mg IV\n6. Salbutamol nébulisé si sibilants\n7. Monitoring SpO₂, PA, ECG",
    },
    tags: ["urgent", "allergy"],
  },
  {
    id: "emerg-hypoglycemia",
    category: "emergency",
    title: {
      en: "Hypoglycemia",
      ar: "نقص سكر الدم",
      fr: "Hypoglycémie",
    },
    summary: {
      en: "BG < 70 mg/dL · act fast",
      ar: "سكر < 70 ملغ/دل · تصرف بسرعة",
      fr: "Glycémie < 70 mg/dL",
    },
    body: {
      en: "Conscious: 15 g fast carbs (juice, glucose gel), recheck in 15 min\nUnconscious: 25 g (50 mL) D50% IV slow OR Glucagon 1 mg IM/SC\nFollow with complex carbs once awake\nMonitor BG every 15 min until stable > 100 mg/dL",
      ar: "واعٍ: 15غ كربوهيدرات سريعة (عصير، جل سكر)، أعد القياس بعد 15د\nغير واعٍ: 25غ (50 مل) دكستروز 50% وريدي ببطء أو غلوكاجون 1 ملغ عضلي/تحت الجلد\nاتبع بكربوهيدرات معقدة بعد الإفاقة\nقس السكر كل 15د حتى يستقر > 100 ملغ/دل",
      fr: "Conscient : 15 g sucre rapide (jus, gel), recontrôle 15 min\nInconscient : 25 g (50 mL) G50% IV lent OU Glucagon 1 mg IM/SC\nReprendre glucides complexes une fois éveillé\nGlycémie toutes les 15 min jusqu'à > 100 mg/dL",
    },
    tags: ["urgent", "diabetes"],
  },
  {
    id: "emerg-stroke",
    category: "emergency",
    title: {
      en: "Stroke — FAST",
      ar: "السكتة الدماغية - فاست",
      fr: "AVC — FAST",
    },
    summary: {
      en: "Face · Arm · Speech · Time",
      ar: "الوجه · الذراع · الكلام · الوقت",
      fr: "Face · Bras · Parole · Temps",
    },
    body: {
      en: "F — Facial droop?\nA — Arm weakness / drift?\nS — Speech slurred or absent?\nT — Time of onset → call neuro\n\nWindow for thrombolysis: 4.5 h · thrombectomy: up to 24 h\nKeep NPO · IV access · BG · CT brain ASAP\nDo NOT lower BP unless > 220/120 (or 185/110 if eligible for tPA)",
      ar: "F — تدلي الوجه؟\nA — ضعف الذراع؟\nS — اضطراب الكلام؟\nT — وقت البداية → نادِ على طبيب الأعصاب\n\nنافذة المذيبات: 4.5 ساعة · القسطرة: حتى 24 ساعة\nصيام · وصول وريدي · قياس سكر · أشعة دماغ فوراً\nلا تخفض الضغط ما لم > 220/120 (أو 185/110 عند العلاج الجلطي)",
      fr: "F — Asymétrie faciale ?\nA — Faiblesse du bras ?\nS — Trouble de la parole ?\nT — Heure de début → appeler neurologie\n\nFenêtre thrombolyse : 4h30 · thrombectomie : jusqu'à 24h\nÀ jeun · voie IV · glycémie · TDM cérébrale rapide\nNe pas baisser PA sauf > 220/120 (ou 185/110 si tPA)",
    },
    tags: ["urgent", "neuro"],
  },
  {
    id: "emerg-sepsis",
    category: "emergency",
    title: {
      en: "Sepsis — qSOFA",
      ar: "تعفن الدم - qSOFA",
      fr: "Sepsis — qSOFA",
    },
    summary: {
      en: "RR ≥22 · GCS <15 · SBP ≤100",
      ar: "تنفس ≥22 · غلاسكو <15 · ضغط ≤100",
      fr: "FR ≥22 · GCS <15 · PAS ≤100",
    },
    body: {
      en: "qSOFA ≥ 2/3 = high risk\nSepsis-6 bundle within 1 h:\n1. High-flow O₂\n2. Blood cultures × 2 BEFORE antibiotics\n3. Broad-spectrum IV antibiotics\n4. IV fluids 30 mL/kg crystalloid\n5. Serum lactate\n6. Hourly urine output (catheter)",
      ar: "qSOFA ≥ 2/3 = خطر عالٍ\nحزمة الإنقاذ خلال ساعة:\n1. أكسجين عالي التدفق\n2. مزرعة دم × 2 قبل المضادات\n3. مضادات حيوية واسعة الطيف وريدياً\n4. سوائل 30 مل/كغ\n5. قياس اللاكتات\n6. مراقبة البول الساعي (قسطرة)",
      fr: "qSOFA ≥ 2/3 = haut risque\nBundle 1h :\n1. O₂ haut débit\n2. Hémocultures × 2 AVANT antibiotiques\n3. Antibiothérapie IV large spectre\n4. Remplissage 30 mL/kg cristalloïdes\n5. Lactate sérique\n6. Diurèse horaire (sonde)",
    },
    tags: ["urgent", "infection"],
  },
  {
    id: "calc-iv-drip",
    category: "calculation",
    title: {
      en: "IV Drip Rate",
      ar: "معدل التنقيط الوريدي",
      fr: "Débit IV",
    },
    summary: {
      en: "gtts/min = (Vol × Drop factor) / Time",
      ar: "قطرات/د = (الحجم × معامل القطرة) / الزمن",
      fr: "gtt/min = (Vol × facteur) / temps",
    },
    body: {
      en: "Macro set: 10, 15 or 20 gtts/mL\nMicro set: 60 gtts/mL\n\nFormula: gtts/min = (Total mL × drop factor) / total minutes\n\nExample: 1000 mL over 8 h with 20 gtts/mL set\n= (1000 × 20) / 480 = 41-42 gtts/min",
      ar: "مجموعة كبيرة: 10، 15، 20 قطرة/مل\nمجموعة صغيرة: 60 قطرة/مل\n\nالمعادلة: قطرات/د = (المجموع بالمل × معامل القطرة) / الزمن بالدقائق\n\nمثال: 1000 مل خلال 8 ساعات بمعامل 20\n= (1000 × 20) / 480 = 41-42 قطرة/د",
      fr: "Macrogouttes : 10, 15 ou 20 gtt/mL\nMicrogouttes : 60 gtt/mL\n\nFormule : gtt/min = (Volume total × facteur) / temps (min)\n\nEx. : 1000 mL en 8h avec 20 gtt/mL\n= (1000 × 20) / 480 = 41-42 gtt/min",
    },
  },
  {
    id: "calc-pediatric-dose",
    category: "calculation",
    title: {
      en: "Pediatric Dosing",
      ar: "جرعات الأطفال",
      fr: "Doses Pédiatriques",
    },
    summary: {
      en: "By body weight",
      ar: "حسب وزن الجسم",
      fr: "Selon le poids",
    },
    body: {
      en: "Dose = weight (kg) × dose per kg\nParacetamol PO/PR: 15 mg/kg q4-6h (max 60 mg/kg/day)\nIbuprofen PO: 10 mg/kg q6-8h\nAmoxicillin PO: 25-50 mg/kg/day ÷ 3\nAdrenaline anaphylaxis IM: 0.01 mg/kg (max 0.5 mg)\nAdrenaline arrest IV/IO: 0.01 mg/kg of 1:10,000",
      ar: "الجرعة = الوزن (كغ) × الجرعة لكل كغ\nباراسيتامول فموي/شرجي: 15 ملغ/كغ كل 4-6 س (حد أقصى 60 ملغ/كغ/ي)\nإيبوبروفين فموي: 10 ملغ/كغ كل 6-8 س\nأموكسيسلين فموي: 25-50 ملغ/كغ/ي مقسمة 3\nأدرينالين تحسسي عضلي: 0.01 ملغ/كغ (حد أقصى 0.5)\nأدرينالين توقف قلب وريدي: 0.01 ملغ/كغ من 1:10,000",
      fr: "Dose = poids (kg) × dose par kg\nParacétamol PO/PR : 15 mg/kg / 4-6h (max 60 mg/kg/j)\nIbuprofène PO : 10 mg/kg / 6-8h\nAmoxicilline PO : 25-50 mg/kg/j ÷ 3\nAdrénaline anaphylaxie IM : 0,01 mg/kg (max 0,5)\nAdrénaline arrêt IV/IO : 0,01 mg/kg de 1:10 000",
    },
  },
  {
    id: "triage-esi",
    category: "triage",
    title: {
      en: "Triage Priorities",
      ar: "أولويات الفرز",
      fr: "Priorités de triage",
    },
    summary: {
      en: "Red · Orange · Yellow · Green · Blue",
      ar: "أحمر · برتقالي · أصفر · أخضر · أزرق",
      fr: "Rouge · Orange · Jaune · Vert · Bleu",
    },
    body: {
      en: "1 — RED · resuscitation, immediate\n2 — ORANGE · very urgent, ≤10 min\n3 — YELLOW · urgent, ≤60 min\n4 — GREEN · less urgent, ≤120 min\n5 — BLUE · non urgent, ≤240 min\n\nRed flags: airway compromise, shock, GCS <13, SpO₂ <90, severe pain 8-10/10",
      ar: "1 — أحمر · إنعاش فوري\n2 — برتقالي · عاجل جداً ≤10 د\n3 — أصفر · عاجل ≤60 د\n4 — أخضر · أقل إلحاحاً ≤120 د\n5 — أزرق · غير عاجل ≤240 د\n\nعلامات حمراء: انسداد مجرى هواء، صدمة، غلاسكو <13، أكسجين <90، ألم شديد 8-10/10",
      fr: "1 — ROUGE · réa immédiate\n2 — ORANGE · très urgent ≤10 min\n3 — JAUNE · urgent ≤60 min\n4 — VERT · moins urgent ≤120 min\n5 — BLEU · non urgent ≤240 min\n\nRed flags : voies aériennes, choc, GCS <13, SpO₂ <90, douleur 8-10/10",
    },
  },
  {
    id: "infection-precautions",
    category: "infection",
    title: {
      en: "Standard + Isolation Precautions",
      ar: "احتياطات العدوى والعزل",
      fr: "Précautions standard + isolement",
    },
    summary: {
      en: "Contact · Droplet · Airborne",
      ar: "تلامس · رذاذ · هوائي",
      fr: "Contact · Gouttelettes · Air",
    },
    body: {
      en: "STANDARD: hand hygiene · gloves · gown · mask + eye if splash risk\n\nCONTACT (MRSA, C. diff, scabies): gloves + gown, single room\nDROPLET (Influenza, meningococcus): surgical mask within 1 m\nAIRBORNE (TB, varicella, measles): N95 / FFP2, negative pressure room\n\nC. diff: soap + water (alcohol gel ineffective on spores)",
      ar: "أساسي: غسل يدين · قفازات · مريول · كمامة + واقي عين عند خطر الرذاذ\n\nتلامس (MRSA، C. diff، الجرب): قفازات + مريول، غرفة منفردة\nرذاذ (إنفلونزا، مكورات سحائية): كمامة جراحية ضمن 1م\nهوائي (سل، جدري الماء، حصبة): N95 / FFP2، غرفة ضغط سلبي\n\nC. diff: ماء وصابون (الجل الكحولي غير فعال على الأبواغ)",
      fr: "STANDARD : hygiène des mains · gants · blouse · masque + lunettes si risque\n\nCONTACT (SARM, C. diff, gale) : gants + blouse, chambre seule\nGOUTTELETTES (Grippe, méningocoque) : masque chirurgical à < 1 m\nAIR (TB, varicelle, rougeole) : N95 / FFP2, chambre pression négative\n\nC. diff : eau + savon (SHA inefficace sur les spores)",
    },
  },
  {
    id: "drug-high-alert",
    category: "drug",
    title: {
      en: "High-Alert Medications",
      ar: "أدوية عالية الخطورة",
      fr: "Médicaments à haut risque",
    },
    summary: {
      en: "Double-check required",
      ar: "تحقق مزدوج إجباري",
      fr: "Double vérification",
    },
    body: {
      en: "• Insulin · Heparin · Warfarin\n• Concentrated KCl, NaCl >0.9%\n• Opioids (morphine, fentanyl)\n• Chemotherapy\n• Neuromuscular blockers\n\nALWAYS:\n— Independent double-check by 2nd RN\n— Pump programming verified\n— Patient identifiers (5 rights)\n— Allergy + interaction screening",
      ar: "• الأنسولين · الهيبارين · الوارفارين\n• كلوريد البوتاسيوم المركز، NaCl > 0.9%\n• الأفيونات (مورفين، فنتانيل)\n• العلاج الكيميائي\n• مرخيات العضلات\n\nدائماً:\n— تحقق مزدوج مستقل من ممرض ثانٍ\n— تحقق من برمجة المضخة\n— الحقوق الخمسة\n— تحقق من الحساسية والتداخلات",
      fr: "• Insuline · Héparine · Warfarine\n• KCl concentré, NaCl > 0,9%\n• Opioïdes (morphine, fentanyl)\n• Chimiothérapie\n• Curares\n\nTOUJOURS :\n— Double contrôle indépendant\n— Vérification de la pompe\n— Les 5 bons (patient, médicament, dose, voie, moment)\n— Allergies + interactions",
    },
  },
];

// Algerian nurse-specific legal references.
// Sources: official Algerian Journal Officiel and Ministry of Health texts.
// Always verify against the latest official publication.
export const ALGERIA_LAWS: AlgerianLaw[] = [
  {
    id: "law-18-11",
    ref: "Loi n° 18-11 du 02/07/2018",
    title: {
      en: "Health Law — Patient Rights & Care Workers",
      ar: "قانون الصحة - حقوق المريض والعاملين",
      fr: "Loi sanitaire — droits du patient et des soignants",
    },
    summary: {
      en: "Framework law governing healthcare in Algeria, including obligations and protections for nursing staff.",
      ar: "القانون الإطاري للصحة في الجزائر، يشمل التزامات وحماية الكادر التمريضي.",
      fr: "Loi-cadre régissant la santé en Algérie, incluant les obligations et protections du personnel infirmier.",
    },
    body: {
      en: "Establishes the right of every patient to safe care, the principle of medical secrecy (binding nurses), informed consent, and the protection of healthcare workers against any aggression in service. Healthcare providers acting in good faith and within their competence are protected. Defines public service obligations of nursing staff in public structures.",
      ar: "ينص على حق كل مريض في رعاية آمنة، ومبدأ السر المهني (الملزم للممرضين)، والموافقة المستنيرة، وحماية العاملين الصحيين من أي اعتداء أثناء أداء الخدمة. الممرض الذي يعمل بحسن نية وضمن اختصاصه محمي. يحدد التزامات الخدمة العامة للكادر التمريضي في المؤسسات العامة.",
      fr: "Pose le droit du patient à des soins sûrs, le secret professionnel (opposable aux infirmiers), le consentement éclairé, et la protection des soignants contre toute agression en service. Le soignant agissant de bonne foi et dans le cadre de ses compétences est protégé. Définit les obligations de service public du personnel infirmier en structures publiques.",
    },
  },
  {
    id: "decret-91-106",
    ref: "Décret exécutif n° 91-106 (statut particulier)",
    title: {
      en: "Special Statute of Paramedical Staff",
      ar: "النظام الخاص لشبه الطبيين",
      fr: "Statut particulier des paramédicaux",
    },
    summary: {
      en: "Defines grades, advancement, and duties of paramedical / nursing corps.",
      ar: "يحدد الرتب والترقية وواجبات الكادر شبه الطبي / التمريضي.",
      fr: "Définit les grades, l'avancement et les obligations du corps paramédical / infirmier.",
    },
    body: {
      en: "Sets the grades (ISP, IDE, ISSP, etc.), seniority steps, and the conditions for promotion. Each grade has a defined scope of practice — administering medication, dressings, sampling, surveillance — and must operate under a medical prescription except for autonomous nursing acts. Disciplinary procedures and rights to defense are codified.",
      ar: "يحدد الرتب (ممرض الصحة العمومية، ممرض حاصل على الدبلوم، ممرض رئيسي، إلخ)، خطوات الأقدمية، وشروط الترقية. لكل رتبة نطاق ممارسة محدد — إعطاء الأدوية، الضمادات، السحب، المراقبة — ويجب أن تعمل بناءً على وصفة طبية باستثناء الأعمال التمريضية الذاتية. الإجراءات التأديبية وحقوق الدفاع مقننة.",
      fr: "Fixe les grades (ISP, IDE, ISSP, etc.), les échelons d'ancienneté et les conditions de promotion. Chaque grade a un périmètre défini — administration des médicaments, pansements, prélèvements, surveillance — et doit agir sur prescription médicale sauf pour les actes infirmiers autonomes. La discipline et les droits à la défense sont codifiés.",
    },
  },
  {
    id: "decret-09-393",
    ref: "Décret exécutif n° 09-393",
    title: {
      en: "Compensation & Night / On-Call Bonuses",
      ar: "التعويضات وعلاوات الليل والمناوبة",
      fr: "Indemnités, primes de nuit et de garde",
    },
    summary: {
      en: "Defines bonuses for night work, weekend duty, on-call, isolation and contagion exposure.",
      ar: "يحدد العلاوات للعمل الليلي والمناوبة العطل والاستعداد والعزل والتعرض للعدوى.",
      fr: "Fixe les primes de nuit, de garde, d'astreinte, d'isolement et de contagion.",
    },
    body: {
      en: "Night and weekend hours carry a percentage bonus over the base rate. On-call duty has its own indemnity. Specific bonuses apply to staff exposed to contagious diseases or working in remote/isolated facilities. Overtime above legal weekly cap (40 h, max 8 h supplementary) must be authorized in writing.",
      ar: "ساعات الليل والعطل لها علاوة بالنسبة المئوية فوق الأجر الأساسي. للمناوبة تعويض خاص. هناك علاوات خاصة للعاملين المعرضين للأمراض المعدية أو في مؤسسات نائية/معزولة. الساعات الإضافية فوق الحد القانوني (40س، حد أقصى 8 ساعات إضافية) يجب أن تُرخَّص كتابياً.",
      fr: "Les heures de nuit et de week-end donnent droit à un pourcentage de majoration sur le salaire de base. La garde et l'astreinte ont des indemnités spécifiques. Des primes particulières s'appliquent au personnel exposé aux maladies contagieuses ou en zone isolée. Les heures supplémentaires au-delà du plafond légal (40h, max 8h sup) doivent être autorisées par écrit.",
    },
  },
  {
    id: "loi-90-11",
    ref: "Loi n° 90-11 du 21/04/1990 — Relations de travail",
    title: {
      en: "Labour Law — Working Time & Rest",
      ar: "قانون العمل - زمن العمل والراحة",
      fr: "Droit du travail — temps de travail et repos",
    },
    summary: {
      en: "Legal weekly working time, rest periods, annual leave, sick leave.",
      ar: "زمن العمل الأسبوعي القانوني، فترات الراحة، الإجازة السنوية، الإجازة المرضية.",
      fr: "Durée légale du travail, repos, congés annuels, congés maladie.",
    },
    body: {
      en: "Legal weekly duration: 40 hours. Continuous daily rest of at least 12 h. Weekly rest of 24 h minimum. Annual paid leave: 2.5 days per month worked (30 days/year). Maternity leave: 14 weeks fully paid. Sick leave is granted on medical certificate; long illness benefits are governed separately. Working over 5 consecutive nights without proper recovery violates the spirit of the law.",
      ar: "المدة القانونية الأسبوعية: 40 ساعة. راحة يومية متواصلة لا تقل عن 12 ساعة. راحة أسبوعية لا تقل عن 24 ساعة. إجازة سنوية مدفوعة: 2.5 يوم عن كل شهر عمل (30 يوم/سنة). إجازة أمومة: 14 أسبوعاً بأجر كامل. الإجازة المرضية تُمنح بشهادة طبية؛ الأمراض طويلة الأمد تُنظَّم بنصوص خاصة. العمل أكثر من 5 ليالٍ متتالية دون تعافٍ مناسب ينتهك روح القانون.",
      fr: "Durée légale hebdo : 40h. Repos quotidien continu d'au moins 12h. Repos hebdomadaire minimum 24h. Congé annuel payé : 2,5 jours par mois travaillé (30 j/an). Congé maternité : 14 semaines à plein salaire. Congé maladie sur certificat ; longues maladies régies à part. Travailler plus de 5 nuits consécutives sans récupération adéquate viole l'esprit de la loi.",
    },
  },
  {
    id: "deontologie",
    ref: "Code de déontologie des paramédicaux",
    title: {
      en: "Paramedical Code of Ethics",
      ar: "مدونة أخلاقيات الكادر شبه الطبي",
      fr: "Code de déontologie paramédical",
    },
    summary: {
      en: "Professional secrecy, dignity, non-discrimination, continuous training.",
      ar: "السر المهني، الكرامة، عدم التمييز، التكوين المستمر.",
      fr: "Secret professionnel, dignité, non-discrimination, formation continue.",
    },
    body: {
      en: "Strict professional secrecy on all patient information learned in service. Equal care without discrimination of origin, religion, sex, social status. Duty of continuous training to maintain competence. Prohibition of personal financial gain from the patient relationship. Mandatory reporting of suspected abuse on minors or vulnerable adults to the competent authority.",
      ar: "سر مهني صارم على جميع معلومات المريض المعروفة أثناء الخدمة. رعاية متساوية دون تمييز بسبب الأصل أو الدين أو الجنس أو الحالة الاجتماعية. واجب التكوين المستمر للحفاظ على الكفاءة. منع الربح المالي الشخصي من علاقة المريض. الإبلاغ الإجباري عن الاعتداء المشتبه به على القاصرين أو البالغين الهشين للسلطة المختصة.",
      fr: "Secret professionnel strict sur toute information patient connue en service. Soins égaux sans discrimination d'origine, religion, sexe, condition sociale. Devoir de formation continue. Interdiction de tirer un bénéfice financier personnel de la relation soignant-patient. Signalement obligatoire de suspicion de maltraitance sur mineur ou adulte vulnérable.",
    },
  },
  {
    id: "protection-agression",
    ref: "Loi n° 20-04 / Code pénal art. 148",
    title: {
      en: "Protection Against Aggression on Duty",
      ar: "الحماية من الاعتداء أثناء الخدمة",
      fr: "Protection contre l'agression en service",
    },
    summary: {
      en: "Aggravated penalties for any assault on a healthcare worker in service.",
      ar: "عقوبات مشددة لأي اعتداء على عامل صحي أثناء الخدمة.",
      fr: "Peines aggravées pour toute agression d'un soignant en service.",
    },
    body: {
      en: "Any physical or verbal aggression against medical or paramedical staff in the exercise of their duties is punished by aggravated penalties (imprisonment + fine). The healthcare structure is legally obliged to file a complaint and to provide legal support to the victim. The nurse may exercise the right of withdrawal in case of imminent serious danger.",
      ar: "أي اعتداء جسدي أو لفظي على الكادر الطبي أو شبه الطبي أثناء أداء واجبه يُعاقب بعقوبات مشددة (سجن + غرامة). المؤسسة الصحية ملزمة قانوناً بتقديم شكوى وتوفير الدعم القانوني للضحية. يجوز للممرض ممارسة حق الانسحاب في حالة الخطر الجسيم الوشيك.",
      fr: "Toute agression physique ou verbale envers le personnel médical ou paramédical en exercice est punie de peines aggravées (emprisonnement + amende). La structure de santé a l'obligation légale de déposer plainte et de fournir une assistance juridique à la victime. L'infirmier peut exercer son droit de retrait en cas de danger grave et imminent.",
    },
  },
  {
    id: "responsabilite",
    ref: "Code civil + jurisprudence",
    title: {
      en: "Civil & Penal Responsibility",
      ar: "المسؤولية المدنية والجزائية",
      fr: "Responsabilité civile et pénale",
    },
    summary: {
      en: "Liability for negligence, error, or omission causing harm.",
      ar: "المسؤولية عن الإهمال أو الخطأ أو الإغفال المسبب للضرر.",
      fr: "Responsabilité pour négligence, faute ou omission causant un dommage.",
    },
    body: {
      en: "The nurse is personally liable for damage caused by negligence or by acts outside their legal scope. Following an oral order is risky — always require written prescription except in life-threatening emergencies (then document the order, witness, time, and have it counter-signed within 24h). Accurate, timely and signed documentation is the first line of legal protection.",
      ar: "الممرض مسؤول شخصياً عن الضرر الناجم عن الإهمال أو عن الأعمال خارج نطاقه القانوني. تنفيذ الأمر الشفهي محفوف بالمخاطر — اطلب دائماً وصفة مكتوبة باستثناء حالات تهديد الحياة (وثّق الأمر، الشاهد، الوقت، واطلب التوقيع المضاد خلال 24س). التوثيق الدقيق والمؤرَّخ والموقَّع هو خط الدفاع القانوني الأول.",
      fr: "L'infirmier est personnellement responsable du dommage causé par négligence ou par acte hors de son champ légal. Exécuter un ordre oral est risqué — exiger une prescription écrite sauf urgence vitale (documenter l'ordre, le témoin, l'heure, contre-signature sous 24h). Une documentation précise, datée et signée est la première protection juridique.",
    },
  },
];

export const FERMLI_CATEGORIES = [
  { id: "all", icon: "Layers" },
  { id: "emergency", icon: "Siren" },
  { id: "vitals", icon: "Activity" },
  { id: "calculation", icon: "Calculator" },
  { id: "drug", icon: "Pill" },
  { id: "triage", icon: "ListOrdered" },
  { id: "infection", icon: "ShieldAlert" },
] as const;
