import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTokens } from "@/theme/tokens";

export type StateViewProps = {
  symbol: SFSymbol;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
};

/**
 * Shared layout for in-place content states (empty / error / pro-locked).
 * Renders inside the screen's content area — the parent owns safe areas
 * and scroll behavior. Flexible sizing keeps Dynamic Type safe.
 */
export default function StateView({
  symbol,
  title,
  message,
  action,
}: StateViewProps) {
  const t = useTokens();

  return (
    <View style={styles.container}>
      <SymbolView name={symbol} size={44} tintColor={t.inkSubtle} />
      <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: t.inkMuted }]}>{message}</Text>
      ) : null}
      {action ? (
        <Pressable
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: t.accent },
            pressed && styles.actionPressed,
          ]}
          onPress={action.onPress}
        >
          <Text style={[styles.actionLabel, { color: t.card }]}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    maxWidth: 320,
  },
  action: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
