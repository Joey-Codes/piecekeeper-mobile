import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTokens } from "@/theme/tokens";
import { fonts } from "@/theme/typography";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shows a spinner in place of the label and blocks presses. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** The app's primary action button — brand-orange flat fill (web CTA color). */
export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
}: Props) {
  const t = useTokens();
  const blocked = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: t.cta },
        (pressed || blocked) && styles.dimmed,
        style,
      ]}
      onPress={onPress}
      disabled={blocked}
    >
      {loading ? (
        <ActivityIndicator color={t.ctaText} />
      ) : (
        <Text style={[styles.label, { color: t.ctaText }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dimmed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
  },
});
