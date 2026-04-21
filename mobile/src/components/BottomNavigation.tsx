import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NavigationProp,
  ParamListBase,
  RouteProp,
} from "@react-navigation/native";
import { useTranslation } from "../hooks/useTranslation";

type TabKey = "Home" | "Detect" | "History";

export const BottomNavigation: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<ParamListBase>>();
  const { t } = useTranslation();

  const tabs: { key: TabKey; label: string }[] = [
    { key: "Home", label: t("bottomNav.home") },
    { key: "Detect", label: t("bottomNav.detect") },
    { key: "History", label: t("bottomNav.history") },
  ];

  const handleNavigate = (target: TabKey) => {
    const currentRouteNames = navigation.getState()?.routeNames ?? [];

    if (currentRouteNames.includes(target)) {
      navigation.navigate(target);
      return;
    }

    if (currentRouteNames.includes("Main")) {
      navigation.navigate("Main", { screen: target });
      return;
    }

    navigation.getParent()?.navigate("Main", { screen: target });
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = route.name === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => handleNavigate(tab.key)}
            accessibilityRole="button"
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#d1fae5",
    backgroundColor: "#f8fafc",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 999,
    backgroundColor: "#ecfdf5",
  },
  tabButtonActive: {
    backgroundColor: "#059669",
  },
  tabText: {
    textAlign: "center",
    color: "#065f46",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#ecfdf5",
  },
});


