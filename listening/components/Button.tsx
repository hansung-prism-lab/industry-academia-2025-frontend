import { lightColors } from "@/styles/hooks/_colors";
import { FONTS } from "@/styles/hooks/_fonts";
import { Pressable, StyleSheet, Text } from "react-native";

export default function Button({
  text,
  color,
  backgroundColor,
  onPress,
}: {
  text: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.button, { backgroundColor: backgroundColor }]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: color }]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    padding: 20,
    borderRadius: 44,
    alignItems: "center",
    shadowColor: lightColors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    elevation: 10,
  },
  buttonText: {
    fontSize: 26,
    fontFamily: FONTS.BOLD,
  },
});
