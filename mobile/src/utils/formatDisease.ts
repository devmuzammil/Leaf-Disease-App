/**
 * Removes trailing model metadata (scores, %) while keeping real disease names like
 * "Grape Esca (Black Measles)" intact.
 */
export const sanitizeDiseaseLabel = (raw: string): string => {
  let s = raw.trim().replace(/_/g, " ");
  s = s.replace(/\s+/g, " ");
  // Trailing "(0.92)" or "(87%)" from some APIs
  for (let i = 0; i < 3; i++) {
    const next = s
      .replace(/\s*\(\s*\d+\.?\d*\s*%?\s*\)\s*$/u, "")
      .replace(/\s+\d{1,3}(\.\d+)?%?\s*$/u, "")
      .trim();
    if (next === s) break;
    s = next;
  }
  return s;
};

export const formatDiseaseName = (name: string): string => {
  return name
    .trim()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};