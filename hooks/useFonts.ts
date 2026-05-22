"use client"

// Mirrors create-omat's useFonts: module-level Set + Promise map so the same
// font is never requested twice. Loads Google Fonts via a stylesheet <link>
// and resolves once document.fonts reports the family available.

const loadedFonts = new Set<string>()
const loadingPromises = new Map<string, Promise<string>>()

const buildGoogleFontsUrl = (family: string) =>
  `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@400;700&display=swap`

export const useFonts = () => {
  const loadFont = (family: string): Promise<string> => {
    if (typeof document === "undefined") return Promise.resolve(family)
    if (loadedFonts.has(family)) return Promise.resolve(family)
    if (loadingPromises.has(family)) return loadingPromises.get(family)!

    const promise = new Promise<string>(resolve => {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = buildGoogleFontsUrl(family)
      link.onload = () => {
        document.fonts
          .load(`16px "${family}"`)
          .catch(() => {})
          .finally(() => {
            loadedFonts.add(family)
            loadingPromises.delete(family)
            resolve(family)
          })
      }
      link.onerror = () => {
        console.error("Failed to load font:", family)
        loadingPromises.delete(family)
        resolve(family)
      }
      document.head.appendChild(link)
    })

    loadingPromises.set(family, promise)
    return promise
  }

  return { loadFont }
}
