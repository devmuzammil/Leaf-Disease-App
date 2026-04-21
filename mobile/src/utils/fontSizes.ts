import { SupportedLanguage } from "./diseaseHelpers";

/**
 * Get responsive font sizes based on language
 * Urdu and Pashto scripts are more complex visually, so they benefit from larger font sizes
 */
export const getFontSize = (
  baseSize: number,
  language: SupportedLanguage
): number => {
  // Increase font size by 15% for Urdu/Pashto for better readability
  if (language === "ur" || language === "ps") {
    return Math.round(baseSize * 1.15);
  }
  return baseSize;
};

/**
 * Get line height multiplier based on language
 * Urdu/Pashto benefit from slightly more line spacing
 */
export const getLineHeight = (
  fontSize: number,
  language: SupportedLanguage
): number => {
  const baseLineHeight = fontSize * 1.5;
  // Add extra spacing for Urdu/Pashto
  if (language === "ur" || language === "ps") {
    return fontSize * 1.65;
  }
  return baseLineHeight;
};

/**
 * Get font weight based on language
 * Urdu/Pashto can benefit from slightly heavier weight for clarity
 */
export const getFontWeight = (
  baseWeight: "600" | "700" | "800",
  language: SupportedLanguage
): "600" | "700" | "800" => {
  if (language === "ur" || language === "ps") {
    // Increase weight for better visibility
    if (baseWeight === "600") return "700";
    if (baseWeight === "700") return "800";
    return "800";
  }
  return baseWeight;
};
