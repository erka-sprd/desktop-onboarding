type SiteHeaderProps = {
  hidden?: boolean
}

export default function SiteHeader({ hidden = false }: SiteHeaderProps) {
  return (
    <header
      className={`${hidden ? "hidden" : "flex"} flex-none w-full flex-col shadow-[0_2px_4px_rgba(0,0,0,0.04)]`}
    >
      <div className="flex h-8 w-full items-center justify-center bg-[#FF6038]">
        <div className="mx-auto flex w-full items-center justify-center gap-2 px-16 text-[12px] text-black">
          <span className="font-semibold">30% off everything</span>
          <a href="#" className="font-semibold underline underline-offset-2">
            Redeem Code Now
          </a>
        </div>
      </div>
      <div className="flex w-full flex-col bg-white">
        <div className="mx-auto w-full px-16">
          <div className="relative flex h-16 w-full items-center justify-center">
            <img src="/icons/Logo.svg" alt="Spreadshirt" className="h-[40px]" />
            <button
              type="button"
              aria-label="Cart"
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <img src="/icons/icon-cart.svg" alt="" className="h-6 w-6" />
            </button>
          </div>
          <div className="flex h-12 w-full items-center justify-between">
            <nav className="flex items-center gap-7 text-[17px] font-medium text-black">
              <a href="#" className="hover:opacity-70">
                Create
              </a>
              <a href="#" className="hover:opacity-70">
                Shop
              </a>
              <a href="#" className="hover:opacity-70">
                Pro
              </a>
            </nav>
            <a href="#" className="text-[17px] font-medium text-black hover:opacity-70">
              Start selling
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
