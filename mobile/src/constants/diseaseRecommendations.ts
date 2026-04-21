import { sanitizeDiseaseLabel } from "../utils/formatDisease";

export type Severity = "low" | "medium" | "high";

export type DiseaseRecommendation = {
  description: string;
  actions: string[];
  severity: Severity;
  isHealthy?: boolean;
};

export const DISEASE_RECOMMENDATIONS: Record<string, DiseaseRecommendation> = {
  // ===== APPLE =====
  "Apple Brown Spot": {
    description:
      "A fungal disease causing brown spots on leaves and fruit, often with a rusty appearance. Common in humid conditions.",
    actions: [
      "Remove and destroy infected leaves and fallen fruit.",
      "Apply copper-based or sulfur fungicides as recommended locally.",
      "Improve air circulation by pruning and spacing trees properly.",
      "Avoid overhead irrigation to reduce leaf wetness.",
    ],
    severity: "medium",
  },
  "Apple Black Spot": {
    description:
      "A fungal disease causing dark, velvety spots on leaves that may enlarge and cause defoliation if severe.",
    actions: [
      "Remove infected leaves immediately to prevent spread.",
      "Apply fungicides containing mancozeb or other recommended products.",
      "Maintain proper tree spacing and ventilation.",
      "Clean up fallen leaves and debris regularly.",
    ],
    severity: "medium",
  },
  "Apple Scab": {
    description:
      "A fungal disease that causes dark, scabby lesions on leaves and fruit, reducing yield and quality.",
    actions: [
      "Remove and destroy heavily infected leaves and fallen debris.",
      "Apply a recommended fungicide early in the season (follow local guidance).",
      "Improve airflow by pruning and avoid overhead irrigation when possible.",
    ],
    severity: "medium",
  },
  "Apple Black Rot": {
    description:
      "A fungal disease that can cause leaf spots, cankers, and fruit rot, spreading from infected plant material.",
    actions: [
      "Prune out cankers and remove mummified fruit from the tree and ground.",
      "Disinfect pruning tools between cuts.",
      "Use a labeled fungicide program during wet periods (local recommendations).",
    ],
    severity: "high",
  },
  "Apple Cedar Apple Rust": {
    description:
      "A fungal disease that needs both apple and cedar/juniper hosts, causing yellow-orange leaf spots and reduced vigor.",
    actions: [
      "Remove nearby juniper/cedar hosts if feasible, or prune galls from them.",
      "Apply preventative fungicide sprays at key growth stages.",
      "Choose resistant varieties when planting new trees.",
    ],
    severity: "medium",
  },
  "Apple Normal": {
    description: "No visible disease detected on the leaf.",
    actions: [
      "Keep monitoring plants regularly for early symptoms.",
      "Maintain good sanitation and balanced fertilization.",
      "Water at the base to reduce leaf wetness.",
    ],
    severity: "low",
    isHealthy: true,
  },
  "Apple Healthy": {
    description: "No visible disease detected on the leaf.",
    actions: [
      "Keep monitoring plants regularly for early symptoms.",
      "Maintain good sanitation and balanced fertilization.",
      "Water at the base to reduce leaf wetness.",
    ],
    severity: "low",
    isHealthy: true,
  },

  // ===== CHERRY =====
  "Cherry Leaf Scorch": {
    description:
      "A fungal or bacterial disease causing leaves to appear scorched or burned at the edges, often turning brown and drying out.",
    actions: [
      "Prune out and remove affected branches.",
      "Apply copper-based fungicides or bactericides as recommended locally.",
      "Avoid overhead irrigation and ensure good air circulation.",
      "Remove fallen infected leaves.",
    ],
    severity: "medium",
  },
  "Cherry Brown Spot": {
    description:
      "A fungal disease causing brown spots with yellow halos on cherry leaves, reducing their effectiveness.",
    actions: [
      "Remove infected leaves promptly.",
      "Apply fungicides containing copper or mancozeb.",
      "Maintain proper spacing for air circulation.",
      "Water at the base to keep leaves dry.",
    ],
    severity: "medium",
  },
  "Cherry Purple Leaf Spot": {
    description:
      "A fungal disease causing purple or dark red spots on leaves, which can merge and cause severe leaf damage.",
    actions: [
      "Remove and destroy heavily infected leaves.",
      "Apply recommended fungicide sprays at early stages.",
      "Prune branches to improve ventilation.",
      "Avoid overhead watering.",
    ],
    severity: "medium",
  },
  "Cherry Shot Hole": {
    description:
      "A fungal disease where infected tissue falls out, creating shot-hole appearance on leaves.",
    actions: [
      "Remove infected leaves and branches when practical.",
      "Apply fungicides containing copper or other recommended products.",
      "Improve drainage and air circulation.",
      "Avoid stress from drought or waterlogging.",
    ],
    severity: "medium",
  },
  "Cherry Powdery Mildew": {
    description:
      "A fungal disease that appears as white powdery growth on leaves, reducing photosynthesis and plant health.",
    actions: [
      "Remove infected leaves where practical and improve air circulation.",
      "Avoid excessive nitrogen which promotes tender growth.",
      "Apply a suitable fungicide if the infection is spreading (local guidance).",
    ],
    severity: "medium",
  },
  "Cherry Normal": {
    description: "No visible disease detected on the leaf.",
    actions: [
      "Continue routine scouting and sanitation.",
      "Avoid prolonged leaf wetness and ensure good spacing.",
      "Use integrated pest management practices.",
    ],
    severity: "low",
    isHealthy: true,
  },
  "Cherry Healthy": {
    description: "No visible disease detected on the leaf.",
    actions: [
      "Continue routine scouting and sanitation.",
      "Avoid prolonged leaf wetness and ensure good spacing.",
      "Use integrated pest management practices.",
    ],
    severity: "low",
    isHealthy: true,
  },

  // ===== GRAPE =====
  "Grape Anthracnose": {
    description:
      "A fungal disease causing brown, sunken spots on leaves and fruit; can cause severe defoliation and crop loss in wet conditions.",
    actions: [
      "Remove infected leaves and prune affected branches.",
      "Clean up fallen infected material from the vineyard.",
      "Apply protective fungicides containing copper or other recommended products.",
      "Avoid overhead irrigation; use drip irrigation instead.",
    ],
    severity: "high",
  },
  "Grape Brown Spot": {
    description:
      "A fungal disease causing brown spots on grape leaves, reducing photosynthesis and vine vigor.",
    actions: [
      "Remove infected leaves where practical.",
      "Apply recommended fungicide sprays during high humidity.",
      "Maintain good canopy ventilation through pruning.",
      "Keep vineyard floor clean.",
    ],
    severity: "medium",
  },
  "Grape Downy Mildew": {
    description:
      "A fungal disease that causes yellow spots on upper leaf surfaces with white, downy fungal growth on undersides. Severe in humid conditions.",
    actions: [
      "Remove heavily infected leaves to reduce disease pressure.",
      "Apply copper-based or sulfur fungicides preventatively.",
      "Improve air circulation by canopy management.",
      "Use drip irrigation to avoid leaf wetness.",
    ],
    severity: "high",
  },
  "Grape Mites": {
    description:
      "Tiny pest infestation causing stippling, bronzing, or russetting on leaves. Common in hot, dry conditions.",
    actions: [
      "Monitor regularly for early signs of infestation.",
      "Use sulfur dust if mite populations exceed threshold.",
      "Apply horticultural oils if recommended.",
      "Maintain adequate humidity and avoid drought stress.",
    ],
    severity: "medium",
  },
  "Grape Powdery Mildew": {
    description:
      "A fungal disease causing white powdery growth on leaves and fruit. Causes leaf distortion and poor fruit quality.",
    actions: [
      "Apply sulfur or other anti-powdery-mildew fungicides regularly.",
      "Prune to improve air circulation and light penetration.",
      "Avoid excessive nitrogen which promotes tender growth.",
      "Monitor weather and apply preventatives before wet periods.",
    ],
    severity: "medium",
  },
  "Grape Shot Hole": {
    description:
      "A fungal disease where infected tissue falls out of leaves, creating shot-hole appearance.",
    actions: [
      "Remove infected leaves where feasible.",
      "Apply fungicides containing copper when conditions favor disease.",
      "Improve ventilation through pruning.",
      "Avoid overhead watering.",
    ],
    severity: "medium",
  },
  "Grape Black Rot": {
    description:
      "A fungal disease causing leaf spots and fruit rot; it can spread quickly in warm, humid conditions.",
    actions: [
      "Remove mummified berries and infected debris from vines and ground.",
      "Prune to open the canopy and improve airflow.",
      "Use an appropriate fungicide schedule during high-risk periods.",
    ],
    severity: "high",
  },
  "Grape Esca (Black Measles)": {
    description:
      "A complex trunk disease that can cause leaf discoloration and vine decline, often associated with wood infections.",
    actions: [
      "Prune out infected wood where possible and remove dead arms.",
      "Avoid pruning during wet conditions; sanitize tools.",
      "Consult local viticulture extension for management strategies.",
    ],
    severity: "high",
  },
  "Grape Leaf Blight": {
    description:
      "Leaf blight symptoms can reduce leaf area and weaken vines, especially under humid conditions.",
    actions: [
      "Remove infected leaves where feasible and improve canopy airflow.",
      "Avoid overhead irrigation and manage vine vigor.",
      "Apply labeled fungicides if disease pressure is high.",
    ],
    severity: "medium",
  },
  "Grape Normal": {
    description: "No visible disease detected on the leaf.",
    actions: [
      "Maintain canopy management for airflow and light.",
      "Monitor regularly during humid/rainy periods.",
      "Keep vineyard floor clean of old plant debris.",
    ],
    severity: "low",
    isHealthy: true,
  },
  "Grape Healthy": {
    description: "No visible disease detected on the leaf.",
    actions: [
      "Maintain canopy management for airflow and light.",
      "Monitor regularly during humid/rainy periods.",
      "Keep vineyard floor clean of old plant debris.",
    ],
    severity: "low",
    isHealthy: true,
  },

  // ===== TOMATO =====
  "Tomato Fusarium Wilt": {
    description:
      "A fungal vascular disease that causes wilting and yellowing of leaves; the fungus colonizes the plant's vascular system.",
    actions: [
      "Remove and destroy infected plants completely (do not compost).",
      "Practice crop rotation (avoid planting tomatoes/peppers for 2-3 years).",
      "Use resistant varieties when available.",
      "Sterilize tools and disinfect soil if possible.",
    ],
    severity: "high",
  },
  "Tomato Verticillium Wilt": {
    description:
      "A fungal vascular disease causing sudden wilting of one side of the plant or individual branches.",
    actions: [
      "Remove affected branches or entire plant if severely wilted.",
      "Avoid wounding the plant as this facilitates fungal entry.",
      "Practice crop rotation with non-solanaceous crops.",
      "Use resistant tomato varieties.",
    ],
    severity: "high",
  },
  "Tomato Leaf Curl": {
    description:
      "Often caused by viruses or environmental stress; leaves curl upward or downward, affecting photosynthesis.",
    actions: [
      "Control insect vectors (whiteflies, aphids) if viral.",
      "Provide consistent watering and avoid drought stress.",
      "Remove severely affected plants to prevent virus spread.",
      "Use reflective mulch or row covers when feasible.",
    ],
    severity: "medium",
  },
  "Tomato Leaf Miner": {
    description:
      "A pest where larvae tunnel inside leaves, creating serpentine mine patterns and causing leaf damage.",
    actions: [
      "Remove and destroy heavily infested leaves.",
      "Apply insecticidal sprays targeting larvae (follow local guidance).",
      "Use sticky traps to monitor adult populations.",
      "Practice proper crop sanitation and remove host weeds.",
    ],
    severity: "medium",
  },
  "Tomato Bacterial Spot": {
    description:
      "A bacterial disease causing small dark spots on leaves and fruit; it spreads via splashing water and contaminated tools.",
    actions: [
      "Avoid working with plants when wet; reduce splashing and overhead watering.",
      "Remove severely infected leaves and dispose away from the garden.",
      "Use copper-based sprays if recommended locally (follow label instructions).",
    ],
    severity: "high",
  },
  "Tomato Early Blight": {
    description:
      "A fungal disease causing concentric ring spots on older leaves, often leading to defoliation.",
    actions: [
      "Remove infected lower leaves and keep foliage off the soil with staking/mulch.",
      "Water at the base and improve airflow between plants.",
      "Apply a labeled fungicide if symptoms progress (local guidance).",
    ],
    severity: "medium",
  },
  "Tomato Late Blight": {
    description:
      "A severe disease that can rapidly destroy tomato foliage and fruit, especially in cool, wet weather.",
    actions: [
      "Remove and destroy infected plants promptly to reduce spread.",
      "Avoid overhead irrigation; keep plants well-spaced and ventilated.",
      "Use recommended late blight fungicides preventatively when risk is high.",
    ],
    severity: "high",
  },
  "Tomato Leaf Mold": {
    description:
      "A fungal disease common in humid conditions, causing yellow spots and moldy growth on leaf undersides.",
    actions: [
      "Increase ventilation (greenhouse) and reduce humidity.",
      "Remove infected leaves and avoid crowding plants.",
      "Apply labeled fungicides if needed and rotate modes of action.",
    ],
    severity: "medium",
  },
  "Tomato Septoria Leaf Spot": {
    description:
      "A fungal leaf spot causing many small spots and leaf drop, often starting on lower leaves.",
    actions: [
      "Remove infected leaves and clean up plant debris.",
      "Mulch to prevent soil splash and water at the base.",
      "Apply a labeled fungicide program if disease spreads.",
    ],
    severity: "medium",
  },
  "Tomato Spider Mites": {
    description:
      "Tiny pests that cause stippling and bronzing on leaves; outbreaks are common in hot, dry conditions.",
    actions: [
      "Rinse leaf undersides with water to reduce mite populations.",
      "Use insecticidal soap or horticultural oil if appropriate.",
      "Improve humidity and avoid drought stress where possible.",
    ],
    severity: "medium",
  },
  "Tomato Target Spot": {
    description:
      "A fungal disease causing target-like lesions on leaves and sometimes fruit, reducing photosynthesis and yield.",
    actions: [
      "Remove infected leaves and improve airflow through pruning/staking.",
      "Avoid overhead watering and manage irrigation timing.",
      "Use a labeled fungicide if needed, rotating products.",
    ],
    severity: "medium",
  },
  "Tomato Yellow Leaf Curl Virus": {
    description:
      "A viral disease spread mainly by whiteflies; causes leaf curling, yellowing, and stunted growth.",
    actions: [
      "Control whiteflies using integrated pest management.",
      "Remove severely infected plants to reduce virus spread.",
      "Use reflective mulch or insect netting when feasible.",
    ],
    severity: "high",
  },
  "Tomato Mosaic Virus": {
    description:
      "A viral disease that can persist on tools and hands, causing mottling and distorted leaves.",
    actions: [
      "Remove infected plants and avoid composting them.",
      "Disinfect tools and wash hands after handling plants.",
      "Use resistant varieties and avoid tobacco exposure during handling.",
    ],
    severity: "high",
  },
  "Tomato Healthy": {
    description: "No visible disease detected on the leaf.",
    actions: [
      "Keep monitoring for early symptoms and pests.",
      "Water at the base and maintain good airflow.",
      "Practice crop rotation and sanitation to reduce future risk.",
    ],
    severity: "low",
    isHealthy: true,
  },
};

