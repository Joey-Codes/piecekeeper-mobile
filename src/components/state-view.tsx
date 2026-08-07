import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import { StyleSheet, Text, View } from "react-native";

import PrimaryButton from "@/components/primary-button";
import { useTokens } from "@/theme/tokens";
import { fonts } from "@/theme/typography";

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
        <PrimaryButton
          label={action.label}
          onPress={action.onPress}
          style={styles.action}
        />
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
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    textAlign: "center",
    marginTop: 8,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 16,
    textAlign: "center",
    maxWidth: 320,
  },
  action: {
    marginTop: 12,
  },
});
