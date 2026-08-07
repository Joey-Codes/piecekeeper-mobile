/**
 * Font tokens — same discipline as colors: components reference these,
 * never literal family names. All loaded in the root layout via useFonts.
 *
 * - `brand` (Comfortaa): wordmark and the dashboard greeting only.
 * - `body*` (Rubik — "friendly tech": geometric but round-cornered): all
 *   content text. Custom fonts carry their weight in the family name —
 *   use bodySemiBold/bodyBold instead of fontWeight (a fontWeight
 *   override on a custom font can fall back to the system font on iOS).
 */
export const fonts = {
  /**
   * PK Display — custom-emboldened Comfortaa (weight class 800), single
   * weight, local asset in assets/fonts/. For big display titles, the
   * wordmark, and screen-level headings. NEVER set fontWeight or
   * fontStyle on it (faux-bolding/italics would distort the outlines),
   * and never rename anything about it to "Comfortaa" — that name is
   * reserved by the OFL (license file sits next to the .ttf).
   */
  display: "PKDisplay",
  /** Comfortaa Bold — sub-display brand text. */
  brand: "Comfortaa_700Bold",
  /** Rubik Medium — default body text (Regular reads too thin at phone sizes). */
  body: "Rubik_500Medium",
  /** Rubik SemiBold — emphasized labels, buttons. */
  bodySemiBold: "Rubik_600SemiBold",
  /** Rubik Bold — headings, strong emphasis. */
  bodyBold: "Rubik_700Bold",
} as const;
