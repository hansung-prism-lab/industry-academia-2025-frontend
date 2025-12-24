import { View, Text, StyleSheet } from "react-native";
import Header from "@/components/Header";
import { lightColors } from "@/styles/hooks/_colors";
import { FONTS } from "@/styles/hooks/_fonts";
import { CheckIcon, ErrorIcon } from "@/components/icon";
import Button from "@/components/Button";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AnalysisResult() {
  const { title, description, buttonText, propList, nickname } =
    useLocalSearchParams();

  const headerTitle = title ? (title as string) : "분석 실패";
  const resultDescription = description
    ? (description as string)
    : `음성 분석에\n 실패했습니다.`;
  const buttonLabel = buttonText ? (buttonText as string) : "다시 시도하기";

  const router = useRouter();
  const onPress = () => {
    if (headerTitle === "분석 성공") {
      router.push({
        pathname: "./diagnosis-result",
        params: {
          propList: typeof propList === "string" ? (propList as string) : "[]",
          nickname: typeof nickname === "string" ? (nickname as string) : "",
        },
      });
    } else {
      router.push("./analysis");
    }
  };
  return (
    <View style={styles.container}>
      <Header title={"분석 결과"} leftIcon={true} rightIcon={false} />
      <View style={styles.content}>
        <Text style={styles.title}>{headerTitle}</Text>
        {headerTitle === "분석 성공" ? <CheckIcon /> : <ErrorIcon />}
        <Text style={styles.description}>{resultDescription}</Text>
        <Button
          text={buttonLabel}
          color={lightColors.white}
          backgroundColor={lightColors.main}
          onPress={onPress}
        />
        {/* <Text style={styles.title}>분석 실패</Text>
        <ErrorIcon />
        <Text style={styles.description}>음성 분석에{"\n"}실패했습니다.</Text>
        <Button
          text={"다시 시도하기"}
          color={lightColors.white}
          backgroundColor={lightColors.main}
          onPress={onPress}
        /> */}
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
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 60,
    fontFamily: FONTS.BLACK,
    color: lightColors.sub1,
    marginBottom: 44,
  },
  description: {
    fontSize: 32,
    fontFamily: FONTS.MEDIUM,
    color: lightColors.black,
    textAlign: "center",
    marginTop: 92,
    marginBottom: 92,
  },
});
