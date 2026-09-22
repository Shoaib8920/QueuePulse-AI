import type { ReactNode } from "react"

import {
  Activity,
  AlertTriangle,
  BellRing,
  Clock3,
  LockKeyhole,
  RadioTower,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  TimerReset,
  Zap,
} from "lucide-react"

import {
  useQueue,
  type QueuePatient,
  type QueueStatus,
} from "../context/QueueContext"

import {
  usePermissions,
} from "../hooks/usePermissions"

import {
  formatWait,
  getMedianWait,
} from "../lib/queueMetrics"


function getStatusStyle(
  status: QueueStatus,
) {
  switch (status) {
    case "SERVING":
      return "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"

    case "PRIORITY":
      return "border-rose-400/30 bg-rose-500/12 text-rose-200"

    case "READY":
      return "border-cyan-400/25 bg-cyan-500/10 text-cyan-200"

    case "CALLED":
      return "border-violet-400/25 bg-violet-500/10 text-violet-200"

    case "MISSED":
      return "border-yellow-400/25 bg-yellow-500/10 text-yellow-200"

    case "COMPLETED":
      return "border-slate-400/20 bg-slate-500/10 text-slate-300"

    default:
      return "border-white/10 bg-white/[0.04] text-[#D5DFEC]"
  }
}


function getEta(
  patient: QueuePatient,
) {
  if (
    patient.status ===
    "SERVING"
  ) {
    return "Now"
  }

  if (
    patient.status ===
    "COMPLETED"
  ) {
    return "Completed"
  }

  if (
    patient.status ===
    "MISSED"
  ) {
    return "Missed"
  }

  if (
    patient.etaMin === 0 &&
    patient.etaMax === 0
  ) {
    return "Calculating"
  }

  return `${patient.etaMin}–${patient.etaMax} min`
}


