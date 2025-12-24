import { View, Text, Pressable, StyleSheet } from "react-native";
import { BackIcon, SettingIcon } from "./icon";
import { lightColors } from "@/styles/hooks/_colors";
import { FONTS } from "@/styles/hooks/_fonts";
import { useRouter } from "expo-router";
export default function Header({
  title,
  leftIcon = true,
  rightIcon = false,
}: {
  title: string;
  leftIcon: boolean;
  rightIcon: boolean;
}) {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {leftIcon && (
          <Pressable
            onPress={() => {
              router.back();
            }}
          >
            <BackIcon />
          </Pressable>
        )}
      </View>
      <View style={styles.centerSection}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightSection}>
        {rightIcon && (
          <Pressable
            onPress={() => {
              router.push("/settings");
            }}
          >
            <SettingIcon />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightColors.main,
    paddingVertical: 10,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
    minWidth: 0,
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  title: {
    textAlign: "center",
    paddingTop: 10,
    fontSize: 30,
    fontFamily: FONTS.RECIPEKOREA,
    color: lightColors.white,
    flexWrap: "nowrap",
  },
});
