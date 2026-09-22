import {
  Activity,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react"

import {
  useQueue,
} from "../context/QueueContext"

import {
  usePermissions,
} from "../hooks/usePermissions"


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
  } = useQueue()


  const {
    user,

    canCallNext,
    canStartConsultation,
    canCompleteConsultation,
    canMarkNoShow,
    canPauseDoctor,
    canResumeDoctor,
  } = usePermissions()


  const servingPatient =
    queue.find(
      (patient) =>
        patient.status === "SERVING",
    )


  const calledPatient =
    queue.find(
      (patient) =>
        patient.status === "CALLED",
    )


  const activeQueue =
    queue.filter(
      (patient) =>
        patient.status !== "COMPLETED" &&
        patient.status !== "MISSED",
    )


  const waitingPatients =
    activeQueue.filter(
      (patient) =>
        patient.status === "WAITING" ||
        patient.status === "READY" ||
        patient.status === "PRIORITY" ||
        patient.status === "NOT_ARRIVED" ||
        patient.status === "CREATED",
    )


  const priorityPatients =
    activeQueue.filter(
      (patient) =>
        patient.isPriority,
    )


  const doctorPaused =
    doctorStatus === "PAUSED"


  return (
    <div className="space-y-6">

      {/* ================================================= */}
      {/* DOCTOR HERO */}
      {/* ================================================= */}

      <section className="relative overflow-hidden rounded-[30px] border border-violet-400/15 bg-[linear-gradient(135deg,rgba(34,27,78,0.96),rgba(7,18,40,0.97))] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.30)]">

        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />


        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">

                <Stethoscope className="h-3.5 w-3.5" />

                Clinical Workflow

              </span>


              <span
                className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${
                  doctorStatus === "SERVING"
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                    : doctorStatus === "PAUSED"
                    ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-200"
                    : "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
                }`}
              >

                {doctorStatus}

              </span>


              <span className="rounded-full border border-violet-400/15 bg-violet-500/[0.06] px-3 py-1.5 text-[10px] font-semibold text-violet-100">

                Forecast v{forecastVersion}

              </span>

            </div>


            <h2 className="mt-5 bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[34px] font-semibold tracking-[-0.045em] text-transparent">

              Dr. Meera Shah

            </h2>


            <p className="mt-3 text-[13px] leading-7 text-[#C9D4E2]">

              General Medicine · Room 201

            </p>


            {user && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2">

                <ShieldCheck className="h-4 w-4 text-violet-200" />

                <p className="text-[10px] text-[#B8C5D5]">

                  Logged in as{" "}

                  <span className="font-semibold text-white">
                    {user.name}
                  </span>

                  {" · "}

                  {user.role
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(
                      /\b\w/g,
                      (letter) =>
                        letter.toUpperCase(),
                    )}

                </p>

              </div>
            )}

          </div>


          {/* DOCTOR PAUSE / RESUME */}

          <div>

            {doctorPaused ? (
              canResumeDoctor ? (
                <button
                  type="button"
                  onClick={
                    resumeDoctor
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-[12px] font-semibold text-white shadow-[0_15px_35px_rgba(16,185,129,0.20)] transition hover:scale-[1.02]"
                >

                  <Play className="h-4 w-4" />

                  Resume Consultations

                </button>
              ) : (
                <RestrictedAction
                  label="Resume doctor"
                />
              )
            ) : canPauseDoctor ? (
              <button
                type="button"
                onClick={
                  pauseDoctor
                }
                disabled={
                  Boolean(
                    servingPatient,
                  )
                }
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[12px] font-semibold transition ${
                  servingPatient
                    ? "cursor-not-allowed border border-white/[0.08] bg-white/[0.03] text-[#77869B]"
                    : "border border-yellow-400/20 bg-yellow-500/[0.08] text-yellow-100 hover:bg-yellow-500/[0.14]"
                }`}
              >

                <Pause className="h-4 w-4" />

                {servingPatient
                  ? "Complete Current Case First"
                  : "Pause Doctor"}

              </button>
            ) : (
              <RestrictedAction
                label="Pause doctor"
              />
            )}

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* METRICS */}
      {/* ================================================= */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          label="Doctor Status"
          value={doctorStatus}
          note="Current consultation state"
          icon={Activity}
          accent="emerald"
        />


        <MetricCard
          label="Patients Waiting"
          value={String(
            waitingPatients.length,
          ).padStart(
            2,
            "0",
          )}
          note="Eligible queue patients"
          icon={Clock3}
          accent="cyan"
        />


        <MetricCard
          label="Priority Cases"
          value={String(
            priorityPatients.length,
          ).padStart(
            2,
            "0",
          )}
          note="Active triage priority"
          icon={ShieldCheck}
          accent="rose"
        />


        <MetricCard
          label="Forecast"
          value={`v${forecastVersion}`}
          note="Current queue model"
          icon={RotateCcw}
          accent="violet"
        />

      </section>


      {/* ================================================= */}
      {/* CLINICAL CONTROL */}
      {/* ================================================= */}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">

        <div className="rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.22)]">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">

              Consultation Control

            </p>

            <h3 className="mt-2 text-[21px] font-semibold text-white">

              Patient workflow

            </h3>

          </div>


          {/* =========================================== */}
          {/* CURRENTLY SERVING */}
          {/* =========================================== */}

          {servingPatient ? (
            <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-500/[0.06] p-5">

              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200">

                    <Activity className="h-3 w-3" />

                    Consultation Active

                  </div>


                  <p className="mt-5 text-[32px] font-semibold tracking-[-0.04em] text-white">

                    {servingPatient.token}

                  </p>


                  <p className="mt-2 text-[11px] text-[#ACBCCD]">

                    {servingPatient.note}

                  </p>

                </div>


                <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.035] px-5 py-4 text-right">

                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#91A0B4]">

                    Status

                  </p>

                  <p className="mt-2 text-[13px] font-semibold text-emerald-100">

                    Serving

                  </p>

                </div>

              </div>


              <div className="mt-5">

                {canCompleteConsultation ? (
                  <button
                    type="button"
                    onClick={
                      completeCurrentConsultation
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-[11px] font-semibold text-white"
                  >

                    <CheckCircle2 className="h-4 w-4" />

                    Complete Consultation

                  </button>
                ) : (
                  <RestrictedAction
                    label="Complete consultation"
                  />
                )}

              </div>

            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05]">

                  <Stethoscope className="h-5 w-5 text-[#8FA0B5]" />

                </div>


                <div>

                  <p className="text-[12px] font-semibold text-white">

                    No active consultation

                  </p>

                  <p className="mt-1 text-[10px] text-[#8D9CB0]">

                    Call the next eligible patient to continue.

                  </p>

                </div>

              </div>

            </div>
          )}


          {/* =========================================== */}
          {/* CALLED PATIENT */}
          {/* =========================================== */}

          {calledPatient && (
            <div className="mt-4 rounded-[24px] border border-violet-400/20 bg-violet-500/[0.06] p-5">

              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>

                  <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[9px] font-semibold text-violet-100">

                    Patient Called

                  </span>


                  <p className="mt-4 text-[28px] font-semibold text-white">

                    {calledPatient.token}

                  </p>


                  <p className="mt-2 text-[10px] text-[#AAB7C9]">

                    Waiting to enter Room 201

                  </p>

                </div>

              </div>


              <div className="mt-5 flex flex-wrap gap-3">

                {canStartConsultation ? (
                  <button
                    type="button"
                    onClick={
                      startCalledPatient
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-3 text-[11px] font-semibold text-white"
                  >

                    <Play className="h-4 w-4" />

                    Start Consultation

                  </button>
                ) : (
                  <RestrictedAction
                    label="Start consultation"
                  />
                )}


                {canMarkNoShow ? (
                  <button
                    type="button"
                    onClick={
                      markCalledPatientNoShow
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/[0.07] px-4 py-3 text-[11px] font-semibold text-rose-100"
                  >

                    <UserRoundX className="h-4 w-4" />

                    Mark No-show

                  </button>
                ) : null}

              </div>

            </div>
          )}


          {/* =========================================== */}
          {/* CALL NEXT */}
          {/* =========================================== */}

          <div className="mt-5 border-t border-white/[0.08] pt-5">

            {canCallNext ? (
              <button
                type="button"
                onClick={
                  callNextPatient
                }
                disabled={
                  Boolean(
                    servingPatient,
                  ) ||
                  Boolean(
                    calledPatient,
                  ) ||
                  doctorPaused
                }
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[11px] font-semibold transition ${
                  servingPatient ||
                  calledPatient ||
                  doctorPaused
                    ? "cursor-not-allowed border border-white/[0.08] bg-white/[0.03] text-[#6E7D91]"
                    : "bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white hover:scale-[1.01]"
                }`}
              >

                <UserRoundCheck className="h-4 w-4" />

                {doctorPaused
                  ? "Doctor Paused"
                  : servingPatient
                  ? "Complete Current Consultation"
                  : calledPatient
                  ? `${calledPatient.token} Already Called`
                  : "Call Next Patient"}

              </button>
            ) : (
              <RestrictedAction
                label="Call next patient"
              />
            )}

          </div>

        </div>


        {/* ================================================= */}
        {/* NEXT PATIENTS */}
        {/* ================================================= */}

        <div className="rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94 p-5 shadow-[0_25px_70px_rgba(0,0,0,0.22)]">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-violet-200">

              Upcoming Queue

            </p>

            <h3 className="mt-2 text-[19px] font-semibold text-white">

              Next patients

            </h3>

          </div>


          <div className="mt-5 space-y-3">

            {waitingPatients.length === 0 ? (
              <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.025] p-5">

                <p className="text-[10px] text-[#91A0B4]">

                  No patients are waiting.

                </p>

              </div>
            ) : (
              waitingPatients
                .slice(
                  0,
                  6,
                )
                .map(
                  (
                    patient,
                    index,
                  ) => (
                    <div
                      key={
                        patient.id
                      }
                      className={`rounded-[20px] border p-4 ${
                        patient.isPriority
                          ? "border-rose-400/20 bg-rose-500/[0.06]"
                          : "border-white/[0.08] bg-white/[0.025]"
                      }`}
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-3">

                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-bold ${
                              patient.isPriority
                                ? "bg-rose-500/12 text-rose-100"
                                : "bg-violet-500/10 text-violet-100"
                            }`}
                          >

                            {index + 1}

                          </div>


                          <div>

                            <div className="flex items-center gap-2">

                              <p className="text-[13px] font-semibold text-white">

                                {patient.token}

                              </p>


                              {patient.isPriority && (
                                <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-2 py-1 text-[8px] font-bold text-rose-200">

                                  PRIORITY

                                </span>
                              )}

                            </div>


                            <p className="mt-1 text-[9px] text-[#8E9DB1]">

                              {patient.status}

                            </p>

                          </div>

                        </div>


                        <div className="text-right">

                          <p className="text-[11px] font-semibold text-cyan-100">

                            {patient.etaMin}–
                            {patient.etaMax}m

                          </p>


                          <p className="mt-1 text-[8px] text-[#7C8CA1]">

                            ETA window

                          </p>

                        </div>

                      </div>

                    </div>
                  ),
                )
            )}

          </div>

        </div>

      </section>

    </div>
  )
}


function RestrictedAction({
  label,
}: {
  label: string
}) {
  return (
    <div
      title={`Your current role cannot perform ${label.toLowerCase()}.`}
      className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[10px] font-semibold text-[#77869A]"
    >

      <LockKeyhole className="h-3.5 w-3.5" />

      Restricted

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
  const styles = {
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
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}
        >

          <Icon className="h-4 w-4" />

        </div>

      </div>


      <p className="mt-4 text-[24px] font-semibold tracking-[-0.035em] text-white">

        {value}

      </p>


      <p className="mt-2 text-[10px] font-medium text-[#AAB7C9]">

        {note}

      </p>

    </div>
  )
}