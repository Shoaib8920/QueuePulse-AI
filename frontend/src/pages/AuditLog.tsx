import {
    Activity,
    Clock3,
    FileClock,
    RefreshCcw,
    ShieldCheck,
    UserRound,
  } from "lucide-react"
  
  import {
    Navigate,
  } from "react-router-dom"
  
  import {
    useQuery,
  } from "@tanstack/react-query"
  
  import {
    usePermissions,
  } from "../hooks/usePermissions"
  
  import {
    queueApi,
  } from "../lib/api"
  
  
  function formatRole(
    role?: string | null,
  ) {
    if (!role) {
      return "System"
    }
  
    return role
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ")
  }
  
  
  function formatAction(
    action: string,
  ) {
    return action
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ")
  }
  
  
  function formatDateTime(
    timestamp: string,
  ) {
    return new Date(
      timestamp,
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      },
    )
  }
  
  
  function getActionStyle(
    action: string,
  ) {
    const value =
      action.toUpperCase()
  
    if (
      value.includes(
        "PRIORITY",
      )
    ) {
      return "border-rose-400/20 bg-rose-500/[0.07] text-rose-100"
    }
  
    if (
      value.includes(
        "CONSULTATION",
      )
    ) {
      return "border-cyan-400/20 bg-cyan-500/[0.07] text-cyan-100"
    }
  
    if (
      value.includes(
        "DOCTOR",
      )
    ) {
      return "border-violet-400/20 bg-violet-500/[0.07] text-violet-100"
    }
  
    if (
      value.includes(
        "AUTH",
      )
    ) {
      return "border-emerald-400/20 bg-emerald-500/[0.07] text-emerald-100"
    }
  
    return "border-white/[0.10] bg-white/[0.04] text-[#D5DFEC]"
  }
  
  
  export default function AuditLog() {
    const {
      canViewAudit,
    } = usePermissions()
  
  
    const auditQuery =
      useQuery({
        queryKey: [
          "audit",
        ],
  
        queryFn:
          () =>
            queueApi.getAuditLog(
              100,
            ),
  
        refetchInterval:
          5000,
      })
  
  
    if (
      !canViewAudit
    ) {
      return (
        <Navigate
          to="/command-center"
          replace
        />
      )
    }
  
  
    const auditEvents =
      auditQuery.data ?? []
  
  
    return (
      <div className="space-y-6">
  
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}
  
        <section className="relative overflow-hidden rounded-[30px] border border-violet-400/15 bg-[linear-gradient(135deg,rgba(35,28,80,0.96),rgba(7,18,40,0.97))] p-7">
  
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
  
          <div className="relative flex flex-wrap items-start justify-between gap-6">
  
            <div>
  
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.20em] text-violet-100">
  
                <ShieldCheck className="h-3.5 w-3.5" />
  
                Protected Audit Trail
  
              </div>
  
  
              <h2 className="mt-5 bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[34px] font-semibold tracking-[-0.045em] text-transparent">
  
                Hospital Operations Audit Log
  
              </h2>
  
  
              <p className="mt-3 max-w-2xl text-[13px] leading-7 text-[#C7D2E1]">
  
                Track sensitive QueuePulse actions, staff identities,
                affected resources and operational timestamps.
  
              </p>
  
            </div>
  
  
            <button
              type="button"
              onClick={
                () =>
                  auditQuery.refetch()
              }
              disabled={
                auditQuery.isFetching
              }
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.07] px-4 py-3 text-[11px] font-semibold text-cyan-100 transition hover:bg-cyan-500/[0.12] disabled:opacity-50"
            >
  
              <RefreshCcw
                className={`h-4 w-4 ${
                  auditQuery.isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />
  
              Refresh
  
            </button>
  
          </div>
  
        </section>
  
  
        {/* ================================================= */}
        {/* METRICS */}
        {/* ================================================= */}
  
        <section className="grid gap-4 md:grid-cols-3">
  
          <Metric
            label="Audit Records"
            value={String(
              auditEvents.length,
            )}
            note="Latest loaded records"
            icon={FileClock}
          />
  
  
          <Metric
            label="Security"
            value="RBAC"
            note="Role-based access enforced"
            icon={ShieldCheck}
          />
  
  
          <Metric
            label="Refresh"
            value="5s"
            note="Automatic audit synchronization"
            icon={Activity}
          />
  
        </section>
  
  
        {/* ================================================= */}
        {/* AUDIT TABLE */}
        {/* ================================================= */}
  
        <section className="overflow-hidden rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94">
  
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] p-6">
  
            <div>
  
              <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">
  
                Security History
  
              </p>
  
  
              <h3 className="mt-2 text-[19px] font-semibold text-white">
  
                Recent staff actions
  
              </h3>
  
            </div>
  
  
            <span className="rounded-full border border-emerald-400/15 bg-emerald-500/[0.07] px-3 py-1.5 text-[9px] font-semibold text-emerald-100">
  
              Audit service active
  
            </span>
  
          </div>
  
  
          {auditQuery.isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center">
  
              <div className="text-center">
  
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
  
                <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#91A0B4]">
  
                  Loading audit events
  
                </p>
  
              </div>
  
            </div>
          ) : auditQuery.isError ? (
            <div className="p-8">
  
              <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/[0.07] p-5">
  
                <p className="text-[12px] font-semibold text-rose-100">
  
                  Unable to load audit log.
  
                </p>
  
                <p className="mt-2 text-[10px] text-[#D5B9C2]">
  
                  Check your authentication and backend connection.
  
                </p>
  
              </div>
  
            </div>
          ) : auditEvents.length ===
            0 ? (
            <div className="p-8">
  
              <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.025] p-6 text-center">
  
                <FileClock className="mx-auto h-5 w-5 text-[#8190A4]" />
  
                <p className="mt-3 text-[11px] font-semibold text-white">
  
                  No audit records yet
  
                </p>
  
                <p className="mt-2 text-[10px] text-[#8E9DB1]">
  
                  Sensitive hospital actions will appear here.
  
                </p>
  
              </div>
  
            </div>
          ) : (
            <>
  
              {/* HEADER */}
  
              <div className="grid grid-cols-[190px_170px_1fr_160px_160px] gap-4 border-b border-white/[0.07] bg-white/[0.018] px-6 py-4">
  
                <Header>
                  Time
                </Header>
  
                <Header>
                  Action
                </Header>
  
                <Header>
                  Staff
                </Header>
  
                <Header>
                  Role
                </Header>
  
                <Header>
                  Resource
                </Header>
  
              </div>
  
  
              {/* ROWS */}
  
              <div className="divide-y divide-white/[0.07]">
  
                {auditEvents.map(
                  (
                    event,
                  ) => (
                    <div
                      key={
                        event.id
                      }
                      className="grid grid-cols-[190px_170px_1fr_160px_160px] items-center gap-4 px-6 py-5 transition hover:bg-white/[0.02]"
                    >
  
                      {/* TIME */}
  
                      <div className="flex items-center gap-2">
  
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#8291A5]" />
  
                        <p className="text-[9px] text-[#A7B4C6]">
  
                          {formatDateTime(
                            event.created_at,
                          )}
  
                        </p>
  
                      </div>
  
  
                      {/* ACTION */}
  
                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-[8px] font-bold ${getActionStyle(
                          event.action,
                        )}`}
                      >
  
                        {formatAction(
                          event.action,
                        )}
  
                      </span>
  
  
                      {/* STAFF */}
  
                      <div className="flex min-w-0 items-center gap-3">
  
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
  
                          <UserRound className="h-4 w-4 text-violet-200" />
  
                        </div>
  
  
                        <div className="min-w-0">
  
                          <p className="truncate text-[11px] font-semibold text-white">
  
                            {event.actor_name ??
                              "System"}
  
                          </p>
  
                          <p className="mt-1 truncate text-[9px] text-[#7F8FA4]">
  
                            {event.actor_email ??
                              "QueuePulse system"}
  
                          </p>
  
                        </div>
  
                      </div>
  
  
                      {/* ROLE */}
  
                      <p className="text-[9px] font-semibold text-cyan-100">
  
                        {formatRole(
                          event.actor_role,
                        )}
  
                      </p>
  
  
                      {/* RESOURCE */}
  
                      <div>
  
                        <p className="text-[9px] font-semibold text-[#D7E0EC]">
  
                          {event.entity_type}
  
                        </p>
  
                        <p className="mt-1 max-w-[140px] truncate text-[8px] text-[#75859A]">
  
                          {event.entity_id ??
                            "—"}
  
                        </p>
  
                      </div>
  
                    </div>
                  ),
                )}
  
              </div>
  
            </>
          )}
  
        </section>
  
      </div>
    )
  }
  
  
  function Header({
    children,
  }: {
    children: string
  }) {
    return (
      <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#9FADBF]">
  
        {children}
  
      </p>
    )
  }
  
  
  function Metric({
    label,
    value,
    note,
    icon: Icon,
  }: {
    label: string
    value: string
    note: string
    icon: typeof FileClock
  }) {
    return (
      <div className="rounded-[24px] border border-white/[0.09] bg-white/[0.03] p-5">
  
        <div className="flex items-start justify-between">
  
          <div>
  
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#B6C3D4]">
  
              {label}
  
            </p>
  
            <p className="mt-3 text-[27px] font-semibold text-white">
  
              {value}
  
            </p>
  
            <p className="mt-1 text-[9px] text-[#8C9BAF]">
  
              {note}
  
            </p>
  
          </div>
  
  
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-200">
  
            <Icon className="h-4 w-4" />
  
          </div>
  
        </div>
  
      </div>
    )
  }