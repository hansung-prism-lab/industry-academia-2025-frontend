import { View, StyleSheet } from "react-native";
import Header from "@/components/Header";
import { lightColors } from "@/styles/hooks/_colors";
import MenuButton from "@/components/MenuButton";
import { ChatIcon, MicIcon, SheetIcon } from "@/components/icon";
import { useRouter } from "expo-router";

export default function Main() {
  const router = useRouter();
  const menuButtons = [
    {
      icon: <SheetIcon />,
      text: "음성 분석",
      highlightText: "간이 진단",
      onPress: () => {
        router.push("/analysis");
      },
    },
    {
      icon: <MicIcon />,
      text: "AI 음성 비서",
      highlightText: "경청이",
      onPress: () => {
        router.push("/assistant");
      },
    },
    {
      icon: <ChatIcon />,
      text: "음성",
      highlightText: "텍스트 변환",
      onPress: () => {
        router.push("/chat");
      },
    },
  ];
  return (
    <View style={styles.container}>
      <Header title="메뉴" leftIcon={false} rightIcon={true} />
      <View style={styles.content}>
        <View style={styles.menuButtons}>
          {menuButtons.map((button, index) => (
            <MenuButton key={index} {...button} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.sub2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 37,
    justifyContent: "center",
    alignItems: "center",
  },
  menuButtons: {
    width: "100%",
    gap: 50,
  },
});
