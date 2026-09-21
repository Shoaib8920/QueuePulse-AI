import {
    useState,
    type ComponentType,
  } from "react"
  
  import {
    Activity,
    CheckCircle2,
    ChevronRight,
    LayoutGrid,
    MessageSquareText,
    Sparkles,
    Stethoscope,
    Users,
    Wifi,
    X,
  } from "lucide-react"
  
  import {
    NavLink,
    Outlet,
    useLocation,
  } from "react-router-dom"
  
  import DashboardTopBar from "../components/ui/dashboard/DashboardTopBar"
  
  import queuePulseIcon from "../assets/queuepulse-icon.png"
  
  type NavItem = {
    label: string
    route: string
    icon: ComponentType<{
      className?: string
    }>
  }
  
  const navItems: NavItem[] = [
    {
      label: "Command Center",
      route: "/command-center",
      icon: LayoutGrid,
    },
    {
      label: "Live Queue",
      route: "/live-queue",
      icon: Activity,
    },
    {
      label: "Patients",
      route: "/patients",
      icon: Users,
    },
    {
      label: "Doctors",
      route: "/doctors",
      icon: Stethoscope,
    },
    {
      label: "Forecasting",
      route: "/forecasting",
      icon: Sparkles,
    },
  ]
  
  const pageMeta: Record<
    string,
    {
      title: string
      subtitle: string
    }
  > = {
    "/command-center": {
      title: "Operations Command Center",
      subtitle: "General Medicine · Room 201",
    },
  
    "/live-queue": {
      title: "Live Queue",
      subtitle: "General Medicine · Real-time patient flow",
    },
  
    "/patients": {
      title: "Patients",
      subtitle: "Patient visits · Tokens · Arrival status",
    },
  
    "/doctors": {
      title: "Doctors",
      subtitle: "Clinical availability · Capacity · Workload",
    },
  
    "/forecasting": {
      title: "Forecasting Intelligence",
      subtitle: "Live ETA prediction · Confidence · Queue changes",
    },
  }
  
  export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] =
      useState(false)
  
    const location = useLocation()
  
    const currentPage =
      pageMeta[location.pathname] ??
      pageMeta["/command-center"]
  
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        {/* GLOBAL BACKGROUND */}
  
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.13),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_24%),linear-gradient(180deg,#060919_0%,#040611_100%)]" />
  
          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(120,130,255,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(120,130,255,0.13) 1px, transparent 1px)",
              backgroundSize:
                "48px 48px",
            }}
          />
        </div>
  
        {/* MINI SIDEBAR */}
  
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[92px] flex-col border-r border-white/[0.07] bg-[#050714] lg:flex">
          <div className="flex h-[108px] items-center justify-center border-b border-white/[0.07]">
            <div className="relative flex h-[58px] w-[58px] items-center justify-center">
              <div className="absolute inset-1 rounded-[20px] bg-gradient-to-br from-fuchsia-500/30 via-violet-500/20 to-cyan-400/30 blur-xl" />
  
              <div className="relative flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#080B1C]">
                <img
                  src={queuePulseIcon}
                  alt="QueuePulse AI"
                  className="h-[48px] w-[48px] object-contain"
                />
              </div>
            </div>
          </div>
  
          <div className="px-3 pt-10">
            <div className="space-y-2">
              {navItems.map(
                (item) => {
                  const Icon =
                    item.icon
  
                  return (
                    <NavLink
                      key={item.route}
                      to={item.route}
                      title={item.label}
                      className={({
                        isActive,
                      }) =>
                        `group relative flex h-[54px] w-full items-center justify-center rounded-[18px] transition-all duration-200 ${
                          isActive
                            ? "bg-violet-500/[0.16]"
                            : "hover:bg-white/[0.04]"
                        }`
                      }
                    >
                      {({
                        isActive,
                      }) => (
                        <>
                          {isActive && (
                            <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full bg-gradient-to-b from-fuchsia-400 via-violet-400 to-cyan-300 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
                          )}
  
                          <div
                            className={`flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border ${
                              isActive
                                ? "border-violet-400/25 bg-violet-500/16 text-violet-100"
                                : "border-white/[0.07] bg-white/[0.025] text-[#BBC8D9]"
                            }`}
                          >
                            <Icon className="h-[18px] w-[18px]" />
                          </div>
                        </>
                      )}
                    </NavLink>
                  )
                },
              )}
            </div>
          </div>
  
          <div className="mt-auto flex justify-center pb-6">
            <div
              title="All systems operational"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.07]"
            >
              <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400/35" />
  
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        </aside>
  
        {/* EXPANDED SIDEBAR */}
  
        <aside
          className={`fixed inset-y-0 left-0 z-50 hidden w-[270px] flex-col border-r border-white/[0.09] bg-[#050714] shadow-[24px_0_70px_rgba(0,0,0,0.38)] will-change-transform transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex ${
            sidebarOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full pointer-events-none opacity-0"
          }`}
        >
          {/* BRAND */}
  
          <div className="relative flex h-[108px] items-center border-b border-white/[0.07] px-5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center">
                <div className="absolute inset-1 rounded-[20px] bg-gradient-to-br from-fuchsia-500/30 via-violet-500/20 to-cyan-400/30 blur-xl" />
  
                <div className="relative flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#080B1C]">
                  <img
                    src={queuePulseIcon}
                    alt="QueuePulse AI"
                    className="h-[48px] w-[48px] object-contain"
                  />
                </div>
              </div>
  
              <div>
                <h1 className="whitespace-nowrap text-[22px] font-semibold tracking-[-0.045em]">
                  <span className="text-white">
                    Queue
                  </span>
  
                  <span className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    Pulse
                  </span>
  
                  <span className="ml-1 bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                    AI
                  </span>
                </h1>
  
                <p className="mt-1.5 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.27em] text-cyan-200">
                  Hospital Intelligence
                </p>
              </div>
            </div>
  
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#AAB7C9] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
  
          {/* WORKSPACE */}
  
          <div className="px-5 pb-3 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#AEBBCD]">
              Workspace
            </p>
          </div>
  
          {/* NAVIGATION */}
  
          <nav className="px-3">
            <ul className="space-y-1.5">
              {navItems.map(
                (item) => {
                  const Icon =
                    item.icon
  
                  return (
                    <li key={item.route}>
                      <NavLink
                        to={item.route}
                        onClick={() =>
                          setSidebarOpen(
                            false,
                          )
                        }
                        className={({
                          isActive,
                        }) =>
                          `group relative flex w-full items-center gap-3 rounded-[17px] px-3 py-3 transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-violet-500/[0.16] via-violet-500/[0.08] to-transparent"
                              : "hover:bg-white/[0.035]"
                          }`
                        }
                      >
                        {({
                          isActive,
                        }) => (
                          <>
                            {isActive && (
                              <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full bg-gradient-to-b from-fuchsia-400 via-violet-400 to-cyan-300" />
                            )}
  
                            <div
                              className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] border ${
                                isActive
                                  ? "border-violet-400/25 bg-violet-500/16 text-violet-100"
                                  : "border-white/[0.07] bg-white/[0.025] text-[#BBC8D9]"
                              }`}
                            >
                              <Icon className="h-[18px] w-[18px]" />
                            </div>
  
                            <span className="flex-1 text-left text-[14px] font-medium text-[#E0E7F1]">
                              {item.label}
                            </span>
  
                            <ChevronRight className="h-4 w-4 text-[#78879D]" />
                          </>
                        )}
                      </NavLink>
                    </li>
                  )
                },
              )}
            </ul>
          </nav>
  
          <div className="mx-5 mt-6 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />
  
          {/* STATUS */}
  
          <div className="mt-auto p-4">
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#B2C0D2]">
                    System Status
                  </p>
  
                  <p className="mt-1 text-[10px] text-[#8291A6]">
                    Operational services
                  </p>
                </div>
  
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              </div>
  
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-violet-200" />
  
                    <span className="text-[10px] text-[#CED7E5]">
                      Forecast Engine
                    </span>
                  </div>
  
                  <span className="text-[9px] font-semibold text-emerald-200">
                    Online
                  </span>
                </div>
  
                <div className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-3.5 w-3.5 text-cyan-200" />
  
                    <span className="text-[10px] text-[#CED7E5]">
                      Live Sync
                    </span>
                  </div>
  
                  <span className="text-[9px] font-semibold text-emerald-200">
                    Connected
                  </span>
                </div>
  
                <div className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="h-3.5 w-3.5 text-fuchsia-200" />
  
                    <span className="text-[10px] text-[#CED7E5]">
                      SMS Gateway
                    </span>
                  </div>
  
                  <span className="text-[9px] font-semibold text-cyan-200">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
  
        {/* OVERLAY */}
  
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className={`fixed inset-0 z-40 hidden bg-black/20 transition-opacity duration-300 lg:block ${
            sidebarOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        />
  
        {/* DASHBOARD */}
  
        <div className="relative min-h-screen lg:pl-[92px]">
          <DashboardTopBar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() =>
              setSidebarOpen(
                (previous) =>
                  !previous,
              )
            }
            title={currentPage.title}
            subtitle={
              currentPage.subtitle
            }
          />
  
          <main className="px-5 py-7 lg:px-9">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }