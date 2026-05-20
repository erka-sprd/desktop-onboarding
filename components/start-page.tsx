"use client"

import { useEffect, useRef, useState } from "react"
import ProductsDrawer, { type SelectedProduct } from "@/components/products-drawer"
import SiteHeader from "@/components/site-header"

type DesignerPanel = "graphics" | "uploads" | "ai"

type StartPageProps = {
  onStart?: (initialPanel?: DesignerPanel) => void
  selectedProduct: SelectedProduct | null
  onSelectProduct: (product: SelectedProduct) => void
}

export default function StartPage({ onStart, selectedProduct, onSelectProduct }: StartPageProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [productsDrawerOpen, setProductsDrawerOpen] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [])

  const scrollBy = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" })
  }

  const inspirations = [
    { src: "/images/inspiration1.png", alt: "I love Pauline" },
    { src: "/images/inspiration2.png", alt: "Travel essentials" },
    { src: "/images/inspiration4.png", alt: "Luna cat" },
    { src: "/images/inspiration3.png", alt: "Mediterranean weather" },
  ]
  const startActions: { id: string; label: string; icon: string; panel?: DesignerPanel }[] = [
    { id: "graphics", label: "Find Graphics", icon: "/icons/icon-graphics.svg", panel: "graphics" },
    { id: "text", label: "Add Text", icon: "/icons/icon-text.svg" },
    { id: "upload", label: "Upload Yours", icon: "/icons/icon-upload.svg", panel: "uploads" },
    { id: "ai", label: "Generate AI Image", icon: "/icons/icon-sparkles-ai.svg", panel: "ai" },
  ]

  return (
    <div className="min-h-screen w-full flex flex-col">
      <SiteHeader hidden={productsDrawerOpen} />

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full px-16 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2
            className="-mt-2 w-fit font-display text-[18px] font-medium bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #DC2626 0%, #4D52D2 50%, #16A34A 100%)",
            }}
          >
            Start here to customise:
          </h2>

          <div className="flex gap-16">
            {/* Left: Choose a blank product */}
            <div className="flex flex-col gap-3">
              <div className="flex h-9 items-center">
                {selectedProduct ? (
                  <button
                    type="button"
                    onClick={() => setProductsDrawerOpen(true)}
                    className="block w-[260px] truncate text-left text-[14px] font-semibold text-black cursor-pointer hover:underline"
                  >
                    {selectedProduct.name}
                  </button>
                ) : (
                  <p className="text-[14px] font-semibold text-[#6A6A6A]">Choose a product</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setProductsDrawerOpen(true)}
                className="w-[260px] flex-1 rounded-2xl border border-neutral-200 bg-white flex items-center justify-center overflow-hidden p-[60px] cursor-pointer transition-colors hover:bg-neutral-50"
              >
                <img
                  src={selectedProduct?.src ?? "/images/blankproduct.png"}
                  alt={selectedProduct?.name ?? "Blank product"}
                  className="max-h-full max-w-full object-contain"
                />
              </button>
            </div>

            {/* Right: Design inspirations + or-start-here */}
            <div className="flex flex-1 flex-col gap-3 min-w-0">
              <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-semibold text-[#6A6A6A]">Editable inspirations to begin with</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => scrollBy(-280)}
                    className="h-9 w-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 cursor-pointer"
                  >
                    <img src="/icons/icon-chevron-left.svg" alt="" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => scrollBy(280)}
                    className="h-9 w-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 cursor-pointer"
                  >
                    <img src="/icons/icon-chevron-right.svg" alt="" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <div
                  ref={scrollRef}
                  className="flex gap-3 overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {inspirations.map(item => (
                    <div
                      key={item.src}
                      className="w-[280px] h-[260px] flex-none rounded-2xl border border-neutral-200 bg-white flex items-center justify-center overflow-hidden p-12 cursor-pointer transition-colors hover:bg-neutral-50"
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent transition-opacity duration-200 ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
                />
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ${canScrollRight ? "opacity-100" : "opacity-0"}`}
                />
              </div>
              </div>

              {/* or start here */}
              <div className="w-full rounded-2xl bg-neutral-100 p-6 flex flex-col items-center gap-4">
                <p className="text-[14px] font-semibold text-[#6A6A6A]">or start here</p>
                <div className="flex justify-center gap-2">
                  {startActions.map(a => {
                    const [first, ...rest] = a.label.split(" ")
                    const second = rest.join(" ")
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => onStart?.(a.panel)}
                        className="flex flex-col items-center gap-2 cursor-pointer rounded-2xl px-[18px] py-3 transition-colors hover:bg-white"
                      >
                        <span className="h-14 w-14 rounded-full bg-white flex items-center justify-center">
                          <img src={a.icon} alt="" className="h-6 w-6" />
                        </span>
                        <span className="text-center text-[13px] font-semibold text-neutral-800 leading-tight">
                          <span className="block">{first}</span>
                          {second && <span className="block">{second}</span>}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <ProductsDrawer
        open={productsDrawerOpen}
        onOpenChange={setProductsDrawerOpen}
        onSelect={onSelectProduct}
      />
    </div>
  )
}
