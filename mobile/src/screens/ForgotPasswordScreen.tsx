import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../types/navigation";
import { forgotPasswordApi, verifyResetCodeApi, resetPasswordApi } from "../services/authService";
import { PasswordInput } from "../components/PasswordInput";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "" >("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setStatusMessage("");
    setStatusType("");
    setLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      setCodeSent(true);
      setCodeVerified(false);
      setCode("");
      setCountdown(30); // 30 seconds for OTP verification
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    if (code.trim().length !== 6) {
      setError("Verification code must be 6 digits.");
      return;
    }
    if (countdown <= 0) {
      setError("Verification code has expired. Please resend.");
      setStatusMessage("");
      setStatusType("");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await verifyResetCodeApi(email, code.trim());
      setCodeVerified(true);
      setCountdown(0); // Stop the countdown
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setStatusMessage("Code verified successfully. Enter your new password.");
      setStatusType("success");
      Keyboard.dismiss();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Invalid code.");
      setStatusMessage("Code invalid. Please try again or resend the code.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't start countdown if code is verified or not sent
    if (!codeSent || codeVerified || countdown <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setCountdown((seconds) => {
        if (seconds <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setStatusMessage("Verification code expired. Please resend.");
          setStatusType("error");
          setCodeSent(false);
          setCodeVerified(false);
          setCode("");
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [codeSent, codeVerified, countdown]);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!codeVerified) {
      setError("Please verify the code before setting a new password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await resetPasswordApi(email, code, newPassword);
      navigation.navigate("SignIn");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const resetToEmailStep = () => {
    setCodeSent(false);
    setCodeVerified(false);
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setStatusMessage("");
    setStatusType("");
    setCountdown(0);
    setError("");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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
        keyboardDismissMode="on-drag"
      >
        <View style={styles.card}>
          <Text style={styles.kicker}>Reset Password</Text>
          <Text style={styles.title}>Forgot your password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email and we'll send you a reset code.
          </Text>

          {!codeSent ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor="#6b7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleSendCode}
                disabled={loading}
              >
                <Text style={styles.primaryLabel}>
                  {loading ? "Sending..." : "Send Reset Code"}
                </Text>
              </TouchableOpacity>
            </>
          ) : !codeVerified ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={(text) => {
                    setCode(text);
                    setError("");
                  }}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  maxLength={6}
                />
                <Text style={styles.helperText}>
                  Check your email for the verification code
                </Text>
                {countdown > 0 ? (
                  <Text style={styles.helperText}>Code expires in {countdown}s</Text>
                ) : null}
                {statusMessage ? (
                  <Text style={statusType === "success" ? styles.successText : styles.errorText}>
                    {statusMessage}
                  </Text>
                ) : null}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                <Text style={styles.primaryLabel}>
                  {loading ? "Verifying..." : "Verify Code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSendCode}
                disabled={loading}
              >
                <Text style={styles.secondaryLabel}>Resend Code</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <PasswordInput
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setError("");
                }}
                placeholder="Enter new password"
                label="New Password"
                style={styles.input}
              />

              <PasswordInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError("");
                }}
                placeholder="Confirm new password"
                label="Confirm Password"
                style={styles.input}
              />

              {statusMessage ? (
                <Text style={statusType === "success" ? styles.successText : styles.errorText}>
                  {statusMessage}
                </Text>
              ) : null}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.primaryLabel}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (codeSent) {
                resetToEmailStep();
              } else {
                navigation.goBack();
              }
            }}
          >
            <Text style={styles.backLabel}>
              {codeSent ? "Start Over" : "Back to Sign In"}
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
    marginBottom: 8,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: "#e5e7eb",
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#020617",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#f9fafb",
    fontSize: 14,
  },
  helperText: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
  successText: {
    color: "#34d399",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#f97316",
    fontSize: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#16a34a",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
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
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryLabel: {
    color: "#a7f3d0",
    fontSize: 13,
    fontWeight: "600",
  },
  backButton: {
    alignItems: "center",
    marginTop: 8,
  },
  backLabel: {
    color: "#9ca3af",
    fontSize: 13,
  },
});
