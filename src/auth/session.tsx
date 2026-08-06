import { useQueryClient } from "@tanstack/react-query";
import * as Device from "expo-device";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { api, setToken, setUnauthorizedHandler } from "@/api/client";
import type { User } from "@/api/user";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/auth/token-store";

type SessionState = "loading" | "signedOut" | "signedIn";

type Session = {
  state: SessionState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

/** POST /api/v1/login — user comes back unwrapped (GET /user wraps in data) */
type LoginResponse = { token: string; user: User };

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>("loading");
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    getStoredToken().then((token) => {
      if (cancelled) return;
      setToken(token);
      setState(token ? "signedIn" : "signedOut");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      void clearStoredToken();
      queryClient.clear();
      setState("signedOut");
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await api<LoginResponse>("/api/v1/login", {
        method: "POST",
        body: {
          email,
          password,
          device_name: Device.deviceName ?? "iPhone",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      setToken(res.token);
      await setStoredToken(res.token);
      queryClient.setQueryData(["user"], res.user);
      setState("signedIn");
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    try {
      await api("/api/v1/logout", { method: "POST" });
    } catch {
      // revoking the token server-side is best-effort; sign out locally regardless
    }
    setToken(null);
    await clearStoredToken();
    queryClient.clear();
    setState("signedOut");
  }, [queryClient]);

  return (
    <SessionContext.Provider value={{ state, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return session;
}
