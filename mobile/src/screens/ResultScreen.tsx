import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../types/navigation";
import { PredictionCard } from "../components/PredictionCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { getTranslatedDiseaseName } from '../i18n/diseaseTranslations';
import { speakWithFallback, stopSpeech } from "../utils/ttsHelpers";
import { useTranslation } from "../hooks/useTranslation";
import { getDiseaseInfo } from "../utils/diseaseHelpers";
import { getFontSize, getLineHeight, getFontWeight } from "../utils/fontSizes";

type Props = NativeStackScreenProps<AppStackParamList, "Result">;

export const ResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { prediction, imageUri, createdAt } = route.params;
  const confidencePct = ((prediction.confidence ?? 0) * 100).toFixed(2);
  const isNonLeaf = prediction.disease.trim().toLowerCase() === 'non leaf';
  const isHealthy = /healthy|normal/i.test(prediction.disease);
  const { language, t } = useTranslation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const badgeLabel = isNonLeaf
    ? t('result.nonLeaf')
    : isHealthy
    ? t('result.healthy')
    : t('result.diseased');
  const badgeStyle = isNonLeaf
    ? styles.badgeNonLeaf
    : isHealthy
    ? styles.badgeHealthy
    : styles.badgeDiseased;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingNonLeaf, setIsSpeakingNonLeaf] = useState(false);

  const generateSpeechText = () => {
    const diseaseName = getTranslatedDiseaseName(prediction.disease, language);
    return diseaseName;
  };

  const handleReadAloud = async () => {
    if (isSpeaking) {
      await stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const text = generateSpeechText();
    setIsSpeaking(true);

    try {
      await speakWithFallback(text, language, () => setIsSpeaking(false), () => setIsSpeaking(false));
    } catch (error) {
      console.warn("Speech error:", error);
      setIsSpeaking(false);
    }
  };

  const handleReadAloudNonLeaf = async () => {
    if (isSpeakingNonLeaf) {
      await stopSpeech();
      setIsSpeakingNonLeaf(false);
      return;
    }

    const text = t('result.nonLeafTitle');
    setIsSpeakingNonLeaf(true);

    try {
      await speakWithFallback(text, language, () => setIsSpeakingNonLeaf(false), () => setIsSpeakingNonLeaf(false));
    } catch (error) {
      console.warn("Speech error:", error);
      setIsSpeakingNonLeaf(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, isWide && styles.contentWide]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t("result.title")}</Text>

      <View style={styles.imageCard}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
        {!isNonLeaf && (
          <Text style={styles.confidenceLabel}>{confidencePct + "% " + t("detect.confidence")}</Text>
        )}
      </View>

      {!isNonLeaf && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(2, Math.min(100, parseFloat(confidencePct)))}%` }]} />
        </View>
      )}

      {isNonLeaf ? (
        <View style={styles.nonLeafCard}>
          <View style={styles.nonLeafHeader}>
            <Text style={styles.nonLeafTitle}>{t('result.nonLeafTitle')}</Text>
            <TouchableOpacity
              onPress={handleReadAloudNonLeaf}
              style={[styles.soundIcon, isSpeakingNonLeaf && styles.soundIconSpeaking]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FontAwesome
                name={isSpeakingNonLeaf ? "volume-up" : "volume-up"}
                size={20}
                color={isSpeakingNonLeaf ? "#dc2626" : "#15803d"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.nonLeafSubtitle}>{t('result.nonLeafSubtitle')}</Text>
          <Text style={styles.nonLeafMessage}>{t('result.nonLeafMessage')}</Text>
        </View>
      ) : (
        <>
          <PredictionCard
            prediction={prediction}
            displayDisease={getTranslatedDiseaseName(prediction.disease, language)}
            timestamp={createdAt}
            onSpeak={handleReadAloud}
            showRecommendations={false}
          />

          {(() => {
            const diseaseInfo = getDiseaseInfo(prediction.disease, language);
            return diseaseInfo.actions.length > 0 ? (
              <View style={styles.recoCard}>
                <Text style={[styles.recoTitle, { fontSize: getFontSize(15, language), fontWeight: getFontWeight("800", language) }]}>{t("result.treatmentTitle")}</Text>
                <Text style={[styles.recoDesc, { fontSize: getFontSize(13, language), lineHeight: getLineHeight(getFontSize(13, language), language) }]}>{diseaseInfo.description}</Text>
                <View style={styles.recoList}>
                  {diseaseInfo.actions.map((rec, idx) => (
                    <View key={`${idx}-${rec}`} style={styles.recoItemRow}>
                      <Text style={[styles.recoBullet, { fontSize: getFontSize(13, language), lineHeight: getLineHeight(getFontSize(13, language), language) }]}>•</Text>
                      <Text style={[styles.recoItemText, { fontSize: getFontSize(13, language), lineHeight: getLineHeight(getFontSize(13, language), language) }]}>{rec}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null;
          })()}
        </>
      )}

      <View style={styles.buttons}>
        <PrimaryButton
          label={t("result.scanAnother")}
          onPress={() => navigation.navigate("Detect")}
        />
        <PrimaryButton
          label={t("result.backToHome")}
          onPress={() => navigation.navigate("Home")}
          style={styles.secondaryButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  contentWide: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
  },
  imageCard: {
    marginTop: 8,
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 8,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 14,
  },
  imagePlaceholder: {
    backgroundColor: "#e5e7eb",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeHealthy: {
    backgroundColor: "#bbf7d0",
  },
  badgeDiseased: {
    backgroundColor: "#fecaca",
  },
  badgeNonLeaf: {
    backgroundColor: "#fde68a",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#16a34a",
  },
  recoCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    gap: 8,
  },
  recoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1e3a8a",
  },
  recoDesc: {
    fontSize: 13,
    color: "#1f2937",
    lineHeight: 18,
  },
  nonLeafCard: {
    backgroundColor: "#ffedd5",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#fb923c",
    gap: 10,
  },
  nonLeafTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#9a3412",
  },
  nonLeafSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
  },
  nonLeafMessage: {
    fontSize: 13,
    color: "#7c2d12",
    lineHeight: 20,
  },
  recoList: {
    gap: 8,
  },
  recoItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recoBullet: {
    fontSize: 13,
    color: "#1f2937",
    marginRight: 8,
    lineHeight: 20,
  },
  recoItemText: {
    fontSize: 13,
    color: "#1f2937",
    lineHeight: 20,
    flex: 1,
  },
  buttons: {
    marginTop: 8,
    gap: 10,
  },
  readAloudButton: {
    backgroundColor: "#7c3aed", // Purple color for read aloud
  },
  speakingButton: {
    backgroundColor: "#dc2626", // Red color when speaking
  },
  secondaryButton: {
    backgroundColor: "#0f172a",
  },
  noteCard: {
    marginTop: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: "#78350f",
    lineHeight: 18,
  },
  nonLeafHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  soundIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ecfdf3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundIconSpeaking: {
    backgroundColor: '#fee2e2',
  },
});


