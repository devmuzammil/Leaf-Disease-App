import React from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export const SplashScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          {isWide && (
            <View style={styles.logoTextBlock}>
              <Text style={styles.appTitle}>Smart Leaf Guard</Text>
              <Text style={styles.appSubtitle}>
                Precision disease insights for modern growers.
              </Text>
            </View>
          )}
        </View>

        {!isWide && (
          <View style={styles.textBlock}>
            <Text style={styles.appTitle}>Smart Leaf Guard</Text>
            <Text style={styles.appSubtitle}>
              Precision disease insights for modern growers.
            </Text>
          </View>
        )}

        <View style={styles.progress}>
          <ActivityIndicator size="small" color="#bbf7d0" />
          <Text style={styles.loadingText}>Preparing your experience…</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#022c22",
    borderWidth: 2,
    borderColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22c55e",
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  logoTextBlock: {
    maxWidth: 360,
  },
  textBlock: {
    marginTop: 16,
    alignItems: "center",
  },
  appTitle: {
    color: "#ecfdf5",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.6,
    textAlign: "center",
  },
  appSubtitle: {
    marginTop: 8,
    color: "#a7f3d0",
    fontSize: 14,
    textAlign: "center",
  },
  progress: {
    marginTop: 32,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 13,
  },
});


