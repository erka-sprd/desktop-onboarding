export const FontGridSkeleton = ({ count = 12 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="min-h-[116px] animate-pulse rounded-xs bg-neutral-200"
        />
      ))}
    </>
  )
}
