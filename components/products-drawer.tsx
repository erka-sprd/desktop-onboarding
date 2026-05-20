"use client"

import { Drawer } from "vaul"
import { PRODUCTS } from "@/lib/products-data"

export type SelectedProduct = { id: string; src: string; name: string }

type ProductsDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (product: SelectedProduct) => void
}

const PRODUCT_TILES: SelectedProduct[] = PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  src: p.preview,
}))

export default function ProductsDrawer({ open, onOpenChange, onSelect }: ProductsDrawerProps) {
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
            <div className="grid grid-cols-5 gap-4">
              {PRODUCT_TILES.map(({ id, name, src }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onSelect({ id, src, name })
                    onOpenChange(false)
                  }}
                  className="cursor-pointer text-left"
                >
                  <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-[#f5f5f5]">
                    <img src={src} alt={name} className="block h-full w-full object-contain" />
                  </div>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap pt-1.5 text-[12px] font-medium leading-tight text-[#6a6a6a]">
                    {name}
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
