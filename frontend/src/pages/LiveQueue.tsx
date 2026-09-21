import {
    Activity,
    AlertTriangle,
    BellRing,
    Clock3,
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
  
      case "MISSED":
        return "border-yellow-400/25 bg-yellow-500/10 text-yellow-200"
  
      case "COMPLETED":
        return "border-violet-400/25 bg-violet-500/10 text-violet-200"
  
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
      "PRIORITY"
    ) {
      return "Immediate"
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
  
    const waitingCount =
      queue.filter(
        (patient) =>
          patient.status !==
            "COMPLETED" &&
          patient.status !==
            "SERVING",
      ).length
  
    const priorityCount =
      queue.filter(
        (patient) =>
          patient.isPriority,
      ).length
  
    return (
      <div className="space-y-6">
  
        {/* ================================================= */}
        {/* LIVE DEMO CONTROL */}
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
  
                  Forecast v{forecastVersion}
  
                </span>
  
              </div>
  
              <h2 className="mt-5 bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[34px] font-semibold tracking-[-0.045em] text-transparent">
  
                Priority-aware Queue Simulation
  
              </h2>
  
              <p className="mt-3 max-w-2xl text-[13px] leading-7 text-[#C8D4E3]">
  
                Demonstrate how QueuePulse reacts when an emergency patient enters an active OPD queue.
  
              </p>
            </div>
  
            {/* BUTTONS */}
  
            <div className="flex flex-wrap gap-3">
  
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
  
              <button
                type="button"
                onClick={resetDemo}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-[12px] font-semibold text-[#DCE5F1] transition hover:border-cyan-400/20 hover:bg-cyan-500/[0.06]"
              >
  
                <RefreshCcw className="h-4 w-4" />
  
                Reset Demo
  
              </button>
  
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
            ).padStart(2, "0")}
            note="General Medicine"
            icon={Activity}
            accent="violet"
          />
  
          <MetricCard
            label="Priority Cases"
            value={String(
              priorityCount,
            ).padStart(2, "0")}
            note={
              priorityInserted
                ? "Emergency inserted"
                : "No active priority"
            }
            icon={ShieldAlert}
            accent="rose"
          />
  
          <MetricCard
            label="Median Wait"
            value={
              priorityInserted
                ? "38m"
                : "24m"
            }
            note={
              priorityInserted
                ? "+14 min impact"
                : "Normal flow"
            }
            icon={Clock3}
            accent="cyan"
          />
  
          <MetricCard
            label="Forecast Health"
            value="86%"
            note="High confidence"
            icon={Sparkles}
            accent="emerald"
          />
  
        </section>
  
        {/* ================================================= */}
        {/* QUEUE + EVENT FEED */}
        {/* ================================================= */}
  
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
  
          {/* QUEUE TABLE */}
  
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
  
                {queue.length} active tokens
  
              </span>
  
            </div>
  
            {/* HEADER */}
  
            <div className="grid grid-cols-[110px_1fr_150px_160px_130px] gap-4 border-b border-white/[0.07] bg-white/[0.018] px-6 py-4">
  
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A8B5C7]">
                Token
              </p>
  
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A8B5C7]">
                Patient Flow
              </p>
  
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A8B5C7]">
                Status
              </p>
  
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A8B5C7]">
                Forecast
              </p>
  
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A8B5C7]">
                Change
              </p>
  
            </div>
  
            {/* QUEUE */}
  
            <div className="divide-y divide-white/[0.07]">
  
              {queue.map(
                (
                  patient,
                  index,
                ) => (
                  <div
                    key={patient.id}
                    className={`relative grid grid-cols-[110px_1fr_150px_160px_130px] items-center gap-4 px-6 py-5 transition-all duration-500 ${
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
                        className={`inline-flex rounded-full border px-3 py-1.5 text-[9px] font-semibold ${getStatusStyle(
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
                        "PRIORITY"
                          ? "text-rose-200"
                          : patient.status ===
                            "SERVING"
                          ? "text-emerald-200"
                          : "text-[#DCE5F1]"
                      }`}
                    >
                      {getEta(patient)}
                    </p>
  
                    {/* CHANGE */}
  
                    <div>
  
                      {priorityInserted &&
                      !patient.isPriority &&
                      patient.status !==
                        "SERVING" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/15 bg-amber-500/[0.07] px-2.5 py-1.5 text-[9px] font-semibold text-amber-200">
  
                          <TimerReset className="h-3 w-3" />
  
                          +14m
  
                        </span>
                      ) : patient.isPriority ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-500/[0.08] px-2.5 py-1.5 text-[9px] font-semibold text-rose-200">
  
                          <Zap className="h-3 w-3" />
  
                          INSERT
  
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
  
          {/* ================================================= */}
          {/* LIVE EVENT FEED */}
          {/* ================================================= */}
  
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
  
              {events.map(
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
                        : "border-violet-400/15 bg-violet-500/[0.05]"
                    }`}
                  >
  
                    <div className="flex items-start gap-3">
  
                      <div
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
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
  
                        <div className="flex items-center gap-2">
  
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
              )}
  
            </div>
  
            {priorityInserted && (
              <div className="mt-5 rounded-[20px] border border-emerald-400/15 bg-emerald-500/[0.05] p-4">
  
                <div className="flex items-start gap-3">
  
                  <BellRing className="mt-0.5 h-4 w-4 text-emerald-200" />
  
                  <div>
  
                    <p className="text-[11px] font-semibold text-emerald-100">
                      Patient notifications queued
                    </p>
  
                    <p className="mt-1 text-[10px] leading-5 text-[#B8C8C2]">
                      Affected patients will receive updated arrival recommendations.
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
    const accentStyles = {
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
      <div className="rounded-[24px] border border-white/[0.09] bg-white/[0.03] p-5">
  
        <div className="flex items-start justify-between">
  
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#DDE7F3]">
            {label}
          </p>
  
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentStyles[accent]}`}
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