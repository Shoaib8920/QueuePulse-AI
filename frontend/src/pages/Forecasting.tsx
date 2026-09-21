import {
  Activity,
  BrainCircuit,
  Clock3,
  Gauge,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"

import {
  useQueue,
} from "../context/QueueContext"

import {
  getMedianWait,
  getQueueVolatility,
} from "../lib/queueMetrics"


function confidencePercent(
  value: number,
) {
  return Math.round(
    value * 100,
  )
}


function formatReason(
  reason: string,
) {
  return reason
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


export default function Forecasting() {
  const {
    queue,
    forecastVersion,
  } = useQueue()

  const activePatients =
    queue.filter(
      (patient) =>
        patient.status !==
          "COMPLETED" &&
        patient.status !==
          "MISSED",
    )

  const g42 =
    queue.find(
      (patient) =>
        patient.token ===
        "G-42",
    )

  const medianWait =
    getMedianWait(
      queue,
    )

  const volatility =
    getQueueVolatility(
      queue,
    )

  const confidenceValues =
    activePatients
      .filter(
        (patient) =>
          patient.confidenceScore >
          0,
      )
      .map(
        (patient) =>
          patient.confidenceScore,
      )

  const averageConfidence =
    confidenceValues.length >
    0
      ? confidenceValues.reduce(
          (
            total,
            value,
          ) =>
            total + value,
          0,
        ) /
        confidenceValues.length
      : 0

  const averageConfidencePercent =
    confidencePercent(
      averageConfidence,
    )

  return (
    <div className="space-y-6">

      {/* HERO */}

      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(31,25,72,0.97),rgba(7,17,38,0.97))] p-7">

        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">

          <div>

            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">

              <BrainCircuit className="h-3.5 w-3.5" />

              Monte Carlo Engine

            </span>

            <h2 className="mt-5 bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[36px] font-semibold tracking-[-0.045em] text-transparent">

              Live wait-time intelligence

            </h2>

            <p className="mt-3 max-w-2xl text-[13px] leading-7 text-[#C8D2E0]">

              QueuePulse calculates probabilistic waiting-time windows from the current queue, doctor pace and consultation uncertainty.

            </p>

          </div>

          <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-500/[0.06] px-6 py-4">

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">

              Avg Confidence

            </p>

            <p className="mt-1 text-[32px] font-semibold text-white">

              {averageConfidencePercent}%

            </p>

            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-emerald-200">

              Live Model

            </p>

          </div>

        </div>

      </section>

      {/* METRICS */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <Metric
          icon={Clock3}
          label="Median Wait"
          value={`${medianWait}m`}
          note="Across active queue"
          accent="cyan"
        />

        <Metric
          icon={Activity}
          label="Queue Volatility"
          value={volatility}
          note="ETA window spread"
          accent="violet"
        />

        <Metric
          icon={TrendingUp}
          label="Forecast Version"
          value={`v${forecastVersion}`}
          note="Latest model run"
          accent="emerald"
        />

        <Metric
          icon={RadioTower}
          label="Active Forecasts"
          value={String(
            activePatients.length,
          ).padStart(
            2,
            "0",
          )}
          note="Current queue"
          accent="rose"
        />

      </section>

      {/* G42 FORECAST */}

      {g42 && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_390px]">

          <div className="rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94 p-7">

            <div className="flex flex-wrap items-start justify-between gap-5">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-violet-200">

                  Patient Forecast

                </p>

                <h3 className="mt-2 text-[23px] font-semibold text-white">

                  Token G-42

                </h3>

              </div>

              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/[0.07] px-3 py-1.5 text-[9px] font-semibold text-cyan-100">

                Model v
                {g42.forecastModelVersion}

              </span>

            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-3">

              <ForecastValue
                label="ETA Window"
                value={`${g42.etaMin}–${g42.etaMax} min`}
                icon={Clock3}
              />

              <ForecastValue
                label="Predicted Wait"
                value={`${Math.round(
                  g42.predictedWait,
                )} min`}
                icon={Target}
              />

              <ForecastValue
                label="Confidence"
                value={`${confidencePercent(
                  g42.confidenceScore,
                )}%`}
                icon={ShieldCheck}
              />

            </div>

            <div className="mt-5 rounded-[22px] border border-cyan-400/15 bg-cyan-500/[0.05] p-5">

              <div className="flex items-start gap-3">

                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />

                <div>

                  <p className="text-[11px] font-semibold text-white">

                    Why this forecast?

                  </p>

                  <p className="mt-2 text-[10px] leading-5 text-[#B7C5D5]">

                    Latest reason code:{" "}
                    <span className="font-semibold text-cyan-100">
                      {formatReason(
                        g42.reasonCode,
                      )}
                    </span>
                    . QueuePulse models uncertainty instead of assuming every consultation has identical duration.

                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ENGINE DETAILS */}

          <div className="rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94 p-6">

            <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">

              Model Interpretation

            </p>

            <div className="mt-5 space-y-3">

              <EngineItem
                label="Lower estimate"
                value={`${g42.etaMin} min`}
              />

              <EngineItem
                label="Median prediction"
                value={`${g42.predictedWait.toFixed(
                  1,
                )} min`}
              />

              <EngineItem
                label="Upper estimate"
                value={`${g42.etaMax} min`}
              />

              <EngineItem
                label="Confidence"
                value={`${confidencePercent(
                  g42.confidenceScore,
                )}% ${g42.confidenceLabel}`}
              />

              <EngineItem
                label="Reason"
                value={formatReason(
                  g42.reasonCode,
                )}
              />

            </div>

          </div>

        </section>
      )}

      {/* QUEUE FORECAST TABLE */}

      <section className="overflow-hidden rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94">

        <div className="border-b border-white/[0.08] p-6">

          <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">

            Forecast Distribution

          </p>

          <h3 className="mt-2 text-[19px] font-semibold text-white">

            Active patient predictions

          </h3>

        </div>

        <div className="grid grid-cols-[110px_120px_1fr_140px_130px] gap-4 border-b border-white/[0.07] px-6 py-4">

          <TableHeader>
            Token
          </TableHeader>

          <TableHeader>
            Status
          </TableHeader>

          <TableHeader>
            ETA Window
          </TableHeader>

          <TableHeader>
            Predicted
          </TableHeader>

          <TableHeader>
            Confidence
          </TableHeader>

        </div>

        <div className="divide-y divide-white/[0.07]">

          {activePatients.map(
            (patient) => (
              <div
                key={patient.id}
                className="grid grid-cols-[110px_120px_1fr_140px_130px] items-center gap-4 px-6 py-5"
              >

                <p className="text-[15px] font-semibold text-white">

                  {patient.token}

                </p>

                <p className="text-[9px] font-semibold text-[#B8C5D6]">

                  {patient.status}

                </p>

                <p className="text-[12px] font-semibold text-cyan-100">

                  {patient.status ===
                  "SERVING"
                    ? "Now"
                    : `${patient.etaMin}–${patient.etaMax} min`}

                </p>

                <p className="text-[11px] text-[#D9E2ED]">

                  {patient.status ===
                  "SERVING"
                    ? "0 min"
                    : `${patient.predictedWait.toFixed(
                        1,
                      )} min`}

                </p>

                <div className="flex items-center gap-2">

                  <Gauge className="h-3.5 w-3.5 text-violet-200" />

                  <span className="text-[10px] font-semibold text-violet-100">

                    {confidencePercent(
                      patient.confidenceScore,
                    )}
                    %

                  </span>

                </div>

              </div>
            ),
          )}

        </div>

      </section>

    </div>
  )
}


