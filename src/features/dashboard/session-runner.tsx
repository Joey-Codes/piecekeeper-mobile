import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { api, ApiError } from "@/api/client";
import {
  countablePieces,
  DASHBOARD_TODAY_KEY,
  useCancelSession,
  useFinishSession,
  useTogglePiece,
  type PracticeSession,
  type PreviousSessionNotes,
} from "@/api/dashboard";
import { useUser } from "@/api/user";
import GreetingHeader from "@/features/dashboard/greeting-header";
import SessionNotesCard from "@/features/dashboard/session-notes-card";
import {
  formatElapsed,
  useSessionTimer,
  type StaleTimer,
} from "@/features/dashboard/use-session-timer";
import { formatFriendlyDate } from "@/lib/dates";
import { pieceStatusColor, useTokens } from "@/theme/tokens";
import { fonts } from "@/theme/typography";
import { useQueryClient } from "@tanstack/react-query";

/**
 * The Home tab's session area. Two modes (Joey's structure):
 * - Default: greeting + "Today's Practice" preview card (what's scheduled),
 *   or the completed summary once finished.
 * - Live: when the timer is running/paused the whole view becomes the
 *   focus-mode session screen — big timer, three unlabeled controls,
 *   checklist, notes. No greeting.
 * `duration_seconds > 0` is the server's "finished" signal.
 */
