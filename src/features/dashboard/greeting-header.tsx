import { StyleSheet, Text, View } from "react-native";

import { useUser } from "@/api/user";
import { useTokens } from "@/theme/tokens";
import { fonts } from "@/theme/typography";

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/** Web-style dashboard greeting: date line + time-aware hello. */
export default function GreetingHeader() {
  const t = useTokens();
  const { data: user } = useUser();
  const firstName = user?.name.split(" ")[0];

  const date = new Date()
    .toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <View style={styles.block}>
      <Text style={[styles.date, { color: t.cta }]}>IT'S {date}</Text>
      <Text style={[styles.greeting, { color: t.inkStrong }]}>
        {timeGreeting()}
        {firstName ? `, ${firstName}` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingTop: 8,
    gap: 2,
  },
  date: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
  },
  greeting: {
    fontFamily: fonts.display,
    fontSize: 26,
  },
});
