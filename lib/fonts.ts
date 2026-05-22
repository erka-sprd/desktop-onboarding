// 50 Google Fonts across 5 categories used by the FontPanel.
// Each entry's `family` is the Google Fonts family name and the value used
// as the CSS `font-family` after loading.

export type FontCategory =
  | "sans-serif"
  | "serif"
  | "display"
  | "handwriting"
  | "monospace"

export type FontDef = {
  family: string
  category: FontCategory
}

export const FONTS: FontDef[] = [
  // Sans-serif (14)
  { family: "Inter", category: "sans-serif" },
  { family: "Roboto", category: "sans-serif" },
  { family: "Open Sans", category: "sans-serif" },
  { family: "Lato", category: "sans-serif" },
  { family: "Montserrat", category: "sans-serif" },
  { family: "Poppins", category: "sans-serif" },
  { family: "Raleway", category: "sans-serif" },
  { family: "Work Sans", category: "sans-serif" },
  { family: "Nunito", category: "sans-serif" },
  { family: "Manrope", category: "sans-serif" },
  { family: "DM Sans", category: "sans-serif" },
  { family: "Karla", category: "sans-serif" },
  { family: "Ubuntu", category: "sans-serif" },
  { family: "Quicksand", category: "sans-serif" },

  // Serif (10)
  { family: "Playfair Display", category: "serif" },
  { family: "Merriweather", category: "serif" },
  { family: "Lora", category: "serif" },
  { family: "PT Serif", category: "serif" },
  { family: "Crimson Text", category: "serif" },
  { family: "Cormorant Garamond", category: "serif" },
  { family: "EB Garamond", category: "serif" },
  { family: "Spectral", category: "serif" },
  { family: "DM Serif Display", category: "serif" },
  { family: "Libre Baskerville", category: "serif" },

  // Display (10)
  { family: "Bebas Neue", category: "display" },
  { family: "Oswald", category: "display" },
  { family: "Anton", category: "display" },
  { family: "Archivo Black", category: "display" },
  { family: "Righteous", category: "display" },
  { family: "Russo One", category: "display" },
  { family: "Fjalla One", category: "display" },
  { family: "Abril Fatface", category: "display" },
  { family: "Yeseva One", category: "display" },
  { family: "Alfa Slab One", category: "display" },

  // Handwriting / Script (10)
  { family: "Pacifico", category: "handwriting" },
  { family: "Dancing Script", category: "handwriting" },
  { family: "Great Vibes", category: "handwriting" },
  { family: "Caveat", category: "handwriting" },
  { family: "Sacramento", category: "handwriting" },
  { family: "Satisfy", category: "handwriting" },
  { family: "Kalam", category: "handwriting" },
  { family: "Permanent Marker", category: "handwriting" },
  { family: "Indie Flower", category: "handwriting" },
  { family: "Shadows Into Light", category: "handwriting" },

  // Monospace (6)
  { family: "Roboto Mono", category: "monospace" },
  { family: "JetBrains Mono", category: "monospace" },
  { family: "Source Code Pro", category: "monospace" },
  { family: "Space Mono", category: "monospace" },
  { family: "Fira Code", category: "monospace" },
  { family: "Inconsolata", category: "monospace" },
]