export default function SessionRunner({
  session,
  previousNotes,
}: {
  session: PracticeSession;
  previousNotes: PreviousSessionNotes | null;
}) {
  const t = useTokens();
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  const finishMutation = useFinishSession(session.id);
  const cancelMutation = useCancelSession(session.id);
  const toggleMutation = useTogglePiece(session.id);

  // A timer left over from a previous day gets its time credited to that
  // day's session, best-effort — same recovery the web does.
  const onStale = useCallback(
    (stale: StaleTimer) => {
      api(`/api/v1/dashboard/sessions/${stale.sessionId}/finish`, {
        method: "POST",
        body: { duration_seconds: stale.elapsed },
      })
        .then(() =>
          queryClient.invalidateQueries({ queryKey: DASHBOARD_TODAY_KEY }),
        )
        .catch(() => {});
    },
    [queryClient],
  );

  const timer = useSessionTimer(session.id, onStale);

  const finished = session.duration_seconds > 0;
  const active =
    !finished && (timer.status === "running" || timer.status === "paused");
  const countable = countablePieces(session);
  const doneCount = countable.filter((p) => p.completed).length;

  const finish = useCallback(
    async (elapsed: number) => {
      try {
        await finishMutation.mutateAsync({
          duration_seconds: Math.max(1, elapsed),
        });
        timer.reset();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        Alert.alert(
          "Couldn't Finish Session",
          error instanceof ApiError
            ? error.message
            : "Check your connection and try again.",
        );
      }
    },
    [finishMutation, timer],
  );

  const confirmEnd = () => {
    Alert.alert(
      "End Session",
      `You've been practicing for ${formatElapsed(timer.elapsedSeconds)}.`,
      [
        { text: "Keep Going", style: "cancel" },
        { text: "End Session", onPress: () => void finish(timer.elapsedSeconds) },
      ],
    );
  };

  const confirmCancel = () => {
    Alert.alert(
      "Cancel Session",
      doneCount > 0
        ? `You've completed ${doneCount} ${doneCount === 1 ? "piece" : "pieces"}. Cancelling will discard that progress and reset the session.`
        : "This will reset the session and clear the timer.",
      [
        { text: "Keep Practicing", style: "cancel" },
        {
          text: "Cancel Session",
          style: "destructive",
          onPress: () => {
            cancelMutation.mutate(undefined, {
              onSuccess: () => timer.reset(),
              onError: () =>
                Alert.alert(
                  "Couldn't Cancel",
                  "Check your connection and try again.",
                ),
            });
          },
        },
      ],
    );
  };

  const onToggle = (pieceId: number) => {
    if (!active) return;
    Haptics.selectionAsync();
    toggleMutation.mutate(pieceId, {
      onSuccess: (data) => {
        // Auto-finish when the preference is on and that tick completed the set.
        if (
          user?.auto_end_session &&
          data.pieces_completed >= countable.length &&
          countable.length > 0
        ) {
          void finish(timer.elapsedSeconds);
        }
      },
    });
  };

  // ── Live mode: the whole view is the session ──────────────────────────
  if (active) {
    const paused = timer.status === "paused";
    return (
      <>
        <View style={styles.liveHeader}>
          <Text style={[styles.liveCaption, { color: t.inkSubtle }]}>
            {paused ? "PAUSED" : "PRACTICE SESSION"}
          </Text>
          <Text
            style={[
              styles.liveTimer,
              { color: paused ? t.inkSubtle : t.inkStrong },
            ]}
          >
            {formatElapsed(timer.elapsedSeconds)}
          </Text>
          <View style={styles.liveControls}>
            <Pressable
              onPress={confirmCancel}
              style={({ pressed }) => [
                styles.sideButton,
                { backgroundColor: t.card },
                pressed && styles.pressed,
              ]}
            >
              <SymbolView name="xmark" size={20} tintColor={t.inkMuted} />
            </Pressable>
            <Pressable
              onPress={timer.togglePause}
              style={({ pressed }) => [
                styles.centerButton,
                { backgroundColor: t.cta },
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={paused ? "play.fill" : "pause.fill"}
                size={28}
                tintColor={t.ctaText}
              />
            </Pressable>
            <Pressable
              onPress={confirmEnd}
              disabled={timer.elapsedSeconds < 1 || finishMutation.isPending}
              style={({ pressed }) => [
                styles.sideButton,
                { backgroundColor: t.card },
                (pressed ||
                  timer.elapsedSeconds < 1 ||
                  finishMutation.isPending) &&
                  styles.pressed,
              ]}
            >
              <SymbolView name="stop.fill" size={20} tintColor={t.inkMuted} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: t.card }]}>
          <Text style={[styles.cardTitle, { color: t.inkStrong }]}>
            Practice Checklist
          </Text>
          <ProgressLine done={doneCount} total={countable.length} />
          {/* Future: warm-up and theory sections slot in here, above pieces */}
          <PieceRows session={session} active onToggle={onToggle} />
        </View>

        <SessionNotesCard session={session} />
      </>
    );
  }

  // ── Default mode: greeting + scheduled/completed card ─────────────────
  return (
    <>
      <GreetingHeader />

      <View style={[styles.card, { backgroundColor: t.card }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.cardTitle, { color: t.inkStrong }]}>
            Today's Practice
          </Text>
          {finished ? (
            <View style={styles.doneChip}>
              <SymbolView
                name="checkmark.seal.fill"
                size={18}
                tintColor={t.cta}
              />
              <Text style={[styles.doneChipText, { color: t.inkMuted }]}>
                {formatElapsed(session.duration_seconds)}
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={timer.start}
              disabled={timer.status === "restoring"}
              style={({ pressed }) => [
                styles.startPill,
                { backgroundColor: t.cta },
                (pressed || timer.status === "restoring") && styles.pressed,
              ]}
            >
              <SymbolView name="play.fill" size={12} tintColor={t.ctaText} />
              <Text style={[styles.startPillText, { color: t.ctaText }]}>
                Start
              </Text>
            </Pressable>
          )}
        </View>

        <ProgressLine done={doneCount} total={countable.length} />

        {session.pieces.length === 0 && session.ad_hoc_pieces.length === 0 ? (
          <Text style={[styles.emptyNote, { color: t.inkSubtle }]}>
            Nothing logged yet today.
          </Text>
        ) : null}

        <PieceRows session={session} active={false} onToggle={onToggle} />
      </View>

      {finished ? <SessionNotesCard session={session} /> : null}

      {previousNotes?.notes ? (
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <Text style={[styles.smallLabel, { color: t.inkSubtle }]}>
            LAST SESSION · {formatFriendlyDate(previousNotes.date)}
          </Text>
          <Text style={[styles.prevNotesText, { color: t.inkMuted }]}>
            {previousNotes.notes}
          </Text>
        </View>
      ) : null}
    </>
  );
}

