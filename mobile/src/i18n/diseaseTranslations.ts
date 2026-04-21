import { formatDiseaseName, sanitizeDiseaseLabel } from "../utils/formatDisease";
import { resolveDiseaseRecommendationKey } from "../constants/diseaseRecommendations";

// Disease name translations for Urdu and Pashto
// These are local names from Charsadda & Chitral regions
const diseaseAliases: Record<string, string> = {
  "Tomato Leaf Minor": "Tomato Leaf Miner",
  "Tomato Septoria Leaf": "Tomato Septoria Leaf Spot",
  "Tomato Leafminer": "Tomato Leaf Miner",
  "Tomato Leaf Mold": "Tomato Leaf Mold",
  "Tomato Septoria Leaf Spot": "Tomato Septoria Leaf Spot",
  // Model / API spelling variants → canonical keys in diseaseTranslations
  "Grape Esca Black Measles": "Grape Esca (Black Measles)",
  "Grape Black Measles": "Grape Esca (Black Measles)",
  "Cedar Apple Rust": "Apple Cedar Apple Rust",
  "Apple Cedar Rust": "Apple Cedar Apple Rust",
  "Grape Healthy": "Grape Normal",
  "Cherry Healthy": "Cherry Normal",
  "Apple Healthy": "Apple Normal",
  "Tomato Septoria": "Tomato Septoria Leaf Spot",
  "Septoria Leaf Spot": "Tomato Septoria Leaf Spot",
};

/** English key used for translation lookup (Title Case + alias resolution). */
export const getCanonicalDiseaseKey = (name: string): string => {
  const normalized = formatDiseaseName(name);
  return diseaseAliases[normalized] ?? normalized;
};

