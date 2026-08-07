import { Stack } from "expo-router";

export default function HomeStackLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true }}>
      {/* Home draws its own greeting header (web-style); pushed screens
          keep native headers. */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
