import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/backend";

export type User = {
  name: string;
  email: string;
  phone?: string;
  location?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

const TOKEN_KEY = "auth_token";

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function signUpApi(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await axios.post(`${API_BASE_URL}/auth/signup`, input, {
    headers: { Accept: "application/json" },
    timeout: 15000,
  });
  return res.data as AuthResponse;
}

export async function signInApi(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await axios.post(`${API_BASE_URL}/auth/signin`, input, {
    headers: { Accept: "application/json" },
    timeout: 15000,
  });
  return res.data as AuthResponse;
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email }, {
    headers: { Accept: "application/json" },
    timeout: 15000,
  });
  return res.data as { message: string };
}

export async function verifyResetCodeApi(email: string, code: string): Promise<{ message: string }> {
  const res = await axios.post(`${API_BASE_URL}/auth/verify-reset-code`, { email, code }, {
    headers: { Accept: "application/json" },
    timeout: 15000,
  });
  return res.data as { message: string };
}

export async function resetPasswordApi(email: string, code: string, newPassword: string): Promise<{ message: string }> {
  const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, { email, code, newPassword }, {
    headers: { Accept: "application/json" },
    timeout: 15000,
  });
  return res.data as { message: string };
}

export async function getMeApi(): Promise<User> {
  const token = await getAuthToken();
  const res = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    timeout: 15000,
  });
  return (res.data as any).user as User;
}

export async function updateProfileApi(input: {
  name?: string;
  phone?: string;
  location?: string;
}): Promise<User> {
  const token = await getAuthToken();
  const res = await axios.put(`${API_BASE_URL}/auth/profile`, input, {
    headers: {
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    timeout: 15000,
  });
  return (res.data as any).user as User;
}

export async function changePasswordApi(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const token = await getAuthToken();
  await axios.put(`${API_BASE_URL}/auth/password`, input, {
    headers: {
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    timeout: 15000,
  });
}

export async function signInWithGoogleApi(input: { idToken: string }): Promise<AuthResponse> {
  const res = await axios.post(`${API_BASE_URL}/auth/google`, input, {
    headers: { Accept: "application/json" },
    timeout: 15000,
  });
  return res.data as AuthResponse;
}

