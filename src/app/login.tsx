import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiError } from "@/api/client";
import { useSession } from "@/auth/session";
import { useTokens } from "@/theme/tokens";

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
    { backgroundColor: t.button, borderColor: t.border, color: t.ink },
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
        <Text style={[styles.title, { color: t.inkStrong }]}>PieceKeeper</Text>
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

        <Pressable
          style={({ pressed }) => [
            styles.submit,
            { backgroundColor: t.accent },
            (pressed || !canSubmit) && styles.submitDimmed,
          ]}
          onPress={submit}
          disabled={!canSubmit}
        >
          {busy ? (
            <ActivityIndicator color={t.card} />
          ) : (
            <Text style={[styles.submitLabel, { color: t.card }]}>Sign In</Text>
          )}
        </Pressable>
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
  title: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    fontSize: 17,
  },
  submit: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitDimmed: {
    opacity: 0.6,
  },
  submitLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
});
