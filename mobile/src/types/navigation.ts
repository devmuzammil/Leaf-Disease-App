import type { DiseasePrediction } from "../config/api";

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Detect: undefined;
  Result: {
    prediction: DiseasePrediction;
    imageUri?: string;
    createdAt?: string;
  };
  History: undefined;
};

export type AppDrawerParamList = {
  Main: undefined;
  Profile: undefined;
  About: undefined;
  Help: undefined;
};

