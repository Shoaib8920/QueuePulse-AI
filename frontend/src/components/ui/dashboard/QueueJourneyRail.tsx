import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock3,
  RadioTower,
  Sparkles,
  TimerReset,
  Zap,
} from "lucide-react"

import {
  useQueue,
  type QueuePatient,
} from "../../../context/QueueContext"

function getPatientAccent(
  patient: QueuePatient,
) {
  if (
    patient.status === "SERVING"
  ) {
    return {
      border:
        "border-emerald-400/30",

      background:
        "from-emerald-500/[0.13] to-cyan-500/[0.05]",

      badge:
        "border-emerald-400/25 bg-emerald-500/12 text-emerald-200",

      token:
        "text-emerald-50",

      dot:
        "bg-emerald-400",
    }
  }

  if (
    patient.isPriority
  ) {
    return {
      border:
        "border-rose-400/35",

      background:
        "from-rose-500/[0.16] to-fuchsia-500/[0.07]",

      badge:
        "border-rose-400/25 bg-rose-500/12 text-rose-200",

      token:
        "text-rose-100",

      dot:
        "bg-rose-400",
    }
  }

  if (
    patient.status === "READY"
  ) {
    return {
      border:
        "border-cyan-400/30",

      background:
        "from-cyan-500/[0.13] to-blue-500/[0.05]",

      badge:
        "border-cyan-400/25 bg-cyan-500/12 text-cyan-200",

      token:
        "text-cyan-50",

      dot:
        "bg-cyan-400",
    }
  }

  return {
    border:
      "border-white/[0.10]",

    background:
      "from-white/[0.055] to-white/[0.02]",

    badge:
      "border-white/[0.10] bg-white/[0.05] text-[#D2DCE9]",

    token:
      "text-white",

    dot:
      "bg-[#8493A9]",
  }
}

function getEta(
  patient: QueuePatient,
) {
  if (
    patient.status === "SERVING"
  ) {
    return "Now"
  }

  if (
    patient.status === "PRIORITY"
  ) {
    return "Immediate"
  }

  return `${patient.etaMin}–${patient.etaMax} min`
}

