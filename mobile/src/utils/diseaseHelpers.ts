/**
 * Disease Translation and Description Helper
 * Provides utilities for accessing disease names and descriptions in different languages
 */

import { getTranslatedDiseaseName } from "../i18n/diseaseTranslations";
import {
  getDiseaseRecommendation,
  resolveDiseaseRecommendationKey,
} from "../constants/diseaseRecommendations";
import {
  getLocalizedDiseaseRecommendationTexts,
  type LocalizedRecommendationTexts,
} from "../constants/diseaseRecommendationsLocalized";

export type SupportedLanguage = "en" | "ur" | "ps";

// Translation maps for common phrases in disease descriptions and actions
const descriptionTranslations: Record<string, { ur: string; ps: string }> = {
  // Common disease descriptions
  "A fungal disease": { ur: "ایک فنگس کا مرض", ps: "یوه فونګس ناروغي" },
  "A fungal vascular disease": { ur: "ایک فنگس کا رگی مرض", ps: "یوه فونګس رګي ناروغي" },
  "A bacterial disease": { ur: "ایک بیکٹیریا کا مرض", ps: "یوه بیکٹیریا ناروغي" },
  "A viral disease": { ur: "ایک وائرس کا مرض", ps: "یوه وایرس ناروغي" },
  "Tiny pest infestation": { ur: "چھوٹے کیڑوں کا حملہ", ps: "کوچني کیڑو برید" },
  "No visible disease detected": { ur: "کوئی مرض نظر نہیں آ رہا", ps: "هيڅ ناروغي نه لیدل کیږي" },
  "causing brown spots": { ur: "بھورے داغ پیدا کر رہا ہے", ps: "بسو داغ جوړوي" },
  "causing yellow spots": { ur: "پیلے داغ پیدا کر رہا ہے", ps: "زرو داغ جوړوي" },
  "causing dark spots": { ur: "گہرے داغ پیدا کر رہا ہے", ps: "تور داغ جوړوي" },
  "on leaves": { ur: "پتیوں پر", ps: "پاڼو باندې" },
  "on fruit": { ur: "پھل پر", ps: "میوو باندې" },
  "Common in humid conditions": { ur: "نم ماحول میں عام ہے", ps: "په نمي شرایطو کې عام دی" },
  "Severe in humid conditions": { ur: "نم ماحول میں شدید ہے", ps: "په نمي شرایطو کې شدید دی" },
};

const actionTranslations: Record<string, { ur: string; ps: string }> = {
  // Common treatment actions
  "Remove and destroy infected leaves": { ur: "متاثرہ پتیوں کو نکالیں اور تباہ کریں", ps: "اغیزمن پاڼې لرې کړئ او تباه کړئ" },
  "Remove infected leaves": { ur: "متاثرہ پتیوں کو نکالیں", ps: "اغیزمن پاڼې لرې کړئ" },
  "Apply fungicides": { ur: "فنگسائڈز کا استعمال کریں", ps: "فونګسائډونه وکاروئ" },
  "Apply copper-based fungicides": { ur: "کاپر بیسڈ فنگسائڈز کا استعمال کریں", ps: "کاپر بیسډ فونګسائډونه وکاروئ" },
  "Improve air circulation": { ur: "ہوا کی گردش بہتر کریں", ps: "هوایي جریان ښه کړئ" },
  "Avoid overhead irrigation": { ur: "اوورہیڈ آبپاشی سے گریز کریں", ps: "له اوورہیډ اوبو څخه ډډه وکړئ" },
  "Water at the base": { ur: "جڑوں کے قریب پانی دیں", ps: "په اساس کې اوبه ورکړئ" },
  "Remove and destroy": { ur: "نکالیں اور تباہ کریں", ps: "لرې کړئ او تباه کړئ" },
  "Practice crop rotation": { ur: "فصلوں کی روٹیشن کا طریقہ استعمال کریں", ps: "د فصلونو روټیشن تمرین کړئ" },
  "Use resistant varieties": { ur: "مزاحم اقسام استعمال کریں", ps: "مقاوم ډولونه وکاروئ" },
  "Control insect vectors": { ur: "کیڑوں کو کنٹرول کریں", ps: "کیډو کنټرول کړئ" },
  "Keep monitoring": { ur: "نگرانی جاری رکھیں", ps: "څارنه دوامداره وساتئ" },
  "Maintain good sanitation": { ur: "صحت افزاء اقدامات جاری رکھیں", ps: "ښه پاکوالی وساتئ" },
  "Remove fallen infected material": { ur: "گرے ہوئے متاثرہ مواد کو نکالیں", ps: "ښخ شوي اغیزمن مواد لرې کړئ" },
  "Clean up fallen leaves": { ur: "گرے ہوئے پتیوں کو صاف کریں", ps: "ښخ شوي پاڼې پاکې کړئ" },
  "Prune to improve": { ur: "بہتری کے لیے تراشیں", ps: "د ښه والي لپاره پرون کړئ" },
  "Avoid drought stress": { ur: "خشکی کے دباؤ سے گریز کریں", ps: "له وچکالۍ فشار څخه ډډه وکړئ" },
  "Monitor regularly": { ur: "با قاعدگی نگرانی کریں", ps: "په منظم ډول څارنه وکړئ" },
  "Use integrated pest management": { ur: "انٹیگریٹڈ کیڑے مینجمنٹ استعمال کریں", ps: "ادغام شوي کیډو مدیریت وکاروئ" },
};

