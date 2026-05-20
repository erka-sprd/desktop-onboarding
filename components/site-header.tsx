type SiteHeaderProps = {
  hidden?: boolean
}

export default function SiteHeader({ hidden = false }: SiteHeaderProps) {
  return (
    <header
      className={`${hidden ? "hidden" : "flex"} flex-none w-full flex-col shadow-[0_2px_4px_rgba(0,0,0,0.04)] bg-white`}
    >
      <div className="mx-auto w-full px-16">
        <div className="flex h-16 w-full items-center justify-between">
          <img src="/icons/Logo.svg" alt="Spreadshirt" className="h-[28px]" />
          <div className="flex items-center gap-6">
            <button type="button" aria-label="Cart" className="cursor-pointer">
              <img src="/icons/icon-cart.svg" alt="" className="h-6 w-6" />
            </button>
            <button type="button" aria-label="Menu" className="cursor-pointer">
              <img src="/icons/icon-hamburger-menu.svg" alt="" className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
