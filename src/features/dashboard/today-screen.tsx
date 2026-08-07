import { useRouter } from "expo-router";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  useDashboardToday,
  usePracticeToday,
  type DashboardToday,
} from "@/api/dashboard";
import EmptyState from "@/components/empty-state";
import ErrorState from "@/components/error-state";
import Skeleton from "@/components/skeleton";
import GreetingHeader from "@/features/dashboard/greeting-header";
import SessionRunner from "@/features/dashboard/session-runner";
import { formatFriendlyDate } from "@/lib/dates";

/**
 * Home tab content (phase-2 slices 1–2). Default mode shows the greeting
 * and what's scheduled; a running session takes over the whole view
 * (handled inside SessionRunner). State priority mirrors the web:
 * no_pieces → needs_schedule → rest_day → needs_anchor → session.
 */
export default function TodayScreen() {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardToday();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {isPending ? (
        <>
          <GreetingHeader />
          <TodaySkeleton />
        </>
      ) : isError ? (
        <>
          <GreetingHeader />
          <ErrorState onRetry={refetch} />
        </>
      ) : (
        <TodayContent data={data} />
      )}
    </ScrollView>
  );
}

function TodayContent({ data }: { data: DashboardToday }) {
  const router = useRouter();
  const practiceToday = usePracticeToday();

  const confirmPracticeToday = () => {
    Alert.alert(
      "Practice Today",
      "Today is a rest day. Generate a session anyway?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Practice Today",
          onPress: () =>
            practiceToday.mutate(undefined, {
              onError: () =>
                Alert.alert(
                  "Couldn't Start",
                  "Check your connection and try again.",
                ),
            }),
        },
      ],
    );
  };

  // The live session view owns the whole screen — no greeting.
  if (data.session && !data.no_pieces && !data.needs_schedule && !data.rest_day && !data.needs_anchor) {
    return (
      <SessionRunner
        session={data.session}
        previousNotes={data.previous_session_notes}
      />
    );
  }

  return (
    <>
      <GreetingHeader />
      {data.no_pieces ? (
        <EmptyState
          symbol="music.note.list"
          title="No Pieces Yet"
          message="Add some pieces to your repertoire to start practicing!"
          action={{
            label: "Go to Repertoire",
            onPress: () => router.push("/repertoire"),
          }}
        />
      ) : data.needs_schedule ? (
        <EmptyState
          symbol="calendar.badge.exclamationmark"
          title="Set Up Your Schedule"
          message="Choose how often and how much you'd like to practice."
          action={{
            label: "Go to Settings",
            onPress: () => router.push("/settings"),
          }}
        />
      ) : data.rest_day ? (
        <EmptyState
          symbol="moon.zzz"
          title="Rest Day"
          message={
            data.next_practice_date
              ? `No session scheduled for today. Your next practice is ${formatFriendlyDate(data.next_practice_date)}.`
              : "No session scheduled for today."
          }
          action={{
            label: "Practice Today Instead",
            onPress: confirmPracticeToday,
          }}
        />
      ) : data.needs_anchor ? (
        <EmptyState
          symbol="calendar"
          title="Pick a Start Date"
          message="Your schedule needs a start date. Choose when to begin practicing in Settings."
          action={{
            label: "Pick a Start Date",
            onPress: () => router.push("/settings"),
          }}
        />
      ) : (
        // No state flag and no session — contract says this shouldn't
        // happen, but never render a blank screen.
        <ErrorState title="Nothing to Show" />
      )}
    </>
  );
}

/** Mirrors the default layout's shape: a card with header + rows. */
function TodaySkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <Skeleton width={140} height={18} />
        <Skeleton width={70} height={14} />
      </View>
      {Array.from({ length: 4 }, (_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <Skeleton width={22} height={22} borderRadius={11} />
          <View style={styles.skeletonLines}>
            <Skeleton width="65%" height={14} />
            <Skeleton width="40%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  skeletonCard: {
    gap: 14,
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  skeletonLines: {
    flex: 1,
    gap: 6,
  },
});
