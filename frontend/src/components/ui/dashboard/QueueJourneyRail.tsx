import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock3,
  HeartPulse,
  RadioTower,
  Sparkles,
  Stethoscope,
  TimerReset,
  Zap,
} from "lucide-react"

type QueueNodeStatus =
  | "serving"
  | "priority"
  | "ready"
  | "waiting"

type QueueNode = {
  token: string
  status: QueueNodeStatus
  title: string
  eta: string
  note: string
}

const queueNodes: QueueNode[] = [
  {
    token: "G-31",
    status: "serving",
    title: "Now Serving",
    eta: "Now",
    note: "Consultation in progress",
  },
  {
    token: "P1-07",
    status: "priority",
    title: "Priority Insert",
    eta: "Inserted 12:08",
    note: "Urgent triage case",
  },
  {
    token: "G-32",
    status: "ready",
    title: "Ready Next",
    eta: "8–12 min",
    note: "Prepare arrival",
  },
  {
    token: "G-33",
    status: "waiting",
    title: "Forecast Updated",
    eta: "18–25 min",
    note: "ETA refreshed",
  },
  {
    token: "G-34",
    status: "waiting",
    title: "Waiting",
    eta: "27–34 min",
    note: "Downstream shift",
  },
]

const majorGradient =
  "bg-gradient-to-r from-white via-[#CFF7FF] via-[#62D9FF] to-[#C084FC] bg-clip-text text-transparent"

const cyanGradient =
  "bg-gradient-to-r from-[#BFF8FF] via-[#5FE5FF] to-[#8B9CFF] bg-clip-text text-transparent"

const purpleGradient =
  "bg-gradient-to-r from-[#F0E7FF] via-[#C4B5FD] to-[#E879F9] bg-clip-text text-transparent"

const labelStyle =
  "text-[10px] font-bold uppercase tracking-[0.22em] text-[#E2ECF8]"

const statusStyles: Record<
  QueueNodeStatus,
  {
    border: string
    bg: string
    glow: string
    badge: string
    badgeText: string
    titleText: string
    tokenGlow: string
    dot: string
  }
> = {
  serving: {
    border: "border-emerald-400/40",
    bg: "bg-emerald-500/[0.09]",
    glow:
      "shadow-[0_0_45px_rgba(16,185,129,0.13)]",
    badge:
      "bg-emerald-500/18 border-emerald-400/35",
    badgeText:
      "text-emerald-200",
    titleText:
      "text-emerald-200",
    tokenGlow:
      "from-emerald-400/24 to-cyan-400/12",
    dot:
      "bg-emerald-400",
  },

  priority: {
    border:
      "border-rose-400/40",
    bg:
      "bg-rose-500/[0.10]",
    glow:
      "shadow-[0_0_50px_rgba(244,63,94,0.16)]",
    badge:
      "bg-rose-500/18 border-rose-400/35",
    badgeText:
      "text-rose-200",
    titleText:
      "text-rose-200",
    tokenGlow:
      "from-rose-400/24 to-fuchsia-400/12",
    dot:
      "bg-rose-400",
  },

  ready: {
    border:
      "border-cyan-400/40",
    bg:
      "bg-cyan-500/[0.10]",
    glow:
      "shadow-[0_0_50px_rgba(34,211,238,0.14)]",
    badge:
      "bg-cyan-500/18 border-cyan-400/35",
    badgeText:
      "text-cyan-200",
    titleText:
      "text-cyan-200",
    tokenGlow:
      "from-cyan-400/24 to-sky-400/12",
    dot:
      "bg-cyan-400",
  },

  waiting: {
    border:
      "border-slate-400/22",
    bg:
      "bg-white/[0.035]",
    glow:
      "shadow-none",
    badge:
      "bg-slate-500/12 border-slate-400/22",
    badgeText:
      "text-slate-100",
    titleText:
      "text-slate-100",
    tokenGlow:
      "from-slate-500/14 to-slate-400/7",
    dot:
      "bg-slate-300",
  },
}

function getConnectorStyle(
  index: number,
) {
  if (index === 0) {
    return "from-emerald-400/35 via-cyan-400/30 to-rose-400/25"
  }

  if (index === 1) {
    return "from-rose-400/35 via-violet-400/35 to-cyan-400/30"
  }

  if (index === 2) {
    return "from-cyan-400/30 via-fuchsia-400/25 to-slate-400/20"
  }

  return "from-slate-400/20 via-slate-400/15 to-slate-400/15"
}

