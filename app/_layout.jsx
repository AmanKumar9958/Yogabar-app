import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import Toast from 'react-native-toast-message';
import CustomSplashScreen from "../components/CustomSplashScreen";
import { toastConfig } from "../configs/toastConfig";
import "../global.css";

export default function RootLayout() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isShowSplash) {
    return <CustomSplashScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "yogabg" } }} />
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <Toast config={toastConfig} />
    </>
  );
}
