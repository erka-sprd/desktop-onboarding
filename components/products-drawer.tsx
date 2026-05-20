"use client"

import { useEffect, useState } from "react"
import { Drawer } from "vaul"

export type SelectedProduct = { id: string; src: string; name: string }

type ProductsDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (product: SelectedProduct) => void
}

type ApiProduct = {
  id: string
  name: string
  resources: { type: string; href: string }[]
}

function categorize(name: string): string | null {
  if (/hoodie|hooded/i.test(name)) return "Hoodies"
  if (/cap|hat|visor|beanie/i.test(name)) return "Caps & Hats"
  if (/t-shirt|tee\b/i.test(name)) return "T-Shirts"
  if (/sweat/i.test(name)) return "Sweatshirts"
  if (/mug|cup|bottle|flask/i.test(name)) return "Drinkware"
  if (/bag|backpack|tote/i.test(name)) return "Bags"
  if (/sticker/i.test(name)) return "Stickers"
  if (/poster|canvas/i.test(name)) return "Wall Art"
  if (/tank|top/i.test(name)) return "Tank Tops"
  if (/sock/i.test(name)) return "Socks"
  return null
}

const SHOP_ID = "205909"
const API_URL = `https://api.spreadshirt.net/api/v1/shops/${SHOP_ID}/productTypes?mediaType=json&limit=1000`

const FEATURED_PRODUCT: SelectedProduct = {
  id: "2940",
  name: "Unisex Premium Oversized Organic T-Shirt",
  src: "https://image.spreadshirtmedia.net/image-server/v1/productTypes/2940/views/1/appearances/1257?width=300",
}

export default function ProductsDrawer({ open, onOpenChange, onSelect }: ProductsDrawerProps) {
  const [products, setProducts] = useState<SelectedProduct[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || products.length > 0) return
    setLoading(true)
    fetch(API_URL)
      .then(r => r.json())
      .then((data: { productTypes: ApiProduct[] }) => {
        const buckets: Record<string, SelectedProduct[]> = {}
        for (const p of data.productTypes) {
          const c = categorize(p.name)
          if (!c) continue
          const preview = p.resources.find(r => r.type === "preview")
          if (!preview) continue
          if (!buckets[c]) buckets[c] = []
          if (buckets[c].length >= 3) continue
          buckets[c].push({ id: p.id, name: p.name, src: `${preview.href}?width=300` })
        }
        const merged = [
          FEATURED_PRODUCT,
          ...Object.values(buckets)
            .flat()
            .filter(p => p.id !== FEATURED_PRODUCT.id),
        ]
        setProducts(merged)
      })
      .finally(() => setLoading(false))
  }, [open, products.length])

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[9998] bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[9999] flex h-[calc(100dvh-32px)] flex-col rounded-t-2xl bg-white outline-none">
          <Drawer.Title className="sr-only">All products</Drawer.Title>
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <span className="font-display text-[16px] font-medium text-black">All products</span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              <img src="/icons/icon-close-x.svg" alt="" className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {loading && products.length === 0 && (
              <div className="text-[14px] text-neutral-500">Loading products…</div>
            )}
            <div className="grid grid-cols-5 gap-4">
              {products.map(({ id, name: pName, src }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onSelect({ id, src, name: pName })
                    onOpenChange(false)
                  }}
                  className="cursor-pointer text-left"
                >
                  <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-[#f5f5f5]">
                    <img src={src} alt={pName} className="block h-full w-full object-contain" />
                  </div>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap pt-1.5 text-[12px] font-medium leading-tight text-[#6a6a6a]">
                    {pName}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