export default function QueueJourneyRail() {
  return (
    <section className="overflow-hidden rounded-[34px] border border-white/12 bg-[linear-gradient(135deg,rgba(30,22,67,0.98),rgba(8,12,30,0.98))] shadow-[0_28px_80px_rgba(2,6,23,0.48)] backdrop-blur-xl">

      <div className="grid xl:grid-cols-[250px_minmax(0,1fr)_280px]">

        {/* LEFT PANEL */}

        <div className="border-b border-white/10 p-6 xl:border-b-0 xl:border-r">

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.19em] text-emerald-200">

            <RadioTower className="h-3.5 w-3.5" />

            Now Serving

          </div>

          <div className="mt-7">

            <p
              className={`text-[72px] font-semibold leading-none tracking-[-0.07em] ${cyanGradient}`}
            >
              G-31
            </p>

          </div>

          <div className="mt-5 space-y-1.5">

            <p
              className={`text-[22px] font-semibold ${majorGradient}`}
            >
              General Medicine
            </p>

            <p className="text-[14px] font-medium text-[#D3DCE9]">
              Dr. Meera Shah
            </p>

            <p className="text-[13px] font-medium text-[#B8C5D6]">
              Room 201
            </p>

          </div>

          <div className="mt-8 rounded-[22px] border border-emerald-400/25 bg-emerald-500/12 px-5 py-4">

            <p className="text-[13px] font-semibold text-emerald-100">
              Consultation in progress
            </p>

          </div>

          <div className="mt-5 grid gap-3">

            <div className="rounded-2xl border border-white/12 bg-white/[0.045] p-4">

              <p className={labelStyle}>
                Elapsed Time
              </p>

              <p className="mt-2 text-[19px] font-semibold text-white">
                08:42 min
              </p>

            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.045] p-4">

              <p className={labelStyle}>
                Queue State
              </p>

              <p
                className={`mt-2 text-[16px] font-semibold ${cyanGradient}`}
              >
                Auto Re-Forecasting
              </p>

            </div>

          </div>

        </div>

        {/* CENTER PANEL */}

        <div className="border-b border-white/10 p-6 xl:border-b-0 xl:border-r">

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.20em] text-cyan-200">

                <Sparkles className="h-3.5 w-3.5" />

                Live Queue Journey

              </div>

              <h2
                className={`mt-4 text-[34px] font-semibold tracking-[-0.045em] ${majorGradient}`}
              >
                Priority-aware queue sequence
              </h2>

              <p className="mt-3 max-w-2xl text-[13px] leading-7 text-[#D0D9E7]">

                Live patient flow with priority insertion and automatic
                downstream ETA recalculation.

              </p>

            </div>

            <div className="inline-flex h-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-4 py-2 text-[12px] font-medium text-[#E5EBF4]">

              <Activity className="h-4 w-4 text-violet-200" />

              42 waiting

            </div>

          </div>

          {/* QUEUE CARDS */}

          <div className="mt-8 overflow-x-auto pb-2">

            <div className="min-w-[1080px] rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-6">

              <div className="relative flex items-start">

                {queueNodes.map(
                  (node, index) => {
                    const styles =
                      statusStyles[
                        node.status
                      ]

                    return (
                      <div
                        key={node.token}
                        className="flex items-start"
                      >

                        <div className="w-[184px]">

                          {node.status ===
                          "priority" ? (
                            <div className="mb-3 inline-flex items-center gap-1 rounded-full border border-rose-400/35 bg-rose-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.17em] text-rose-100">

                              <AlertTriangle className="h-3 w-3" />

                              Queue Changed

                            </div>
                          ) : (
                            <div className="mb-3 h-[28px]" />
                          )}

                          <div
                            className={[
                              "relative overflow-hidden rounded-[28px] border p-4",
                              styles.border,
                              styles.bg,
                              styles.glow,
                            ].join(" ")}
                          >

                            <div
                              className={`absolute inset-0 rounded-[28px] bg-gradient-to-br ${styles.tokenGlow} opacity-80`}
                            />

                            <div className="relative">

                              <div className="flex items-start justify-between">

                                <div
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.17em] ${styles.badge} ${styles.badgeText}`}
                                >

                                  <span
                                    className={`h-2 w-2 rounded-full ${styles.dot}`}
                                  />

                                  {node.title}

                                </div>

                                {node.status ===
                                  "priority" && (
                                  <div className="rounded-full border border-rose-400/35 bg-rose-500/15 p-2">

                                    <Zap className="h-4 w-4 text-rose-200" />

                                  </div>
                                )}

                              </div>

                              <p
                                className={`mt-5 text-[36px] font-semibold tracking-[-0.04em] ${
                                  node.status ===
                                  "priority"
                                    ? purpleGradient
                                    : majorGradient
                                }`}
                              >
                                {node.token}
                              </p>

                              <div className="mt-5 space-y-2">

                                <p
                                  className={`text-[13px] font-semibold ${styles.titleText}`}
                                >
                                  {node.eta}
                                </p>

                                <p className="text-[12px] font-medium text-[#D0D8E5]">
                                  {node.note}
                                </p>

                              </div>

                            </div>

                          </div>

                        </div>

                        {index <
                          queueNodes.length -
                            1 && (
                          <div className="mx-3 flex h-[210px] w-[72px] items-center justify-center">

                            <div className="relative flex w-full flex-col items-center">

                              <div
                                className={`h-[52px] w-[64px] rounded-[18px] border border-white/15 bg-gradient-to-r ${getConnectorStyle(
                                  index,
                                )} p-[1px]`}
                              >

                                <div className="flex h-full w-full items-center justify-center rounded-[17px] bg-[#141833]/95">

                                  <ArrowRight className="h-5 w-5 text-white" />

                                </div>

                              </div>

                              <div className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C0CCDC]">

                                {index === 0 &&
                                  "Live handoff"}

                                {index === 1 &&
                                  "Priority impact"}

                                {index === 2 &&
                                  "ETA refresh"}

                                {index === 3 &&
                                  "Queue shift"}

                              </div>

                            </div>

                          </div>
                        )}

                      </div>
                    )
                  },
                )}

              </div>

            </div>

          </div>

          {/* EVENT CARDS */}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">

            <div className="rounded-[26px] border border-violet-400/20 bg-[linear-gradient(180deg,rgba(100,60,255,0.10),rgba(255,255,255,0.025))] p-5">

              <p className={labelStyle}>
                Queue Event
              </p>

              <p
                className={`mt-4 text-[18px] font-semibold ${purpleGradient}`}
              >
                P1-07 inserted at 12:08 PM
              </p>

              <p className="mt-2 text-[12px] leading-6 text-[#D2DBE8]">
                Emergency patient inserted by authorized triage staff.
              </p>

            </div>

            <div className="rounded-[26px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,54,95,0.22),rgba(255,255,255,0.025))] p-5">

              <p className={labelStyle}>
                Re-Forecast Action
              </p>

              <p
                className={`mt-4 text-[18px] font-semibold ${cyanGradient}`}
              >
                Downstream ETAs recalculated
              </p>

              <p className="mt-2 text-[12px] leading-6 text-[#D2DBE8]">
                Affected patients were identified and their arrival windows updated.
              </p>

            </div>

          </div>

        </div>

        {/* RIGHT PANEL */}

        <div className="p-6">

          <div className="flex items-start justify-between">

            <div>

              <p className={labelStyle}>
                Forecast Health
              </p>

              <h3
                className={`mt-3 text-[28px] font-semibold leading-tight ${majorGradient}`}
              >
                Stable and
                <br />
                reliable
              </h3>

            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-full border-[4px] border-cyan-400/80 border-r-violet-400 border-t-violet-400 bg-white/[0.055] shadow-[0_0_40px_rgba(34,211,238,0.16)]">

              <div className="text-center">

                <p className="text-[23px] font-bold text-white">
                  86%
                </p>

                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                  High
                </p>

              </div>

            </div>

          </div>

          <div className="mt-8 space-y-4">

            <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-4">

              <div className="flex items-center gap-2">

                <Clock3 className="h-4 w-4 text-cyan-200" />

                <p className={labelStyle}>
                  Median Wait
                </p>

              </div>

              <p
                className={`mt-3 text-[30px] font-semibold ${cyanGradient}`}
              >
                24 min
              </p>

            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-4">

              <div className="flex items-center gap-2">

                <TimerReset className="h-4 w-4 text-yellow-200" />

                <p className={labelStyle}>
                  Queue Volatility
                </p>

              </div>

              <p className="mt-3 text-[26px] font-semibold text-yellow-200">
                Medium
              </p>

            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-4">

              <div className="flex items-center gap-2">

                <HeartPulse className="h-4 w-4 text-violet-200" />

                <p className={labelStyle}>
                  Last Recalculation
                </p>

              </div>

              <p
                className={`mt-3 text-[25px] font-semibold ${purpleGradient}`}
              >
                12:08 PM
              </p>

            </div>

            <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-4">

              <div className="flex items-center gap-2">

                <Stethoscope className="h-4 w-4 text-emerald-200" />

                <p className={labelStyle}>
                  ETA Confidence Band
                </p>

              </div>

              <p
                className={`mt-3 text-[25px] font-semibold ${majorGradient}`}
              >
                ± 4 min
              </p>

            </div>

          </div>

          {/* NOTICE */}

          <div className="mt-5 rounded-[24px] border border-amber-400/20 bg-amber-500/[0.07] p-4">

            <div className="flex gap-3">

              <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-200" />

              <div>

                <p className="text-[12px] font-semibold text-amber-100">
                  Priority insertion detected
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#E1D6B4]">
                  Selected downstream ETAs increased after P1-07 entered the queue.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}