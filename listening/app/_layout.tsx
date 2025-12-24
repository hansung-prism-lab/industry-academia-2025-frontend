import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { setCustomText } from "react-native-global-props";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FONTS } from "@/styles/hooks/_fonts";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    [FONTS.THIN]: require("../assets/fonts/Pretendard-Thin.ttf"),
    [FONTS.EXTRA_LIGHT]: require("../assets/fonts/Pretendard-ExtraLight.ttf"),
    [FONTS.LIGHT]: require("../assets/fonts/Pretendard-Light.ttf"),
    [FONTS.REGULAR]: require("../assets/fonts/Pretendard-Regular.ttf"),
    [FONTS.MEDIUM]: require("../assets/fonts/Pretendard-Medium.ttf"),
    [FONTS.SEMI_BOLD]: require("../assets/fonts/Pretendard-SemiBold.ttf"),
    [FONTS.BOLD]: require("../assets/fonts/Pretendard-Bold.ttf"),
    [FONTS.EXTRA_BOLD]: require("../assets/fonts/Pretendard-ExtraBold.ttf"),
    [FONTS.BLACK]: require("../assets/fonts/Pretendard-Black.ttf"),
    [FONTS.RECIPEKOREA]: require("../assets/fonts/Recipekorea.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setCustomText({
        style: {
          fontFamily: FONTS.REGULAR,
        },
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
