import { DarkTheme, DefaultTheme } from "expo-router";

import { tokens } from "./tokens";

/**
 * React Navigation themes derived from the tokens, so native-stack headers,
 * screen backgrounds, and links pick up the palette without per-screen styling.
 */
export const navigationThemes = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: tokens.light.accent,
      background: tokens.light.page,
      card: tokens.light.card,
      text: tokens.light.ink,
      border: tokens.light.divider,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: tokens.dark.accent,
      background: tokens.dark.page,
      card: tokens.dark.card,
      text: tokens.dark.ink,
      border: tokens.dark.divider,
    },
  },
};
