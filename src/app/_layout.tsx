// Weight-specific subpaths so only the used .ttf files ship in the bundle
import { Comfortaa_700Bold } from "@expo-google-fonts/comfortaa/700Bold";
import { Rubik_500Medium } from "@expo-google-fonts/rubik/500Medium";
import { Rubik_600SemiBold } from "@expo-google-fonts/rubik/600SemiBold";
import { Rubik_700Bold } from "@expo-google-fonts/rubik/700Bold";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { SessionProvider, useSession } from "@/auth/session";
import UpgradeGate from "@/features/launch/upgrade-gate";
import { navigationThemes } from "@/theme/navigation";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootNavigator() {
  const { state } = useSession();
  // Bundled with the app (no network) — loads in milliseconds. If it
  // ever errors, proceed without the brand font rather than block.
  const [fontsLoaded, fontError] = useFonts({
    Comfortaa_700Bold,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
    // Custom-emboldened Comfortaa (see typography.ts for the guardrails)
    PKDisplay: require("@/assets/fonts/PKDisplay.ttf"),
  });
  const ready = state !== "loading" && (fontsLoaded || fontError != null);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  // Hold the splash screen until the stored token has been read (so the
  // first frame is the right side of the guard) and fonts are registered.
  if (!ready) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={state === "signedIn"}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={state === "signedOut"}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider
          value={navigationThemes[scheme === "dark" ? "dark" : "light"]}
        >
          <UpgradeGate>
            <RootNavigator />
          </UpgradeGate>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
