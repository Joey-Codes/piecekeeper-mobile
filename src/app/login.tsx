import { Image } from "expo-image";
import { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiError } from "@/api/client";
import { useSession } from "@/auth/session";
import PrimaryButton from "@/components/primary-button";
import { useTokens } from "@/theme/tokens";
import { fonts } from "@/theme/typography";

export default function LoginScreen() {
  const { signIn } = useSession();
  const t = useTokens();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      // success: the root guard swaps this screen out for the tabs
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Couldn't reach the server. Check your connection.";
      Alert.alert("Sign In Failed", message);
      setBusy(false);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: t.button, color: t.ink },
  ];

  return (
    <KeyboardAvoidingView
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.form}>
        <View style={styles.brandRow}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: t.inkStrong }]}>
            PieceKeeper
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: t.inkMuted }]}>
          Sign in to your account
        </Text>

        <TextInput
          style={inputStyle}
          placeholder="Email"
          placeholderTextColor={t.inkSubtle}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!busy}
        />
        <TextInput
          ref={passwordRef}
          style={inputStyle}
          placeholder="Password"
          placeholderTextColor={t.inkSubtle}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!busy}
        />

        <PrimaryButton
          label="Sign In"
          onPress={submit}
          disabled={!canSubmit}
          loading={busy}
          style={styles.submit}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
  },
  form: {
    paddingHorizontal: 24,
    gap: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    fontFamily: fonts.body,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
  },
  submit: {
    marginTop: 8,
  },
});
