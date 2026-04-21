import React from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useTranslation } from "../hooks/useTranslation";
import { BottomNavigation } from "../components/BottomNavigation";

export const AboutScreen: React.FC = () => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
      >
        <Text style={styles.title}>{t("about.title")}</Text>

        <View style={styles.card}>
          <Text style={styles.body}>{t("about.section1")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.body}>{t("about.section2")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.body}>{t("about.section3")}</Text>
        </View>
      </ScrollView>
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
    gap: 14,
  },
  contentWide: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#022c22",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  body: {
    fontSize: 15,
    color: "#1f2937",
    lineHeight: 20,
  },
});


