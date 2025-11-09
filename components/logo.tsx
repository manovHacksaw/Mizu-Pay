export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-lg">P</span>
      </div>
      <span className="font-semibold text-sidebar-foreground">Payora</span>
    </div>
  )
}
