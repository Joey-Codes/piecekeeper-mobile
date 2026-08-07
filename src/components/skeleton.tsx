import { useEffect } from "react";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useTokens } from "@/theme/tokens";

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Pulsing placeholder block. Compose several into a per-screen skeleton
 * layout that mirrors the loaded content's shape — never a full-screen
 * spinner (dev plan, definition of done).
 */
export default function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: Props) {
  const t = useTokens();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: t.divider },
        pulse,
        style,
      ]}
    />
  );
}
