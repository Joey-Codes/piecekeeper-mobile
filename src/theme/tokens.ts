import { useColorScheme } from "react-native";

/**
 * Semantic color tokens, ported from the web app's dark-mode system
 * (PieceKeeper repo: docs/frontend/dark_mode.md / resources/css/app.css).
 * Components use tokens only — no literal colors anywhere else.
 */
export type Tokens = {
  /** Page background (the cream/dark backdrop) */
  page: string;
  /** Card surface */
  card: string;
  /** Button / input surface (resting state) */
  button: string;
  /** Subtle pressed/hover tint over button- or card-like surfaces */
  surfaceHover: string;
  /** Default body text, most headings */
  ink: string;
  /** Subtitles, descriptions, secondary info */
  inkMuted: string;
  /** Placeholder text, faint hints, timestamps */
  inkSubtle: string;
  /** Extra-emphasized headings, important labels */
  inkStrong: string;
  /** Standard divider/border line */
  divider: string;
  /** Stronger interactive border (inputs, outlined buttons) */
  border: string;
  /** Brand violet — selected tab, links, primary actions */
  accent: string;
  /** Destructive actions (sign out, delete) */
  danger: string;
};

export const tokens: Record<"light" | "dark", Tokens> = {
  light: {
    page: "#fbeedc",
    card: "#ffffff",
    button: "#ffffff",
    surfaceHover: "#fafaf9", // stone-50
    ink: "#292524", // stone-800
    inkMuted: "#44403c", // stone-700
    inkSubtle: "#78716c", // stone-500
    inkStrong: "#1c1917", // stone-900
    divider: "#e7e5e4", // stone-200
    border: "#d6d3d1", // stone-300
    accent: "#7c3aed", // violet-600
    danger: "#dc2626", // red-600
  },
  dark: {
    page: "#191919",
    card: "#202020",
    button: "#2e2e2e",
    surfaceHover: "#3a3a3a",
    ink: "#f0efed",
    inkMuted: "#a8a29e", // stone-400
    inkSubtle: "#78716c", // stone-500
    inkStrong: "#f0efed",
    divider: "#2e2e2e",
    border: "#303034",
    accent: "#a78bfa", // violet-400 — violet-600 is too dark against #191919
    danger: "#ef4444", // red-500
  },
};

/** Tokens for the current system color scheme. */
export function useTokens(): Tokens {
  return tokens[useColorScheme() === "dark" ? "dark" : "light"];
}
