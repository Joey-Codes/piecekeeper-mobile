import { useQuery } from "@tanstack/react-query";

import { api } from "@/api/client";

/** GET /api/v1/app-config — public, fetched once at launch. */
export type AppConfig = {
  min_app_version: string;
  force_upgrade: boolean;
  /** Feature flags; empty for now. Don't read undocumented keys. */
  features: Record<string, unknown>;
};

export function useAppConfig() {
  return useQuery({
    queryKey: ["app-config"],
    queryFn: () => api<AppConfig>("/api/v1/app-config"),
    staleTime: Infinity,
    retry: 1,
  });
}
