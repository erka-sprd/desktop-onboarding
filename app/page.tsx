"use client"

import { useState } from "react"
import Designer from "@/components/designer"
import { type SelectedProduct } from "@/components/products-drawer"
import StartPage from "@/components/start-page"

type DesignerPanel = "graphics" | "uploads" | "ai"

export default function Page() {
  const [showDesigner, setShowDesigner] = useState(false)
  const [initialPanel, setInitialPanel] = useState<DesignerPanel | undefined>(undefined)
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null)

  if (showDesigner) {
    return (
      <Designer
        initialPanel={initialPanel}
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
      />
    )
  }
  return (
    <StartPage
      selectedProduct={selectedProduct}
      onSelectProduct={setSelectedProduct}
      onStart={panel => {
        setInitialPanel(panel)
        setShowDesigner(true)
      }}
    />
  )
}
