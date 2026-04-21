import React, { useState } from "react";
import {
  Alert,
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
import { signUp } from "../store/authSlice";
import { setAuthToken, signUpApi } from "../services/authService";
import { PasswordInput } from "../components/PasswordInput";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please complete all fields to create your account.");
      return;
    }
    setError("");

    try {
      setLoading(true);
      const res = await signUpApi({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      await setAuthToken(res.token);
      dispatch(signUp(res.user));
    } catch (e: any) {
      setError(
        e?.response?.data?.error ??
          e?.message ??
          "Sign up failed. Please try again."
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
          <Text style={styles.kicker}>Create account</Text>
          <Text style={styles.title}>Join Smart Leaf Guard</Text>
          <Text style={styles.subtitle}>
            Save predictions securely and sync across your devices with a single
            sign-in.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Muzammil Hussain"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />
          </View>

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
            placeholder="Create a strong password"
            label="Password"
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryLabel}>
              {loading ? "Creating..." : "Create account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.secondaryLabel}>
              Already have an account?{" "}
              <Text style={styles.secondaryLabelStrong}>Sign in</Text>
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
    maxWidth: 480,
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
  forgotButton: {
    marginTop: 12,
    alignItems: "center",
  },
  forgotLabel: {
    color: "#a7f3d0",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  secondaryLabel: {
    color: "#9ca3af",
    fontSize: 13,
  },
  secondaryLabelStrong: {
    color: "#a7f3d0",
    fontWeight: "600",
  },
});


