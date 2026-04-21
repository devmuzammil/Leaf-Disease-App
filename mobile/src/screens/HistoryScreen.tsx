import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import {
  fetchPredictionHistoryPaginated,
  clearHistory,
  deleteHistoryItem,
  isPredictionHistoryDirty,
  markPredictionHistoryClean,
} from "../services/predictionService";
import { API_BASE_URL } from "../config/backend";
import { getAuthToken } from "../services/authService";
import { getDiseaseRecommendation } from "../constants/diseaseRecommendations";
import { getTranslatedDiseaseName } from "../i18n/diseaseTranslations";
import { PredictionCard } from "../components/PredictionCard";
import type { AppStackParamList } from "../types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomNavigation } from "../components/BottomNavigation";
import { useTranslation } from "../hooks/useTranslation";
import NetInfo from "@react-native-community/netinfo";

type Props = NativeStackScreenProps<AppStackParamList, "History">;

type HistoryItem = {
  id: string;
  imageUri?: string;
  createdAt: string;
  prediction: {
    crop: string;
    disease: string;
    confidence: number;
    recommendations?: string[];
    severity?: "low" | "medium" | "high";
    isHealthy?: boolean;
  };
  displayDisease?: string;
};

let historyCacheItems: HistoryItem[] | null = null;
let historyCachePage = 0;
let historyCacheTotalPages = 0;
let historyCacheLanguage: string | null = null;

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { language, t } = useTranslation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const loadHistoryPage = useCallback(async (pageToLoad = 1, append = false) => {
    setLoadError(null);
    try {
      if (isOffline) {
        if (historyCacheItems && historyCacheItems.length) {
          setItems(historyCacheItems);
          setPage(historyCachePage);
          setTotalPages(historyCacheTotalPages);
          return;
        }
        setLoadError('You are offline. Please check your connection.');
        return;
      }

      if (pageToLoad === 1 && historyCacheItems && !isPredictionHistoryDirty() && historyCacheLanguage === language) {
        setItems(historyCacheItems);
        setPage(historyCachePage);
        setTotalPages(historyCacheTotalPages);
        return;
      }

      const response = await fetchPredictionHistoryPaginated(pageToLoad, 10);
      const backendHost = API_BASE_URL.replace(/\/api\/?$/, '');
      const mapped = response.predictions.map((i) => {
        const rec = getDiseaseRecommendation(i.prediction);
        return {
          id: i.id,
          createdAt: String(i.createdAt),
          imageUri: i.imageUrl ? `${backendHost}${i.imageUrl}` : undefined,
          prediction: {
            crop: i.crop,
            disease: i.prediction,
            confidence: i.confidence,
            recommendations: rec?.actions ?? [],
            severity: rec?.severity ?? (/healthy|normal/i.test(i.prediction) ? 'low' : 'medium'),
            isHealthy: rec?.isHealthy ?? /healthy|normal/i.test(i.prediction),
          },
          displayDisease: i.prediction.toLowerCase().trim() === 'non leaf' ? t('result.nonLeaf') : getTranslatedDiseaseName(i.prediction, language),
        };
      });

      const nextItems = append ? [...items, ...mapped] : mapped;
      setItems(nextItems);
      setPage(response.page);
      setTotalPages(response.totalPages);
      historyCacheItems = nextItems;
      historyCachePage = response.page;
      historyCacheTotalPages = response.totalPages;
      historyCacheLanguage = language;
      markPredictionHistoryClean();
    } catch (e: any) {
      console.warn('Failed to fetch history from backend', e);
      if (e?.response?.status === 401) {
        setLoadError('Unable to load history. Please sign in again.');
      } else {
        setLoadError('Failed to load history. Please try again.');
      }
    }
  }, [isOffline, items, language]);

  const load = useCallback(async () => {
    if (historyCacheItems && !isPredictionHistoryDirty() && historyCacheLanguage === language) {
      setItems(historyCacheItems);
      setPage(historyCachePage);
      setTotalPages(historyCacheTotalPages);
      setLoading(false);
      setLoadError(null);
      return;
    }

    setLoading(true);
    await loadHistoryPage(1, false);
    setLoading(false);
  }, [isOffline, loadHistoryPage, language]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistoryPage(1, false);
    setRefreshing(false);
  }, [isOffline, loadHistoryPage, language]);

  useEffect(() => {
    const unsubNet = NetInfo.addEventListener((state: any) => {
      setIsOffline(state.isConnected === false);
    });

    const unsubscribe = navigation.addListener("focus", load);

    // Ensure history loads on first mount even if screen is already focused.
    void load();

    return () => {
      unsubscribe();
      unsubNet();
    };
  }, [navigation, load]);

  useEffect(() => {
    void load();
  }, [language, load]);

  const handleClear = async () => {
    Alert.alert(
      t("history.clear"),
      "Are you sure you want to clear all history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await getAuthToken();
              if (!token) {
                Alert.alert("Error", "Please sign in to clear history.");
                return;
              }
              if (isOffline) {
                Alert.alert("Error", "You are offline. Cannot clear history.");
                return;
              }
              await clearHistory();
              setItems([]);
              historyCacheItems = [];
              historyCachePage = 0;
              historyCacheTotalPages = 0;
            } catch (error) {
              Alert.alert("Error", "Failed to clear history. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert(
      "Delete entry",
      "Are you sure you want to delete this history item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await getAuthToken();
              if (!token) {
                Alert.alert("Error", "Please sign in to delete items.");
                return;
              }
              if (isOffline) {
                Alert.alert("Error", "You are offline. Cannot delete item.");
                return;
              }
              await deleteHistoryItem(itemId);
              setItems((prev) => {
                const next = prev.filter((i) => i.id !== itemId);
                historyCacheItems = next;
                return next;
              });
            } catch (error) {
              Alert.alert("Error", "Failed to delete item. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <ActivityIndicator color="#15803d" />
          <Text style={styles.loadingText}>{t("history.loading")}</Text>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.fullErrorText}>{loadError}</Text>
          <TouchableOpacity onPress={load} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>{t("history.emptyTitle")}</Text>
          <Text style={styles.emptyText}>{t("history.emptyText")}</Text>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.container, isWide && styles.containerWide]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t("history.title")}</Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>{t("history.clear")}</Text>
          </TouchableOpacity>
        </View>

        {isOffline ? (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              No internet connection. Cannot load or modify history.
            </Text>
          </View>
        ) : null}

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!loadingMore && page < totalPages && !isOffline) {
              setLoadingMore(true);
              void loadHistoryPage(page + 1, true).finally(() => setLoadingMore(false));
            }
          }}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color="#15803d" />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.itemWrapper}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.itemTouchable}
                onPress={() =>
                  navigation.navigate("Result", {
                    prediction: item.prediction,
                    imageUri: item.imageUri,
                    createdAt: item.createdAt,
                  })
                }
              >
                <View style={styles.itemRow}>
                  {item.imageUri ? (
                    <Image source={{ uri: item.imageUri }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPlaceholder]} />
                  )}
                  <View style={styles.itemInfo}>
                    <PredictionCard
                      prediction={item.prediction}
                      displayDisease={item.displayDisease}
                      timestamp={item.createdAt}
                      showSoundButton={false}
                      showRecommendations={false}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteItem(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  containerWide: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#064e3b",
  },
  clearText: {
    fontSize: 13,
    color: "#b91c1c",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  offlineBanner: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  offlineText: {
    fontSize: 12,
    color: "#9a3412",
    fontWeight: "600",
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: "600",
  },
  fullErrorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#15803d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  itemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTouchable: {
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    gap: 10,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  thumbPlaceholder: {
    backgroundColor: "#e5e7eb",
  },
  itemInfo: {
    flex: 1,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: "#f87171",
  },
  footerLoader: {
    marginVertical: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#4b5563",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
  },
});


