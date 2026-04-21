import React, { useMemo, useState } from "react";
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
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateProfile } from "../store/authSlice";
import { useTranslation } from "../hooks/useTranslation";
import { BottomNavigation } from "../components/BottomNavigation";
import { changePasswordApi, updateProfileApi } from "../services/authService";
import { PasswordInput } from "../components/PasswordInput";

export const ProfileScreen: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { t, language, setLanguage } = useTranslation();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<
    null | { type: "success" | "error"; message: string }
  >(null);

  const isSaveDisabled = useMemo(() => {
    return (
      !name.trim() ||
      (name === (user?.name ?? "")) &&
        (phone === (user?.phone ?? "")) &&
        (location === (user?.location ?? ""))
    );
  }, [name, phone, location, user]);

  const handleSave = () => {
    (async () => {
      try {
        const updated = await updateProfileApi({
          name: name.trim(),
          phone: phone.trim(),
          location: location.trim(),
        });
        dispatch(
          updateProfile({
            name: updated.name,
            phone: updated.phone,
            location: updated.location,
          })
        );
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      } catch (e) {
        // Keep UI responsive even if backend fails
        dispatch(
          updateProfile({
            name: name.trim(),
            phone: phone.trim(),
            location: location.trim(),
          })
        );
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }
    })();
  };

  const handleChangePassword = () => {
    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      setPasswordStatus({ type: "error", message: t("profile.passwordErrorRequired") });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: t("profile.passwordErrorMatch") });
      return;
    }
    (async () => {
      try {
        await changePasswordApi({
          currentPassword,
          newPassword,
        });
        setPasswordStatus({ type: "success", message: t("profile.passwordSuccess") });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (e: any) {
        setPasswordStatus({
          type: "error",
          message:
            e?.response?.data?.error ??
            e?.message ??
            t("profile.passwordErrorRequired"),
        });
      }
    })();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.select({ ios: "padding", android: "height" })}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("profile.title")}</Text>
        <Text style={styles.subtitle}>{t("profile.subtitle")}</Text>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>{t("profile.name")}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Aftab Khan"
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("profile.email")}</Text>
            <TextInput
              value={user?.email ?? ""}
              editable={false}
              style={[styles.input, styles.disabledInput]}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("profile.phone")}</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+92 3XX XXXXXXX"
              keyboardType="phone-pad"
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("profile.location")}</Text>
            <View style={styles.languageRow}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  location === "Charsadda" && styles.languageButtonActive,
                ]}
                onPress={() => setLocation("Charsadda")}
              >
                <Text
                  style={[
                    styles.languageLabel,
                    location === "Charsadda" && styles.languageLabelActive,
                  ]}
                >
                  Charsadda
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  location === "Chitral" && styles.languageButtonActive,
                ]}
                onPress={() => setLocation("Chitral")}
              >
                <Text
                  style={[
                    styles.languageLabel,
                    location === "Chitral" && styles.languageLabelActive,
                  ]}
                >
                  Chitral
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (isSaveDisabled || !user) && styles.primaryButtonDisabled,
            ]}
            disabled={isSaveDisabled || !user}
            onPress={handleSave}
          >
            <Text style={styles.primaryLabel}>
              {saved ? t("profile.saved") : t("profile.save")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.languageTitle}>{t("profile.languageTitle")}</Text>
          <View style={styles.languageRow}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === "en" && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage("en")}
            >
              <Text
                style={[
                  styles.languageLabel,
                  language === "en" && styles.languageLabelActive,
                ]}
              >
                EN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === "ur" && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage("ur")}
            >
              <Text
                style={[
                  styles.languageLabel,
                  language === "ur" && styles.languageLabelActive,
                ]}
              >
                اردو
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === "ps" && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage("ps")}
            >
              <Text
                style={[
                  styles.languageLabel,
                  language === "ps" && styles.languageLabelActive,
                ]}
              >
                پښتو
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.languageTitle}>{t("profile.passwordTitle")}</Text>
          <PasswordInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            label={t("profile.currentPassword")}
            style={styles.input}
          />
          <PasswordInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            label={t("profile.newPassword")}
            style={styles.input}
          />
          <PasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            label={t("profile.confirmPassword")}
            style={styles.input}
          />
          {passwordStatus ? (
            <Text
              style={[
                styles.passwordStatus,
                passwordStatus.type === "success"
                  ? styles.passwordStatusSuccess
                  : styles.passwordStatusError,
              ]}
            >
              {passwordStatus.message}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.primaryLabel}>{t("profile.passwordSave")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavigation />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
    gap: 16,
  },
  contentWide: {
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#022c22",
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  disabledInput: {
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
  },
  primaryButton: {
    backgroundColor: "#059669",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  primaryLabel: {
    color: "#ecfdf5",
    fontWeight: "700",
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
  },
  languageRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  languageButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#94a3b8",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  languageButtonActive: {
    backgroundColor: "#022c22",
    borderColor: "#022c22",
  },
  languageLabel: {
    fontWeight: "700",
    color: "#0f172a",
  },
  languageLabelActive: {
    color: "#ecfdf5",
  },
  passwordStatus: {
    fontSize: 13,
    marginTop: -4,
  },
  passwordStatusSuccess: {
    color: "#15803d",
  },
  passwordStatusError: {
    color: "#dc2626",
  },
});


