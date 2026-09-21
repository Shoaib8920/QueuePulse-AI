import {
    Activity,
    AlertTriangle,
    BellRing,
    CheckCircle2,
    Clock3,
    RadioTower,
    ShieldCheck,
    Sparkles,
    Stethoscope,
    Users,
    Wifi,
  } from "lucide-react"
  
  import {
    Link,
    useParams,
  } from "react-router-dom"
  
  import {
    useQueue,
  } from "../context/QueueContext"
  
  import queuePulseIcon from "../assets/queuepulse-icon.png"
  
  /*
    Demo OPD starts at 11:00 AM.
  
    G-42:
    40–55 min  -> 11:40–11:55
    After +14m -> 11:54–12:09
  
    We round patient-facing estimates
    to the nearest 5 minutes, so:
    11:54 -> 11:55
    12:09 -> 12:10
  */
  
  const DEMO_START_MINUTES =
    11 * 60
  
  function roundToNearestFive(
    value: number,
  ) {
    return Math.round(value / 5) * 5
  }
  
  function formatClockTime(
    queueMinutes: number,
  ) {
    const total =
      DEMO_START_MINUTES +
      roundToNearestFive(
        queueMinutes,
      )
  
    const hours24 =
      Math.floor(total / 60) %
      24
  
    const minutes =
      total % 60
  
    const period =
      hours24 >= 12
        ? "PM"
        : "AM"
  
    const hours12 =
      hours24 % 12 || 12
  
    return `${hours12}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`
  }
  
  export default function PatientToken() {
    const {
      reference,
    } = useParams()
  
    const {
      queue,
      priorityInserted,
      forecastVersion,
    } = useQueue()
  
    const normalizedReference =
      reference?.toUpperCase()
  
    const patient =
      queue.find(
        (item) =>
          item.token.toUpperCase() ===
          normalizedReference,
      )
  
    const nowServing =
      queue.find(
        (item) =>
          item.status ===
          "SERVING",
      )
  
    if (!patient) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-white">
  
          <div className="w-full max-w-[520px] rounded-[32px] border border-white/10 bg-[#0B1025] p-8 text-center">
  
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-violet-500/10">
  
              <AlertTriangle className="h-7 w-7 text-violet-200" />
  
            </div>
  
            <h1 className="mt-6 text-[26px] font-semibold">
              Token not found
            </h1>
  
            <p className="mt-3 text-[13px] leading-6 text-[#AEBBCD]">
              We could not find a live QueuePulse token matching this reference.
            </p>
  
            <Link
              to="/token/G-42"
              className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-3 text-[12px] font-semibold"
            >
              Open Demo Token G-42
            </Link>
  
          </div>
  
        </div>
      )
    }
  
    const activeQueue =
      queue.filter(
        (item) =>
          item.status !==
            "COMPLETED" &&
          item.status !==
            "MISSED",
      )
  
    const patientIndex =
      activeQueue.findIndex(
        (item) =>
          item.id ===
          patient.id,
      )
  
    const patientsAhead =
      patientIndex >= 0
        ? activeQueue
            .slice(
              0,
              patientIndex,
            )
            .filter(
              (item) =>
                item.status !==
                "SERVING",
            ).length
        : 0
  
    const expectedStart =
      `${formatClockTime(
        patient.etaMin,
      )} – ${formatClockTime(
        patient.etaMax,
      )}`
  
    const arrivalMinutes =
      Math.max(
        0,
        patient.etaMin - 15,
      )
  
    const recommendedArrival =
      formatClockTime(
        arrivalMinutes,
      )
  
    const confidence =
      priorityInserted
        ? 82
        : 86
  
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
  
        {/* BACKGROUND */}
  
        <div className="pointer-events-none fixed inset-0">
  
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_28%),linear-gradient(180deg,#070A1D_0%,#040612_100%)]" />
  
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(120,130,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(120,130,255,0.15) 1px, transparent 1px)",
              backgroundSize:
                "44px 44px",
            }}
          />
  
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
  
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
  
        </div>
  
        <div className="relative mx-auto min-h-screen max-w-[1180px] px-4 py-5 md:px-7 md:py-8">
  
          {/* ============================================== */}
          {/* PATIENT NAVBAR */}
          {/* ============================================== */}
  
          <header className="flex items-center justify-between rounded-[24px] border border-white/[0.09] bg-[#090D20]/80 px-4 py-3 backdrop-blur-xl md:px-5">
  
            <div className="flex items-center gap-3">
  
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[14px] border border-white/[0.10] bg-[#080B1C]">
  
                <img
                  src={queuePulseIcon}
                  alt="QueuePulse AI"
                  className="h-10 w-10 object-contain"
                />
  
              </div>
  
              <div>
  
                <p className="text-[15px] font-semibold tracking-[-0.03em]">
  
                  <span className="text-white">
                    Queue
                  </span>
  
                  <span className="bg-gradient-to-r from-cyan-200 to-blue-300 bg-clip-text text-transparent">
                    Pulse
                  </span>
  
                  <span className="ml-1 bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                    AI
                  </span>
  
                </p>
  
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.23em] text-cyan-200">
  
                  Patient Live Token
  
                </p>
  
              </div>
  
            </div>
  
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/[0.08] px-3 py-2">
  
              <span className="relative flex h-2 w-2">
  
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
  
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
  
              </span>
  
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-200">
  
                Live
  
              </span>
  
            </div>
  
          </header>
  
          {/* ============================================== */}
          {/* HERO */}
          {/* ============================================== */}
  
          <main className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_390px]">
  
            {/* LEFT */}
  
            <section className="relative overflow-hidden rounded-[32px] border border-white/[0.10] bg-[linear-gradient(145deg,rgba(30,28,77,0.97),rgba(8,18,42,0.97))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.32)] md:p-8">
  
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/[0.10] blur-3xl" />
  
              <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-violet-500/[0.12] blur-3xl" />
  
              <div className="relative">
  
                <div className="flex flex-wrap items-center justify-between gap-3">
  
                  <div>
  
                    <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-[#B9C6D9]">
  
                      Your Token
  
                    </p>
  
                    <p className="mt-3 bg-gradient-to-r from-white via-cyan-100 to-violet-200 bg-clip-text text-[64px] font-semibold leading-none tracking-[-0.065em] text-transparent md:text-[82px]">
  
                      {patient.token}
  
                    </p>
  
                  </div>
  
                  <div className="rounded-[22px] border border-cyan-400/20 bg-cyan-500/[0.07] px-5 py-4">
  
                    <div className="flex items-center gap-2">
  
                      <ShieldCheck className="h-4 w-4 text-cyan-200" />
  
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">
  
                        Confidence
  
                      </p>
  
                    </div>
  
                    <p className="mt-2 text-[26px] font-semibold text-white">
  
                      {confidence}%
  
                    </p>
  
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200">
  
                      High
  
                    </p>
  
                  </div>
  
                </div>
  
                <div className="mt-7 flex items-center gap-3">
  
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/12">
  
                    <Stethoscope className="h-4 w-4 text-violet-200" />
  
                  </div>
  
                  <div>
  
                    <p className="text-[14px] font-semibold text-white">
                      General Medicine
                    </p>
  
                    <p className="mt-1 text-[10px] text-[#96A6BB]">
                      Dr. Meera Shah · Room 201
                    </p>
  
                  </div>
  
                </div>
  
                {/* FORECAST */}
  
                <div className="mt-8 rounded-[28px] border border-white/[0.10] bg-black/[0.13] p-6">
  
                  <div className="flex items-center gap-2">
  
                    <Sparkles className="h-4 w-4 text-cyan-200" />
  
                    <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">
  
                      Expected Consultation
  
                    </p>
  
                  </div>
  
                  <p className="mt-4 text-[34px] font-semibold tracking-[-0.045em] text-white md:text-[43px]">
  
                    {expectedStart}
  
                  </p>
  
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
  
                    <div className="rounded-[20px] border border-cyan-400/15 bg-cyan-500/[0.06] p-4">
  
                      <div className="flex items-center gap-2">
  
                        <Clock3 className="h-4 w-4 text-cyan-200" />
  
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#BCD7E0]">
  
                          Arrive By
  
                        </p>
  
                      </div>
  
                      <p className="mt-3 text-[22px] font-semibold text-white">
  
                        {recommendedArrival}
  
                      </p>
  
                    </div>
  
                    <div className="rounded-[20px] border border-violet-400/15 bg-violet-500/[0.06] p-4">
  
                      <div className="flex items-center gap-2">
  
                        <Users className="h-4 w-4 text-violet-200" />
  
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#D1C9EA]">
  
                          Patients Ahead
  
                        </p>
  
                      </div>
  
                      <p className="mt-3 text-[22px] font-semibold text-white">
  
                        {patientsAhead}
  
                      </p>
  
                    </div>
  
                  </div>
  
                </div>
  
                {/* ARRIVAL GUIDANCE */}
  
                <div className="mt-5 flex items-start gap-3 rounded-[22px] border border-emerald-400/15 bg-emerald-500/[0.055] p-4">
  
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
  
                  <div>
  
                    <p className="text-[11px] font-semibold text-emerald-100">
  
                      You do not need to wait in the hospital queue yet.
  
                    </p>
  
                    <p className="mt-1 text-[10px] leading-5 text-[#B4C8C2]">
  
                      Plan to reach the OPD by{" "}
                      <span className="font-semibold text-white">
                        {recommendedArrival}
                      </span>
                      . QueuePulse will keep updating this window if conditions change.
  
                    </p>
  
                  </div>
  
                </div>
  
              </div>
  
            </section>
  
            {/* ============================================== */}
            {/* RIGHT — LIVE QUEUE */}
            {/* ============================================== */}
  
            <section className="space-y-5">
  
              <div className="rounded-[30px] border border-cyan-400/15 bg-[linear-gradient(145deg,rgba(5,43,56,0.72),rgba(7,17,35,0.94))] p-6">
  
                <div className="flex items-center justify-between">
  
                  <div className="flex items-center gap-2">
  
                    <RadioTower className="h-4 w-4 text-emerald-200" />
  
                    <p className="text-[10px] font-bold uppercase tracking-[0.21em] text-emerald-200">
  
                      Now Serving
  
                    </p>
  
                  </div>
  
                  <Wifi className="h-4 w-4 text-cyan-200" />
  
                </div>
  
                <p className="mt-6 text-[56px] font-semibold tracking-[-0.06em] text-white">
  
                  {nowServing?.token ??
                    "—"}
  
                </p>
  
                <p className="mt-3 text-[12px] font-medium text-[#D8E3EC]">
                  General Medicine
                </p>
  
                <p className="mt-1 text-[10px] text-[#8FA1B4]">
                  Room 201
                </p>
  
                <div className="mt-6 rounded-[20px] border border-white/[0.08] bg-black/10 p-4">
  
                  <div className="flex items-center gap-2">
  
                    <Activity className="h-4 w-4 text-emerald-200" />
  
                    <p className="text-[11px] text-[#D4E0E8]">
  
                      Consultation currently in progress
  
                    </p>
  
                  </div>
  
                </div>
  
              </div>
  
              {/* LIVE STATUS */}
  
              <div className="rounded-[30px] border border-white/[0.09] bg-[#0A1023]/92 p-6">
  
                <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-[#DCE7F3]">
  
                  Live Status
  
                </p>
  
                <div className="mt-5 space-y-3">
  
                  <StatusItem
                    label="Forecast Version"
                    value={`v${forecastVersion}`}
                    color="violet"
                  />
  
                  <StatusItem
                    label="Token Status"
                    value={
                      patient.status
                    }
                    color="cyan"
                  />
  
                  <StatusItem
                    label="Notifications"
                    value="Active"
                    color="emerald"
                  />
  
                </div>
  
              </div>
  
            </section>
  
          </main>
  
          {/* ============================================== */}
          {/* LIVE UPDATE */}
          {/* ============================================== */}
  
          <section className="mt-5">
  
            {priorityInserted ? (
              <div className="relative overflow-hidden rounded-[30px] border border-rose-400/20 bg-[linear-gradient(135deg,rgba(73,17,55,0.42),rgba(15,12,38,0.90))] p-6 md:p-7">
  
                <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-fuchsia-500/[0.09] blur-3xl" />
  
                <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
  
                  <div className="flex items-start gap-4">
  
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-rose-400/20 bg-rose-500/[0.10]">
  
                      <BellRing className="h-5 w-5 text-rose-200" />
  
                    </div>
  
                    <div>
  
                      <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-rose-200">
  
                        Live Update
  
                      </p>
  
                      <h3 className="mt-2 text-[20px] font-semibold text-white">
  
                        Your waiting window has changed.
  
                      </h3>
  
                      <p className="mt-2 max-w-2xl text-[11px] leading-6 text-[#D1BCC8]">
  
                        A priority clinical case entered the queue. Your consultation estimate and recommended arrival were automatically recalculated.
  
                      </p>
  
                      <p className="mt-3 text-[10px] text-[#A995A3]">
  
                        No private medical details are shared with patients.
  
                      </p>
  
                    </div>
  
                  </div>
  
                  <div className="grid min-w-[300px] grid-cols-2 gap-3">
  
                    <div className="rounded-[18px] border border-rose-400/15 bg-rose-500/[0.07] p-4">
  
                      <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-rose-200">
                        Updated ETA
                      </p>
  
                      <p className="mt-2 text-[15px] font-semibold text-white">
                        {expectedStart}
                      </p>
  
                    </div>
  
                    <div className="rounded-[18px] border border-cyan-400/15 bg-cyan-500/[0.06] p-4">
  
                      <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-cyan-200">
                        New Arrival
                      </p>
  
                      <p className="mt-2 text-[15px] font-semibold text-white">
                        {recommendedArrival}
                      </p>
  
                    </div>
  
                  </div>
  
                </div>
  
              </div>
            ) : (
              <div className="rounded-[28px] border border-emerald-400/15 bg-emerald-500/[0.045] p-5">
  
                <div className="flex items-center gap-3">
  
                  <CheckCircle2 className="h-4 w-4 text-emerald-200" />
  
                  <div>
  
                    <p className="text-[11px] font-semibold text-emerald-100">
                      Your forecast is stable.
                    </p>
  
                    <p className="mt-1 text-[10px] text-[#AFC2BA]">
                      We will update this page automatically if the queue changes.
                    </p>
  
                  </div>
  
                </div>
  
              </div>
            )}
  
          </section>
  
          {/* ============================================== */}
          {/* PATIENT EXPLANATION */}
          {/* ============================================== */}
  
          <section className="mt-5 grid gap-4 md:grid-cols-3">
  
            <InfoCard
              icon={Sparkles}
              title="Live Forecast"
              description="Your ETA changes as the real OPD queue changes."
              accent="violet"
            />
  
            <InfoCard
              icon={BellRing}
              title="Smart Alerts"
              description="Important ETA changes trigger patient notifications."
              accent="cyan"
            />
  
            <InfoCard
              icon={ShieldCheck}
              title="Privacy First"
              description="Queue updates never expose another patient's medical details."
              accent="emerald"
            />
  
          </section>
  
          {/* FOOTER */}
  
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] py-5">
  
            <p className="text-[9px] text-[#718096]">
  
              QueuePulse AI · Smart queues. Healthier tomorrows.
  
            </p>
  
            <Link
              to="/command-center"
              className="text-[9px] font-semibold text-[#8796AB] transition hover:text-cyan-200"
            >
  
              Staff Access →
  
            </Link>
  
          </footer>
  
        </div>
  
      </div>
    )
  }
  
  function StatusItem({
    label,
    value,
    color,
  }: {
    label: string
    value: string
  
    color:
      | "violet"
      | "cyan"
      | "emerald"
  }) {
    const colors = {
      violet:
        "text-violet-200",
  
      cyan:
        "text-cyan-200",
  
      emerald:
        "text-emerald-200",
    }
  
    return (
      <div className="flex items-center justify-between rounded-[16px] border border-white/[0.07] bg-white/[0.025] px-4 py-3">
  
        <p className="text-[9px] font-medium text-[#A7B4C6]">
          {label}
        </p>
  
        <p className={`text-[10px] font-semibold ${colors[color]}`}>
          {value}
        </p>
  
      </div>
    )
  }
  
  function InfoCard({
    icon: Icon,
    title,
    description,
    accent,
  }: {
    icon: typeof Sparkles
    title: string
    description: string
  
    accent:
      | "violet"
      | "cyan"
      | "emerald"
  }) {
    const styles = {
      violet:
        "bg-violet-500/10 text-violet-200",
  
      cyan:
        "bg-cyan-500/10 text-cyan-200",
  
      emerald:
        "bg-emerald-500/10 text-emerald-200",
    }
  
    return (
      <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
  
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}
        >
  
          <Icon className="h-4 w-4" />
  
        </div>
  
        <h3 className="mt-4 text-[13px] font-semibold text-white">
          {title}
        </h3>
  
        <p className="mt-2 text-[10px] leading-5 text-[#99A8BB]">
          {description}
        </p>
  
      </div>
    )
  }