export default function QueueJourneyRail() {
  const {
    queue,
    priorityInserted,
    forecastVersion,
  } = useQueue()

  const visibleQueue =
    queue.slice(
      0,
      5,
    )

  const currentPatient =
    queue.find(
      (patient) =>
        patient.status ===
        "SERVING",
    )

  return (
    <section className="overflow-hidden rounded-[30px] border border-white/[0.10] bg-[linear-gradient(135deg,rgba(29,21,66,0.96),rgba(8,13,31,0.98))]">

      <div className="grid xl:grid-cols-[240px_minmax(0,1fr)_270px]">

        {/* LEFT */}

        <div className="border-b border-white/[0.08] p-6 xl:border-b-0 xl:border-r">

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.20em] text-emerald-200">

            <RadioTower className="h-3.5 w-3.5" />

            Now Serving

          </div>

          <p className="mt-7 text-[64px] font-semibold leading-none tracking-[-0.065em] text-white">

            {currentPatient?.token ??
              "—"}

          </p>

          <p className="mt-5 text-[17px] font-semibold text-[#E3EAF4]">

            General Medicine

          </p>

          <p className="mt-2 text-[12px] text-[#9FAEC2]">

            Dr. Meera Shah

          </p>

          <p className="mt-1 text-[11px] text-[#8291A5]">

            Room 201

          </p>

          <div className="mt-7 rounded-[20px] border border-emerald-400/20 bg-emerald-500/[0.07] p-4">

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">

              Consultation

            </p>

            <p className="mt-2 text-[13px] font-semibold text-white">

              In progress

            </p>

            <p className="mt-1 text-[10px] text-[#AFC5BE]">

              Elapsed 08:42

            </p>

          </div>

        </div>

        {/* CENTER */}

        <div className="border-b border-white/[0.08] p-6 xl:border-b-0 xl:border-r">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">

                <Sparkles className="h-3.5 w-3.5" />

                Live Queue Journey

              </div>

              <h3 className="mt-4 bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[30px] font-semibold tracking-[-0.045em] text-transparent">

                Priority-aware queue sequence

              </h3>

              <p className="mt-2 text-[12px] leading-6 text-[#BFCADA]">

                Live queue order and forecast movement after operational events.

              </p>

            </div>

            <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-[10px] font-semibold text-[#D8E1ED]">

              Forecast v
              {forecastVersion}

            </span>

          </div>

          {/* FLOW */}

          <div className="mt-7 overflow-x-auto pb-2">

            <div className="flex min-w-max items-stretch gap-3">

              {visibleQueue.map(
                (
                  patient,
                  index,
                ) => {
                  const styles =
                    getPatientAccent(
                      patient,
                    )

                  return (
                    <div
                      key={
                        patient.id
                      }
                      className="flex items-center gap-3"
                    >

                      <div
                        className={`relative w-[170px] overflow-hidden rounded-[24px] border bg-gradient-to-br p-4 transition-all duration-500 ${styles.border} ${styles.background}`}
                      >

                        {patient.isPriority && (
                          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15">

                            <Zap className="h-4 w-4 text-rose-200" />

                          </div>
                        )}

                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.15em] ${styles.badge}`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                          />

                          {
                            patient.status
                          }

                        </div>

                        <p
                          className={`mt-5 text-[30px] font-semibold tracking-[-0.045em] ${styles.token}`}
                        >

                          {
                            patient.token
                          }

                        </p>

                        <p className="mt-3 text-[11px] font-semibold text-[#DCE5F1]">

                          {getEta(
                            patient,
                          )}

                        </p>

                        <p className="mt-1 min-h-[32px] text-[9px] leading-4 text-[#93A2B6]">

                          {
                            patient.note
                          }

                        </p>

                        {priorityInserted &&
                          !patient.isPriority &&
                          patient.status !==
                            "SERVING" && (
                            <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-amber-400/15 bg-amber-500/[0.07] px-2 py-1 text-[8px] font-semibold text-amber-200">

                              <TimerReset className="h-2.5 w-2.5" />

                              +14m shift

                            </div>
                          )}

                      </div>

                      {index <
                        visibleQueue.length -
                          1 && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">

                          <ArrowRight className="h-4 w-4 text-[#8EA0B6]" />

                        </div>
                      )}

                    </div>
                  )
                },
              )}

            </div>

          </div>

          {/* EVENT */}

          <div
            className={`mt-6 rounded-[20px] border p-4 ${
              priorityInserted
                ? "border-rose-400/20 bg-gradient-to-r from-rose-500/[0.07] to-fuchsia-500/[0.04]"
                : "border-cyan-400/15 bg-cyan-500/[0.05]"
            }`}
          >

            <div className="flex items-start gap-3">

              {priorityInserted ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />
              ) : (
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
              )}

              <div>

                <p
                  className={`text-[11px] font-semibold ${
                    priorityInserted
                      ? "text-rose-100"
                      : "text-cyan-100"
                  }`}
                >

                  {priorityInserted
                    ? "Priority insertion changed the queue"
                    : "Queue operating normally"}

                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#B7C2D2]">

                  {priorityInserted
                    ? "P1-07 was inserted after the active consultation. All downstream ETAs were re-forecast."
                    : "No active disruptions detected. Forecasts are following the normal queue sequence."}

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="p-6">

          <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">

            Forecast Health

          </p>

          <div className="mt-4 flex items-center justify-between">

            <div>

              <p className="text-[24px] font-semibold leading-tight text-white">

                Stable and
                <br />
                reliable

              </p>

              <p className="mt-2 text-[10px] text-[#91A1B5]">

                Current reliability

              </p>

            </div>

            <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full border-[4px] border-cyan-400/80 border-r-violet-400 border-t-violet-400 bg-white/[0.03]">

              <div className="text-center">

                <p className="text-[20px] font-bold text-white">

                  86%

                </p>

                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-cyan-200">

                  High

                </p>

              </div>

            </div>

          </div>

          <div className="mt-7 space-y-3">

            <HealthMetric
              icon={Clock3}
              label="Median wait"
              value={
                priorityInserted
                  ? "38 min"
                  : "24 min"
              }
              color="cyan"
            />

            <HealthMetric
              icon={Activity}
              label="Queue volatility"
              value={
                priorityInserted
                  ? "High"
                  : "Medium"
              }
              color={
                priorityInserted
                  ? "rose"
                  : "yellow"
              }
            />

            <HealthMetric
              icon={
                TimerReset
              }
              label="Forecast version"
              value={`v${forecastVersion}`}
              color="violet"
            />

          </div>

        </div>

      </div>

    </section>
  )
}

function HealthMetric({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Clock3
  label: string
  value: string

  color:
    | "cyan"
    | "yellow"
    | "rose"
    | "violet"
}) {
  const colors = {
    cyan:
      "text-cyan-200",

    yellow:
      "text-yellow-200",

    rose:
      "text-rose-200",

    violet:
      "text-violet-200",
  }

  return (
    <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-4">

      <div className="flex items-center gap-2">

        <Icon
          className={`h-3.5 w-3.5 ${colors[color]}`}
        />

        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#A9B6C8]">

          {label}

        </p>

      </div>

      <p
        className={`mt-2 text-[17px] font-semibold ${colors[color]}`}
      >

        {value}

      </p>

    </div>
  )
}