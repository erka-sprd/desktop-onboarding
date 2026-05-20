export type ProductTypeData = {
  id: string
  name: string
  price: number
  defaultViewId: string
  appearances: { id: string; name: string; color: string }[]
  sizes: { id: string; name: string }[]
}

const SHOP_ID = "205909"

export const IMAGE_BASE = "https://image.spreadshirtmedia.net/image-server/v1"

export function productImageUrl(
  productTypeId: string,
  viewId: string,
  appearanceId: string,
  width = 800
) {
  return `${IMAGE_BASE}/productTypes/${productTypeId}/views/${viewId}/appearances/${appearanceId}?width=${width}`
}

type ApiProductType = {
  id: string
  name: string
  price?: { vatIncluded: number }
  views?: { id: string; name?: string }[]
  appearances?: { id: string; name?: string; colors?: { value?: string }[] }[]
  sizes?: { id: string; name?: string }[]
}

export async function fetchProductType(id: string): Promise<ProductTypeData> {
  const url = `https://api.spreadshirt.net/api/v1/shops/${SHOP_ID}/productTypes/${id}?mediaType=json&fullData=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch product type ${id}: ${res.status}`)
  const data: ApiProductType = await res.json()
  return {
    id: data.id,
    name: data.name,
    price: data.price?.vatIncluded ?? 0,
    defaultViewId: data.views?.[0]?.id ?? "1",
    appearances: (data.appearances ?? []).map(a => ({
      id: a.id,
      name: a.name ?? "",
      color: a.colors?.[0]?.value ?? "#cccccc",
    })),
    sizes: (data.sizes ?? []).map(s => ({ id: s.id, name: s.name ?? "" })),
  }
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
    // Pick 1–3 sizes to mark as out of stock, deterministically.
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
