import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export const PrimaryButton: React.FC<Props> = ({
  label,
  onPress,
  disabled,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#166534",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  label: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  disabled: {
    backgroundColor: "#9ca3af",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});


