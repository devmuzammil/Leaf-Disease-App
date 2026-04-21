import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { HomeScreen } from "../screens/HomeScreen";
import { DetectScreen } from "../screens/DetectScreen";
import { ResultScreen } from "../screens/ResultScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import type { AppStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<AppStackParamList>();

const headerOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: "#022c22",
  },
  headerTitleStyle: {
    color: "#ecfdf5",
    fontSize: 18,
    fontWeight: "700",
  },
  headerTintColor: "#a7f3d0",
  headerTitleAlign: "center",
  contentStyle: { backgroundColor: "#f9fafb" },
};

const HeaderMenuButton: React.FC = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => (navigation as any).getParent()?.openDrawer?.()}
      style={styles.menuButton}
      hitSlop={8}
    >
      <View style={styles.menuLine} />
      <View style={[styles.menuLine, styles.menuLineShort]} />
    </TouchableOpacity>
  );
};

export const AppStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        ...headerOptions,
        headerLeft: () => <HeaderMenuButton />,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
          title: "Smart Leaf Guard",
        }}
      />
      <Stack.Screen
        name="Detect"
        component={DetectScreen}
        options={{
          title: "Detect Disease",
        }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{
          title: "Result",
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "History",
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: Platform.select({ ios: 8, android: 0, default: 8 }),
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  menuLine: {
    width: 22,
    height: 2,
    borderRadius: 999,
    backgroundColor: "#ecfdf5",
    marginBottom: 4,
  },
  menuLineShort: {
    width: 16,
    opacity: 0.8,
  },
});


