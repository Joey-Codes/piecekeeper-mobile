import { useQuery } from "@tanstack/react-query";

import { api } from "@/api/client";

/**
 * UserResource fields the app reads (docs/api/mobile_v1.md — read only
 * what's documented; extend as screens need more).
 */
export type User = {
  name: string;
  email: string;
  /** Preference: auto-finish the session when the last piece is ticked */
  auto_end_session: boolean;
};

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => (await api<{ data: User }>("/api/v1/user")).data,
  });
}
