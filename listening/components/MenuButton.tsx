import { View, Text, StyleSheet, Pressable } from "react-native";
import { lightColors } from "@/styles/hooks/_colors";
import { FONTS } from "@/styles/hooks/_fonts";
export default function MenuButton({
  icon,
  text,
  highlightText,
  onPress,
}: {
  icon: React.ReactNode;
  text: string;
  highlightText: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {icon}
      <View style={styles.textContainer}>
        <Text style={styles.text}>{text}</Text>
        <Text style={styles.highlightText}>{highlightText}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 22,
    paddingHorizontal: 30,
    borderRadius: 22,
    backgroundColor: lightColors.white,
    borderWidth: 2,
    borderColor: lightColors.main,
    shadowColor: lightColors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    elevation: 10,
    gap: 12,
  },
  textContainer: {
    flexDirection: "column",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 32,
    fontFamily: FONTS.REGULAR,
    color: lightColors.sub1,
  },
  highlightText: {
    fontSize: 32,
    fontFamily: FONTS.SEMI_BOLD,
    color: lightColors.sub1,
  },
});
