import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../types/navigation";
import { useAppDispatch } from "../store/hooks";
import { signIn } from "../store/authSlice";
import { setAuthToken, signInApi } from "../services/authService";
import { PasswordInput } from "../components/PasswordInput";

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }
    setError("");

    try {
      setLoading(true);
      const res = await signInApi({ email: email.trim(), password });
      await setAuthToken(res.token);
      dispatch(signIn(res.user));
    } catch (e: any) {
      setError(
        e?.response?.data?.error ??
          e?.message ??
          "Sign in failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.kicker}>Welcome back</Text>
          <Text style={styles.title}>Sign in to continue</Text>
          <Text style={styles.subtitle}>
            Access your disease detection history and start new analyses in
            seconds.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            label="Password"
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryLabel}>{loading ? "Signing in..." : "Sign in"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.forgotButton, { marginTop: 8, marginBottom: 8 }]}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotLabel}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.secondaryLabel}>
              New here? <Text style={styles.secondaryLabelStrong}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  contentWide: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#020617",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  kicker: {
    color: "#a7f3d0",
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: "#ecfdf5",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 8,
    color: "#9ca3af",
    fontSize: 13,
  },
  field: {
    marginTop: 18,
  },
  label: {
    color: "#e5e7eb",
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#020617",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#f9fafb",
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    color: "#f97316",
    fontSize: 12,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: "#16a34a",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryLabel: {
    color: "#ecfdf5",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 14,
    alignItems: "center",
  },
  secondaryLabel: {
    color: "#9ca3af",
    fontSize: 13,
  },
  secondaryLabelStrong: {
    color: "#a7f3d0",
    fontWeight: "600",
  },
  googleButton: {
    marginTop: 14,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
  },
  forgotButton: {
    alignSelf: "flex-end",
  },
  forgotLabel: {
    color: "#fff",
    fontSize: 13,
    textDecorationLine: "underline",
  },
});


