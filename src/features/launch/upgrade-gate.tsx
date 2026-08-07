import Constants from "expo-constants";
import type { ReactNode } from "react";

import { useAppConfig } from "@/api/app-config";
import UpgradeRequiredScreen from "@/features/launch/upgrade-required-screen";
import { isVersionBelow } from "@/lib/semver";

/**
 * Launch gate driven by GET /api/v1/app-config. Fails open: while the
 * request is loading or if it errors, the app renders normally — only a
 * real "blocked" response replaces the app with the upgrade screen.
 */
export default function UpgradeGate({ children }: { children: ReactNode }) {
  const { data: config } = useAppConfig();

  const appVersion = Constants.expoConfig?.version ?? "0.0.0";
  const blocked =
    config != null &&
    (config.force_upgrade || isVersionBelow(appVersion, config.min_app_version));

  if (blocked) {
    return <UpgradeRequiredScreen />;
  }
  return <>{children}</>;
}
