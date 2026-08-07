import { useCallback, useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";

/**
 * Practice-session timer, mirroring the web dashboard's behavior:
 * wall-clock based (backgrounding/suspension can't drift it), pause/resume,
 * persisted across app restarts. While running, the persisted `lastTickAt`
 * lets a restore credit the time the app was closed.
 *
 * Persistence uses SecureStore purely because it's the storage module the
 * dev build already ships; the payload isn't sensitive.
 */

const TIMER_KEY = "piecekeeper.sessionTimer";
const TICK_MS = 1000;

type PersistedTimer = {
  date: string; // YYYY-MM-DD, device-local
  sessionId: number;
  elapsed: number;
  paused: boolean;
  lastTickAt: number | null; // non-null only while running
};

/** A restored timer belonging to a previous day (or another session). */
export type StaleTimer = { sessionId: number; elapsed: number };

export type SessionTimer = {
  status: "restoring" | "idle" | "running" | "paused";
  elapsedSeconds: number;
  start: () => void;
  togglePause: () => void;
  /** Stop and forget — after finish, cancel, or discard. */
  reset: () => void;
};

function todayDate(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function useSessionTimer(
  sessionId: number,
  onStale?: (stale: StaleTimer) => void,
): SessionTimer {
  const [status, setStatus] = useState<SessionTimer["status"]>("restoring");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const accumulatedRef = useRef(0);
  const segmentStartRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onStaleRef = useRef(onStale);
  onStaleRef.current = onStale;

  const persist = useCallback(
    (elapsed: number, paused: boolean) => {
      void SecureStore.setItemAsync(
        TIMER_KEY,
        JSON.stringify({
          date: todayDate(),
          sessionId,
          elapsed,
          paused,
          lastTickAt: paused ? null : Date.now(),
        } satisfies PersistedTimer),
      );
    },
    [sessionId],
  );

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    stopInterval();
    segmentStartRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      if (segmentStartRef.current != null) {
        setElapsedSeconds(
          accumulatedRef.current +
            Math.floor((Date.now() - segmentStartRef.current) / 1000),
        );
      }
    }, TICK_MS);
  }, [stopInterval]);

  // Restore persisted state once per session id.
  useEffect(() => {
    let cancelled = false;
    SecureStore.getItemAsync(TIMER_KEY).then((raw) => {
      if (cancelled) return;
      if (!raw) {
        setStatus("idle");
        return;
      }
      let saved: PersistedTimer;
      try {
        saved = JSON.parse(raw);
      } catch {
        void SecureStore.deleteItemAsync(TIMER_KEY);
        setStatus("idle");
        return;
      }

      if (saved.date !== todayDate() || saved.sessionId !== sessionId) {
        if (saved.elapsed > 0) {
          onStaleRef.current?.({
            sessionId: saved.sessionId,
            elapsed: saved.elapsed,
          });
        }
        void SecureStore.deleteItemAsync(TIMER_KEY);
        setStatus("idle");
        return;
      }

      // Credit wall-clock time spent away if it was running when persisted.
      const wasRunning = !saved.paused && typeof saved.lastTickAt === "number";
      const restored = wasRunning
        ? saved.elapsed +
          Math.max(0, Math.floor((Date.now() - (saved.lastTickAt as number)) / 1000))
        : saved.elapsed;

      accumulatedRef.current = restored;
      setElapsedSeconds(restored);
      setStatus(wasRunning ? "running" : "paused");
      if (wasRunning) {
        startInterval();
        persist(restored, false);
      }
    });
    return () => {
      cancelled = true;
      stopInterval();
    };
  }, [sessionId, persist, startInterval, stopInterval]);

  const start = useCallback(() => {
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setStatus("running");
    startInterval();
    persist(0, false);
  }, [persist, startInterval]);

  const togglePause = useCallback(() => {
    setStatus((current) => {
      if (current === "running") {
        const now =
          segmentStartRef.current != null
            ? accumulatedRef.current +
              Math.floor((Date.now() - segmentStartRef.current) / 1000)
            : accumulatedRef.current;
        accumulatedRef.current = now;
        setElapsedSeconds(now);
        stopInterval();
        persist(now, true);
        return "paused";
      }
      if (current === "paused") {
        startInterval();
        persist(accumulatedRef.current, false);
        return "running";
      }
      return current;
    });
  }, [persist, startInterval, stopInterval]);

  const reset = useCallback(() => {
    stopInterval();
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setStatus("idle");
    void SecureStore.deleteItemAsync(TIMER_KEY);
  }, [stopInterval]);

  return { status, elapsedSeconds, start, togglePause, reset };
}

/** 65 → "1:05", 3665 → "1:01:05" */
export function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
