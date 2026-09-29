export const NavigationMenuBar = () => {
  return (
    <aside
      className="flex w-14 shrink-0 justify-center py-3 sm:w-16 sm:py-4 lg:w-20"
      aria-label="User sidebar"
    >
      <div
        className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-card text-sm font-semibold text-foreground shadow-[var(--shadow-card-soft)]"
        aria-label="JD user avatar"
        role="img"
      >
        JD
      </div>
    </aside>
  )
}
