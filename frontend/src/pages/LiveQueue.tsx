import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock3,
    MoreHorizontal,
    RadioTower,
  } from "lucide-react"
  
  const queue = [
    {
      token: "G-31",
      patient: "Current consultation",
      status: "Serving",
      eta: "Now",
      style:
        "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    },
    {
      token: "P1-07",
      patient: "Priority clinical case",
      status: "Priority",
      eta: "Inserted",
      style:
        "border-rose-400/20 bg-rose-500/10 text-rose-200",
    },
    {
      token: "G-32",
      patient: "Checked in",
      status: "Ready",
      eta: "8–12 min",
      style:
        "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
    },
    {
      token: "G-33",
      patient: "Not arrived",
      status: "Waiting",
      eta: "18–25 min",
      style:
        "border-white/10 bg-white/[0.04] text-[#D5DFEC]",
    },
    {
      token: "G-34",
      patient: "Not arrived",
      status: "Waiting",
      eta: "27–34 min",
      style:
        "border-white/10 bg-white/[0.04] text-[#D5DFEC]",
    },
  ]
  
  export default function LiveQueue() {
    return (
      <div className="space-y-6">
  
        <section className="grid gap-4 xl:grid-cols-[1fr_330px]">
  
          {/* QUEUE */}
  
          <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0B1025]/90">
  
            <div className="flex items-center justify-between border-b border-white/[0.08] p-6">
  
              <div>
  
                <div className="flex items-center gap-2">
  
                  <RadioTower className="h-4 w-4 text-cyan-300" />
  
                  <h2 className="text-[22px] font-semibold text-white">
                    General Medicine Queue
                  </h2>
  
                </div>
  
                <p className="mt-2 text-[12px] text-[#AEBBCD]">
                  Live sequence · Room 201 · Dr. Meera Shah
                </p>
  
              </div>
  
              <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-[11px] font-semibold text-violet-100">
                42 waiting
              </span>
  
            </div>
  
            <div className="divide-y divide-white/[0.07]">
  
              {queue.map(
                (row) => (
                  <div
                    key={row.token}
                    className="grid grid-cols-[100px_1fr_150px_130px_40px] items-center gap-4 px-6 py-5 transition hover:bg-white/[0.025]"
                  >
  
                    <p className="text-[21px] font-semibold text-white">
                      {row.token}
                    </p>
  
                    <div>
                      <p className="text-[13px] font-medium text-[#DCE5F1]">
                        {row.patient}
                      </p>
  
                      <p className="mt-1 text-[10px] text-[#8391A5]">
                        General Medicine
                      </p>
                    </div>
  
                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-semibold ${row.style}`}
                      >
                        {row.status}
                      </span>
                    </div>
  
                    <p className="text-[12px] font-medium text-[#DCE5F1]">
                      {row.eta}
                    </p>
  
                    <button className="text-[#7E8DA3] hover:text-white">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
  
                  </div>
                ),
              )}
  
            </div>
  
          </div>
  
          {/* CURRENT */}
  
          <div className="space-y-4">
  
            <div className="rounded-[28px] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.10] to-cyan-500/[0.04] p-6">
  
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                Now Serving
              </p>
  
              <p className="mt-5 text-[58px] font-semibold tracking-[-0.06em] text-white">
                G-31
              </p>
  
              <p className="mt-2 text-[14px] text-[#D7E1ED]">
                Dr. Meera Shah
              </p>
  
              <p className="mt-1 text-[11px] text-[#94A4B8]">
                Room 201
              </p>
  
              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-black/10 p-4">
  
                <Activity className="h-4 w-4 text-emerald-300" />
  
                <span className="text-[12px] text-[#D7E1ED]">
                  Consultation running · 08:42
                </span>
  
              </div>
  
            </div>
  
            <div className="rounded-[28px] border border-rose-400/15 bg-rose-500/[0.06] p-6">
  
              <AlertTriangle className="h-5 w-5 text-rose-300" />
  
              <p className="mt-4 text-[14px] font-semibold text-white">
                Priority insertion detected
              </p>
  
              <p className="mt-2 text-[11px] leading-5 text-[#BFC9D8]">
                P1-07 entered the queue at 12:08 PM. Downstream ETAs were recalculated.
              </p>
  
            </div>
  
          </div>
  
        </section>
  
        {/* MINI METRICS */}
  
        <section className="grid gap-4 md:grid-cols-3">
  
          <SmallMetric
            icon={Clock3}
            label="Median Wait"
            value="24 min"
            accent="cyan"
          />
  
          <SmallMetric
            icon={Activity}
            label="Queue Velocity"
            value="6.2 / hr"
            accent="violet"
          />
  
          <SmallMetric
            icon={CheckCircle2}
            label="Completed Today"
            value="118"
            accent="emerald"
          />
  
        </section>
  
      </div>
    )
  }
  
  function SmallMetric({
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
      | "violet"
      | "emerald"
  }) {
    const classes = {
      cyan:
        "text-cyan-200 bg-cyan-500/10",
      violet:
        "text-violet-200 bg-violet-500/10",
      emerald:
        "text-emerald-200 bg-emerald-500/10",
    }
  
    return (
      <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
  
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${classes[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
  
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#DDE7F3]">
          {label}
        </p>
  
        <p className="mt-2 text-[28px] font-semibold text-white">
          {value}
        </p>
  
      </div>
    )
  }