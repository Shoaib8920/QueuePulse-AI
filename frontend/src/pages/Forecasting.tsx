import {
    Activity,
    ArrowRight,
    BellRing,
    Clock3,
    RefreshCcw,
    ShieldAlert,
    Sparkles,
    TrendingUp,
    Zap,
  } from "lucide-react"
  
  import {
    useQueue,
  } from "../context/QueueContext"
  
  export default function Forecasting() {
    const {
      queue,
      priorityInserted,
      forecastVersion,
      resetDemo,
    } = useQueue()
  
    const g42 =
      queue.find(
        (patient) =>
          patient.token ===
          "G-42",
      )
  
    const currentEta =
      g42
        ? `${g42.etaMin}–${g42.etaMax} min`
        : "—"
  
    return (
      <div className="space-y-6">
  
        {/* FORECAST HERO */}
  
        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(31,25,72,0.97),rgba(7,17,38,0.97))] p-7">
  
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
  
          <div className="relative flex flex-wrap items-start justify-between gap-6">
  
            <div>
  
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">
  
                <Sparkles className="h-3.5 w-3.5" />
  
                Forecast Engine v
                {forecastVersion}
  
              </span>
  
              <h2 className="mt-5 bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[36px] font-semibold tracking-[-0.045em] text-transparent">
  
                Live wait-time intelligence
  
              </h2>
  
              <p className="mt-3 max-w-2xl text-[13px] leading-7 text-[#C8D2E0]">
  
                QueuePulse continuously recalculates consultation windows when hospital conditions change.
  
              </p>
  
            </div>
  
            <div className="flex gap-3">
  
              {priorityInserted && (
                <button
                  type="button"
                  onClick={
                    resetDemo
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-[11px] font-semibold text-[#DDE5F0] transition hover:bg-white/[0.06]"
                >
  
                  <RefreshCcw className="h-4 w-4" />
  
                  Reset Scenario
  
                </button>
              )}
  
              <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-500/[0.06] px-6 py-4">
  
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                  Confidence
                </p>
  
                <p className="mt-1 text-[32px] font-semibold text-white">
                  86%
                </p>
  
                <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-emerald-200">
                  High
                </p>
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
        {/* LIVE IMPACT */}
  
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_340px]">
  
          <div className="rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94 p-7">
  
            <div className="flex items-center justify-between gap-4">
  
              <div>
  
                <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-violet-200">
  
                  Patient Impact
  
                </p>
  
                <h3 className="mt-2 text-[21px] font-semibold text-white">
  
                  Token G-42 forecast
  
                </h3>
  
              </div>
  
              <span
                className={`rounded-full border px-3 py-1.5 text-[9px] font-semibold ${
                  priorityInserted
                    ? "border-rose-400/20 bg-rose-500/[0.07] text-rose-200"
                    : "border-emerald-400/20 bg-emerald-500/[0.07] text-emerald-200"
                }`}
              >
  
                {priorityInserted
                  ? "Forecast Changed"
                  : "Stable"}
  
              </span>
  
            </div>
  
            {/* BEFORE / AFTER */}
  
            <div className="mt-7 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
  
              <ForecastWindow
                title="Original Forecast"
                value="40–55 min"
                subtitle="Before operational disruption"
                tone="normal"
              />
  
              <div className="flex items-center justify-center">
  
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                    priorityInserted
                      ? "border-rose-400/20 bg-rose-500/[0.08]"
                      : "border-white/[0.08] bg-white/[0.03]"
                  }`}
                >
  
                  <ArrowRight
                    className={`h-5 w-5 ${
                      priorityInserted
                        ? "text-rose-200"
                        : "text-[#75849A]"
                    }`}
                  />
  
                </div>
  
              </div>
  
              <ForecastWindow
                title="Current Forecast"
                value={
                  currentEta
                }
                subtitle={
                  priorityInserted
                    ? "After P1-07 insertion"
                    : "No change detected"
                }
                tone={
                  priorityInserted
                    ? "changed"
                    : "normal"
                }
              />
  
            </div>
  
            {/* SYSTEM EXPLANATION */}
  
            <div
              className={`mt-6 rounded-[22px] border p-5 ${
                priorityInserted
                  ? "border-rose-400/15 bg-gradient-to-r from-rose-500/[0.07] to-fuchsia-500/[0.04]"
                  : "border-cyan-400/15 bg-cyan-500/[0.05]"
              }`}
            >
  
              <div className="flex items-start gap-3">
  
                {priorityInserted ? (
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />
                ) : (
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                )}
  
                <div>
  
                  <p className="text-[11px] font-semibold text-white">
  
                    {priorityInserted
                      ? "Why did the forecast change?"
                      : "Forecast operating normally"}
  
                  </p>
  
                  <p className="mt-2 text-[10px] leading-5 text-[#B8C4D4]">
  
                    {priorityInserted
                      ? "An authorized priority case entered ahead of waiting patients. QueuePulse detected the queue disruption and shifted downstream consultation estimates by approximately 14 minutes."
                      : "The queue currently has no major disruptions. Forecasts are based on the normal patient sequence and current consultation pace."}
  
                  </p>
  
                </div>
  
              </div>
  
            </div>
  
            {/* NOTIFICATION */}
  
            {priorityInserted && (
              <div className="mt-4 rounded-[20px] border border-emerald-400/15 bg-emerald-500/[0.05] p-4">
  
                <div className="flex items-center gap-3">
  
                  <BellRing className="h-4 w-4 text-emerald-200" />
  
                  <div>
  
                    <p className="text-[10px] font-semibold text-emerald-100">
                      Notification triggered
                    </p>
  
                    <p className="mt-1 text-[9px] text-[#AFC2BA]">
                      G-42 will receive an updated arrival recommendation.
                    </p>
  
                  </div>
  
                </div>
  
              </div>
            )}
  
          </div>
  
          {/* METRICS */}
  
          <div className="space-y-4">
  
            <ForecastMetric
              icon={Clock3}
              label="Median Wait"
              value={
                priorityInserted
                  ? "38 min"
                  : "24 min"
              }
              accent="cyan"
            />
  
            <ForecastMetric
              icon={Activity}
              label="Queue Volatility"
              value={
                priorityInserted
                  ? "High"
                  : "Medium"
              }
              accent={
                priorityInserted
                  ? "rose"
                  : "yellow"
              }
            />
  
            <ForecastMetric
              icon={TrendingUp}
              label="ETA Confidence"
              value="± 4 min"
              accent="violet"
            />
  
            <ForecastMetric
              icon={Zap}
              label="Re-Forecasts"
              value={
                priorityInserted
                  ? "01"
                  : "00"
              }
              accent="emerald"
            />
  
          </div>
  
        </section>
  
      </div>
    )
  }
  
  function ForecastWindow({
    title,
    value,
    subtitle,
    tone,
  }: {
    title: string
    value: string
    subtitle: string
  
    tone:
      | "normal"
      | "changed"
  }) {
    return (
      <div
        className={`rounded-[24px] border p-6 ${
          tone === "changed"
            ? "border-rose-400/20 bg-rose-500/[0.06]"
            : "border-white/[0.08] bg-black/10"
        }`}
      >
  
        <p
          className={`text-[9px] font-bold uppercase tracking-[0.18em] ${
            tone === "changed"
              ? "text-rose-200"
              : "text-[#A6B3C5]"
          }`}
        >
          {title}
        </p>
  
        <p className="mt-3 text-[30px] font-semibold tracking-[-0.035em] text-white">
  
          {value}
  
        </p>
  
        <p
          className={`mt-2 text-[10px] ${
            tone === "changed"
              ? "text-rose-100"
              : "text-[#95A4B8]"
          }`}
        >
          {subtitle}
        </p>
  
      </div>
    )
  }
  
  function ForecastMetric({
    icon: Icon,
    label,
    value,
    accent,
  }: {
    icon: typeof Clock3
    label: string
    value: string
  
    accent:
      | "cyan"
      | "rose"
      | "yellow"
      | "violet"
      | "emerald"
  }) {
    const styles = {
      cyan:
        "text-cyan-200 bg-cyan-500/10",
  
      rose:
        "text-rose-200 bg-rose-500/10",
  
      yellow:
        "text-yellow-200 bg-yellow-500/10",
  
      violet:
        "text-violet-200 bg-violet-500/10",
  
      emerald:
        "text-emerald-200 bg-emerald-500/10",
    }
  
    return (
      <div className="rounded-[25px] border border-white/[0.09] bg-white/[0.035] p-5">
  
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}
        >
  
          <Icon className="h-4 w-4" />
  
        </div>
  
        <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-[#B2BFD0]">
  
          {label}
  
        </p>
  
        <p className="mt-2 text-[27px] font-semibold text-white">
  
          {value}
  
        </p>
  
      </div>
    )
  }