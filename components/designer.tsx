"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import ProductsDrawer, { type SelectedProduct } from "@/components/products-drawer"
import SiteHeader from "@/components/site-header"
import { buildOutOfStockMap, getProductType, type ProductTypeData } from "@/lib/spreadshirt"

/**
 * Changes made (minimal):
 * - #size-buttons-row now WRAPS (no horizontal scroll)
 * - Removed ALL size-row scroll logic (rowRef, canScrollLeft/Right, observers, arrows, fades, scrollByPx)
 * - Dropdown/tooltip repositioning no longer listens to #size-buttons-row scroll (keeps window scroll/resize)
 * - ✅ Kept ALL SVG syntax exactly as-is
 * - ✅ Kept the plus icon inside size buttons
 * - ✅ Kept "30-Day easy returns" and Shipping rows in place
 */

type DesignerPanel = "graphics" | "uploads" | "ai"

const DEFAULT_PRODUCT_ID = "2940" // Unisex Premium Oversized Organic T-Shirt

type DesignerProps = {
  initialPanel?: DesignerPanel
  selectedProduct?: SelectedProduct | null
  onSelectProduct?: (product: SelectedProduct) => void
}

export default function Designer({
  initialPanel,
  selectedProduct,
  onSelectProduct,
}: DesignerProps) {
  const productId = selectedProduct?.id ?? DEFAULT_PRODUCT_ID
  const productData: ProductTypeData | null = useMemo(() => getProductType(productId), [productId])
  const [activeColorIndex, setActiveColorIndex] = useState(0)
  const [productsDrawerOpen, setProductsDrawerOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<DesignerPanel | null>(null)

  useEffect(() => {
    setActiveColorIndex(0)
  }, [productId])

  const appearances = productData?.appearances ?? []
  const sizes = useMemo(
    () => (productData?.sizes ?? []).map(s => s.name),
    [productData]
  )
  const BASE_PRICE = productData?.price ?? 0

  const outOfStockMap = useMemo(
    () =>
      productData
        ? buildOutOfStockMap(productData.id, productData.appearances, productData.sizes)
        : {},
    [productData]
  )
  const togglePanel = (panel: DesignerPanel) =>
    setActivePanel(p => (p === panel ? null : panel))
  const [isBooting, setIsBooting] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setIsBooting(false), 500)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (!initialPanel) return
    // wait for: 500ms loader + 300ms column animation + 100ms buffer
    const t = setTimeout(() => setActivePanel(initialPanel), 900)
    return () => clearTimeout(t)
  }, [initialPanel])

  const productImages = appearances.map(a => ({
    src: a.image,
    alt: a.name,
    color: a.color,
  }))

  // Total selected quantity across all sizes (sum of numeric inputs).
  const [totalSelected, setTotalSelected] = useState(0)

  // Reset totalSelected when color changes
  useEffect(() => {
    setTotalSelected(0)
  }, [activeColorIndex])

  // Calculate discount percentage based on volume
  const getDiscountPercentage = (qty: number): number => {
    if (qty >= 50) return 0.50 // 50% discount
    if (qty >= 20) return 0.15 // 15% discount
    if (qty >= 5) return 0.10 // 10% discount
    return 0 // No discount
  }

  const originalPrice = totalSelected > 0 ? BASE_PRICE * totalSelected : BASE_PRICE
  const discountPercent = getDiscountPercentage(totalSelected)
  const discountedPrice = originalPrice * (1 - discountPercent)

  const formattedOriginalPrice = originalPrice.toFixed(2).replace(".", ",")
  const formattedDiscountedPrice = discountedPrice.toFixed(2).replace(".", ",")

  const colorRowRef = useRef<HTMLDivElement | null>(null)
  const [canScrollColorLeft, setCanScrollColorLeft] = useState(false)
  const [canScrollColorRight, setCanScrollColorRight] = useState(false)
  const [isColorScrollable, setIsColorScrollable] = useState(false)

  const rightSectionRef = useRef<HTMLDivElement | null>(null)

  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const checkRightSectionHeight = () => {
      const rightSection = rightSectionRef.current
      if (!rightSection) return

      const height = rightSection.clientHeight
      const shouldScroll = height < 701
      setIsColorScrollable(shouldScroll)
    }

    checkRightSectionHeight()
    window.addEventListener("resize", checkRightSectionHeight)
    return () => window.removeEventListener("resize", checkRightSectionHeight)
  }, [])

  const updateColorScrollButtons = () => {
    const row = colorRowRef.current
    if (!row) return

    const maxScrollLeft = row.scrollWidth - row.clientWidth
    const eps = 1

    setCanScrollColorLeft(row.scrollLeft > eps)
    setCanScrollColorRight(maxScrollLeft > eps && row.scrollLeft < maxScrollLeft - eps)
  }

  useEffect(() => {
    if (!isColorScrollable) return

    const row = colorRowRef.current
    if (!row) return

    updateColorScrollButtons()

    const onScroll = () => updateColorScrollButtons()
    row.addEventListener("scroll", onScroll, { passive: true })

    const onResize = () => updateColorScrollButtons()
    window.addEventListener("resize", onResize)

    const hasRO = typeof (window as any).ResizeObserver !== "undefined"
    const ro: ResizeObserver | null = hasRO
      ? new ResizeObserver(() => {
          requestAnimationFrame(() => updateColorScrollButtons())
        })
      : null

    if (ro) {
      ro.observe(row)
      Array.from(row.children).forEach((child) => {
        if (child instanceof HTMLElement) ro.observe(child)
      })
    }

    return () => {
      row.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      ro?.disconnect()
    }
  }, [isColorScrollable])

  const scrollColorByPx = (dx: number) => {
    const row = colorRowRef.current
    if (!row) return
    row.scrollBy({ left: dx, behavior: "smooth" })
  }

  const selectedColor = productImages[activeColorIndex]?.alt ?? ""

  return (
    <>
      <style>{`
        #color-buttons-row::-webkit-scrollbar{display:none;}
        #color-buttons-row{scrollbar-width:none;}
      `}</style>

      <div className="h-screen w-full flex flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col px-16 py-[16px] min-h-0">
        <div className="flex flex-1 items-center justify-center min-h-0">
        <div id="creatomat-container" className="flex items-stretch gap-2 w-full h-full justify-center">
          <div
            id="left-section"
            className={`${isBooting ? "w-0 p-0 overflow-hidden" : "w-[100px] p-[6px] px-1.5"} h-full bg-[#F4F4F4] rounded-[12px] flex flex-col transition-[width,padding] duration-300 ease-out`}
          >
            {/* Top Section - Products */}
            <div id="left-section-top-side" className="flex-shrink-0">
              <button
                type="button"
                onMouseEnter={() => setHoveredButton("products")}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={() => setProductsDrawerOpen(true)}
                className={
                  "w-[88px] h-auto flex flex-col items-center gap-[8px] p-[8px] rounded-[10px] transition-all duration-200 cursor-pointer " +
                  (hoveredButton === "products" ? "bg-[#DEDEDE]" : "bg-transparent")
                }
              >
                <img src="/images/blankproduct.png" alt="Products" className="size-14" />
                <div className="text-[12px] font-[600] text-black text-center">Products</div>
              </button>
            </div>

            {/* Middle Section - Action Buttons */}
            <div id="left-section-middle-side" className="flex-1 flex flex-col justify-center gap-[8px]">
              {/* AI Image Button */}
              <button
                type="button"
                onMouseEnter={() => setHoveredButton("ai")}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={() => togglePanel("ai")}
                className={
                  "w-[88px] h-auto flex flex-col items-center gap-[8px] p-[8px] rounded-[10px] transition-all duration-200 cursor-pointer " +
                  (activePanel === "ai"
                    ? "bg-white"
                    : hoveredButton === "ai"
                      ? "bg-[#DEDEDE]"
                      : "bg-transparent")
                }
              >
                <img src="/icons/icon-sparkles-ai.svg" alt="" className="h-6 w-6" />

                <div className="text-[12px] font-[600] text-black text-center">AI Image</div>
              </button>

              {/* Uploads Button */}
              <button
                type="button"
                onMouseEnter={() => setHoveredButton("upload")}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={() => togglePanel("uploads")}
                className={
                  "w-[88px] h-auto flex flex-col items-center gap-[8px] p-[8px] rounded-[10px] transition-all duration-200 cursor-pointer " +
                  (activePanel === "uploads"
                    ? "bg-white"
                    : hoveredButton === "upload"
                      ? "bg-[#DEDEDE]"
                      : "bg-transparent")
                }
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 5C9.55228 5 10 5.44772 10 6C10 6.51284 9.61396 6.93551 9.11662 6.99327L9 7H3C2.44772 7 2 6.55228 2 6C2 5.48716 2.38604 5.06449 2.88338 5.00673L3 5H9Z"
                    fill="black"
                  />
                  <path
                    d="M6.1499 2C6.66274 2 7.08541 2.38604 7.14317 2.88338L7.1499 3V9C7.1499 9.55228 6.70219 10 6.1499 10C5.63707 10 5.2144 9.61396 5.15663 9.11662L5.1499 9V3C5.1499 2.44772 5.59762 2 6.1499 2Z"
                    fill="black"
                  />
                  <path
                    d="M5 19V13C5 12.4477 5.44772 12 6 12C6.55228 12 7 12.4477 7 13V19C7 20.1046 7.89543 21 9 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7H13C12.4477 7 12 6.55228 12 6C12 5.44772 12.4477 5 13 5H19C21.2091 5 23 6.79086 23 9V19C23 21.2091 21.2091 23 19 23H9C6.79086 23 5 21.2091 5 19Z"
                    fill="black"
                  />
                  <path
                    d="M17.01 10C17.5623 10 18.01 10.4477 18.01 11C18.01 11.5128 17.624 11.9355 17.1266 11.9933L17.01 10Z"
                    fill="black"
                  />
                  <path
                    d="M9.30662 13.2797C10.5733 12.0608 12.2485 12.0157 13.5577 13.1563L13.7071 13.2931L18.7071 18.2931C19.0976 18.6836 19.0976 19.3168 18.7071 19.7073C18.3466 20.0678 17.7794 20.0955 17.3871 19.7905L17.2929 19.7073L12.3066 14.7208C11.8017 14.2349 11.3053 14.2025 10.8126 14.6127L10.7071 14.7073L6.70711 18.7073C6.31658 19.0979 5.68342 19.0979 5.29289 18.7073C4.93241 18.3468 4.90468 17.7796 5.2097 17.3873L5.29289 17.2931L9.30662 13.2797Z"
                    fill="black"
                  />
                  <path
                    d="M16.3066 15.2797C17.5733 14.0608 19.2485 14.0157 20.5577 15.1563L20.7071 15.2931L22.7071 17.2931C23.0976 17.6836 23.0976 18.3168 22.7071 18.7073C22.3466 19.0678 21.7794 19.0955 21.3871 18.7905L21.2929 18.7073L19.3066 16.7208C18.8017 16.2349 18.3053 16.2025 17.8126 16.6127L17.7071 16.7073L16.7071 17.7073C16.3166 18.0979 15.6834 18.0979 15.2929 17.7073C14.9324 17.3469 14.9047 16.7796 15.2097 16.3873L15.2929 16.2931L16.3066 15.2797Z"
                    fill="black"
                  />
                </svg>
                <div className="text-[12px] font-[600] text-black text-center">Uploads</div>
              </button>

              {/* Text Button */}
              <button
                type="button"
                onMouseEnter={() => setHoveredButton("text")}
                onMouseLeave={() => setHoveredButton(null)}
                className={
                  "w-[88px] h-auto flex flex-col items-center gap-[8px] p-[8px] rounded-[10px] transition-all duration-200 cursor-pointer " +
                  (hoveredButton === "text" ? "bg-[#DEDEDE]" : "bg-transparent")
                }
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M13 3C13.353 3 13.6761 3.18574 13.8555 3.48242L13.916 3.59961L20.6533 19H21C21.5523 19 22 19.4477 22 20C22 20.5128 21.6135 20.9354 21.1162 20.9932L21 21H14C13.4477 21 13 20.5523 13 20C13 19.4872 13.3865 19.0646 13.8838 19.0068L14 19H14.4912L13.2207 16H7.56836L6.44336 19H7C7.55228 19 8 19.4477 8 20C8 20.5128 7.61355 20.9354 7.11621 20.9932L7 21H4C3.44772 21 3 20.5523 3 20C3 19.4872 3.38645 19.0646 3.88379 19.0068L4 19H4.30664L10.0635 3.64844C10.1952 3.29749 10.5106 3.05335 10.876 3.00781L11 3H13ZM11.2432 6.19922L16.6621 19H18.4707L12.3447 5H11.6934L11.2432 6.19922ZM8.31836 14H12.374L10.2227 8.91895L8.31836 14Z"
                    fill="black"
                  />
                </svg>
                <div className="text-[12px] font-[600] text-black text-center">Text</div>
              </button>

              {/* Graphics Button */}
              <button
                type="button"
                onMouseEnter={() => setHoveredButton("graphics")}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={() => togglePanel("graphics")}
                className={
                  "w-[88px] h-auto flex flex-col items-center gap-[8px] p-[8px] rounded-[10px] transition-all duration-200 cursor-pointer " +
                  (activePanel === "graphics"
                    ? "bg-white"
                    : hoveredButton === "graphics"
                      ? "bg-[#DEDEDE]"
                      : "bg-transparent")
                }
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.49998 13.0004C9.88069 13.0004 11 14.1197 11 15.5004V20.5004C10.9998 21.8809 9.88057 23.0004 8.49998 23.0004H3.49998C2.11949 23.0003 1.00019 21.8809 0.999983 20.5004V15.5004C0.999983 14.1197 2.11936 13.0005 3.49998 13.0004H8.49998ZM2.99998 21.0004H8.99998V15.0004H2.99998V21.0004Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18 13.0004C20.7614 13.0004 23 15.239 23 18.0004C22.9998 20.7616 20.7613 23.0004 18 23.0004C15.2388 23.0003 13.0002 20.7616 13 18.0004C13 15.239 15.2386 13.0005 18 13.0004ZM18 15.0004C16.3432 15.0005 15 16.3436 15 18.0004C15.0002 19.657 16.3433 21.0003 18 21.0004C19.6567 21.0004 20.9998 19.6571 21 18.0004C21 16.3435 19.6568 15.0004 18 15.0004Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.85838 1.27089C7.99316 0.877739 9.26801 1.10931 10.1465 1.9369C10.9859 2.72814 11.2908 3.90489 10.9824 5.00331L10.9726 5.03456L10.9433 5.12538L10.9346 5.15272L10.9258 5.17909L10.918 5.19374L8.93553 11.0736L2.90721 9.49843L2.88963 9.49354L2.76463 9.45839L2.73631 9.45058C1.64397 9.10904 0.82264 8.20731 0.6201 7.06776C0.408388 5.87545 0.916702 4.67775 1.87303 3.94472C2.69941 3.31146 3.77647 3.08987 4.76854 3.35097C5.09875 2.38274 5.87752 1.61087 6.85838 1.27089ZM8.7744 3.39296C8.47376 3.10973 7.99182 2.99448 7.51268 3.16054C7.03145 3.32743 6.69477 3.7308 6.61522 4.1703C6.43507 5.16403 5.3576 5.74287 4.42967 5.34218C4.01879 5.16479 3.49455 5.22164 3.08885 5.53261C2.68532 5.84218 2.51648 6.31042 2.58885 6.71815C2.65622 7.09696 2.92761 7.41223 3.32811 7.53944L3.41307 7.56288L7.63573 8.6664L9.03221 4.53065L9.03905 4.49452L9.0449 4.47694L9.04783 4.46913L9.05565 4.44374C9.16902 4.03883 9.05457 3.6395 8.7744 3.39296Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16.5928 1.55995C17.0194 0.814059 18.0948 0.814105 18.5215 1.55995L22.9668 9.33827C23.3894 10.0788 22.8547 11.0002 22.0019 11.0004H13.1123C12.2596 11 11.7256 10.0788 12.1484 9.33827L16.5928 1.55995ZM14.7002 9.07655H20.414L17.5576 4.07655L14.7002 9.07655Z"
                    fill="currentColor"
                  />
                </svg>

                <div className="text-[12px] font-[600] text-black text-center">Graphics</div>
              </button>
            </div>

            {/* Bottom Section - Undo/Redo */}
            <div id="left-section-bottom-side" className="flex-shrink-0 flex flex-col gap-[2px]">
              {/* Undo Button - Disabled */}
              <div className="relative group/tooltip flex justify-center">
                <button
                  type="button"
                  disabled
                  aria-label="Undo"
                  className="w-[88px] h-auto flex flex-col items-center p-[8px] cursor-not-allowed opacity-50 pointer-events-none"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.70711 13.2929C10.0676 13.6534 10.0953 14.2206 9.7903 14.6129L9.70711 14.7071C9.34662 15.0676 8.77939 15.0953 8.3871 14.7903L8.29289 14.7071L4.29289 10.7071C4.2575 10.6717 4.22531 10.6343 4.19633 10.5953L4.12467 10.4841L4.07123 10.3713L4.03585 10.266L4.01102 10.1485L4.00398 10.0898L4 10L4.00279 9.92476L4.02024 9.79927L4.04974 9.68786L4.09367 9.57678L4.146 9.47929L4.2097 9.3871L4.29289 9.29289L8.29289 5.29289C8.68342 4.90237 9.31658 4.90237 9.70711 5.29289C10.0676 5.65338 10.0953 6.22061 9.7903 6.6129L9.70711 6.70711L7.415 9H16C18.7614 9 21 11.2386 21 14C21 16.6888 18.8777 18.8818 16.2169 18.9954L16 19H15C14.4477 19 14 18.5523 14 18C14 17.4872 14.386 17.0645 14.8834 17.0067L15 17H16C17.6569 17 19 15.6569 19 14C19 12.4023 17.7511 11.0963 16.1763 11.0051L16 11H7.415L9.70711 13.2929Z"
                      fill="#989898"
                    />
                  </svg>
                </button>
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-black px-2 py-1 text-[14px] font-medium text-white opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:w-0 before:h-0 before:border-y-[4px] before:border-y-transparent before:border-r-[4px] before:border-r-black">
                  Undo
                </span>
              </div>

              {/* Redo Button - Disabled */}
              <div className="relative group/tooltip flex justify-center">
                <button
                  type="button"
                  disabled
                  aria-label="Redo"
                  className="w-[88px] h-auto flex flex-col items-center p-[8px] cursor-not-allowed opacity-50 pointer-events-none"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10 19H9C6.23 19 4 16.7618 4 14.0039C4 11.2361 6.23 9.00785 9 9.00785H17.59L15.29 6.71965V6.71865C14.89 6.31896 14.89 5.68946 15.29 5.29976C15.68 4.90008 16.31 4.90008 16.71 5.29976L20.71 9.29662V9.29563C20.8 9.38555 20.87 9.49547 20.92 9.62537C20.97 9.74527 20.99 9.86518 21 10.0051C20.99 10.135 20.97 10.2549 20.92 10.3848C20.87 10.5047 20.8 10.6146 20.71 10.7145L16.71 14.7114C16.31 15.1011 15.68 15.1011 15.29 14.7114C14.89 14.3117 14.89 13.6822 15.289 13.2925L17.589 11.0043H8.99C7.33 11.0043 5.99 12.3432 5.99 14.0019C5.99 15.6506 7.33 16.9996 8.99 16.9996H9.99C10.54 16.9996 10.99 17.4392 10.99 17.9988C10.99 18.5484 10.54 18.998 9.99 18.998L10 19Z"
                      fill="#989898"
                    />
                  </svg>
                </button>
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-black px-2 py-1 text-[14px] font-medium text-white opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-50 before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:w-0 before:h-0 before:border-y-[4px] before:border-y-transparent before:border-r-[4px] before:border-r-black">
                  Redo
                </span>
              </div>
            </div>
          </div>

          <div
            id="canvas-section"
            className="relative overflow-hidden min-w-[700px] max-w-[1000px] flex-1 h-full bg-[#F4F4F4] rounded-[12px] flex items-center justify-center"
            onClick={e => {
              if (activePanel && e.target === e.currentTarget) {
                setActivePanel(null)
              }
            }}
          >
            {isBooting ? (
              <div
                aria-label="Loading"
                className="h-10 w-10 rounded-full border-4 border-neutral-300 border-t-neutral-600 animate-spin"
              />
            ) : (
              <img
                src={productImages[activeColorIndex]?.src || "/placeholder.svg"}
                alt={productImages[activeColorIndex]?.alt || ""}
                className="h-[70%] w-auto object-contain"
                onClick={() => activePanel && setActivePanel(null)}
              />
            )}
            {(["graphics", "uploads", "ai"] as const).map(panel => (
              <div
                key={panel}
                className={`absolute inset-y-[2px] left-[2px] w-[300px] rounded-[12px] bg-white shadow-[32px_0px_50px_0px_rgba(0,0,0,0.05)] flex flex-col transition-transform duration-300 ease-out ${
                  activePanel === panel ? "translate-x-0" : "-translate-x-[calc(100%+100px)]"
                }`}
              >
                <h2 className="font-display text-[18px] font-medium text-black px-6 pt-6 pb-4 capitalize flex-shrink-0">
                  {panel === "ai" ? "AI Image" : panel}
                </h2>
                {panel === "graphics" && (
                  <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-0">
                      {[
                        "/img/graphics/croco.png",
                        ...Array.from({ length: 16 }, (_, i) => `/img/graphics/graphics${i + 1}.png`),
                        ...Array.from({ length: 32 }, (_, i) => `/img/graphics/graphics${i + 17}.webp`),
                      ].map(src => (
                        <button
                          key={src}
                          type="button"
                          className="aspect-square flex items-center justify-center p-3 cursor-pointer overflow-hidden border-r border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                        >
                          <img
                            src={src}
                            alt=""
                            className="max-h-full max-w-full object-contain select-none"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  aria-label={`Close ${panel} panel`}
                  onClick={() => setActivePanel(null)}
                  className="absolute -right-3.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-2xl border border-neutral-200 bg-white px-0.5 py-3 hover:bg-neutral-50"
                >
                  <img src="/icons/icon-chevron-left.svg" alt="" className="size-5" />
                </button>
              </div>
            ))}
          </div>

          <div
            ref={rightSectionRef}
            id="right-section"
            className={`${isBooting ? "w-0 p-0 overflow-hidden" : "w-[460px] p-[24px] pb-3 overflow-y-auto"} h-full bg-[#F4F4F4] rounded-[12px] flex flex-col transition-[width,padding] duration-300 ease-out`}
          >
            <div id="top-part" className="flex-shrink-0">
              <div className="flex items-start justify-between mb-[8px]">
                <h1 className="font-display text-[20px] font-[800] text-black leading-tight line-clamp-2">
                  {productData?.name ?? ""}
                </h1>
              </div>
              <div className="text-[14px] text-black underline cursor-pointer">See product details</div>

              <div id="select-color" className="mb-8">
                <div className="w-full text-left text-[12px] uppercase font-bold text-[#6A6A6A] mb-[12px] tracking-[0.08em] mt-6">
                  COLOR: {selectedColor.toUpperCase()}
                </div>
                {isColorScrollable ? (
                  <div className="relative">
                    <div
                      id="color-buttons-row"
                      ref={colorRowRef}
                      className="flex flex-nowrap gap-[2px] overflow-x-auto"
                    >
                      {productImages.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          className={
                            "shrink-0 w-[46px] h-[50px] p-[6px] box-border rounded-[6px] flex items-center justify-center overflow-hidden cursor-pointer select-none border " +
                            (activeColorIndex === index
                              ? "bg-white border-black rounded-[8px]"
                              : "bg-transparent border-transparent hover:bg-[#DEDEDE]")
                          }
                          onClick={() => setActiveColorIndex(index)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              setActiveColorIndex(index)
                            }
                          }}
                          tabIndex={0}
                        >
                          <img
                            src={img.src || "/placeholder.svg"}
                            alt={img.alt}
                            className="max-w-full max-h-full object-contain block"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Edge fades for color row */}
                    {canScrollColorLeft ? (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 top-0 h-full w-[64px] z-[10]"
                        style={{
                          background: "linear-gradient(to right, rgba(244,244,244,1), rgba(244,244,244,0))",
                        }}
                      />
                    ) : null}

                    {canScrollColorRight ? (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 top-0 h-full w-[64px] z-[10]"
                        style={{
                          background: "linear-gradient(to right, rgba(244,244,244,0), rgba(244,244,244,1))",
                        }}
                      />
                    ) : null}

                    {/* Scroll arrows for color row */}
                    {canScrollColorLeft ? (
                      <button
                        type="button"
                        aria-label="Scroll left"
                        onClick={() => scrollColorByPx(-100)}
                        className={
                          "absolute left-[-16px] top-1/2 -translate-y-1/2 z-[20] " +
                          "h-[32px] w-[32px] rounded-full bg-white " +
                          "border border-[#DEDEDE] shadow-sm " +
                          "flex items-center justify-center cursor-pointer"
                        }
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M8.75 3.5L5.25 7L8.75 10.5"
                            stroke="black"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : null}

                    {canScrollColorRight ? (
                      <button
                        type="button"
                        aria-label="Scroll right"
                        onClick={() => scrollColorByPx(100)}
                        className={
                          "absolute right-[-16px] top-1/2 -translate-y-1/2 z-[20] " +
                          "h-[32px] w-[32px] rounded-full bg-white " +
                          "border border-[#DEDEDE] shadow-sm " +
                          "flex items-center justify-center cursor-pointer"
                        }
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5.25 3.5L8.75 7L5.25 10.5"
                            stroke="black"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-[2px] items-start">
                    {productImages.map((img, index) => (
                      <button
                        key={index}
                        type="button"
                        className={
                          "w-[46px] h-[50px] p-[6px] box-border flex items-center justify-center overflow-hidden cursor-pointer select-none border rounded-md " +
                          (activeColorIndex === index
                            ? "bg-white border-black rounded-[8px]"
                            : "bg-transparent border-transparent hover:bg-[#DEDEDE]")
                        }
                        onClick={() => setActiveColorIndex(index)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            setActiveColorIndex(index)
                          }
                        }}
                        tabIndex={0}
                      >
                        <img
                          src={img.src || "/placeholder.svg"}
                          alt={img.alt}
                          className="max-w-full max-h-full object-contain block"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div id="bottom-part" className="flex-shrink-0 mt-auto">
              

              <div className="flex mb-[12px] flex-row items-center justify-start gap-x-2 ml-0">
  <span
    className={
      totalSelected > 0
        ? "text-[14px] font-medium font-sans tracking-[0] text-[#DC2626]"
        : "text-[12px] font-bold font-sans tracking-[0.08em] text-[#6A6A6A]"
    }
  >
    {getVolumeDiscountText(totalSelected)}
  </span>

  <div className="h-[4px] rounded-full bg-[#DEDEDE] w-1 mx-2.5" />

  <button
    type="button"
    className="text-[14px] font-sans underline text-black hover:cursor-pointer font-normal"
    onClick={(e) => e.preventDefault()}
  >
    Size guide
  </button>
</div>


              {/* ✅ WRAPS: no horizontal scrolling */}
              <div id="size-buttons-row" className="flex flex-wrap gap-[8px] overflow-x-hidden mb-0">
                {sizes.map((label) => (
                  <SizeSelectorButton
                    key={`${label}-${activeColorIndex}`}
                    label={label}
                    disabled={outOfStockMap[appearances[activeColorIndex]?.id]?.includes(label)}
                    onQuantityChange={(delta) => setTotalSelected((t) => Math.max(0, t + delta))}
                    showCaret={totalSelected > 0}
                  />
                ))}
              </div>

              {/* Price and CTA section */}
              <div className="flex items-center justify-between gap-[16px] mt-8 mb-3">
                <div className="flex flex-col relative">
                  {totalSelected >= 5 && discountPercent > 0 ? (
                    <span className="text-[12px] text-[#6A6A6A] line-through mb-1 absolute mt-[-18px] font-medium">
                      {formattedOriginalPrice} €
                    </span>
                  ) : null}
                  <span
                    className={`text-[24px] font-medium leading-7 ${
                      totalSelected >= 5 && discountPercent > 0 ? "text-[#DC2626]" : "text-black"
                    }`}
                  >
                    {formattedDiscountedPrice} €
                  </span>
                  <span className="text-[14px] text-black underline cursor-pointer font-normal leading-5">Price details</span>
                </div>
                <button
                  type="button"
                  disabled={showToast}
                  onClick={() => {
                    setShowToast(true)
                    setTimeout(() => {
                      setShowToast(false)
                    }, 2000)
                  }}
                  className={`flex-1 text-white text-[14px] font-medium px-[24px] flex items-center justify-center transition-colors h-[54px] ${
                    showToast ? "bg-[#666] cursor-not-allowed" : "bg-black cursor-pointer hover:bg-[#333]"
                  }`}
                >
                  Add to basket
                </button>
              </div>

{/* Divider */}
              

{/* Returns section */}
              

              {/* Divider */}
              <div className="w-full h-px bg-[#DEDEDE] mb-3" />
              

              {/* Shipping section */}
              <div className="flex items-center mb-0 gap-2">                
                <div className="flex items-center flex-1 gap-1.5 flex-row justify-between">
                  <span className="flex items-center gap-1.5 text-[14px] text-black py-0.5 rounded-xs text-left px-0 font-medium">
<svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.66602 2.66699C9.00787 2.66699 9.28957 2.92435 9.32812 3.25586L9.33301 3.33398H12C12.2048 3.33408 12.3961 3.42801 12.5215 3.58594L12.5713 3.65723L14.5713 6.99023L14.5957 7.03516L14.624 7.10059L14.6504 7.18848L14.6631 7.2666L14.666 7.33398V11.334C14.6659 11.6757 14.4086 11.9576 14.0771 11.9961L14 12H13.2168C12.9421 12.7766 12.2036 13.334 11.333 13.334C10.4624 13.334 9.72391 12.7766 9.44922 12H6.5498C6.27509 12.7765 5.53662 13.334 4.66602 13.334C3.79548 13.3338 3.05685 12.7765 2.78223 12H2C1.65811 12 1.3764 11.7427 1.33789 11.4111L1.33301 11.334V4C1.33318 3.29739 1.87682 2.722 2.56641 2.6709L2.66602 2.66699H8.66602ZM4.66602 10.667C4.30015 10.6672 4.00252 10.9621 3.99902 11.3271L4 11.334C4 11.3356 3.99904 11.3372 3.99902 11.3389C4.00182 11.7046 4.29971 12.0008 4.66602 12.001C5.0341 12.001 5.33283 11.702 5.33301 11.334C5.33301 10.9658 5.03421 10.667 4.66602 10.667ZM11.333 10.667C10.9648 10.667 10.666 10.9658 10.666 11.334C10.6662 11.702 10.9649 12.001 11.333 12.001C11.7011 12.001 11.9998 11.702 12 11.334C12 10.9658 11.7012 10.667 11.333 10.667ZM9.33301 10.667H9.44922C9.72399 9.89059 10.4625 9.33398 11.333 9.33398C12.2035 9.33398 12.942 9.89059 13.2168 10.667H13.333V8H9.33301V10.667ZM2.66602 10.667H2.78223C3.05693 9.89064 3.79559 9.33412 4.66602 9.33398C5.53651 9.33398 6.275 9.89065 6.5498 10.667H8V4H2.66602V10.667ZM9.33301 6.66699H12.8223L11.6221 4.66699H9.33301V6.66699Z" fill="#6A6A6A"/>
</svg>
                    Dec. 13-15 or
                      <span className="text-[14px] text-black font-regular underline px-0 py-0">
                        faster  
                      </span>
                  </span>
                  
                  <span className="text-[14px] py-0.5 font-regular rounded-xs px-0 font-medium">
                    30-Day easy returns
                  </span>
                </div>
                
              </div>

              

            </div>
          </div>
        </div>
        </div>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-700 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-[14px] font-medium">Successfully added to basket</span>
        </div>
      )}

      <ProductsDrawer
        open={productsDrawerOpen}
        onOpenChange={setProductsDrawerOpen}
        onSelect={p => onSelectProduct?.(p)}
      />
    </>
  )
}

type SizeSelectorButtonProps = {
  label: string
  disabled?: boolean
  onQuantityChange: (delta: number) => void
  showCaret?: boolean
}

function SizeSelectorButton({ label, disabled = false, onQuantityChange, showCaret = false }: SizeSelectorButtonProps) {
  const [value, setValue] = useState("")
  const [isRemoved, setIsRemoved] = useState(true)
  const prevQtyRef = useRef(0)

  useEffect(() => {
    const qty = isRemoved ? 0 : Number.parseInt(value || "0", 10) || 0
    const prev = prevQtyRef.current
    if (qty !== prev) {
      onQuantityChange(qty - prev)
      prevQtyRef.current = qty
    }
  }, [value, isRemoved, onQuantityChange])

  return (
    <XLButton
      label={label}
      value={value}
      onValueChange={setValue}
      isRemoved={isRemoved}
      setIsRemoved={setIsRemoved}
      disabled={disabled}
      showCaret={showCaret}
    />
  )
}

type XLButtonProps = {
  label: string
  value: string
  onValueChange: (next: string) => void
  isRemoved: boolean
  setIsRemoved: (next: boolean) => void
  disabled?: boolean
  showCaret?: boolean
}

type DropdownPos = {
  top: number
  left: number
  width: number
}

type TooltipPos = {
  top: number
  left: number
}

export function XLButton({ label, value, onValueChange, isRemoved, setIsRemoved, disabled = false, showCaret = false }: XLButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const [isInputHover, setIsInputHover] = useState(false)
  const [isInputActive, setIsInputActive] = useState(false)
  const [isDisabledHover, setIsDisabledHover] = useState(false)

  const rootRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const measureRef = useRef<HTMLSpanElement | null>(null)
  const [inputPxWidth, setInputPxWidth] = useState<number>(0)

  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null)
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null)

  const options = useMemo(() => {
    const nums = Array.from({ length: 5 }, (_, i) => String(i + 1))
    nums.push("More")
    return hasSelection ? ["Remove", ...nums] : nums
  }, [hasSelection])

  useEffect(() => {
    if (disabled) return
    if (isRemoved) {
      if (hasSelection) setHasSelection(false)
    } else {
      if (!hasSelection) setHasSelection(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemoved, disabled])

  useLayoutEffect(() => {
    if (isRemoved || disabled) return
    const el = measureRef.current
    if (!el) return

    const text = value.length ? value : "0"
    el.textContent = text

    const w = Math.ceil(el.getBoundingClientRect().width)
    setInputPxWidth(w)
  }, [value, isRemoved, disabled])

  const recomputeDropdownPos = () => {
    const btn = rootRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    setDropdownPos({
      top: Math.round(r.top) - 6,
      left: Math.round(r.right),
      width: Math.round(r.width),
    })
  }

  const recomputeTooltipPos = () => {
    const btn = rootRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    setTooltipPos({
      top: Math.round(r.top) - 8,
      left: Math.round(r.left + r.width / 2),
    })
  }

  useEffect(() => {
    if (!isOpen) return

    recomputeDropdownPos()

    const onDocMouseDown = (e: MouseEvent) => {
      const root = rootRef.current
      const dd = dropdownRef.current
      if (!root) return

      if (e.target instanceof Node) {
        if (root.contains(e.target)) return
        if (dd && dd.contains(e.target)) return
      }
      setIsOpen(false)
    }

    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }

    const onReposition = () => recomputeDropdownPos()

    // ✅ removed #size-buttons-row scroll listener
    window.addEventListener("scroll", onReposition, { passive: true })
    window.addEventListener("resize", onReposition)

    document.addEventListener("mousedown", onDocMouseDown)
    document.addEventListener("keydown", onDocKeyDown)

    return () => {
      window.removeEventListener("scroll", onReposition)
      window.removeEventListener("resize", onReposition)
      document.removeEventListener("mousedown", onDocMouseDown)
      document.removeEventListener("keydown", onDocKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!disabled || !isDisabledHover) {
      setTooltipPos(null)
      return
    }

    recomputeTooltipPos()

    const onReposition = () => recomputeTooltipPos()

    // ✅ removed #size-buttons-row scroll listener
    window.addEventListener("scroll", onReposition, { passive: true })
    window.addEventListener("resize", onReposition)

    return () => {
      window.removeEventListener("scroll", onReposition)
      window.removeEventListener("resize", onReposition)
    }
  }, [disabled, isDisabledHover])

  const toggleDropdown = () => setIsOpen((v) => !v)

  const pick = (opt: string) => {
    if (opt === "More") {
      setIsRemoved(false)
      setHasSelection(true)
      onValueChange("")
      setIsOpen(false)
      // Focus the input after state updates
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
      return
    }

    const next = applyDropdownPick(opt)

    if (next.removed) {
      setIsRemoved(true)
      setIsInputHover(false)
      setHasSelection(false)
      onValueChange("")
    } else {
      setIsRemoved(false)
      setHasSelection(true)
      onValueChange(next.value)
    }

    setIsOpen(false)
  }

  const isLockedActive = isOpen && !disabled
  const isSelectedState = hasSelection && !isOpen && !disabled && !isInputHover && !isInputActive

  return (
    <>
      <button
        ref={rootRef}
        type="button"
        onMouseEnter={() => {
          if (disabled) setIsDisabledHover(true)
        }}
        onMouseLeave={() => {
          if (disabled) setIsDisabledHover(false)
        }}
        onMouseDown={(e) => {
          if (disabled) return
          if (!isRemoved && (isInputHover || isInputActive)) return
          e.preventDefault()
          toggleDropdown()
        }}
        className={
          "group relative inline-flex items-center justify-center gap-[4px] " +
          "h-[32px] min-w-[32px] px-[6px] py-0 " +
          (disabled
            ? "bg-[#E8E8E8] "
            : isLockedActive
              ? "bg-white "
              : (isInputHover || isInputActive)
                ? "bg-white "
                : isSelectedState
                  ? "bg-white "
                  : "bg-[#F4F4F4] ") +
          "border-2 rounded-none transition-colors duration-200 ease-out " +
          (disabled ? "cursor-not-allowed border-[#E8E8E8] " : "border-[#dedede] cursor-pointer ") +
          (isLockedActive
            ? "border-black "
            : (isInputHover || isInputActive)
              ? "border-black "
              : isSelectedState
                ? "border-black "
                : !disabled && isRemoved
                  ? "hover:bg-white hover:border-black "
                  : "")
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={
            "text-[12px] font-semibold font-sans transition-colors duration-200 ease-out text-center " +
            (disabled
              ? "text-[#B9B9B9]"
              : isLockedActive
                ? "text-black"
                : isSelectedState
                  ? "text-black"
                  : !isInputHover
                    ? (isRemoved ? "text-black group-hover:text-black" : "text-black")
                    : "text-black")
          }
        >
          {label}
        </span>

        {!isRemoved && !disabled ? (
          <>
            <span
              ref={measureRef}
              aria-hidden="true"
              className="absolute -left-[99999px] top-0 whitespace-pre text-[12px] font-medium font-sans"
            />

            <span
              className={
                "inline-flex items-center justify-center px-[2px] rounded-full transition-colors duration-200 ease-out " +
                "text-white " +
                (isInputHover || isInputActive ? "bg-transparent h-[28px]" : "bg-[#EDEDED] h-[20px]")
              }
            >
              <input
                ref={inputRef}
                inputMode="numeric"
                pattern="[0-9]*"
                type="text"
                value={value}
                onChange={(e) => onValueChange(onlyDigits(e.target.value))}
                onMouseEnter={() => setIsInputHover(true)}
                onMouseLeave={() => setIsInputHover(false)}
                onFocus={() => setIsInputActive(true)}
                onBlur={(e) => {
                  setIsInputActive(false)
                  const raw = e.currentTarget.value.trim()
                  if (shouldTriggerRemoveOnBlur(raw)) {
                    setIsRemoved(true)
                    setHasSelection(false)
                    setIsInputHover(false)
                    onValueChange("")
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === "Enter") {
                    inputRef.current?.blur()
                  }
                }}
                style={{
                  width: inputPxWidth ? String(Math.max(20, inputPxWidth)) + "px" : "20px",
                }}
                className={
                  (isInputHover || isInputActive ? "h-[28px] " : "h-[20px] ") +
                  "px-0 text-[12px] font-sans text-center font-bold " +
                  "bg-transparent text-black " +
                  "border border-transparent rounded-none outline-none " +
                  "hover:border-[#6A6A6A] focus:border-transparent hover:bg-white transition-colors duration-200 ease-out"
                }
                aria-label="Number" placeholder="0"
              />
            </span>
          </>
        ) : null}

        {/* Plus icon - shows on enabled buttons only when no value is selected */}
        {!disabled && isRemoved && (!value || Number(value) === 0) ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={
              "flex-shrink-0 " +
              (isLockedActive ? "text-[#989898]" : "text-[#989898] group-hover:text-[#989898]")
            }
          >
            <path
              d="M7.99951 2.66699C8.34137 2.66699 8.62307 2.92435 8.66162 3.25586L8.6665 3.33398V7.33398H12.6665C13.0346 7.33398 13.3333 7.63196 13.3335 8C13.3335 8.34175 13.076 8.62341 12.7446 8.66211L12.6665 8.66699H8.6665V12.667C8.6665 13.0352 8.3677 13.334 7.99951 13.334C7.65789 13.3338 7.37605 13.0764 7.3374 12.7451L7.3335 12.667V8.66699H3.3335C2.96531 8.66699 2.6665 8.36819 2.6665 8C2.66667 7.65826 2.92393 7.3764 3.25537 7.33789L3.3335 7.33398H7.3335V3.33398C7.3335 2.9659 7.63147 2.66717 7.99951 2.66699Z"
              fill="currentColor"
            />
          </svg>
        ) : null}
      </button>

      {/* Tooltip (portal) */}
      {disabled && isDisabledHover && tooltipPos
        ? createPortal(
            <div
              role="tooltip"
              className={
                "pointer-events-none fixed z-[99999] " +
                "bg-black text-white text-[14px] font-medium font-sans " +
                "px-[10px] py-[6px] whitespace-nowrap shadow-sm rounded-[4px]"
              }
              style={{
                top: tooltipPos.top,
                left: tooltipPos.left,
                transform: "translate(-50%, -100%)",
              }}
            >
              Currently out of stock
            </div>,
            document.body,
          )
        : null}

      {/* Dropdown (portal) */}
      {isOpen && !disabled && dropdownPos
        ? createPortal(
            <div
              ref={dropdownRef}
              role="listbox"
              aria-label="Options"
              className={"fixed z-[9999] bg-white border border-[#DEDEDE] rounded-none shadow-sm py-[4px]"}
              style={{
                top: dropdownPos.top,
                left: dropdownPos.left,
                transform: "translate(-100%, -100%)",
                minWidth: dropdownPos.width,
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {/* QUANTITY title - only show when Remove is not in options */}
              {!hasSelection ? (
                <div className="px-[8px] mb-[10px] mt-[4px]">
                  <span className="text-[12px] font-bold text-[#818181]">QUANTITY</span>
                </div>
              ) : null}

              {options.map((opt) => {
                const selected = (!isRemoved ? value : "") === opt
                const isRemove = opt === "Remove"
                const isMore = opt === "More"

                return (
                  <div
                    key={opt}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setIsInputHover(false)}
                    onClick={() => pick(opt)}
                    className={
                      "px-[8px] h-[28px] flex items-center cursor-pointer gap-[6px] " +
                      "text-[14px] font-medium font-sans " +
                      (selected ? "bg-[#DEDEDE] text-black " : isRemove ? "text-[#D92D20] " : "text-black ") +
                      "hover:bg-[#F4F4F4] hover:text-black transition-colors duration-200 ease-out"
                    }
                  >
                    {isRemove ? (
                      <span className="text-[#D92D20]">Remove</span>
                    ) : isMore ? (
                      <>
                        <span>More</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M9.19531 3.19434C10.192 2.19796 11.808 2.19796 12.8047 3.19434C13.767 4.1567 13.8003 5.69704 12.9043 6.69922L12.8047 6.80469L5.80469 13.8047C5.70053 13.9087 5.56526 13.975 5.4209 13.9941L5.33301 14H2.66699C2.3251 14 2.04339 13.7417 2.00488 13.4102L2 13.333V10.666C2.00004 10.5187 2.04912 10.3764 2.1377 10.2607L2.19531 10.1943L9.19531 3.19434ZM3.33301 10.9424V12.666H5.05664L10.7236 6.99902L8.99902 5.27539L3.33301 10.9424ZM11.8623 4.1377C11.4127 3.68811 10.6986 3.66287 10.2197 4.0625L10.1377 4.1377L9.94238 4.33203L11.666 6.05664L11.8623 5.86133C12.3116 5.41173 12.3361 4.69853 11.9365 4.21973L11.8623 4.1377Z"
                            fill="#989898"
                          />
                        </svg>
                      </>
                    ) : (
                      opt
                    )}
                  </div>
                )
              })}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

// ----------------------
// Helpers
// ----------------------

export function getVolumeDiscountText(totalSelected: number) {
  const n = Math.max(0, Math.floor(totalSelected || 0))

  if (n === 0) return "CHOOSE SIZE & QUANTITY"

  if (n >= 1 && n <= 5) return "From 5 article -10% reduction"
  if (n >= 6 && n <= 19) return "From 20 article -15% reduction"
  if (n >= 20 && n <= 49) return "From 50 article -25% reduction"
  return `For ${n} article -50% reduction`
}

export function onlyDigits(input: string) {
  // Keep digits only, max 5 chars.
  const digits = input.replace(/[^0-9]+/g, "").slice(0, 5)
  if (digits === "") return ""

  // Remove leading zeros if there's a non-zero number at the end (e.g. 01 -> 1, 004 -> 4).
  const trimmed = digits.replace(/^0+/, "")

  // If input was all zeros, keep a single 0.
  return trimmed === "" ? "0" : trimmed
}

export function shouldTriggerRemoveOnBlur(rawValue: string) {
  const v = rawValue.trim()
  // Empty OR any all-zero value should behave like selecting "Remove".
  return v === "" || /^0+$/.test(v)
}

export function applyDropdownPick(opt: string): { removed: boolean; value: string } {
  if (opt === "Remove") return { removed: true, value: "" }
  return { removed: false, value: opt }
}
