# 🌿 Local Language Support Implementation Guide

## Overview
This implementation adds comprehensive Pashto/Urdu language support with local disease names from Charsadda & Chitral regions, enabling farmers to understand disease predictions in familiar local terminology.

---

## 📁 Files Modified & Created

### 1. **Disease Translations** 
**File:** [`mobile/src/i18n/diseaseTranslations.ts`](mobile/src/i18n/diseaseTranslations.ts)

**Changes:**
- ✅ Expanded disease name mappings for all crops (Apple, Cherry, Grape, Tomato)
- ✅ Added local Urdu and Pashto names from regional knowledge
- ✅ Implemented mapping for:
  - **Apple:** Brown Spot, Black Spot, Scab, Black Rot, Cedar Rust, Normal/Healthy
  - **Cherry:** Leaf Scorch, Brown Spot, Purple Leaf Spot, Shot Hole, Powdery Mildew, Normal/Healthy
  - **Grape:** Anthracnose, Brown Spot, Downy Mildew, Mites, Powdery Mildew, Shot Hole, Black Rot, Esca, Leaf Blight, Normal/Healthy
  - **Tomato:** 12+ diseases including Fusarium Wilt, Verticillium Wilt, Bacterial Spot, Early/Late Blight, Leaf Curl, etc.

**Key Functions:**
```typescript
// Get translated disease name
getTranslatedDiseaseName(name: string, lang: "en" | "ur" | "ps"): string

// Get all disease names in specific language
getAllDiseaseNames(lang: "en" | "ur" | "ps"): string[]
```

---

### 2. **Disease Recommendations**
**File:** [`mobile/src/constants/diseaseRecommendations.ts`](mobile/src/constants/diseaseRecommendations.ts)

**Changes:**
- ✅ Added comprehensive disease recommendations for all crops
- ✅ Added entries for:
  - Apple Brown Spot, Black Spot, Normal/Healthy
  - Cherry Leaf Scorch, Brown Spot, Purple Leaf Spot, Shot Hole
  - Grape Anthracnose, Brown Spot, Downy Mildew, Mites, Powdery Mildew, Shot Hole
  - Tomato Fusarium Wilt, Verticillium Wilt, Leaf Curl, Leaf Miner, and many more
- ✅ Each disease includes:
  - Clear description of symptoms
  - 3-4 actionable treatment recommendations
  - Severity level (low/medium/high)
  - Health status indicator

---

### 3. **TTS Helpers** (NEW)
**File:** [`mobile/src/utils/ttsHelpers.ts`](mobile/src/utils/ttsHelpers.ts)

**Purpose:** Centralized text-to-speech utility for multilingual support

**Key Features:**
- ✅ Language-aware TTS implementation
- ✅ Fallback mechanism (Urdu/Pashto → English if unavailable)
- ✅ Error handling and graceful degradation
- ✅ Voice parameter optimization (pitch: 1.0, rate: 0.8)

**Main Functions:**
```typescript
// Get TTS language code
getTTSLanguageCode(language: SupportedLanguage): string

// Speak with fallback
speakWithFallback(
  text: string,
  language: SupportedLanguage,
  onDone?: () => void,
  onError?: () => void
): Promise<void>

// Stop speech
stopSpeech(): Promise<void>

// Get available languages
getSupportedLanguages(): Promise<string[]>
```

---

### 4. **Disease Helpers** (NEW)
**File:** [`mobile/src/utils/diseaseHelpers.ts`](mobile/src/utils/diseaseHelpers.ts)

**Purpose:** Unified interface for disease information across languages

**Key Functions:**
```typescript
// Get disease name in target language
getDiseaseName(diseaseName: string, language: SupportedLanguage): string

// Get complete disease info
getDiseaseInfo(diseaseName: string, language: SupportedLanguage): {
  englishName: string
  translatedName: string
  description: string
  actions: string[]
  severity: Severity
  isHealthy: boolean
}

// Get speech-optimized text
getSpeechText(diseaseName: string, language: SupportedLanguage, includeDescription?: boolean): string

// Get local names
getLocalNames(diseaseName: string): { urdu?: string; pashto?: string }

// Check if plant is healthy
isHealthyPlant(diseaseName: string): boolean
```

---

### 5. **Result Screen Enhancements**
**File:** [`mobile/src/screens/ResultScreen.tsx`](mobile/src/screens/ResultScreen.tsx)

**Changes:**
- ✅ Updated `getSpeechLanguage()` to support Pashto (`ps-PS`)
- ✅ Improved `generateSpeechText()` with language-aware logic
- ✅ Enhanced `handleReadAloud()` with:
  - Better error handling
  - Fallback mechanism for unsupported languages
  - Improved logging

---

### 6. **Prediction Card Component**
**File:** [`mobile/src/components/PredictionCard.tsx`](mobile/src/components/PredictionCard.tsx)

**Changes:**
- ✅ Added local TTS state management (`isSpeakingLocal`)
- ✅ Integrated TTS helpers for consistent speech behavior
- ✅ Added visual feedback (icon color changes when speaking)
- ✅ Dual speak handler:
  - Uses parent's `onSpeak` if provided
  - Falls back to local TTS handling
- ✅ Always displays translated disease names

---

## 🎯 How It Works

### Language Switching Flow
```
User selects language (Urdu/Pashto) in preferences
    ↓
Language stored in Redux (preferencesSlice)
    ↓
useTranslation hook provides current language
    ↓
Components render using translated disease names
    ↓
TTS uses language-specific voice codes
```

### Disease Name Display
1. **Backend** returns English disease names
2. **Frontend** translates using `diseaseTranslations` mapping
3. **UI** displays local names when language != English
4. **TTS** speaks in selected language with fallback

