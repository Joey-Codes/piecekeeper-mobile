import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useTokens } from "@/theme/tokens";
import { fonts } from "@/theme/typography";

/**
 * Temporary screen body for the phase-1 shell. The filler rows make the
 * screen scroll so the large-title collapse is visible on-device.
 */
export default function PlaceholderScreen({ note }: { note: string }) {
  const t = useTokens();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.note, { color: t.inkMuted }]}>{note}</Text>
      {Array.from({ length: 12 }, (_, i) => (
        <View key={i} style={[styles.row, { backgroundColor: t.card }]} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 16,
    marginBottom: 4,
  },
  row: {
    height: 72,
    borderRadius: 12,
  },
});
