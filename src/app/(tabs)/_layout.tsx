import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useTokens } from "@/theme/tokens";

/**
 * Custom template PNGs (generated from Lucide to match the web sidebar's
 * icon set — see the web app's Practice/Repertoire/Insights/Settings nav).
 * Custom images instead of SF Symbols is deliberate: it lets us control
 * icon size and bake in top padding, which iOS doesn't allow for symbols.
 */
export default function TabsLayout() {
  const t = useTokens();

  return (
    <NativeTabs
      backgroundColor={t.tabBar}
      shadowColor="transparent"
      tintColor={t.cta}
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="repertoire">
        <NativeTabs.Trigger.Label>Repertoire</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/repertoire.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/insights.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/settings.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
