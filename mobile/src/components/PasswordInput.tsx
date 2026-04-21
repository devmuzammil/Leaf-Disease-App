import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  Text,
} from "react-native";

interface PasswordInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          {...props}
          secureTextEntry={!showPassword}
          editable={true}
          autoComplete="off"
          placeholderTextColor="#6b7280"
          style={[styles.input, style]}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },
  label: {
    color: "#e5e7eb",
    fontSize: 13,
    marginBottom: 6,
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#020617",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#f9fafb",
    fontSize: 14,
  },
  toggleButton: {
    position: "absolute",
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  toggleText: {
    color: "#a7f3d0",
    fontSize: 12,
    fontWeight: "500",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 6,
  },
});
