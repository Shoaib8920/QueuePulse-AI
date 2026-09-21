import {
    Activity,
    CheckCircle2,
    Clock3,
    Coffee,
    Play,
    RotateCcw,
    Stethoscope,
    UserCheck,
    UserX,
    Zap,
  } from "lucide-react"
  
  import {
    useQueue,
  } from "../context/QueueContext"
  
  export default function Doctors() {
    const {
      queue,
      doctorStatus,
      forecastVersion,
  
      completeCurrentConsultation,
      callNextPatient,
      startCalledPatient,
      markCalledPatientNoShow,
  
      pauseDoctor,
      resumeDoctor,
      resetDemo,
    } = useQueue()
  
    const servingPatient =
      queue.find(
        (patient) =>
          patient.status ===
          "SERVING",
      )
  
    const calledPatient =
      queue.find(
        (patient) =>
          patient.status ===
          "CALLED",
      )
  
    const waitingPatients =
      queue.filter(
        (patient) =>
          patient.status ===
            "WAITING" ||
          patient.status ===
            "READY" ||
          patient.status ===
            "PRIORITY" ||
          patient.status ===
            "CALLED",
      )
  
    const completedCount =
      queue.filter(
        (patient) =>
          patient.status ===
          "COMPLETED",
      ).length
  
    const missedCount =
      queue.filter(
        (patient) =>
          patient.status ===
          "MISSED",
      ).length
  
    const canCallNext =
      !servingPatient &&
      !calledPatient &&
      doctorStatus !==
        "PAUSED"
  
    const canStart =
      Boolean(
        calledPatient,
      ) &&
      doctorStatus !==
        "PAUSED"
  
    const canComplete =
      Boolean(
        servingPatient,
      )
  
    const canPause =
      !servingPatient &&
      doctorStatus !==
        "PAUSED"
  
    return (
      <div className="space-y-6">
  
        {/* ================================================= */}
        {/* DOCTOR CONTROL HERO */}
        {/* ================================================= */}
  
        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(28,31,72,0.97),rgba(7,18,39,0.97))] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
  
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
  
          <div className="relative flex flex-wrap items-start justify-between gap-6">
  
            <div>
  
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">
  
                <Stethoscope className="h-3.5 w-3.5" />
  
                Doctor Console
  
              </span>
  
              <h2 className="mt-5 bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[36px] font-semibold tracking-[-0.045em] text-transparent">
  
                Dr. Meera Shah
  
              </h2>
  
              <p className="mt-2 text-[13px] text-[#BFCADD]">
  
                General Medicine · Room 201
  
              </p>
  
            </div>
  
            {/* STATUS */}
  
            <div
              className={`rounded-[24px] border px-6 py-4 ${
                doctorStatus ===
                "SERVING"
                  ? "border-emerald-400/20 bg-emerald-500/[0.07]"
                  : doctorStatus ===
                    "PAUSED"
                  ? "border-yellow-400/20 bg-yellow-500/[0.07]"
                  : "border-cyan-400/20 bg-cyan-500/[0.07]"
              }`}
            >
  
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#B8C4D5]">
                Doctor Status
              </p>
  
              <div className="mt-2 flex items-center gap-2">
  
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    doctorStatus ===
                    "SERVING"
                      ? "bg-emerald-400"
                      : doctorStatus ===
                        "PAUSED"
                      ? "bg-yellow-300"
                      : "bg-cyan-300"
                  }`}
                />
  
                <p className="text-[18px] font-semibold text-white">
  
                  {doctorStatus}
  
                </p>
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
        {/* ================================================= */}
        {/* MAIN DOCTOR CONSOLE */}
        {/* ================================================= */}
  
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
  
          {/* CURRENT PATIENT */}
  
          <div className="rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94 p-7">
  
            <div className="flex flex-wrap items-start justify-between gap-5">
  
              <div>
  
                <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-violet-200">
                  Current Consultation
                </p>
  
                {servingPatient ? (
                  <>
                    <p className="mt-4 text-[60px] font-semibold leading-none tracking-[-0.06em] text-white">
  
                      {
                        servingPatient.token
                      }
  
                    </p>
  
                    <p className="mt-5 text-[13px] font-semibold text-[#DDE6F1]">
  
                      {
                        servingPatient.department
                      }
  
                    </p>
  
                    <p className="mt-2 text-[11px] text-[#8FA0B5]">
  
                      Consultation currently in progress
  
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-5 text-[28px] font-semibold text-white">
  
                      No active consultation
  
                    </p>
  
                    <p className="mt-2 text-[11px] leading-5 text-[#94A3B8]">
  
                      Complete, call, or start the next patient using the operational controls.
  
                    </p>
                  </>
                )}
  
              </div>
  
              {servingPatient && (
                <div className="rounded-[20px] border border-emerald-400/15 bg-emerald-500/[0.06] p-4">
  
                  <Clock3 className="h-5 w-5 text-emerald-200" />
  
                  <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.17em] text-[#AFC1BC]">
                    Elapsed
                  </p>
  
                  <p className="mt-1 text-[22px] font-semibold text-white">
                    08:42
                  </p>
  
                </div>
              )}
  
            </div>
  
            {/* PRIMARY ACTION */}
  
            <div className="mt-8">
  
              <button
                type="button"
                onClick={
                  completeCurrentConsultation
                }
                disabled={
                  !canComplete
                }
                className={`flex w-full items-center justify-center gap-2 rounded-[18px] px-5 py-4 text-[13px] font-semibold transition ${
                  canComplete
                    ? "bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white shadow-[0_15px_35px_rgba(6,182,212,0.22)] hover:scale-[1.005]"
                    : "cursor-not-allowed border border-white/10 bg-white/[0.035] text-[#65758A]"
                }`}
              >
  
                <CheckCircle2 className="h-4 w-4" />
  
                Complete Consultation
  
              </button>
  
            </div>
  
            {/* CALLED PATIENT */}
  
            <div className="mt-6 rounded-[24px] border border-white/[0.08] bg-black/10 p-5">
  
              <div className="flex items-start justify-between gap-4">
  
                <div>
  
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A8B7CA]">
  
                    Called Patient
  
                  </p>
  
                  <p className="mt-2 text-[26px] font-semibold text-white">
  
                    {calledPatient
                      ? calledPatient.token
                      : "—"}
  
                  </p>
  
                  <p className="mt-1 text-[10px] text-[#8695A9]">
  
                    {calledPatient
                      ? "Waiting to enter consultation room"
                      : "No patient currently called"}
  
                  </p>
  
                </div>
  
                <UserCheck className="h-5 w-5 text-cyan-200" />
  
              </div>
  
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
  
                <button
                  type="button"
                  onClick={
                    startCalledPatient
                  }
                  disabled={
                    !canStart
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[11px] font-semibold transition ${
                    canStart
                      ? "border border-cyan-400/20 bg-cyan-500/[0.08] text-cyan-100 hover:bg-cyan-500/[0.14]"
                      : "cursor-not-allowed border border-white/[0.07] bg-white/[0.025] text-[#617085]"
                  }`}
                >
  
                  <Play className="h-3.5 w-3.5" />
  
                  Start Consultation
  
                </button>
  
                <button
                  type="button"
                  onClick={
                    markCalledPatientNoShow
                  }
                  disabled={
                    !calledPatient
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[11px] font-semibold transition ${
                    calledPatient
                      ? "border border-rose-400/20 bg-rose-500/[0.07] text-rose-100 hover:bg-rose-500/[0.12]"
                      : "cursor-not-allowed border border-white/[0.07] bg-white/[0.025] text-[#617085]"
                  }`}
                >
  
                  <UserX className="h-3.5 w-3.5" />
  
                  Mark No-show
  
                </button>
  
              </div>
  
            </div>
  
          </div>
  
          {/* OPERATIONAL CONTROLS */}
  
          <div className="space-y-4">
  
            <div className="rounded-[28px] border border-white/[0.09] bg-white/[0.035] p-6">
  
              <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">
                Queue Controls
              </p>
  
              <h3 className="mt-2 text-[19px] font-semibold text-white">
                Operational Actions
              </h3>
  
              <div className="mt-6 space-y-3">
  
                <button
                  type="button"
                  onClick={
                    callNextPatient
                  }
                  disabled={
                    !canCallNext
                  }
                  className={`flex w-full items-center justify-between rounded-[16px] border px-4 py-4 transition ${
                    canCallNext
                      ? "border-violet-400/20 bg-violet-500/[0.07] hover:bg-violet-500/[0.12]"
                      : "cursor-not-allowed border-white/[0.07] bg-white/[0.025]"
                  }`}
                >
  
                  <div className="flex items-center gap-3">
  
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/12">
  
                      <Zap className="h-4 w-4 text-violet-200" />
  
                    </div>
  
                    <div className="text-left">
  
                      <p
                        className={`text-[11px] font-semibold ${
                          canCallNext
                            ? "text-white"
                            : "text-[#647388]"
                        }`}
                      >
                        Call Next Patient
                      </p>
  
                      <p className="mt-1 text-[9px] text-[#748399]">
                        Advance queue
                      </p>
  
                    </div>
  
                  </div>
  
                </button>
  
                {doctorStatus ===
                "PAUSED" ? (
                  <button
                    type="button"
                    onClick={
                      resumeDoctor
                    }
                    className="flex w-full items-center justify-between rounded-[16px] border border-emerald-400/20 bg-emerald-500/[0.07] px-4 py-4 transition hover:bg-emerald-500/[0.12]"
                  >
  
                    <div className="flex items-center gap-3">
  
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12">
  
                        <Play className="h-4 w-4 text-emerald-200" />
  
                      </div>
  
                      <div className="text-left">
  
                        <p className="text-[11px] font-semibold text-white">
                          Resume Doctor
                        </p>
  
                        <p className="mt-1 text-[9px] text-[#7FA695]">
                          Re-open consultation channel
                        </p>
  
                      </div>
  
                    </div>
  
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      pauseDoctor
                    }
                    disabled={
                      !canPause
                    }
                    className={`flex w-full items-center justify-between rounded-[16px] border px-4 py-4 transition ${
                      canPause
                        ? "border-yellow-400/20 bg-yellow-500/[0.06] hover:bg-yellow-500/[0.10]"
                        : "cursor-not-allowed border-white/[0.07] bg-white/[0.025]"
                    }`}
                  >
  
                    <div className="flex items-center gap-3">
  
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10">
  
                        <Coffee className="h-4 w-4 text-yellow-200" />
  
                      </div>
  
                      <div className="text-left">
  
                        <p
                          className={`text-[11px] font-semibold ${
                            canPause
                              ? "text-white"
                              : "text-[#647388]"
                          }`}
                        >
                          Pause Doctor
                        </p>
  
                        <p className="mt-1 text-[9px] text-[#887F67]">
                          Temporary break
                        </p>
  
                      </div>
  
                    </div>
  
                  </button>
                )}
  
              </div>
  
            </div>
  
            {/* FORECAST STATUS */}
  
            <div className="rounded-[28px] border border-cyan-400/15 bg-gradient-to-br from-cyan-500/[0.06] to-violet-500/[0.04] p-6">
  
              <p className="text-[9px] font-bold uppercase tracking-[0.20em] text-cyan-200">
                Forecast Engine
              </p>
  
              <div className="mt-4 flex items-end justify-between">
  
                <div>
  
                  <p className="text-[30px] font-semibold text-white">
  
                    v{forecastVersion}
  
                  </p>
  
                  <p className="mt-1 text-[10px] text-[#9AB0BF]">
                    Current model state
                  </p>
  
                </div>
  
                <Activity className="h-6 w-6 text-cyan-200" />
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
        {/* ================================================= */}
        {/* QUEUE SUMMARY */}
        {/* ================================================= */}
  
        <section className="grid gap-4 md:grid-cols-4">
  
          <SummaryCard
            label="Waiting"
            value={String(
              waitingPatients.length,
            ).padStart(
              2,
              "0",
            )}
            accent="violet"
          />
  
          <SummaryCard
            label="Serving"
            value={
              servingPatient
                ? "01"
                : "00"
            }
            accent="cyan"
          />
  
          <SummaryCard
            label="Completed"
            value={String(
              completedCount,
            ).padStart(
              2,
              "0",
            )}
            accent="emerald"
          />
  
          <SummaryCard
            label="Missed"
            value={String(
              missedCount,
            ).padStart(
              2,
              "0",
            )}
            accent="rose"
          />
  
        </section>
  
        {/* RESET */}
  
        <div className="flex justify-end">
  
          <button
            type="button"
            onClick={resetDemo}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] px-4 py-3 text-[10px] font-semibold text-[#BAC7D8] transition hover:border-violet-400/20 hover:text-white"
          >
  
            <RotateCcw className="h-3.5 w-3.5" />
  
            Reset Full Demo
  
          </button>
  
        </div>
  
      </div>
    )
  }
  
  function SummaryCard({
    label,
    value,
    accent,
  }: {
    label: string
    value: string
  
    accent:
      | "violet"
      | "cyan"
      | "emerald"
      | "rose"
  }) {
    const colors = {
      violet:
        "from-violet-500/[0.08] border-violet-400/15 text-violet-200",
  
      cyan:
        "from-cyan-500/[0.08] border-cyan-400/15 text-cyan-200",
  
      emerald:
        "from-emerald-500/[0.08] border-emerald-400/15 text-emerald-200",
  
      rose:
        "from-rose-500/[0.08] border-rose-400/15 text-rose-200",
    }
  
    return (
      <div
        className={`rounded-[24px] border bg-gradient-to-br to-transparent p-5 ${colors[accent]}`}
      >
  
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#C8D3E1]">
          {label}
        </p>
  
        <p className="mt-3 text-[32px] font-semibold text-white">
          {value}
        </p>
  
      </div>
    )
  }