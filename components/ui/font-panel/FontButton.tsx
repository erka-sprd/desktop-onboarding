"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { useFonts } from "@/hooks/useFonts"
import type { FontDef } from "@/lib/fonts"

type FontButtonProps = {
  font: FontDef
  isSelected: boolean
  onClick: (font: FontDef) => void
  className?: string
}

export const FontButton = ({ font, isSelected, onClick, className }: FontButtonProps) => {
  const [fontFamily, setFontFamily] = useState<string | null>(null)
  const ref = useRef<HTMLButtonElement | null>(null)
  const spanRef = useRef<HTMLSpanElement | null>(null)
  const { loadFont } = useFonts()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting) {
          const family = await loadFont(font.family)
          setFontFamily(family)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [font.family, loadFont])

  useLayoutEffect(() => {
    const span = spanRef.current
    const btn = ref.current
    if (!span || !btn || !fontFamily) return

    const padding = 32 // p-4 = 16px each side
    const availW = btn.clientWidth - padding
    const availH = btn.clientHeight - padding

    let lo = 8
    let hi = 40
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2)
      span.style.fontSize = `${mid}px`
      if (span.scrollWidth <= availW && span.scrollHeight <= availH) {
        lo = mid
      } else {
        hi = mid - 1
      }
    }
    span.style.fontSize = `${lo}px`
  }, [fontFamily])

  const baseClasses =
    "flex flex-col items-center justify-center text-center h-full min-h-[116px] cursor-pointer rounded-xs bg-neutral-100 p-4 transition border"
  const stateClasses = isSelected
    ? "border-black"
    : "hover:bg-neutral-150 border-transparent"

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${stateClasses} ${className ?? ""}`}
      onClick={() => onClick(font)}
    >
      {fontFamily ? (
        <span
          ref={spanRef}
          key={fontFamily}
          style={{ fontFamily: `"${fontFamily}"` }}
          className="w-full text-center align-middle"
        >
          {font.family}
        </span>
      ) : (
        <div className="flex w-full flex-col items-center gap-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
        </div>
      )}
    </button>
  )
}