// Simple translation function for descriptions
const translateDescription = (description: string, language: SupportedLanguage): string => {
  if (language === "en") return description;

  let translated = description;
  for (const [english, translations] of Object.entries(descriptionTranslations)) {
    translated = translated.replace(new RegExp(english, 'gi'), translations[language]);
  }
  return translated;
};

// Simple translation function for actions
const translateAction = (action: string, language: SupportedLanguage): string => {
  if (language === "en") return action;

  let translated = action;
  for (const [english, translations] of Object.entries(actionTranslations)) {
    translated = translated.replace(new RegExp(english, 'gi'), translations[language]);
  }
  return translated;
};

/**
 * Get the display name of a disease in the specified language
 * @param diseaseName The English disease name
 * @param language The target language
 * @returns The translated disease name
 */
export const getDiseaseName = (
  diseaseName: string,
  language: SupportedLanguage
): string => {
  return getTranslatedDiseaseName(diseaseName, language);
};

/**
 * Get the full disease information for display
 * @param diseaseName The English disease name
 * @param language The target language
 * @returns Object containing name, description, and treatment actions
 */
const unknownDiseaseFallback: Record<"ur" | "ps", LocalizedRecommendationTexts> = {
  ur: {
    description:
      "ماڈل نے ایک ایسی بیماری ظاہر کی جو ہماری فہرست سے مماثل نہیں ہے۔ براہ کرم تصویر واضح رکھیں اور مقامی زرعی افسر سے مشورہ کریں۔",
    actions: [
      "متاثرہ پتے یا پودے پر نظر رکھیں اور نقصان زیادہ ہو تو نمونہ لے کر مشورہ کریں۔",
      "اوپر سے پانی نہ دیں؛ ہوا اور صفائی بہتر رکھیں۔",
      "کیڑوں یا داغوں کی صورت میں لیبل والے مناسب اسپرے صرف مقامی رہنمائی سے۔",
    ],
  },
  ps: {
    description:
      "ماډل یوه ناروغي ښودلې چې زموږ په لیست کې سمه نه وه. روښانه انځور واخلئ او د سیمې کرنیز سلاکار سره مشوره وکړئ.",
    actions: [
      "اغیزمن پاڼو او ونو څارنه وکړئ؛ که زیان زیات وي نمونه یوسئ.",
      "له اوورهیډ اوبو څخه ډډه؛ هوا او پاکوالی ښه وساتئ.",
      "د کیډو یا نښو په صورت کې یوازې د سیمې مشورې سره لیبل شوي اسپرې.",
    ],
  },
};

export const getDiseaseInfo = (
  diseaseName: string,
  language: SupportedLanguage
) => {
  const translatedName = getTranslatedDiseaseName(diseaseName, language);
  const recommendation = getDiseaseRecommendation(diseaseName);
  const resolvedKey = resolveDiseaseRecommendationKey(diseaseName);

  let localized: LocalizedRecommendationTexts | null = null;
  if (language !== "en") {
    localized = getLocalizedDiseaseRecommendationTexts(resolvedKey, language);
    if (!localized && recommendation) {
      localized = unknownDiseaseFallback[language];
    }
  }

  const description =
    localized?.description ??
    (recommendation ? translateDescription(recommendation.description, language) : "");
  const actions =
    localized?.actions ??
    (recommendation ? recommendation.actions.map((action) => translateAction(action, language)) : []);

  return {
    englishName: diseaseName,
    translatedName,
    description,
    actions,
    severity: recommendation?.severity || "medium",
    isHealthy: recommendation?.isHealthy || false,
  };
};

/**
 * Get text suitable for text-to-speech
 * @param diseaseName The English disease name
 * @param language The target language
 * @param includeDescription Whether to include the description (English only for now)
 * @returns Text optimized for speech synthesis
 */
export const getSpeechText = (
  diseaseName: string,
  language: SupportedLanguage,
  includeDescription: boolean = false
): string => {
  const translatedName = getTranslatedDiseaseName(diseaseName, language);

  if (!includeDescription || language !== "en") {
    return translatedName;
  }

  const recommendation = getDiseaseRecommendation(diseaseName);
  if (recommendation?.description) {
    // Include description for better context
    return `${translatedName}. ${recommendation.description}`;
  }

  return translatedName;
};

/**
 * Get local name recommendations (Urdu/Pashto) for a disease
 * Useful for farmers who may not recognize English names
 * @param diseaseName The English disease name
 * @returns Object with Urdu and Pashto names
 */
export const getLocalNames = (
  diseaseName: string
): { urdu?: string; pashto?: string } => {
  const urduName = getTranslatedDiseaseName(diseaseName, "ur");
  const pashtoName = getTranslatedDiseaseName(diseaseName, "ps");

  return {
    urdu: urduName !== diseaseName ? urduName : undefined,
    pashto: pashtoName !== diseaseName ? pashtoName : undefined,
  };
};

/**
 * Check if a disease is considered "healthy" (no disease present)
 * @param diseaseName The English disease name
 * @returns True if the disease is considered healthy/normal
 */
export const isHealthyPlant = (diseaseName: string): boolean => {
  const rec = getDiseaseRecommendation(diseaseName);
  return rec?.isHealthy ?? /healthy|normal/i.test(diseaseName);
};
