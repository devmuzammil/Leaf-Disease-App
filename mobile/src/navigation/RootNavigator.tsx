import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { AuthNavigator } from "./AuthNavigator";
import { AppDrawerNavigator } from "./AppDrawerNavigator";
import { SplashScreen } from "../screens/SplashScreen";
import { useAppSelector } from "../store/hooks";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
        }}
      >
        {showSplash ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="App" component={AppDrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

