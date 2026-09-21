import {
    Activity,
    ArrowRight,
    Clock3,
    Sparkles,
    TrendingUp,
    Zap,
  } from "lucide-react"
  
  export default function Forecasting() {
    return (
      <div className="space-y-6">
  
        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(31,25,72,0.97),rgba(7,17,38,0.97))] p-7">
  
          <div className="flex flex-wrap items-start justify-between gap-5">
  
            <div>
  
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
  
                <Sparkles className="h-3.5 w-3.5" />
  
                Forecast Engine
  
              </span>
  
              <h2 className="mt-5 bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[36px] font-semibold text-transparent">
  
                Live wait-time intelligence
  
              </h2>
  
              <p className="mt-3 max-w-2xl text-[13px] leading-7 text-[#C8D2E0]">
  
                QueuePulse continuously re-forecasts consultation windows as priority cases, delays, no-shows and doctor availability change.
  
              </p>
  
            </div>
  
            <div className="rounded-[26px] border border-cyan-400/20 bg-cyan-500/[0.06] p-5">
  
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                Forecast Confidence
              </p>
  
              <p className="mt-2 text-[42px] font-semibold text-white">
                86%
              </p>
  
              <p className="text-[11px] font-semibold text-emerald-200">
                HIGH
              </p>
  
            </div>
  
          </div>
  
        </section>
  
        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
  
          {/* BEFORE / AFTER */}
  
          <div className="rounded-[30px] border border-white/[0.09] bg-white/[0.03] p-7">
  
            <div className="flex items-center gap-2">
  
              <Zap className="h-4 w-4 text-violet-200" />
  
              <h3 className="text-[18px] font-semibold text-white">
                Priority impact simulation
              </h3>
  
            </div>
  
            <p className="mt-2 text-[11px] text-[#91A0B4]">
              Token G-42 · General Medicine
            </p>
  
            <div className="mt-7 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
  
              <div className="rounded-[24px] border border-white/[0.08] bg-black/10 p-6">
  
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A6B3C5]">
                  Before
                </p>
  
                <p className="mt-3 text-[30px] font-semibold text-white">
                  11:40 – 11:55
                </p>
  
                <p className="mt-2 text-[11px] text-[#95A4B8]">
                  Arrival by 11:25 AM
                </p>
  
              </div>
  
              <ArrowRight className="mx-auto h-6 w-6 text-violet-300" />
  
              <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/[0.06] p-6">
  
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-rose-200">
                  After Priority Insert
                </p>
  
                <p className="mt-3 text-[30px] font-semibold text-white">
                  11:55 – 12:10
                </p>
  
                <p className="mt-2 text-[11px] text-rose-100">
                  Arrival updated to 11:40 AM
                </p>
  
              </div>
  
            </div>
  
            <div className="mt-6 rounded-[22px] border border-violet-400/15 bg-violet-500/[0.06] p-5">
  
              <p className="text-[11px] leading-6 text-[#D2DBE8]">
  
                P1-07 was inserted at 12:08 PM. QueuePulse detected the disruption and recalculated all downstream consultation windows.
  
              </p>
  
            </div>
  
          </div>
  
          {/* METRICS */}
  
          <div className="space-y-4">
  
            <ForecastMetric
              icon={Clock3}
              label="Median Wait"
              value="24 min"
            />
  
            <ForecastMetric
              icon={Activity}
              label="Queue Volatility"
              value="Medium"
            />
  
            <ForecastMetric
              icon={TrendingUp}
              label="ETA Confidence"
              value="± 4 min"
            />
  
          </div>
  
        </section>
  
      </div>
    )
  }
  
  function ForecastMetric({
    icon: Icon,
    label,
    value,
  }: {
    icon: typeof Clock3
    label: string
    value: string
  }) {
    return (
      <div className="rounded-[26px] border border-white/[0.09] bg-white/[0.035] p-5">
  
        <Icon className="h-5 w-5 text-cyan-200" />
  
        <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-[#B2BFD0]">
          {label}
        </p>
  
        <p className="mt-2 text-[27px] font-semibold text-white">
          {value}
        </p>
  
      </div>
    )
  }