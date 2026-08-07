import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "@/components/empty-state";
import ErrorState from "@/components/error-state";
import ProLockedState from "@/components/pro-locked-state";
import Skeleton from "@/components/skeleton";
import { useTokens } from "@/theme/tokens";

/**
 * TEMPORARY dev-only gallery for eyeballing the state kit in light/dark.
 * Open from Safari on the phone: piecekeepermobile://dev-states
 * Delete this file once verified — it must not ship.
 */
export default function DevStatesScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: t.page }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <Text style={[styles.heading, { color: t.inkStrong }]}>
        State kit gallery
      </Text>

      <Text style={[styles.label, { color: t.inkSubtle }]}>Skeleton</Text>
      <View
        style={[styles.card, { backgroundColor: t.card, borderColor: t.divider }]}
      >
        <View style={styles.skeletonRow}>
          <Skeleton width={44} height={44} borderRadius={22} />
          <View style={styles.skeletonLines}>
            <Skeleton width="70%" />
            <Skeleton width="45%" height={12} />
          </View>
        </View>
        <Skeleton height={12} />
        <Skeleton width="85%" height={12} />
      </View>

      <Text style={[styles.label, { color: t.inkSubtle }]}>EmptyState</Text>
      <EmptyState
        symbol="music.note.list"
        title="No Pieces Yet"
        message="Pieces you add to your repertoire will show up here."
        action={{ label: "Add a Piece", onPress: () => {} }}
      />

      <Text style={[styles.label, { color: t.inkSubtle }]}>ErrorState</Text>
      <ErrorState onRetry={() => {}} />

      <Text style={[styles.label, { color: t.inkSubtle }]}>ProLockedState</Text>
      <ProLockedState />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  skeletonLines: {
    flex: 1,
    gap: 8,
  },
});
