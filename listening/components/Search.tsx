import { lightColors } from "@/styles/hooks/_colors";
import { View, StyleSheet, Text, TextInput, Pressable } from "react-native";
import { FONTS } from "@/styles/hooks/_fonts";
import { useState, useEffect } from "react";

export default function Search({
  label,
  placeholder,
  text,
  value,
  onChangeText,
  onSubmit,
}: {
  label?: string;
  placeholder: string;
  text: string;
  // controlled props (optional)
  value?: string;
  onChangeText?: (message: string) => void;
  onSubmit?: (message: string) => void;
}) {
  // 내부 state는 uncontrolled 모드에서만 사용
  const [inputText, setInputText] = useState("");

  // 외부에서 value를 전달하면 내부 상태를 동기화
  useEffect(() => {
    if (value !== undefined) setInputText(value);
  }, [value]);

  const handleChange = (t: string) => {
    if (onChangeText) onChangeText(t);
    // controlled 모드이면 내부 상태를 변경하지 않음
    if (value === undefined) setInputText(t);
  };

  const handleSend = () => {
    const current = value !== undefined ? value : inputText;
    const trimmed = current.trim();
    if (trimmed) {
      if (onSubmit) onSubmit(trimmed);
      if (value === undefined) setInputText("");
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor={lightColors.gray}
          value={value !== undefined ? value : inputText}
          onChangeText={handleChange}
          onSubmitEditing={handleSend}
        />
        <Pressable style={styles.searchButton} onPress={handleSend}>
          <Text style={styles.searchButtonText}>{text}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 22,
    fontFamily: FONTS.SEMI_BOLD,
    color: lightColors.black,
    marginBottom: 8,
  },
  inputContainer: {
    width: "100%",
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    width: "75%",
    borderWidth: 2,
    borderColor: lightColors.main,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontFamily: FONTS.REGULAR,
    color: lightColors.black,
    backgroundColor: lightColors.white,
  },
  searchButton: {
    width: "25%",
    padding: 9,
    borderRadius: 44,
    alignItems: "center",
    backgroundColor: lightColors.main,
    shadowColor: lightColors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    elevation: 10,
  },
  searchButtonText: {
    fontSize: 26,
    fontFamily: FONTS.SEMI_BOLD,
    color: lightColors.white,
  },
});
