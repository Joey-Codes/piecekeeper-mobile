import { Stack } from "expo-router";

export default function SettingsStackLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
    </Stack>
  );
}
