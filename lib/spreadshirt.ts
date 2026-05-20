import { PRODUCTS, type StaticProduct } from "./products-data"

export type ProductTypeData = {
  id: string
  name: string
  price: number
  defaultViewId: string
  appearances: { id: string; name: string; color: string; image: string }[]
  sizes: { id: string; name: string }[]
}

export function getProductType(id: string): ProductTypeData | null {
  const p: StaticProduct | undefined = PRODUCTS.find(x => x.id === id)
  if (!p) return null
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    defaultViewId: "1",
    appearances: p.appearances,
    sizes: p.sizes.map((name, i) => ({ id: String(i), name })),
  }
}

export function productImageUrl(
  _productTypeId: string,
  _viewId: string,
  _appearanceId: string,
  _width = 800
) {
  // Kept for backwards compatibility — callers should prefer the appearance.image directly.
  const p = PRODUCTS.find(x => x.id === _productTypeId)
  return p?.appearances.find(a => a.id === _appearanceId)?.image ?? ""
}

// Deterministic pseudo-random for stable OOS per (productId, appearanceId).
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function buildOutOfStockMap(
  productId: string,
  appearances: { id: string }[],
  sizes: { name: string }[]
): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  for (const a of appearances) {
    const seed = hash(`${productId}:${a.id}`)
    const count = 1 + (seed % 3)
    const picks = new Set<string>()
    let s = seed
    while (picks.size < Math.min(count, sizes.length)) {
      s = (s * 1664525 + 1013904223) >>> 0
      picks.add(sizes[s % sizes.length].name)
    }
    map[a.id] = Array.from(picks)
  }
  return map
}