function Metric({
  icon: Icon,
  label,
  value,
  note,
  accent,
}: {
  icon: typeof Clock3
  label: string
  value: string
  note: string

  accent:
    | "cyan"
    | "violet"
    | "emerald"
    | "rose"
}) {
  const styles = {
    cyan:
      "bg-cyan-500/10 text-cyan-200",

    violet:
      "bg-violet-500/10 text-violet-200",

    emerald:
      "bg-emerald-500/10 text-emerald-200",

    rose:
      "bg-rose-500/10 text-rose-200",
  }

  return (
    <div className="rounded-[24px] border border-white/[0.09] bg-white/[0.03] p-5">

      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-[#C1CDDC]">
        {label}
      </p>

      <p className="mt-2 text-[28px] font-semibold text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#93A2B6]">
        {note}
      </p>

    </div>
  )
}


function ForecastValue({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Clock3
}) {
  return (
    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">

      <Icon className="h-4 w-4 text-cyan-200" />

      <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.17em] text-[#AAB7C9]">
        {label}
      </p>

      <p className="mt-2 text-[22px] font-semibold text-white">
        {value}
      </p>

    </div>
  )
}


function EngineItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-[17px] border border-white/[0.07] bg-white/[0.025] px-4 py-3">

      <p className="text-[9px] text-[#98A7BA]">
        {label}
      </p>

      <p className="text-right text-[10px] font-semibold text-white">
        {value}
      </p>

    </div>
  )
}


function TableHeader({
  children,
}: {
  children: string
}) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#9EADBF]">
      {children}
    </p>
  )
}