import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api/client";

/**
 * GET /api/v1/dashboard/today (docs/api/mobile_v1.md in the Laravel repo).
 * Slice-1 subset: only the fields the read-only dashboard renders — add
 * fields here as screens need them, never read undocumented ones.
 *
 * Exactly one of these describes the day, checked in this priority order
 * (mirrors the web dashboard): no_pieces → needs_schedule → rest_day →
 * needs_anchor → session.
 */
export type DashboardToday = {
  session: PracticeSession | null;
  rest_day: boolean;
  previous_session_notes: PreviousSessionNotes | null;
  no_pieces?: boolean;
  needs_schedule?: boolean;
  needs_anchor?: boolean;
  next_practice_date?: string | null;
};

export type PracticeSession = {
  id: number;
  date: string;
  pieces_assigned: number;
  pieces_completed: number;
  /** 0 until the session is finished */
  duration_seconds: number;
  notes: string | null;
  pieces: SessionPiece[];
  ad_hoc_pieces: AdHocPiece[];
};

export type SessionPiece = {
  id: number;
  title: string;
  composer: string | null;
  /** Learning | Polishing | Mastered | Relearning | Shelved */
  status: string;
  completed: boolean;
  position: number;
  /** Non-null when the piece was deleted from the repertoire after assignment */
  deleted_at: string | null;
};

/** Impromptu additions — not part of the checklist, no completed flag. */
export type AdHocPiece = {
  id: number;
  title: string;
  composer: string | null;
};

export type PreviousSessionNotes = {
  date: string;
  notes: string | null;
};

export const DASHBOARD_TODAY_KEY = ["dashboard", "today"] as const;

export function useDashboardToday() {
  return useQuery({
    queryKey: DASHBOARD_TODAY_KEY,
    queryFn: () => api<DashboardToday>("/api/v1/dashboard/today"),
  });
}

/** Pieces that count toward progress — soft-deleted ones render but don't count. */
export function countablePieces(session: PracticeSession): SessionPiece[] {
  return session.pieces.filter((p) => !p.deleted_at);
}

type TogglePieceResponse = {
  piece_id: number;
  completed: boolean;
  pieces_completed: number;
};

/**
 * Optimistic tick: the cache flips instantly, rolls back on error, and
 * reconciles with the server's counts on success (perceived latency on
 * ticks is the #1 wrapper tell — dev plan).
 */
export function useTogglePiece(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pieceId: number) =>
      api<TogglePieceResponse>(
        `/api/v1/dashboard/sessions/${sessionId}/toggle-piece`,
        { method: "POST", body: { piece_id: pieceId } },
      ),
    onMutate: async (pieceId) => {
      await queryClient.cancelQueries({ queryKey: DASHBOARD_TODAY_KEY });
      const previous =
        queryClient.getQueryData<DashboardToday>(DASHBOARD_TODAY_KEY);
      queryClient.setQueryData<DashboardToday>(DASHBOARD_TODAY_KEY, (old) => {
        if (!old?.session) return old;
        const pieces = old.session.pieces.map((p) =>
          p.id === pieceId ? { ...p, completed: !p.completed } : p,
        );
        return {
          ...old,
          session: {
            ...old.session,
            pieces,
            pieces_completed: pieces.filter((p) => p.completed).length,
          },
        };
      });
      return { previous };
    },
    onError: (_error, _pieceId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(DASHBOARD_TODAY_KEY, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<DashboardToday>(DASHBOARD_TODAY_KEY, (old) => {
        if (!old?.session) return old;
        return {
          ...old,
          session: {
            ...old.session,
            pieces: old.session.pieces.map((p) =>
              p.id === data.piece_id ? { ...p, completed: data.completed } : p,
            ),
            pieces_completed: data.pieces_completed,
          },
        };
      });
    },
  });
}

function useSessionMutation(
  sessionId: number,
  path: "finish" | "cancel",
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body?: { duration_seconds: number }) =>
      api<{ session: PracticeSession }>(
        `/api/v1/dashboard/sessions/${sessionId}/${path}`,
        { method: "POST", body },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData<DashboardToday>(DASHBOARD_TODAY_KEY, (old) =>
        old ? { ...old, session: data.session } : old,
      );
    },
  });
}

/** POST finish — requires duration_seconds 1–86400. Returns the fresh session. */
export function useFinishSession(sessionId: number) {
  return useSessionMutation(sessionId, "finish");
}

/** POST cancel — unticks everything, drops ad-hoc pieces, clears notes. */
export function useCancelSession(sessionId: number) {
  return useSessionMutation(sessionId, "cancel");
}

export function useUpdateSessionNotes(sessionId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes: string) =>
      api<{ notes: string | null }>(
        `/api/v1/dashboard/sessions/${sessionId}/notes`,
        { method: "PATCH", body: { notes } },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData<DashboardToday>(DASHBOARD_TODAY_KEY, (old) =>
        old?.session
          ? { ...old, session: { ...old.session, notes: data.notes } }
          : old,
      );
    },
  });
}

/** POST practice-today — generates a session on a rest day. */
export function usePracticeToday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<{ session: PracticeSession; rest_day: boolean }>(
        "/api/v1/dashboard/practice-today",
        { method: "POST" },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData<DashboardToday>(DASHBOARD_TODAY_KEY, (old) =>
        old ? { ...old, session: data.session, rest_day: false } : old,
      );
      // Response includes a fresh user payload in a different wrapper —
      // simpler to just refetch the user.
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
