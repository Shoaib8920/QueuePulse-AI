import {
    useState,
    type FormEvent,
  } from "react"
  
  import {
    Activity,
    ArrowRight,
    BrainCircuit,
    LockKeyhole,
    ShieldCheck,
    UserRound,
  } from "lucide-react"
  
  import {
    Navigate,
    useLocation,
    useNavigate,
  } from "react-router-dom"
  
  import {
    useAuth,
  } from "../context/AuthContext"
  
  
  export default function Login() {
    const {
      login,
      isAuthenticated,
    } = useAuth()
  
    const navigate =
      useNavigate()
  
    const location =
      useLocation()
  
  
    const [
      email,
      setEmail,
    ] = useState(
      "",
    )
  
    const [
      password,
      setPassword,
    ] = useState(
      "",
    )
  
    const [
      error,
      setError,
    ] =
      useState<string | null>(
        null,
      )
  
    const [
      submitting,
      setSubmitting,
    ] =
      useState(false)
  
  
    if (
      isAuthenticated
    ) {
      return (
        <Navigate
          to="/command-center"
          replace
        />
      )
    }
  
  
    async function submit(
      event: FormEvent,
    ) {
      event.preventDefault()
  
      setSubmitting(true)
      setError(null)
  
      try {
        await login(
          email,
          password,
        )
  
        const state =
          location.state as
            | {
                from?: string
              }
            | null
  
        navigate(
          state?.from ??
            "/command-center",
          {
            replace: true,
          },
        )
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setError(
            error.message,
          )
        } else {
          setError(
            "Unable to sign in.",
          )
        }
      } finally {
        setSubmitting(false)
      }
    }
  
  
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-5 py-10">
  
        <div className="pointer-events-none absolute -left-48 -top-48 h-[520px] w-[520px] rounded-full bg-violet-600/15 blur-[130px]" />
  
        <div className="pointer-events-none absolute -bottom-48 -right-48 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[130px]" />
  
  
        <div className="relative grid w-full max-w-[1080px] overflow-hidden rounded-[34px] border border-white/[0.10] bg-[#0A1024]/95 shadow-[0_40px_120px_rgba(0,0,0,0.55)] lg:grid-cols-[1.05fr_0.95fr]">
  
          {/* BRAND PANEL */}
  
          <div className="relative overflow-hidden border-b border-white/[0.08] bg-[linear-gradient(145deg,rgba(44,32,99,0.78),rgba(7,19,42,0.9))] p-9 lg:border-b-0 lg:border-r lg:p-12">
  
            <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
  
            <div className="relative">
  
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/[0.08] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-100">
  
                <Activity className="h-3.5 w-3.5" />
  
                Healthcare Command System
  
              </div>
  
              <h1 className="mt-9 text-[48px] font-semibold tracking-[-0.055em] text-white">
  
                Queue
                <span className="text-cyan-300">
                  Pulse
                </span>{" "}
                <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  AI
                </span>
  
              </h1>
  
              <p className="mt-5 max-w-md text-[14px] leading-7 text-[#C8D3E2]">
  
                Secure OPD queue intelligence for hospital operations, triage and clinical teams.
  
              </p>
  
  
              <div className="mt-10 space-y-3">
  
                <Feature
                  icon={
                    BrainCircuit
                  }
                  title="Monte Carlo Forecasting"
                  description="Live probabilistic waiting-time predictions."
                />
  
                <Feature
                  icon={
                    ShieldCheck
                  }
                  title="Role-Based Access"
                  description="Clinical actions restricted to authorized staff."
                />
  
                <Feature
                  icon={
                    LockKeyhole
                  }
                  title="Auditable Operations"
                  description="Sensitive queue actions are recorded."
                />
  
              </div>
  
            </div>
  
          </div>
  
  
          {/* LOGIN */}
  
          <div className="p-8 sm:p-10 lg:p-12">
  
            <div className="mx-auto max-w-[390px]">
  
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
  
                <LockKeyhole className="h-5 w-5 text-violet-200" />
  
              </div>
  
              <h2 className="mt-7 text-[30px] font-semibold tracking-[-0.04em] text-white">
  
                Staff sign in
  
              </h2>
  
              <p className="mt-2 text-[12px] leading-6 text-[#98A7BA]">
  
                Authenticate with your QueuePulse hospital staff account.
  
              </p>
  
  
              <form
                onSubmit={
                  submit
                }
                className="mt-8 space-y-5"
              >
  
                <div>
  
                  <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#BDC9D8]">
  
                    Email
  
                  </label>
  
                  <div className="mt-2 flex items-center rounded-xl border border-white/[0.10] bg-white/[0.035] px-4">
  
                    <UserRound className="h-4 w-4 shrink-0 text-[#79889B]" />
  
                    <input
                      type="email"
                      value={
                        email
                      }
                      onChange={(
                        event,
                      ) =>
                        setEmail(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="staff@queuepulse.local"
                      required
                      autoComplete="username"
                      className="w-full bg-transparent px-3 py-3.5 text-[12px] text-white outline-none placeholder:text-[#5F6C80]"
                    />
  
                  </div>
  
                </div>
  
  
                <div>
  
                  <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#BDC9D8]">
  
                    Password
  
                  </label>
  
                  <div className="mt-2 flex items-center rounded-xl border border-white/[0.10] bg-white/[0.035] px-4">
  
                    <LockKeyhole className="h-4 w-4 shrink-0 text-[#79889B]" />
  
                    <input
                      type="password"
                      value={
                        password
                      }
                      onChange={(
                        event,
                      ) =>
                        setPassword(
                          event
                            .target
                            .value,
                        )
                      }
                      required
                      autoComplete="current-password"
                      placeholder="Enter password"
                      className="w-full bg-transparent px-3 py-3.5 text-[12px] text-white outline-none placeholder:text-[#5F6C80]"
                    />
  
                  </div>
  
                </div>
  
  
                {error && (
                  <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.08] px-4 py-3 text-[11px] text-rose-100">
  
                    {error}
  
                  </div>
                )}
  
  
                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 px-5 py-3.5 text-[12px] font-semibold text-white shadow-[0_16px_40px_rgba(124,58,237,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
  
                  {submitting
                    ? "Authenticating..."
                    : "Enter Command Center"}
  
                  {!submitting && (
                    <ArrowRight className="h-4 w-4" />
                  )}
  
                </button>
  
              </form>
  
  
              <div className="mt-7 rounded-[18px] border border-white/[0.07] bg-white/[0.025] p-4">
  
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8999AD]">
  
                  Demo Security
  
                </p>
  
                <p className="mt-2 text-[10px] leading-5 text-[#AAB7C8]">
  
                  Access permissions are enforced by the FastAPI backend, not only by the user interface.
  
                </p>
  
              </div>
  
            </div>
  
          </div>
  
        </div>
  
      </div>
    )
  }
  
  
  function Feature({
    icon: Icon,
    title,
    description,
  }: {
    icon: typeof Activity
    title: string
    description: string
  }) {
    return (
      <div className="flex items-start gap-4 rounded-[20px] border border-white/[0.08] bg-white/[0.035] p-4">
  
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
  
          <Icon className="h-4 w-4 text-cyan-200" />
  
        </div>
  
        <div>
  
          <p className="text-[11px] font-semibold text-white">
            {title}
          </p>
  
          <p className="mt-1 text-[10px] leading-5 text-[#9FAEC1]">
            {description}
          </p>
  
        </div>
  
      </div>
    )
  }