import {
    Navigate,
    Outlet,
    useLocation,
  } from "react-router-dom"
  
  import {
    useAuth,
  } from "../context/AuthContext"
  
  
  export default function ProtectedRoute() {
    const {
      isAuthenticated,
      loading,
    } = useAuth()
  
    const location =
      useLocation()
  
  
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#050816]">
  
          <div className="text-center">
  
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
  
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9AA9BC]">
  
              Securing QueuePulse
  
            </p>
  
          </div>
  
        </div>
      )
    }
  
  
    if (
      !isAuthenticated
    ) {
      return (
        <Navigate
          to="/login"
          replace
          state={{
            from:
              location.pathname,
          }}
        />
      )
    }
  
  
    return <Outlet />
  }