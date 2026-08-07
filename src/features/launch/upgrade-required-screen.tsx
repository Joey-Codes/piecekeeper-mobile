import * as SplashScreen from "expo-splash-screen";
import { SymbolView } from "expo-symbols";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTokens } from "@/theme/tokens";

/**
 * Full-screen block shown instead of the app when app-config says this
 * binary is too old. No App Store link yet — the app isn't in the store.
 */
export default function UpgradeRequiredScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();

  // This screen can replace the navigator before the normal splash-hide
  // effect runs, so make sure the splash screen never sticks here.
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: t.page,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <SymbolView
        name="arrow.down.circle.dotted"
        size={56}
        tintColor={t.inkSubtle}
      />
      <Text style={[styles.title, { color: t.inkStrong }]}>
        Update Required
      </Text>
      <Text style={[styles.message, { color: t.inkMuted }]}>
        This version of PieceKeeper is no longer supported. Please install the
        latest version to keep practicing.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    maxWidth: 320,
  },
});
