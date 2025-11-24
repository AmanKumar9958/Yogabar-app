import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "yogabg" } }} />
      <StatusBar style="dark" backgroundColor="transparent" translucent />
    </>
  );
}
