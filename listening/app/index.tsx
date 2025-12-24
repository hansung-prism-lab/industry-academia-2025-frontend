import { Redirect } from "expo-router";
import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return <Redirect href="/login" />;
}
