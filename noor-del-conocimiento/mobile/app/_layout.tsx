import "../lib/i18n";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Amiri_400Regular,
  Amiri_700Bold,
  Amiri_400Regular_Italic,
  Amiri_700Bold_Italic,
} from "@expo-google-fonts/amiri";
import {
  ElMessiri_400Regular,
  ElMessiri_500Medium,
  ElMessiri_600SemiBold,
  ElMessiri_700Bold,
} from "@expo-google-fonts/el-messiri";
import {
  DMSerifDisplay_400Regular,
  DMSerifDisplay_400Regular_Italic,
} from "@expo-google-fonts/dm-serif-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { LanguageProvider } from "../context/LanguageContext";
import { SettingsProvider } from "../context/SettingsContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Colors } from "../constants/colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Amiri_400Regular_Italic,
    Amiri_700Bold_Italic,
    ElMessiri_400Regular,
    ElMessiri_500Medium,
    ElMessiri_600SemiBold,
    ElMessiri_700Bold,
    DMSerifDisplay_400Regular,
    DMSerifDisplay_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    // Hide splash once fonts resolve (loaded or errored)
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Keep splash visible while loading; on error, fonts fall back to system defaults
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <SafeAreaProvider>
      <ErrorBoundary>
        <LanguageProvider>
          <SettingsProvider>
            <StatusBar style="light" backgroundColor={Colors.bg.primary} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bg.primary },
                animation: "fade_from_bottom",
                animationDuration: 250,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="home" />
              <Stack.Screen name="stats" />
              <Stack.Screen name="rules" />
              <Stack.Screen name="play" />
              <Stack.Screen name="game-over" />
              <Stack.Screen name="majlis-setup" />
              <Stack.Screen name="majlis-game-over" />
              <Stack.Screen name="learn" />
              <Stack.Screen name="review" />
              <Stack.Screen name="daily-challenge" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </SettingsProvider>
        </LanguageProvider>
      </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
