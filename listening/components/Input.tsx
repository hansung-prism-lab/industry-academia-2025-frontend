import { TextInput, View, StyleSheet, Text } from "react-native";
import { FONTS } from "@/styles/hooks/_fonts";
import { lightColors } from "@/styles/hooks/_colors";

interface InputProps {
  label: string;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
}: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        style={styles.input}
        placeholderTextColor={lightColors.gray}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
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
  input: {
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
});
