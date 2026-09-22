import {
    LogOut,
    ShieldCheck,
    UserRound,
  } from "lucide-react"
  
  import {
    useNavigate,
  } from "react-router-dom"
  
  import {
    useAuth,
  } from "../context/AuthContext"
  
  
  function formatRole(
    role: string,
  ) {
    return role
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word
            .charAt(0)
            .toUpperCase() +
          word.slice(1),
      )
      .join(" ")
  }
  
  
  export default function StaffAccountMenu() {
    const {
      user,
      logout,
    } = useAuth()
  
    const navigate =
      useNavigate()
  
  
    if (!user) {
      return null
    }
  
  
    function handleLogout() {
      logout()
  
      navigate(
        "/login",
        {
          replace: true,
        },
      )
    }
  
  
    return (
      <div className="flex items-center gap-3">
  
        {/* STAFF IDENTITY */}
  
        <div className="hidden items-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 py-2 md:flex">
  
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-500/[0.08]">
  
            <UserRound className="h-4 w-4 text-cyan-200" />
  
          </div>
  
          <div className="min-w-0">
  
            <p className="max-w-[160px] truncate text-[11px] font-semibold text-white">
  
              {user.name}
  
            </p>
  
            <div className="mt-0.5 flex items-center gap-1.5">
  
              <ShieldCheck className="h-3 w-3 text-violet-300" />
  
              <p className="text-[9px] font-medium text-[#9EADC0]">
  
                {formatRole(
                  user.role,
                )}
  
              </p>
  
            </div>
  
          </div>
  
        </div>
  
  
        {/* LOGOUT */}
  
        <button
          type="button"
          onClick={
            handleLogout
          }
          title="Log out"
          className="group flex h-11 items-center gap-2 rounded-xl border border-rose-400/15 bg-rose-500/[0.06] px-3 text-[10px] font-semibold text-rose-100 transition hover:border-rose-400/30 hover:bg-rose-500/[0.12]"
        >
  
          <LogOut className="h-4 w-4 transition group-hover:translate-x-0.5" />
  
          <span className="hidden sm:inline">
            Logout
          </span>
  
        </button>
  
      </div>
    )
  }