import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useUser } from "@/api/user";
import { useSession } from "@/auth/session";
import { useTokens } from "@/theme/tokens";

export default function SettingsScreen() {
  const { signOut } = useSession();
  const { data: user } = useUser();
  const t = useTokens();

  const confirmSignOut = () => {
    Alert.alert("Sign Out", "You can sign back in at any time.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => void signOut() },
    ]);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: t.card, borderColor: t.divider },
        ]}
      >
        <View style={[styles.row, { borderBottomColor: t.divider }]}>
          <Text style={[styles.rowLabel, { color: t.ink }]}>
            {user?.name ?? "…"}
          </Text>
          <Text style={[styles.rowDetail, { color: t.inkSubtle }]}>
            {user?.email ?? ""}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.row,
            styles.lastRow,
            pressed && { backgroundColor: t.surfaceHover },
          ]}
          onPress={confirmSignOut}
        >
          <Text style={[styles.rowLabel, { color: t.danger }]}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 17,
  },
  rowDetail: {
    fontSize: 14,
  },
});