const normalizeDiseaseName = (name: string): string =>
  name
    .trim()
    .replace(/[\s_]+/g, ' ')
    .replace(/[.,()]/g, '')
    .toLowerCase();

const getFallbackRecommendation = (diseaseName: string): DiseaseRecommendation => {
  const lowerName = diseaseName.toLowerCase();
  if (/virus/i.test(lowerName)) {
    return {
      description: `Viral disease detected: ${diseaseName}`,
      actions: [
        "Remove and destroy severely infected plants to prevent spread.",
        "Control insect vectors such as whiteflies and aphids.",
        "Use resistant varieties when available.",
        "Maintain good hygiene by disinfecting tools and removing debris.",
      ],
      severity: "high",
    };
  }

  if (/(wilt|fusarium|verticillium)/i.test(lowerName)) {
    return {
      description: `Vascular wilt disease detected: ${diseaseName}`,
      actions: [
        "Remove and destroy infected plants and avoid replanting the same crop in the same area.",
        "Use resistant varieties where possible.",
        "Avoid soil compaction and overwatering.",
        "Sterilize tools and keep the growing area clean.",
      ],
      severity: "high",
    };
  }

  if (/(mildew|blight|spot|rust|scab|rot|anthracnose|leaf mold|leaf blight|shot hole)/i.test(lowerName)) {
    return {
      description: `Foliar disease detected: ${diseaseName}`,
      actions: [
        "Remove infected leaves and improve air circulation around plants.",
        "Avoid overhead watering and water at the base of plants.",
        "Apply a labeled fungicide appropriate for foliar disease control.",
        "Keep the area free of fallen infected debris.",
      ],
      severity: "medium",
    };
  }

  if (/(mite|miner|aphid|whitefly|pest|worm|borer)/i.test(lowerName)) {
    return {
      description: `Pest infestation detected: ${diseaseName}`,
      actions: [
        "Remove and destroy heavily infested leaves.",
        "Use insecticidal soap or horticultural oil as needed.",
        "Monitor regularly and use traps or barriers where appropriate.",
        "Reduce plant stress by maintaining proper water and nutrient levels.",
      ],
      severity: "medium",
    };
  }

  return {
    description: `Disease detected: ${diseaseName}`,
    actions: [
      `Monitor the ${diseaseName.toLowerCase()} symptoms closely and remove heavily infected leaf tissue.`,
      "Improve air circulation and avoid overhead watering to keep leaves dry.",
      "Use a fungicide if the symptoms look like spots, blight, mildew, rust, or mold.",
      "Use an insecticide or miticide if the symptoms appear pest-related.",
    ],
    severity: "medium",
  };
};

