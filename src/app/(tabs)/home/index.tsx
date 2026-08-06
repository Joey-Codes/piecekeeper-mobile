import { Stack } from "expo-router";

import { useUser } from "@/api/user";
import PlaceholderScreen from "@/components/placeholder-screen";

export default function HomeScreen() {
  const { data: user } = useUser();
  const firstName = user?.name.split(" ")[0];

  return (
    <>
      <Stack.Screen options={{ title: firstName ? `Hi, ${firstName}` : "Home" }} />
      <PlaceholderScreen note="Your practice day will live here." />
    </>
  );
}