function ProgressLine({ done, total }: { done: number; total: number }) {
  const t = useTokens();
  if (total === 0) return null;
  return (
    <>
      <Text style={[styles.progressText, { color: t.inkSubtle }]}>
        <Text style={{ color: t.ink, fontFamily: fonts.bodySemiBold }}>
          {done}/{total}
        </Text>{" "}
        complete
      </Text>
      <View style={[styles.progressTrack, { backgroundColor: t.divider }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: t.cta,
              width: `${Math.round((done / total) * 100)}%`,
            },
          ]}
        />
      </View>
    </>
  );
}

function PieceRows({
  session,
  active,
  onToggle,
}: {
  session: PracticeSession;
  active: boolean;
  onToggle: (pieceId: number) => void;
}) {
  const t = useTokens();

  return (
    <View style={styles.rows}>
      {session.pieces.map((piece) => {
        const removed = piece.deleted_at != null;
        return (
          <Pressable
            key={piece.id}
            onPress={() => onToggle(piece.id)}
            disabled={!active || removed}
            style={({ pressed }) => [
              styles.row,
              pressed && active && { backgroundColor: t.surfaceHover },
            ]}
          >
            <View
              style={[
                styles.statusBar,
                {
                  backgroundColor: removed
                    ? t.divider
                    : pieceStatusColor(piece.status),
                },
              ]}
            />
            <SymbolView
              name={piece.completed ? "checkmark.circle.fill" : "circle"}
              size={24}
              tintColor={
                removed ? t.divider : piece.completed ? t.cta : t.border
              }
            />
            <View style={styles.rowText}>
              <Text
                style={[
                  styles.rowTitle,
                  { color: removed || piece.completed ? t.inkSubtle : t.ink },
                ]}
                numberOfLines={1}
              >
                {piece.title}
              </Text>
              {removed ? (
                <Text style={[styles.rowDetail, { color: t.inkSubtle }]}>
                  Removed from repertoire
                </Text>
              ) : piece.composer ? (
                <Text
                  style={[styles.rowDetail, { color: t.inkSubtle }]}
                  numberOfLines={1}
                >
                  {piece.composer}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}

      {session.ad_hoc_pieces.length > 0 ? (
        <View style={styles.adHocSection}>
          <Text style={[styles.smallLabel, { color: t.inkSubtle }]}>
            IMPROMPTU
          </Text>
          {session.ad_hoc_pieces.map((piece) => (
            <View key={piece.id} style={styles.adHocRow}>
              <SymbolView name="music.note" size={18} tintColor={t.inkSubtle} />
              <Text
                style={[styles.rowTitle, { color: t.ink }]}
                numberOfLines={1}
              >
                {piece.title}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // live mode
  liveHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 8,
    gap: 4,
  },
  liveCaption: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  liveTimer: {
    fontSize: 64,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  liveControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginTop: 12,
  },
  sideButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  // shared cards
  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 19,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 32,
  },
  startPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
  doneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  doneChipText: {
    fontSize: 15,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: 15,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  emptyNote: {
    fontFamily: fonts.body,
    fontSize: 16,
    paddingVertical: 6,
  },
  // rows
  rows: {
    marginTop: 4,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingRight: 4,
    borderRadius: 10,
  },
  statusBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  rowTitle: {
    fontFamily: fonts.body,
    fontSize: 17,
  },
  rowDetail: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
  adHocSection: {
    paddingTop: 8,
    gap: 8,
  },
  adHocRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  smallLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  prevNotesText: {
    fontFamily: fonts.body,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.6,
  },
});