### TTS Speech Flow
```
User taps "Read Disease" button
    ↓
Get translated disease name
    ↓
Determine TTS language code
    ↓
Attempt speech in selected language
    ↓
If fails, fallback to English
    ↓
Update UI state (speaking/stopped)
```

---

## 🗣️ Supported Languages & Voice Codes

| Language | Code | Region | Pashto Alias |
|----------|------|--------|-------------|
| English | `en-US` | USA | N/A |
| Urdu | `ur-PK` | Pakistan | Same as Urdu |
| Pashto | `ps-PS` | Afghanistan | Same as Pashto |

**Note:** Pashto and Urdu use the same voice for TTS (as per requirements)

---

## 📱 Usage Example

### Displaying Translated Disease Name
```typescript
import { getTranslatedDiseaseName } from "../i18n/diseaseTranslations";
import { useTranslation } from "../hooks/useTranslation";

const MyComponent = ({ disease }: { disease: string }) => {
  const { language } = useTranslation();
  
  return (
    <Text>
      {getTranslatedDiseaseName(disease, language)}
    </Text>
  );
};
```

### Using TTS with Fallback
```typescript
import { speakWithFallback } from "../utils/ttsHelpers";
import { useTranslation } from "../hooks/useTranslation";

const handleSpeak = async () => {
  const { language } = useTranslation();
  
  try {
    await speakWithFallback(
      "مرزھانے والا مرض",  // Urdu text or any language
      language,
      () => console.log("Done speaking"),
      () => console.log("Error speaking")
    );
  } catch (error) {
    console.error("Speech failed:", error);
  }
};
```

### Getting Complete Disease Information
```typescript
import { getDiseaseInfo } from "../utils/diseaseHelpers";

const disease = getDiseaseInfo("Tomato Early Blight", "ur");
console.log(disease.translatedName);  // "جلدی سوکھنے والا مرض"
console.log(disease.description);      // English description
console.log(disease.actions);          // Array of recommendations
console.log(disease.severity);         // "medium"
```

---

## ✅ Implementation Checklist

- ✅ Disease name translations for all crops (Apple, Cherry, Grape, Tomato)
- ✅ Urdu and Pashto mappings for 40+ disease variants
- ✅ Complete disease recommendations with descriptions and actions
- ✅ TTS helpers with fallback mechanism
- ✅ Disease information utilities
- ✅ Result Screen integration
- ✅ Prediction Card component updates
- ✅ Language-aware voice selection
- ✅ Error handling and graceful degradation

---

## 🔍 Testing Recommendations

### Unit Tests Needed
1. **Translation Tests**
   - Verify all disease names translate correctly
   - Check fallback to English when translation missing
   
2. **TTS Tests**
   - Test TTS with each language code
   - Verify fallback mechanism works
   - Test error handling

3. **Disease Info Tests**
   - Verify recommendations exist for all diseases
   - Check severity levels are appropriate
   - Validate health status indicators

### Manual Testing
1. Change app language to Urdu/Pashto
2. Scan a diseased leaf
3. Verify translated disease name appears on result screen
4. Tap "Read Disease" button
5. Verify speech sounds correct (Urdu/Pashto pronunciation)
6. Test fallback by changing language mid-speak

---

## 🌍 Local Medicine Names Reference

### Apple 🍎
- Niswari Daag / Zang Daag = Brown oxidation marks
- Tor Daag / Kala Dhabba = Black spots, often with rusty edges

### Cherry 🍒
- Pana Jalna = Scorched leaves (burning sensation)
- Bhura Daag = Brown spots
- Surakh Wala Pana = Red/spotted holes in leaves

### Grape 🍇
- Safed Phoongi = White fungus/mold (downy appearance)
- Keeray Wala Marz = Pest/mite disease

### Tomato 🍅
- Poda Sookhna = Plant wilting/dying
- Daag Wala Marz = Spot-based disease
- Phaphondi = Mold/fungus growth
- Surang Wala Keera = Tunnel-making pests

---

## 🔄 Future Enhancements

1. **Extended Language Support**
   - Add Arabic, Sindhi, or other regional languages
   - Implement custom voice preferences

2. **Description Translations**
   - Translate disease descriptions to Urdu/Pashto
   - Translate treatment recommendations
   - Support multi-language descriptions in disease cards

3. **Audio Enhancements**
   - Custom pronunciation guides for difficult terms
   - Audio-visual combination (text + speech)
   - Adjustable speech rate/pitch per language

4. **Farmer Feedback**
   - Collect feedback on local disease names
   - Allow manual name corrections by regional experts
   - Community-driven translation improvements

---

## 📝 Notes for Developers

1. **Backend Compatibility:** Backend still uses English disease names internally - this is intentional for consistency
2. **Data Persistence:** Language preference stored in Redux and persists across app sessions
3. **Fallback Strategy:** Always ensure English translations work as fallback
4. **Performance:** Disease name lookups are O(1) using object keys
5. **Accessibility:** TTS makes app accessible to low-literacy farmer populations

---

## 🎓 Architecture Decisions

### Why Separate TTS Helper?
- Centralized language code management
- Reusable fallback logic
- Easier error handling across app
- Deouples TTS logic from UI components

### Why Disease Info Helper?
- Single source of truth for disease data
- Consistent interface across components
- Easy to extend with new utilities
- Type-safe and maintainable

### Why Keep English Internal?
- Simplifies backend API contracts
- Maintains consistency across development
- Easier debugging and logging
- Reduces complexity in ML model outputs

---

**Last Updated:** March 2025
**Version:** 1.0 - Initial Local Language Support
