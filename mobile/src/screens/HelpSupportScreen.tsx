import React from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions, Linking, TouchableOpacity } from "react-native";
import { useTranslation } from "../hooks/useTranslation";
import { BottomNavigation } from "../components/BottomNavigation";

export const HelpSupportScreen: React.FC = () => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@smartleafguard.com');
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
      >
        <Text style={styles.title}>{t("help.title")}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("help.faqTitle")}</Text>

          <View style={styles.faqItem}>
            <Text style={styles.question}>{t("help.faq1")}</Text>
            <Text style={styles.answer}>{t("help.faq1Answer")}</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.question}>{t("help.faq2")}</Text>
            <Text style={styles.answer}>{t("help.faq2Answer")}</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.question}>{t("help.faq3")}</Text>
            <Text style={styles.answer}>{t("help.faq3Answer")}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("help.contactTitle")}</Text>
          <Text style={styles.body}>{t("help.contactText")}</Text>
          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={styles.email}>{t("help.email")}</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#022c22",
    marginBottom: 12,
  },
  faqItem: {
    marginBottom: 16,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#022c22",
    marginBottom: 4,
  },
  answer: {
    fontSize: 15,
    color: "#1f2937",
    lineHeight: 20,
  },
  body: {
    fontSize: 15,
    color: "#1f2937",
    lineHeight: 20,
    marginBottom: 8,
  },
  email: {
    fontSize: 15,
    color: "#059669",
    textDecorationLine: "underline",
  },
});