export default function LiveQueue() {
  const {
    queue,
    events,
    priorityInserted,
    forecastVersion,
    insertPriorityCase,
    resetDemo,
  } = useQueue()


  const {
    user,
    canInsertPriority,
    canResetDemo,
  } = usePermissions()


  const waitingCount =
    queue.filter(
      (patient) =>
        patient.status !==
          "COMPLETED" &&
        patient.status !==
          "MISSED" &&
        patient.status !==
          "SERVING",
    ).length


  const priorityCount =
    queue.filter(
      (patient) =>
        patient.isPriority &&
        patient.status !==
          "COMPLETED" &&
        patient.status !==
          "MISSED",
    ).length


  const medianWait =
    getMedianWait(
      queue,
    )


  return (
    <div className="space-y-6">

      {/* ================================================= */}
      {/* LIVE FORECAST CONTROL */}
      {/* ================================================= */}

      <section className="relative overflow-hidden rounded-[30px] border border-violet-400/15 bg-[linear-gradient(135deg,rgba(43,28,91,0.92),rgba(7,20,42,0.96))] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.30)]">

        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -left-20 bottom-[-100px] h-64 w-64 rounded-full bg-violet-500/12 blur-3xl" />


        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.20em] text-emerald-200">

                <RadioTower className="h-3.5 w-3.5" />

                Live Queue

              </span>


              <span className="rounded-full border border-cyan-400/15 bg-cyan-500/[0.06] px-3 py-1.5 text-[10px] font-semibold text-cyan-100">

                Forecast v
                {forecastVersion}

              </span>


              {user && (
                <span className="rounded-full border border-violet-400/15 bg-violet-500/[0.06] px-3 py-1.5 text-[10px] font-semibold text-violet-100">

                  {user.role
                    .replaceAll(
                      "_",
                      " ",
                    )
                    .toLowerCase()
                    .replace(
                      /\b\w/g,
                      (letter) =>
                        letter.toUpperCase(),
                    )}

                </span>
              )}

            </div>


            <h2 className="mt-5 bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[34px] font-semibold tracking-[-0.045em] text-transparent">

              Priority-aware Queue Simulation

            </h2>


            <p className="mt-3 max-w-2xl text-[13px] leading-7 text-[#C8D4E3]">

              Live OPD forecasts are generated from the QueuePulse Monte Carlo engine.

            </p>

          </div>


          {/* ========================================= */}
          {/* PERMISSION-AWARE ACTIONS */}
          {/* ========================================= */}

          <div className="flex flex-wrap gap-3">

            {canInsertPriority ? (
              <button
                type="button"
                onClick={
                  insertPriorityCase
                }
                disabled={
                  priorityInserted
                }
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[12px] font-semibold transition ${
                  priorityInserted
                    ? "cursor-not-allowed border border-white/10 bg-white/[0.04] text-[#78869B]"
                    : "bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 text-white shadow-[0_14px_35px_rgba(225,29,72,0.24)] hover:scale-[1.02]"
                }`}
              >

                <ShieldAlert className="h-4 w-4" />

                {priorityInserted
                  ? "Priority Case Inserted"
                  : "Insert Priority Case"}

              </button>
            ) : (
              <RestrictedAction
                label="Priority insertion"
              />
            )}


            {canResetDemo ? (
              <button
                type="button"
                onClick={
                  resetDemo
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-[12px] font-semibold text-[#DCE5F1] transition hover:border-cyan-400/20 hover:bg-cyan-500/[0.06]"
              >

                <RefreshCcw className="h-4 w-4" />

                Reset Demo

              </button>
            ) : null}

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* METRICS */}
      {/* ================================================= */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          label="Patients Waiting"
          value={String(
            waitingCount,
          ).padStart(
            2,
            "0",
          )}
          note="Current active queue"
          icon={Activity}
          accent="violet"
        />


        <MetricCard
          label="Priority Cases"
          value={String(
            priorityCount,
          ).padStart(
            2,
            "0",
          )}
          note={
            priorityCount > 0
              ? "Active triage priority"
              : "No active priority"
          }
          icon={
            ShieldAlert
          }
          accent="rose"
        />


        <MetricCard
          label="Median Wait"
          value={
            formatWait(
              medianWait,
            )
          }
          note="Live Monte Carlo estimate"
          icon={Clock3}
          accent="cyan"
        />


        <MetricCard
          label="Forecast Version"
          value={`v${forecastVersion}`}
          note="Latest backend forecast"
          icon={Sparkles}
          accent="emerald"
        />

      </section>


      {/* ================================================= */}
      {/* QUEUE + EVENT FEED */}
      {/* ================================================= */}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">

        {/* ACTIVE QUEUE */}

        <div className="overflow-hidden rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94 shadow-[0_25px_70px_rgba(0,0,0,0.24)]">

          <div className="flex items-center justify-between border-b border-white/[0.08] p-6">

            <div>

              <div className="flex items-center gap-2">

                <Activity className="h-4 w-4 text-cyan-300" />

                <h3 className="text-[19px] font-semibold text-white">

                  Active Queue

                </h3>

              </div>


              <p className="mt-2 text-[11px] text-[#95A4B8]">

                General Medicine · Room 201 · Dr. Meera Shah

              </p>

            </div>


            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-[10px] font-semibold text-violet-100">

              {waitingCount} waiting

            </span>

          </div>


          {/* TABLE HEADER */}

          <div className="grid grid-cols-[110px_1fr_150px_160px_130px] gap-4 border-b border-white/[0.07] bg-white/[0.018] px-6 py-4">

            <Header>
              Token
            </Header>

            <Header>
              Patient Flow
            </Header>

            <Header>
              Status
            </Header>

            <Header>
              Forecast
            </Header>

            <Header>
              Model
            </Header>

          </div>


          {/* QUEUE ROWS */}

          <div className="divide-y divide-white/[0.07]">

            {queue.map(
              (
                patient,
                index,
              ) => (
                <div
                  key={patient.id}
                  className={`relative grid grid-cols-[110px_1fr_150px_160px_130px] items-center gap-4 px-6 py-5 transition-all duration-300 ${
                    patient.isPriority
                      ? "bg-gradient-to-r from-rose-500/[0.08] via-fuchsia-500/[0.04] to-transparent"
                      : "hover:bg-white/[0.02]"
                  }`}
                >

                  {patient.isPriority && (
                    <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-gradient-to-b from-rose-400 to-fuchsia-400 shadow-[0_0_10px_rgba(251,113,133,0.7)]" />
                  )}


                  {/* TOKEN */}

                  <div>

                    <p
                      className={`text-[20px] font-semibold ${
                        patient.isPriority
                          ? "text-rose-100"
                          : "text-white"
                      }`}
                    >

                      {patient.token}

                    </p>


                    <p className="mt-1 text-[9px] text-[#78879C]">

                      #{index + 1}

                    </p>

                  </div>


                  {/* PATIENT FLOW */}

                  <div>

                    <p className="text-[12px] font-medium text-[#DCE5F1]">

                      {patient.department}

                    </p>


                    <p className="mt-1 text-[10px] text-[#8796AA]">

                      {patient.note}

                    </p>

                  </div>


                  {/* STATUS */}

                  <div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[9px] font-semibold ${getStatusStyle(
                        patient.status,
                      )}`}
                    >

                      {patient.status}

                    </span>

                  </div>


                  {/* FORECAST */}

                  <p
                    className={`text-[12px] font-semibold ${
                      patient.status ===
                      "SERVING"
                        ? "text-emerald-200"
                        : patient.isPriority
                        ? "text-rose-200"
                        : "text-[#DCE5F1]"
                    }`}
                  >

                    {getEta(
                      patient,
                    )}

                  </p>


                  {/* MODEL */}

                  <div>

                    {patient.status ===
                    "SERVING" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-500/[0.06] px-2.5 py-1.5 text-[9px] font-semibold text-emerald-200">

                        <Activity className="h-3 w-3" />

                        LIVE

                      </span>
                    ) : patient.isPriority ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/15 bg-rose-500/[0.06] px-2.5 py-1.5 text-[9px] font-semibold text-rose-200">

                        <Zap className="h-3 w-3" />

                        PRIORITY

                      </span>
                    ) : patient.status !==
                        "COMPLETED" &&
                      patient.status !==
                        "MISSED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/15 bg-cyan-500/[0.06] px-2.5 py-1.5 text-[9px] font-semibold text-cyan-200">

                        <TimerReset className="h-3 w-3" />

                        FORECAST

                      </span>
                    ) : (
                      <span className="text-[10px] text-[#66758A]">

                        —

                      </span>
                    )}

                  </div>

                </div>
              ),
            )}

          </div>

        </div>


        {/* EVENT FEED */}

        <div className="rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94 p-5 shadow-[0_25px_70px_rgba(0,0,0,0.24)]">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">

                Live Event Feed

              </p>


              <h3 className="mt-2 text-[19px] font-semibold text-white">

                Queue Intelligence

              </h3>

            </div>


            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-500/[0.07]">

              <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400/30" />

              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />

            </div>

          </div>


          <div className="mt-5 space-y-3">

            {events.length ===
            0 ? (
              <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.025] p-5">

                <p className="text-[10px] text-[#8FA0B5]">

                  Waiting for queue events...

                </p>

              </div>
            ) : (
              events.map(
                (event) => (
                  <div
                    key={event.id}
                    className={`rounded-[20px] border p-4 ${
                      event.type ===
                      "priority"
                        ? "border-rose-400/15 bg-rose-500/[0.06]"
                        : event.type ===
                          "forecast"
                        ? "border-cyan-400/15 bg-cyan-500/[0.06]"
                        : event.type ===
                          "doctor"
                        ? "border-violet-400/15 bg-violet-500/[0.05]"
                        : "border-white/[0.08] bg-white/[0.025]"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          event.type ===
                          "priority"
                            ? "bg-rose-500/12 text-rose-200"
                            : event.type ===
                              "forecast"
                            ? "bg-cyan-500/12 text-cyan-200"
                            : "bg-violet-500/12 text-violet-200"
                        }`}
                      >

                        {event.type ===
                        "priority" ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : event.type ===
                          "forecast" ? (
                          <Sparkles className="h-4 w-4" />
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}

                      </div>


                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="text-[11px] font-semibold text-white">

                            {event.title}

                          </p>


                          <span className="text-[9px] text-[#78869A]">

                            {event.time}

                          </span>

                        </div>


                        <p className="mt-2 text-[10px] leading-5 text-[#AEBBCD]">

                          {event.description}

                        </p>

                      </div>

                    </div>

                  </div>
                ),
              )
            )}

          </div>


          {priorityInserted && (
            <div className="mt-5 rounded-[20px] border border-emerald-400/15 bg-emerald-500/[0.05] p-4">

              <div className="flex items-start gap-3">

                <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />


                <div>

                  <p className="text-[11px] font-semibold text-emerald-100">

                    Patient forecast updated

                  </p>


                  <p className="mt-1 text-[10px] leading-5 text-[#B8C8C2]">

                    QueuePulse recalculated downstream waiting-time windows using the latest queue state.

                  </p>

                </div>

              </div>

            </div>
          )}

        </div>

      </section>

    </div>
  )
}