/**
 * Returns the canonical English disease key from our recommendation table when the model
 * output matches (exact, normalized, or substring). Null when only a generic fallback applies.
 */
export const resolveDiseaseRecommendationKey = (diseaseName: string): string | null => {
  diseaseName = sanitizeDiseaseLabel(diseaseName);
  if (diseaseName.toLowerCase().trim() === "non leaf") {
    return null;
  }

  const normalizedInput = normalizeDiseaseName(diseaseName);

  for (const key of Object.keys(DISEASE_RECOMMENDATIONS)) {
    if (normalizeDiseaseName(key) === normalizedInput) {
      return key;
    }
  }

  for (const key of Object.keys(DISEASE_RECOMMENDATIONS)) {
    const normalizedKey = normalizeDiseaseName(key);
    if (normalizedKey.includes(normalizedInput) || normalizedInput.includes(normalizedKey)) {
      return key;
    }
  }

  return null;
};

export const getDiseaseRecommendation = (diseaseName: string): DiseaseRecommendation | null => {
  diseaseName = sanitizeDiseaseLabel(diseaseName);
  // Avoid recommendations for non-leaf images
  if (diseaseName.toLowerCase().trim() === 'non leaf') {
    return null;
  }

  const resolvedKey = resolveDiseaseRecommendationKey(diseaseName);
  if (resolvedKey) {
    return DISEASE_RECOMMENDATIONS[resolvedKey];
  }

  return getFallbackRecommendation(diseaseName);
};

