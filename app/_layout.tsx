import { ThemeProvider } from "../context/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { View, ActivityIndicator } from "react-native";
import { useUserStore } from "../store/userStore";
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { LanguageProvider } from "./context/LanguageContext";
import AIAssistantOverlay from "@/components/AIAssitanceoverlay";
import ChatTranscript from "@/components/chattranscript";
function RootLayoutNav() {
  const { isLoggedIn, user } = useUserStore();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";
    const inFarmerTabsGroup = segments[0] === "(tabs)";
    const inBuyerTabsGroup = segments[0] === "(buyer-tabs)";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/auth/login");
    } else if (isLoggedIn) {
      if (inAuthGroup) {
        if (user?.role === "buyer") {
          router.replace("/(buyer-tabs)");
        } else {
          router.replace("/(tabs)");
        }
      } else if (user?.role === "buyer" && !inBuyerTabsGroup) {
        router.replace("/(buyer-tabs)");
      } else if (
        user?.role !== "buyer" &&
        !inFarmerTabsGroup &&
        segments[0] !== undefined
      ) {
        router.replace("/(tabs)");
      }
    }
  }, [isLoggedIn, segments, user?.role]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="field/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="field/new" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/login"
        options={{
          headerShown: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="auth/signup"
        options={{
          headerShown: false,
          headerBackVisible: false,
        }}
      />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(buyer-tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Inter-Black": require("../assets/fonts/Inter-Black.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <LanguageProvider>
            <>
              <RootLayoutNav />
              <AIAssistantOverlay />
              <ChatTranscript />
              <StatusBar style="light" backgroundColor="#151718" />
            </>
          </LanguageProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
