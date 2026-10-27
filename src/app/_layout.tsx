import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { Inter_800ExtraBold } from "@expo-google-fonts/inter/800ExtraBold";
import { useReducedMotion } from "react-native-reanimated";
import { LocationProvider } from "@/store/location-store";
import { ReminderProvider } from "@/store/reminder-store";
import { AppProvider, useApp } from "@/store/app-store";
import { usePalette } from "@/hooks/use-palette";
import { Button, Page, Txt } from "@/components/bite/ui";
import { LoadingSkeleton } from "@/components/bite/loading";
void SplashScreen.preventAutoHideAsync();
function Navigation() {
  const c = usePalette();
  const reduce = useReducedMotion();
  const app = useApp();
  if (!app.ready)
    return (
      <Page>
        <Txt size={28} weight="extra">
          Opening your radar…
        </Txt>
        {app.error ? (
          <>
            <Txt>{app.error}</Txt>
            <Button label="Try again" onPress={app.reload} />
          </>
        ) : (
          <LoadingSkeleton />
        )}
      </Page>
    );
  return (
    <>
      <StatusBar style={c.background === "#FFF9E8" ? "dark" : "light"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.background },
          animation: reduce ? "none" : "slide_from_right",
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add" />
        <Stack.Screen name="confirm" />
        <Stack.Screen name="success" />
        <Stack.Screen name="place/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="state/[kind]" />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <LocationProvider>
            <ReminderProvider>
              <Navigation />
            </ReminderProvider>
          </LocationProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
