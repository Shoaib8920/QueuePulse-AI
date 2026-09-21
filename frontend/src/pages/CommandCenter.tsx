import {
  Activity,
  ArrowUpRight,
  Clock3,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

import QueueJourneyRail from "../components/ui/dashboard/QueueJourneyRail"

import {
  useQueue,
} from "../context/QueueContext"

import {
  formatWait,
  getMedianWait,
} from "../lib/queueMetrics"


export default function CommandCenter() {
  const {
    queue,
    priorityInserted,
    forecastVersion,
  } = useQueue()

  const waitingCount =
    queue.filter(
      (patient) =>
        patient.status !==
          "SERVING" &&
        patient.status !==
          "COMPLETED" &&
        patient.status !==
          "MISSED",
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
    getMedianWait(queue)

  return (
    <>
      <section className="relative overflow-hidden rounded-[32px] border border-white/[0.10] bg-[linear-gradient(135deg,rgba(28,31,72,0.97),rgba(10,17,41,0.97))] shadow-[0_28px_90px_rgba(0,0,0,0.32)]">

        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative grid gap-7 p-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(430px,0.55fr)] xl:p-9">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/12 px-4 py-2 text-[11px] font-semibold text-emerald-200">

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                LIVE OPD

              </span>

              <span className="text-[12px] font-medium text-[#B8C4D5]">

                Monte Carlo forecasting active

              </span>

              <span className="h-1 w-1 rounded-full bg-[#718096]" />

              <span className="text-[12px] font-medium text-[#B8C4D5]">

                Forecast v{forecastVersion}

              </span>

            </div>

            <h2 className="mt-7 text-[48px] font-semibold leading-[1.06] tracking-[-0.055em] md:text-[56px]">

              <span className="text-white">
                General Medicine
              </span>

              <span className="ml-3 bg-gradient-to-r from-cyan-100 via-cyan-300 to-violet-300 bg-clip-text text-transparent">

                Control Room

              </span>

            </h2>

            <p className="mt-6 max-w-[820px] text-[15px] leading-8 text-[#D5DEEA]">

              Real-time queue intelligence powered by probabilistic waiting-time forecasting.

            </p>

            {priorityInserted && (
              <div className="mt-6 max-w-[720px] rounded-[20px] border border-rose-400/20 bg-rose-500/[0.06] p-4">

                <div className="flex items-start gap-3">

                  <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-200" />

                  <div>

                    <p className="text-[11px] font-semibold text-rose-100">

                      Priority queue event detected

                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-[#D9C4CD]">

                      QueuePulse recalculated downstream forecasts using the Monte Carlo engine.

                    </p>

                  </div>

                </div>

              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                to="/live-queue"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-blue-500 px-5 py-3 text-[12px] font-semibold text-white"
              >

                <Sparkles className="h-4 w-4" />

                Open Live Queue

              </Link>

              <Link
                to="/forecasting"
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.08] px-5 py-3 text-[12px] font-semibold text-cyan-50"
              >

                View Forecasting

                <ArrowUpRight className="h-4 w-4" />

              </Link>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <Metric
              label="Patients Waiting"
              value={String(
                waitingCount,
              ).padStart(
                2,
                "0",
              )}
              note="Current live queue"
              icon={Users}
              color="violet"
            />

            <Metric
              label="Median Wait"
              value={
                formatWait(
                  medianWait,
                )
              }
              note="Monte Carlo median"
              icon={Clock3}
              color="cyan"
            />

            <Metric
              label="Priority Cases"
              value={String(
                priorityCount,
              ).padStart(
                2,
                "0",
              )}
              note={
                priorityCount > 0
                  ? "Triage priority active"
                  : "No active priority"
              }
              icon={ShieldAlert}
              color="rose"
            />

            <Metric
              label="Forecast Version"
              value={`v${forecastVersion}`}
              note="Latest model output"
              icon={Activity}
              color="emerald"
            />

          </div>

        </div>

      </section>

      <section className="mt-6 rounded-[32px] border border-white/[0.10] bg-[linear-gradient(180deg,rgba(17,22,44,0.97),rgba(10,14,28,0.95))] p-4 lg:p-5">

        <QueueJourneyRail />

      </section>

    </>
  )
}


type MetricProps = {
  label: string
  value: string
  note: string
  icon: typeof Users

  color:
    | "violet"
    | "cyan"
    | "rose"
    | "emerald"
}


function Metric({
  label,
  value,
  note,
  icon: Icon,
  color,
}: MetricProps) {
  const styles = {
    violet:
      "bg-violet-500/16 text-violet-100",

    cyan:
      "bg-cyan-500/16 text-cyan-100",

    rose:
      "bg-rose-500/16 text-rose-100",

    emerald:
      "bg-emerald-500/16 text-emerald-100",
  }

  return (
    <div className="rounded-[24px] border border-white/[0.10] bg-white/[0.045] p-5">

      <div className="flex items-start justify-between gap-3">

        <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#E2EBF8]">
          {label}
        </p>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles[color]}`}
        >

          <Icon className="h-5 w-5" />

        </div>

      </div>

      <p className="mt-4 text-[38px] font-semibold tracking-[-0.05em] text-white">

        {value}

      </p>

      <p className="mt-2 text-[11px] font-medium text-[#BECADD]">

        {note}

      </p>

    </div>
  )
}