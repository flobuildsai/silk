import {
  Fraunces,
  Playfair_Display,
  Instrument_Serif,
  Newsreader,
  Archivo_Black,
  Manrope,
  IBM_Plex_Sans,
  Inter,
} from "next/font/google";

// Display fonts — these power section headlines. We load them all so the
// renderer can swap at runtime based on `theme.typography.displayFont`.
// next/font inlines these at build time, so the site stays fast.

export const fontFraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

export const fontPlayfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const fontInstrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const fontNewsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-newsreader",
  display: "swap",
});

export const fontArchivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-archivo-black",
  display: "swap",
});

// Body fonts.
export const fontManrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const fontIbmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex",
  display: "swap",
});

// Inter is the Geist fallback — Geist isn't on Google Fonts yet but Inter is
// a close geometric grotesk we can ship without a custom font file. We only
// expose it under --font-geist so the renderer reads it by name.
export const fontGeist = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

// Tactical-telemetry display. Neue Haas Grotesk isn't on Google Fonts — fall
// back to Manrope's tight grotesk. The --font-neue-haas variable still
// points at a weighty grotesk so the renderer works identically.
export const fontNeueHaas = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-neue-haas",
  display: "swap",
});

export const ALL_FONT_VARIABLES = [
  fontFraunces.variable,
  fontPlayfair.variable,
  fontInstrumentSerif.variable,
  fontNewsreader.variable,
  fontArchivoBlack.variable,
  fontManrope.variable,
  fontIbmPlex.variable,
  fontGeist.variable,
  fontNeueHaas.variable,
].join(" ");

/**
 * Map a PageSpec font name to the CSS variable powered by next/font.
 * The renderer writes these variables into `--font-display` and
 * `--font-sans` on the page root so Tailwind's `font-display`/`font-sans`
 * classes resolve to the correct face.
 */
export const FONT_VAR_BY_NAME: Record<string, string> = {
  Fraunces: "var(--font-fraunces)",
  "Playfair Display": "var(--font-playfair)",
  "Instrument Serif": "var(--font-instrument-serif)",
  Newsreader: "var(--font-newsreader)",
  "Archivo Black": "var(--font-archivo-black)",
  Geist: "var(--font-geist)",
  Manrope: "var(--font-manrope)",
  "IBM Plex Sans": "var(--font-ibm-plex)",
  "Neue Haas Grotesk": "var(--font-neue-haas)",
};

export function resolveFontVar(name: string, fallback: string): string {
  return FONT_VAR_BY_NAME[name] ?? fallback;
}