export const diseaseTranslations: Record<string, { ur: string; ps: string }> = {
  // ===== APPLE =====
  "Apple Brown Spot": { ur: "نسواری داغ / زنگ داغ", ps: "نسواري داغ / زنګ داغ" },
  "Apple Normal": { ur: "صاف پنا / صحتمند پنا", ps: "صاف پاڼه / روغ پاڼه" },
  "Apple Black Spot": { ur: "تور داغ / کالا ڈھبّہ", ps: "تور داغ / کالی دھبه" },
  "Apple Scab": { ur: "سیب اسکیب", ps: "د سیب اسکیب" },
  "Apple Black Rot": { ur: "سیب کی سیاہ سڑن", ps: "د سیب تور ګندیدنه" },
  "Apple Cedar Apple Rust": { ur: "سیب سیڈر رسٹ", ps: "د سیب او سدار زنګ" },
  "Apple Healthy": { ur: "صحتمند / سیب صحت مند", ps: "روغ / سیب روغ" },

  // ===== CHERRY =====
  "Cherry Leaf Scorch": { ur: "پنا جلنا / سوزش پنا", ps: "پاڼو سوځیدنه / سوزش پاڼه" },
  "Cherry Normal": { ur: "ٹھیک پنا", ps: "ٽیکه پاڼه" },
  "Cherry Brown Spot": { ur: "بھورا داغ", ps: "بور داغ" },
  "Cherry Purple Leaf Spot": { ur: "ارغوانی داغ", ps: "اورغواني داغ" },
  "Cherry Shot Hole": { ur: "سراخ والا پنا / چھدرا پنا", ps: "سوراخ والې پاڼې / ګنډ پاڼه" },
  "Cherry Powdery Mildew": { ur: "چیری پاوڈری پھپھوندی", ps: "د چیری پوډري فنګس" },
  "Cherry Healthy": { ur: "ٹھیک پنا / صحتمند", ps: "روغ / ٽیکه" },

  // ===== GRAPE =====
  "Grape Anthracnose": { ur: "کالا داغ مرض / سوکھا داغ", ps: "تور داغ ناروغي / خشکه داغ" },
  "Grape Brown Spot": { ur: "بھورے داغ", ps: "بسو داغ" },
  "Grape Downy Mildew": { ur: "سفید پھُونگی / نمی والا مرض", ps: "سپين فنګس / نمي والې ناروغي" },
  "Grape Mites": { ur: "کیڑے والا مرض / پنا خراب کیڑا", ps: "کیڑو والې ناروغي / پاڼه خراب کیڑه" },
  "Grape Normal": { ur: "صحتمند انگور پنا", ps: "روغ انګور پاڼه" },
  "Grape Powdery Mildew": { ur: "سفید پاؤڈر والا مرض / سفید گرد", ps: "سپين پوډر والې ناروغي / سپين ګرد" },
  "Grape Shot Hole": { ur: "سراخ والا پنا", ps: "سوراخ والې پاڼه" },
  "Grape Black Rot": { ur: "انگور کی سیاہ سڑن", ps: "د انګور تور ګندیدنه" },
  "Grape Esca (Black Measles)": { ur: "انگور ایسکا (کالی خسرہ)", ps: "د انګور اسکا (تور خسرې)" },
  "Grape Leaf Blight": { ur: "انگور پتہ بلائٹ", ps: "د انګور د پاڼو سوځیدنه" },
  "Grape Healthy": { ur: "صحتمند انگور پنا", ps: "روغ انګور پاڼه" },

  // ===== TOMATO =====
  "Tomato Fusarium Wilt": { ur: "مرجھانے والا مرض / پودا سوکھنا", ps: "ويلتش ناروغي / ودی خشکیدل" },
  "Tomato Spider Mites": { ur: "مکڑی کیڑے / جال والا کیڑا", ps: "مچۍ کیڑه / جال والې کیڑې" },
  "Tomato Verticillium Wilt": { ur: "اچانک مرجھنا", ps: "ناگاہ ويلتش" },
  "Tomato Bacterial Spot": { ur: "داغ والا مرض / ڈھبے", ps: "داغ والې ناروغي / دھبې" },
  "Tomato Early Blight": { ur: "جلدی سوکھنے والا مرض", ps: "ابتدايي سوځیدنه والې ناروغي" },
  "Tomato Healthy": { ur: "ٹھیک / صحتمند پودا", ps: "ٽیکه / روغ ودی" },
  "Tomato Late Blight": { ur: "دیر سے آنے والا سوکھا مرض", ps: "دیر والې سوځیدنه ناروغي" },
  "Tomato Leaf Curl": { ur: "پتی مرجھنا / کرل مرض", ps: "پاڼه ويلتش / کرل ناروغي" },
  "Tomato Leaf Miner": { ur: "سرنگ والا کیڑا / پتی کے اندر کیڑا", ps: "تونل والې کیڑې / پاڼې دننه کیڑه" },
  "Tomato Leaf Mold": { ur: "پھپھونڈی / فنگس والا مرض", ps: "فنګس والې ناروغي / پوډري" },
  "Tomato Septoria Leaf Spot": { ur: "چھوٹے چھوٹے داغ / باریک ڈھبے", ps: "کوچني داغ / ریز دھبې" },
  "Tomato Target Spot": { ur: "لک्ष्य داغ / دائروی داغ", ps: "نشانه داغ / دايروي داغ" },
  "Tomato Yellow Leaf Curl Virus": { ur: "پیلی پتی کرل وائرس", ps: "زر پاڼه کرل وایرس" },
  "Tomato Mosaic Virus": { ur: "موزیک وائرس / مختلف رنگ کا مرض", ps: "موزیک وایرس / مختلف رنګ ناروغي" },
};

export function getTranslatedDiseaseName(name: string, lang: "en" | "ur" | "ps"): string {
  const cleaned = sanitizeDiseaseLabel(name);
  const canonicalName = getCanonicalDiseaseKey(cleaned);
  if (lang === "en") return canonicalName;

  const direct = diseaseTranslations[canonicalName]?.[lang];
  if (direct) return direct;

  const resolvedRecoKey = resolveDiseaseRecommendationKey(cleaned);
  if (resolvedRecoKey && diseaseTranslations[resolvedRecoKey]?.[lang]) {
    return diseaseTranslations[resolvedRecoKey][lang];
  }

  return canonicalName;
}

/**
 * Get all disease names in a specific language
 * Useful for displaying disease lists in the selected language
 */
export function getAllDiseaseNames(lang: "en" | "ur" | "ps"): string[] {
  if (lang === "en") {
    return Object.keys(diseaseTranslations);
  }

  return Object.entries(diseaseTranslations).map(([engName, translations]) => {
    return translations[lang] || engName;
  });
}