function RestrictedAction({
  label,
}: {
  label: string
}) {
  return (
    <div
      title={`Your role cannot perform ${label.toLowerCase()}.`}
      className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[10px] font-semibold text-[#77869A]"
    >

      <LockKeyhole className="h-3.5 w-3.5" />

      Restricted

    </div>
  )
}


function Header({
  children,
}: {
  children: ReactNode
}) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A8B5C7]">

      {children}

    </p>
  )
}


function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  note: string

  icon: typeof Activity

  accent:
    | "violet"
    | "rose"
    | "cyan"
    | "emerald"
}) {
  const styles = {
    violet:
      "bg-violet-500/12 text-violet-200",

    rose:
      "bg-rose-500/12 text-rose-200",

    cyan:
      "bg-cyan-500/12 text-cyan-200",

    emerald:
      "bg-emerald-500/12 text-emerald-200",
  }


  return (
    <div className="rounded-[24px] border border-white/[0.09] bg-white/[0.03] p-5 transition hover:border-white/[0.15]">

      <div className="flex items-start justify-between">

        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#DDE7F3]">

          {label}

        </p>


        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}
        >

          <Icon className="h-4 w-4" />

        </div>

      </div>


      <p className="mt-4 text-[32px] font-semibold tracking-[-0.04em] text-white">

        {value}

      </p>


      <p className="mt-2 text-[10px] font-medium text-[#AAB7C9]">

        {note}

      </p>

    </div>
  )
}