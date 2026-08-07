import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

  useEffect(() => {
    if (state !== "loading") {
      SplashScreen.hideAsync();
    }
  }, [state]);

  // Hold the splash screen until the stored token has been read, so the
  // first frame is already the right side of the guard (no login flash).
  if (state === "loading") {
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
