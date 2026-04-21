import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../types/navigation";
import { SignInScreen } from "../screens/SignInScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#020617" },
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};


