import Header from "@/components/Header";
import { lightColors } from "@/styles/hooks/_colors";
import { FONTS } from "@/styles/hooks/_fonts";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useMemo, useState } from "react";
import {
  GoodIcon,
  NextButtonIcon,
  BackButtonIcon,
  SosoIcon,
  BadIcon,
} from "@/components/icon";

// propList를 이용해 결과를 구성합니다. propList 예시는
// [{ id: 0, disease: string, description: "안심" | "주의" | "위험" }] 형태를 가정합니다.
import { useLocalSearchParams } from "expo-router";

function useResultsFromParams() {
  const { propList } = useLocalSearchParams();
  return useMemo(() => {
    try {
      const parsed = typeof propList === "string" ? JSON.parse(propList) : [];
      if (!Array.isArray(parsed)) return [] as any[];
      return parsed.map((item: any, idx: number) => {
        const rawLevel =
          typeof item?.level === "string"
            ? item.level.toUpperCase()
            : item?.level;
        const description =
          rawLevel === "LOW"
            ? "안심"
            : rawLevel === "MEDIUM"
            ? "주의"
            : rawLevel === "HIGH"
            ? "위험"
            : "안심";
        let iconEl = <GoodIcon />;
        if (description === "주의") iconEl = <SosoIcon />;
        if (description === "위험") iconEl = <BadIcon />;
        return {
          id: item?.id ?? idx,
          disease: item?.name ?? `항목 ${idx + 1}`,
          description,
          icon: iconEl,
        };
      });
    } catch (_) {
      return [] as any[];
    }
  }, [propList]);
}

export default function DiagnosisResult() {
  const data = useResultsFromParams();
  const { nickname } = useLocalSearchParams();
  const result =
    data.length > 0
      ? data
      : [
          { id: 0, disease: "뇌졸중", description: "안심", icon: <GoodIcon /> },
          { id: 1, disease: "뇌부상", description: "주의", icon: <SosoIcon /> },
          {
            id: 2,
            disease: "뇌성마비",
            description: "위험",
            icon: <BadIcon />,
          },
        ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < result.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentResult = result[currentIndex];

  const getDescriptionColor = (description: string) => {
    switch (description) {
      case "안심":
        return lightColors.green;
      case "주의":
        return lightColors.orange;
      case "위험":
        return lightColors.red;
      default:
        return lightColors.green;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="진단 결과" leftIcon={true} rightIcon={false} />
      <View style={styles.content}>
        <Text style={styles.title}>{currentResult.disease}</Text>
        <View style={styles.resultContainer}>
          <View style={styles.topText}>
            <Text style={styles.discription}>
              {(typeof nickname === "string" && nickname) || "OOO"} 님은 현재
            </Text>
            <Text style={styles.disease}>{currentResult.disease}</Text>
            <Text style={styles.diseaseDescription}>
              <Text
                style={[
                  styles.diseaseDescriptionBold,
                  { color: getDescriptionColor(currentResult.description) },
                ]}
              >
                {currentResult.description}
              </Text>{" "}
              단계입니다.
            </Text>
          </View>
          {currentResult.icon}
          <Text style={styles.notice}>
            본 진단 결과는 참고용이며,{`\n`}정확한 진단은 반드시 병원 방문을
            통해{`\n`}확인하시기 바랍니다.
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handlePrevious}
          style={{ opacity: currentIndex > 0 ? 1 : 0 }}
          disabled={currentIndex === 0}
        >
          <BackButtonIcon />
        </Pressable>
        <Pressable
          onPress={handleNext}
          style={{ opacity: currentIndex < result.length - 1 ? 1 : 0 }}
          disabled={currentIndex === result.length - 1}
        >
          <NextButtonIcon />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightColors.sub2,
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 37,
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 60,
    fontFamily: FONTS.BLACK,
    color: lightColors.sub1,
  },
  topText: {
    alignItems: "center",
    justifyContent: "center",
  },
  resultContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: lightColors.sub1,
    borderRadius: 10,
    padding: 20,
    backgroundColor: lightColors.white,
    gap: 20,
    marginTop: 20,
  },
  discription: {
    fontSize: 32,
    fontFamily: FONTS.MEDIUM,
    color: lightColors.black,
  },
  disease: {
    fontSize: 32,
    fontFamily: FONTS.BOLD,
    color: lightColors.sub1,
  },
  diseaseDescription: {
    fontSize: 32,
    fontFamily: FONTS.MEDIUM,
    color: lightColors.black,
  },
  diseaseDescriptionBold: {
    fontSize: 32,
    fontFamily: FONTS.BOLD,
    color: lightColors.green,
  },
  notice: {
    fontSize: 18,
    fontFamily: FONTS.MEDIUM,
    color: lightColors.gray,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 10,
  },
});
