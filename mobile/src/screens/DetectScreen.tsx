import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { PrimaryButton } from "../components/PrimaryButton";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../types/navigation";
import type { DiseasePrediction } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomNavigation } from "../components/BottomNavigation";
import { useTranslation } from "../hooks/useTranslation";
import { markPredictionHistoryDirty, predictDisease, PredictionError } from "../services/predictionService";
import { getDiseaseRecommendation } from "../constants/diseaseRecommendations";

type Props = NativeStackScreenProps<AppStackParamList, "Detect">;

type HistoryItem = {
  id: string;
  imageUri: string;
  createdAt: string;
  prediction: DiseasePrediction;
};

const HISTORY_KEY = "prediction_history";

export const DetectScreen: React.FC<Props> = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Load imageUri from AsyncStorage on mount
  React.useEffect(() => {
    (async () => {
      const savedUri = await AsyncStorage.getItem('detect_image_uri');
      if (savedUri) setImageUri(savedUri);
    })();
  }, []);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const requestPermissions = useCallback(async () => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibrary = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (camera.status !== "granted" || mediaLibrary.status !== "granted") {
      Alert.alert(t("detect.permissionTitle"), t("detect.permissionMessage"));
      return false;
    }
    return true;
  }, [t]);

  const handlePickImage = useCallback(
    async (source: "camera" | "library") => {
      const ok = await requestPermissions();
      if (!ok) return;

      const pickerFn =
        source === "camera"
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;

      const result = await pickerFn({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        setImageUri(result.assets[0].uri);
        await AsyncStorage.setItem('detect_image_uri', result.assets[0].uri);
      }
    },
    [requestPermissions]
  );

  const saveToHistory = async (item: HistoryItem) => {
    try {
      const existing = await AsyncStorage.getItem(HISTORY_KEY);
      const list: HistoryItem[] = existing ? JSON.parse(existing) : [];
      const updated = [item, ...list].slice(0, 20); // cap history
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      // non-critical
      console.warn("Failed to save history", error);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageUri) {
      Alert.alert(t("detect.noImageTitle"), t("detect.noImageMessage"));
      return;
    }

    try {
      setIsUploading(true);
      const result = await predictDisease(imageUri);
      const rec = getDiseaseRecommendation(result.disease);

      const prediction: DiseasePrediction = {
        crop: result.crop,
        disease: result.disease,
        confidence: result.confidence,
        recommendations: rec?.actions ?? [],
        severity: rec?.severity ?? (result.isHealthy ? "low" : "medium"),
        isHealthy: rec?.isHealthy ?? result.isHealthy,
      };

      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        imageUri,
        createdAt: new Date().toISOString(),
        prediction,
      };
      await saveToHistory(historyItem);

      // Remove persisted image after analysis
      await AsyncStorage.removeItem('detect_image_uri');

      markPredictionHistoryDirty();
      navigation.navigate("Result", {
        prediction,
        imageUri,
        createdAt: historyItem.createdAt,
      });
    } catch (error: any) {
      console.error(error);
      if (error instanceof PredictionError && error.code === "OFFLINE") {
        Alert.alert(t("detect.failureTitle"), error.message);
        return;
      }
      Alert.alert(
        t("detect.failureTitle"),
        error?.message ?? t("detect.failureMessage")
      );
    } finally {
      setIsUploading(false);
    }
  }, [imageUri, navigation, t]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("detect.title")}</Text>
        <Text style={styles.subtitle}>{t("detect.subtitle")}</Text>

        <View style={styles.previewCard}>
          {imageUri ? (
            <View>
              <View style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                <TouchableOpacity
                  onPress={async () => {
                    setImageUri(null);
                    await AsyncStorage.removeItem('detect_image_uri');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <FontAwesome name="close" size={24} color="#dc2626" />
                </TouchableOpacity>
              </View>
              <Image source={{ uri: imageUri }} style={styles.preview} />
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{t("detect.noImage")}</Text>
            </View>
          )}
        </View>

        <View style={styles.row}>
          <PrimaryButton
            label={t("detect.camera")}
            onPress={() => handlePickImage("camera")}
            style={styles.halfButton}
          />
          <PrimaryButton
            label={t("detect.gallery")}
            onPress={() => handlePickImage("library")}
            style={styles.halfButton}
          />
        </View>

        <View style={styles.analyzeSection}>
          <PrimaryButton
            label={isUploading ? t("detect.analyzing") : t("detect.analyze")}
            onPress={handleAnalyze}
            disabled={isUploading || !imageUri}
          />
          {isUploading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#15803d" />
              <Text style={styles.loadingText}>{t("detect.loading")}</Text>
            </View>
          )}
        </View>

        <Text style={styles.hintTitle}>{t("detect.tipsTitle")}</Text>
        <Text style={styles.hintText}>{t("detect.tips")}</Text>
      </ScrollView>
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
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
    color: "#064e3b",
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
  },
  previewCard: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "#ecfdf3",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 10,
  },
  preview: {
    width: "100%",
    height: 260,
    borderRadius: 14,
  },
  placeholder: {
    height: 260,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  placeholderText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  halfButton: {
    flex: 1,
  },
  analyzeSection: {
    marginTop: 12,
    gap: 8,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#166534",
  },
  hintTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#065f46",
  },
  hintText: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
  },
});


