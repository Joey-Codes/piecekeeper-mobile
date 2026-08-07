import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useUpdateSessionNotes, type PracticeSession } from "@/api/dashboard";
import { useTokens } from "@/theme/tokens";
import { fonts } from "@/theme/typography";

/**
 * Editable notes for today's session. Saves when editing ends; shows a
 * subtle saved/unsaved hint rather than a button.
 */
export default function SessionNotesCard({
  session,
}: {
  session: PracticeSession;
}) {
  const t = useTokens();
  const notesMutation = useUpdateSessionNotes(session.id);
  const [draft, setDraft] = useState(session.notes ?? "");

  // Cancel clears notes server-side; follow external resets when not editing.
  useEffect(() => {
    setDraft(session.notes ?? "");
  }, [session.notes]);

  const dirty = draft !== (session.notes ?? "");

  const save = () => {
    if (dirty) {
      notesMutation.mutate(draft);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: t.card }]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: t.inkSubtle }]}>
          SESSION NOTES
        </Text>
        {notesMutation.isPending ? (
          <Text style={[styles.hint, { color: t.inkSubtle }]}>Saving…</Text>
        ) : notesMutation.isError ? (
          <Text style={[styles.hint, { color: t.danger }]}>Couldn't save</Text>
        ) : null}
      </View>
      <TextInput
        style={[styles.input, { color: t.ink }]}
        value={draft}
        onChangeText={setDraft}
        onEndEditing={save}
        placeholder="How did it go?"
        placeholderTextColor={t.inkSubtle}
        multiline
        maxLength={2000}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 44,
    paddingTop: 0,
  },
});
