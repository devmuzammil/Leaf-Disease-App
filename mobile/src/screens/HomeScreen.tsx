import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../types/navigation";
import { BottomNavigation } from "../components/BottomNavigation";
import { useTranslation } from "../hooks/useTranslation";

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const { t } = useTranslation();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, isWide && styles.contentWide]}>
            <View style={styles.header}>
              <Text style={styles.appTitle}>{t("home.title")}</Text>
              <Text style={styles.appSubtitle}>{t("home.subtitle")}</Text>
            </View>

            <View style={[styles.heroRow, isWide && styles.heroRowWide]}>
              <View style={styles.heroCard}>
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.heroImage}
                />
                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroTitle}>{t("home.heroTitle")}</Text>
                  <Text style={styles.heroText}>{t("home.heroText")}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <PrimaryButton
                  label={t("home.cta")}
                  onPress={() => navigation.navigate("Detect")}
                />
                <TouchableOpacity
                  style={styles.historyLink}
                  onPress={() => navigation.navigate("History")}
                >
                  <Text style={styles.historyText}>{t("home.history")}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{t("home.howItWorksTitle")}</Text>
                <Text style={styles.infoText}>{t("home.howItWorks")}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{t("home.designedTitle")}</Text>
                <Text style={styles.infoText}>{t("home.designedText")}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <BottomNavigation />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#022c22",
  },
  container: {
    flex: 1,
    backgroundColor: "#022c22",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ecfdf5",
  },
  appSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#a7f3d0",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 18,
  },
  contentWide: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
  },
  heroRow: {
    gap: 16,
  },
  heroRowWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  heroCard: {
    flex: 2,
    backgroundColor: "#ecfdf3",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#064e3b",
  },
  heroText: {
    marginTop: 4,
    fontSize: 13,
    color: "#374151",
  },
  actions: {
    flex: 1,
    marginTop: 4,
    gap: 8,
  },
  historyLink: {
    paddingVertical: 6,
  },
  historyText: {
    fontSize: 13,
    color: "#a7f3d0",
    textDecorationLine: "underline",
  },
  infoRow: {
    flexDirection: "column",
    gap: 12,
  },
  infoCard: {
    backgroundColor: "#022c22",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#064e3b",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#a7f3d0",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#d1fae5",
    lineHeight: 18,
  },
});


