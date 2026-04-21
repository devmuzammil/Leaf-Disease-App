import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import type { DiseasePrediction } from "../config/api";
import { useTranslation } from "../hooks/useTranslation";
import { getTranslatedDiseaseName } from "../i18n/diseaseTranslations";
import { speakWithFallback, stopSpeech } from "../utils/ttsHelpers";
import { getFontSize, getLineHeight, getFontWeight } from "../utils/fontSizes";


type Props = {
  prediction: DiseasePrediction;
  displayDisease?: string;
  timestamp?: string;
  onSpeak?: () => void;
  showSoundButton?: boolean;
  showRecommendations?: boolean;
};

export const PredictionCard: React.FC<Props> = ({
  prediction,
  displayDisease,
  timestamp,
  onSpeak,
  showSoundButton = true,
  showRecommendations = true,
}) => {
  const confidencePct = (prediction.confidence * 100).toFixed(2);
  const { language, t } = useTranslation();
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);

  const formatRecommendation = (rec: string) => {
    const translated = t(`recommendation.${rec}`);
    return translated !== `recommendation.${rec}` ? translated : rec;
  };

  const isNonLeaf = prediction.disease.trim().toLowerCase() === 'non leaf';
  const cropLabel = t(`crop.${prediction.crop}`);
  const displayCrop = isNonLeaf ? t('result.nonLeaf') : cropLabel.startsWith('crop.') ? prediction.crop : cropLabel;

  const handleLocalSpeak = async () => {
    if (isSpeakingLocal) {
      await stopSpeech();
      setIsSpeakingLocal(false);
      return;
    }

    const diseaseName = displayDisease ?? getTranslatedDiseaseName(prediction.disease, language);
    setIsSpeakingLocal(true);

    try {
      await speakWithFallback(
        diseaseName,
        language,
        () => setIsSpeakingLocal(false),
        () => setIsSpeakingLocal(false)
      );
    } catch (error) {
      console.error("Error speaking disease name:", error);
      setIsSpeakingLocal(false);
    }
  };

  const handleSpeakClick = () => {
    if (onSpeak) {
      onSpeak();
    } else {
      handleLocalSpeak();
    }
  };

  return (
    <View style={[styles.card, isNonLeaf && styles.nonLeafCard]}>
      {timestamp && (
        <Text style={styles.timestamp}>{new Date(timestamp).toLocaleString()}</Text>
      )}
      <Text style={[styles.chip, isNonLeaf && styles.nonLeafChip]}>{displayCrop}</Text>
      <View style={styles.diseaseRow}>
        <Text 
          style={[
            styles.title, 
            isNonLeaf && styles.nonLeafTitle,
            { 
              fontSize: getFontSize(18, language),
              fontWeight: getFontWeight("700", language),
              lineHeight: getLineHeight(getFontSize(18, language), language)
            }
          ]} 
          numberOfLines={2} 
          ellipsizeMode="tail"
        >
          {displayDisease ?? getTranslatedDiseaseName(prediction.disease, language)}
        </Text>
        {!isNonLeaf && showSoundButton && (
          <TouchableOpacity 
            onPress={handleSpeakClick} 
            style={[styles.soundIcon, isSpeakingLocal && styles.soundIconSpeaking]} 
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FontAwesome 
              name={isSpeakingLocal ? "volume-up" : "volume-up"} 
              size={20} 
              color={isSpeakingLocal ? "#dc2626" : "#15803d"} 
            />
          </TouchableOpacity>
        )}
      </View>
      {isNonLeaf ? (
        <Text style={styles.nonLeafMessage}>{t('result.nonLeafHistoryMessage')}</Text>
      ) : (
        <>
          <Text style={styles.confidence}>
            {t("detect.confidence")}: <Text style={styles.confidenceValue}>{confidencePct}%</Text>
          </Text>
          {showRecommendations && prediction.recommendations?.length ? (
            <View style={styles.recommendations}>
              {prediction.recommendations.slice(0, 3).map((rec, idx) => (
                <Text key={`${idx}-${rec}`} style={styles.recommendationItem}>
                  • {formatRecommendation(rec)}
                </Text>
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ecfdf3",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    gap: 6,
  },
  nonLeafCard: {
    backgroundColor: "#fff7ed",
    borderColor: "#fb923c",
  },
  timestamp: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: "#bbf7d0",
    color: "#14532d",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
  },
  nonLeafChip: {
    backgroundColor: "#fde68a",
    color: "#92400e",
  },
  diseaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#064e3b",
    flexShrink: 1,
    flexWrap: 'wrap',
    marginRight: 8,
  },
  soundIcon: {
    paddingLeft: 4,
    paddingRight: 2,
    paddingVertical: 2,
  },
  soundIconSpeaking: {
    opacity: 0.7,
  },
  confidence: {
    fontSize: 14,
    color: "#374151",
  },
  confidenceValue: {
    fontWeight: "600",
    color: "#047857",
  },
  nonLeafTitle: {
    color: "#9a3412",
  },
  nonLeafMessage: {
    marginTop: 10,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
  },
  recommendations: {
    marginTop: 6,
    gap: 4,
  },
  recommendationItem: {
    fontSize: 13,
    color: "#374151",
  },
});


