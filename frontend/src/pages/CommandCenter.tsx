import {
    Activity,
    ArrowUpRight,
    Clock3,
    ShieldAlert,
    Sparkles,
    Users,
  } from "lucide-react"
  
  import QueueJourneyRail from "../components/ui/dashboard/QueueJourneyRail"
  
  export default function CommandCenter() {
    return (
      <>
        <section className="overflow-hidden rounded-[32px] border border-white/[0.10] bg-[linear-gradient(135deg,rgba(28,31,72,0.97),rgba(10,17,41,0.97))] shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
  
          <div className="grid gap-7 p-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(430px,0.55fr)] xl:p-9">
  
            {/* HERO */}
  
            <div className="min-w-0">
  
              <div className="flex flex-wrap items-center gap-3">
  
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/12 px-4 py-2 text-[11px] font-semibold text-emerald-200">
  
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
  
                  LIVE OPD
  
                </span>
  
                <span className="text-[12px] font-medium text-[#B8C4D5]">
                  Auto re-forecasting active
                </span>
  
                <span className="h-1 w-1 rounded-full bg-[#718096]" />
  
                <span className="text-[12px] font-medium text-[#B8C4D5]">
                  Last sync: seconds ago
                </span>
  
              </div>
  
              <h2 className="mt-7 max-w-[900px] text-[48px] font-semibold leading-[1.06] tracking-[-0.055em] md:text-[56px]">
  
                <span className="text-white">
                  General Medicine
                </span>
  
                <span className="ml-3 bg-gradient-to-r from-cyan-100 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                  Control Room
                </span>
  
              </h2>
  
              <p className="mt-6 max-w-[820px] text-[15px] leading-8 text-[#D5DEEA]">
                A live operational dashboard for queue visibility,
                emergency-aware forecasting and patient-flow decisions
                across the OPD.
              </p>
  
              <div className="mt-8 flex gap-3">
  
                <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-blue-500 px-5 py-3 text-[12px] font-semibold shadow-[0_16px_35px_rgba(124,58,237,0.32)]">
  
                  <Sparkles className="h-4 w-4" />
  
                  Open Live Queue
  
                </button>
  
                <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.08] px-5 py-3 text-[12px] font-semibold text-cyan-50">
  
                  View Analytics
  
                  <ArrowUpRight className="h-4 w-4" />
  
                </button>
  
              </div>
  
            </div>
  
            {/* METRICS */}
  
            <div className="grid grid-cols-2 gap-3">
  
              <Metric
                label="Patients Waiting"
                value="42"
                note="+6 in the last 30 min"
                icon={Users}
                color="violet"
              />
  
              <Metric
                label="Median Wait"
                value="24m"
                note="8% lower than morning peak"
                icon={Clock3}
                color="cyan"
              />
  
              <Metric
                label="Priority Cases"
                value="03"
                note="1 currently being served"
                icon={ShieldAlert}
                color="rose"
              />
  
              <Metric
                label="Doctors Active"
                value="08"
                note="Across 4 departments"
                icon={Activity}
                color="emerald"
              />
  
            </div>
  
          </div>
  
        </section>
  
        <section className="mt-6 rounded-[32px] border border-white/[0.10] bg-[linear-gradient(180deg,rgba(17,22,44,0.97),rgba(10,14,28,0.95))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.34)] lg:p-5">
  
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
  
        <div className="flex items-start justify-between">
  
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