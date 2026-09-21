import {
    Bell,
    ChevronDown,
    Command,
    Menu,
    Search,
    Sparkles,
    X,
  } from "lucide-react"
  
  type DashboardTopBarProps = {
    sidebarOpen: boolean
    onToggleSidebar: () => void
    title: string
    subtitle: string
  }
  
  export default function DashboardTopBar({
    sidebarOpen,
    onToggleSidebar,
    title,
    subtitle,
  }: DashboardTopBarProps) {
    return (
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050817]/90 backdrop-blur-2xl">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-20 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />
  
            <div className="absolute -top-24 right-32 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
  
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(124,58,237,0.05),transparent_28%,transparent_72%,rgba(34,211,238,0.05))]" />
          </div>
  
          <div className="relative flex min-h-[88px] items-center justify-between gap-5 px-5 lg:px-8">
            {/* LEFT */}
  
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={onToggleSidebar}
                className="group relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-violet-400/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] shadow-[0_15px_35px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-violet-300/45 hover:bg-violet-500/10"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),transparent_60%)]" />
  
                {sidebarOpen ? (
                  <X className="relative h-5 w-5 text-white/90" />
                ) : (
                  <Menu className="relative h-5 w-5 text-white/90" />
                )}
              </button>
  
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="truncate text-[16px] font-semibold tracking-[-0.025em] text-white md:text-[18px]">
                    {title}
                  </h1>
  
                  <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 md:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
  
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                      Live
                    </span>
                  </div>
                </div>
  
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <span className="font-medium text-[#BFCADD]">
                    {subtitle}
                  </span>
  
                  <span className="hidden text-[#657287] md:inline">
                    •
                  </span>
  
                  <span className="hidden items-center gap-1.5 text-cyan-200 md:inline-flex">
                    <Sparkles className="h-3 w-3" />
                    Forecasting active
                  </span>
                </div>
              </div>
            </div>
  
            {/* RIGHT */}
  
            <div className="flex items-center gap-3">
              {/* SEARCH */}
  
              <div className="group relative hidden lg:block">
                <div className="absolute -inset-[1px] rounded-[20px] bg-gradient-to-r from-violet-500/25 via-blue-500/10 to-cyan-400/25 opacity-60 blur-[2px] transition-opacity duration-300 group-focus-within:opacity-100" />
  
                <div className="relative flex h-[52px] w-[390px] items-center gap-3 rounded-[20px] border border-white/[0.10] bg-[linear-gradient(180deg,rgba(14,18,39,0.96),rgba(8,12,28,0.96))] px-3 shadow-[0_14px_35px_rgba(0,0,0,0.24)]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035]">
                    <Search className="h-4 w-4 text-[#C7D2E3]" />
                  </div>
  
                  <input
                    type="text"
                    placeholder="Search token, patient or doctor..."
                    className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-white outline-none placeholder:text-[#718096]"
                  />
  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-white/[0.09] bg-white/[0.035] px-2.5 py-2 text-[10px] font-medium text-[#AEBBD0]">
                      <Command className="h-3 w-3" />
                      K
                    </div>
  
                    <button
                      type="button"
                      className="hidden items-center gap-1 rounded-xl border border-white/[0.09] bg-white/[0.035] px-2.5 py-2 text-[10px] text-[#AEBBD0] xl:flex"
                    >
                      Quick
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
  
              {/* BELL */}
  
              <button
                type="button"
                className="group relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-white/[0.10] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_14px_30px_rgba(0,0,0,0.24)] transition hover:border-violet-400/35 hover:bg-violet-500/10"
              >
                <Bell className="h-[19px] w-[19px] text-[#E2E8F2]" />
  
                <span className="absolute right-[9px] top-[8px] flex h-[10px] w-[10px]">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-40" />
  
                  <span className="relative inline-flex h-[10px] w-[10px] rounded-full border-2 border-[#080B18] bg-fuchsia-400" />
                </span>
              </button>
  
              {/* PROFILE */}
  
              <button
                type="button"
                className="group flex h-[52px] items-center gap-3 rounded-2xl border border-violet-400/20 bg-[linear-gradient(135deg,rgba(74,32,130,0.72),rgba(31,24,75,0.82))] p-1.5 pr-3 transition hover:border-violet-300/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 text-[11px] font-bold text-white">
                  OP
                </div>
  
                <div className="hidden text-left xl:block">
                  <p className="text-[11px] font-semibold text-white">
                    Operator
                  </p>
  
                  <p className="text-[9px] text-[#AAB5C8]">
                    Control Access
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  }