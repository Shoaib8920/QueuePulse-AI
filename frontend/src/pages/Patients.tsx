import {
    BellRing,
    CheckCircle2,
    Clock3,
    ExternalLink,
    MessageSquareText,
    Phone,
    Search,
    Send,
    Smartphone,
    UserRound,
    Users,
  } from "lucide-react"
  
  import {
    useState,
    type FormEvent,
  } from "react"
  
  import {
    Link,
  } from "react-router-dom"
  
  import {
    useQueue,
  } from "../context/QueueContext"
  
  function getStatusStyle(
    status: string,
  ) {
    switch (status) {
      case "SERVING":
        return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
  
      case "READY":
        return "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
  
      case "CALLED":
        return "border-violet-400/20 bg-violet-500/10 text-violet-200"
  
      case "PRIORITY":
        return "border-rose-400/20 bg-rose-500/10 text-rose-200"
  
      case "MISSED":
        return "border-yellow-400/20 bg-yellow-500/10 text-yellow-200"
  
      case "COMPLETED":
        return "border-slate-400/20 bg-slate-500/10 text-slate-300"
  
      default:
        return "border-white/10 bg-white/[0.04] text-[#D3DCE8]"
    }
  }
  
  export default function Patients() {
    const {
      queue,
      smsMessages,
      priorityInserted,
      sendSmsForToken,
      simulateSmsQuery,
    } = useQueue()
  
    const [
      search,
      setSearch,
    ] =
      useState("")
  
    const [
      smsInput,
      setSmsInput,
    ] =
      useState("Q G42")
  
    const [
      smsResponse,
      setSmsResponse,
    ] =
      useState(
        "Type Q G42 and press Send to simulate a basic-phone patient.",
      )
  
    const visiblePatients =
      queue.filter(
        (patient) => {
          const query =
            search
              .trim()
              .toLowerCase()
  
          if (!query) {
            return true
          }
  
          return (
            patient.token
              .toLowerCase()
              .includes(
                query,
              ) ||
            patient.department
              .toLowerCase()
              .includes(
                query,
              )
          )
        },
      )
  
    function handleSmsSubmit(
      event: FormEvent,
    ) {
      event.preventDefault()
  
      const response =
        simulateSmsQuery(
          smsInput,
        )
  
      setSmsResponse(
        response,
      )
    }
  
    function handleSendUpdate(
      token: string,
    ) {
      const response =
        sendSmsForToken(
          token,
        )
  
      setSmsResponse(
        response,
      )
  
      setSmsInput(
        `Q ${token.replace(
          "-",
          "",
        )}`,
      )
    }
  
    return (
      <div className="space-y-6">
  
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}
  
        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(27,30,70,0.97),rgba(7,18,40,0.97))] p-7">
  
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
  
          <div className="relative flex flex-wrap items-start justify-between gap-6">
  
            <div>
  
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.20em] text-violet-200">
  
                <Users className="h-3.5 w-3.5" />
  
                Patient Coordination
  
              </span>
  
              <h2 className="mt-5 bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[36px] font-semibold tracking-[-0.045em] text-transparent">
  
                Patient Flow & Communication
  
              </h2>
  
              <p className="mt-3 max-w-2xl text-[13px] leading-7 text-[#C5D0DF]">
  
                Track patient tokens, open the live patient experience and communicate ETA changes to basic phones through SMS.
  
              </p>
  
            </div>
  
            <div
              className={`rounded-[22px] border px-5 py-4 ${
                priorityInserted
                  ? "border-rose-400/20 bg-rose-500/[0.06]"
                  : "border-emerald-400/20 bg-emerald-500/[0.06]"
              }`}
            >
  
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#B8C4D5]">
                Queue State
              </p>
  
              <p
                className={`mt-2 text-[15px] font-semibold ${
                  priorityInserted
                    ? "text-rose-100"
                    : "text-emerald-100"
                }`}
              >
                {priorityInserted
                  ? "Priority disruption active"
                  : "Normal patient flow"}
              </p>
  
            </div>
  
          </div>
  
        </section>
  
        {/* ================================================= */}
        {/* MAIN GRID */}
        {/* ================================================= */}
  
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
  
          {/* PATIENT DIRECTORY */}
  
          <div className="overflow-hidden rounded-[30px] border border-white/[0.09] bg-[#0B1025]/94">
  
            <div className="border-b border-white/[0.08] p-6">
  
              <div className="flex flex-wrap items-center justify-between gap-4">
  
                <div>
  
                  <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">
                    Patient Directory
                  </p>
  
                  <h3 className="mt-2 text-[19px] font-semibold text-white">
                    Live OPD tokens
                  </h3>
  
                </div>
  
                <div className="flex min-w-[280px] items-center gap-3 rounded-2xl border border-white/[0.09] bg-black/10 px-4 py-3">
  
                  <Search className="h-4 w-4 text-[#AAB6C8]" />
  
                  <input
                    value={search}
                    onChange={(
                      event,
                    ) =>
                      setSearch(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Search token..."
                    className="w-full bg-transparent text-[11px] text-white outline-none placeholder:text-[#718096]"
                  />
  
                </div>
  
              </div>
  
            </div>
  
            <div className="divide-y divide-white/[0.07]">
  
              {visiblePatients.map(
                (patient) => (
                  <div
                    key={patient.id}
                    className="grid gap-4 p-5 transition hover:bg-white/[0.02] md:grid-cols-[90px_1fr_140px_230px] md:items-center"
                  >
  
                    {/* TOKEN */}
  
                    <div>
  
                      <p className="text-[20px] font-semibold text-white">
                        {patient.token}
                      </p>
  
                      <p className="mt-1 text-[9px] text-[#77869A]">
                        OPD Token
                      </p>
  
                    </div>
  
                    {/* INFO */}
  
                    <div>
  
                      <div className="flex items-center gap-2">
  
                        <UserRound className="h-3.5 w-3.5 text-violet-200" />
  
                        <p className="text-[11px] font-semibold text-[#DCE5F1]">
  
                          {
                            patient.department
                          }
  
                        </p>
  
                      </div>
  
                      <div className="mt-2 flex items-center gap-2">
  
                        <Phone className="h-3 w-3 text-[#7F8EA3]" />
  
                        <p className="text-[9px] text-[#8998AB]">
  
                          {patient.phoneMasked ??
                            "No phone number"}
  
                        </p>
  
                      </div>
  
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
  
                    {/* ACTIONS */}
  
                    <div className="flex flex-wrap justify-end gap-2">
  
                      <Link
                        to={`/token/${patient.token}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/18 bg-cyan-500/[0.07] px-3 py-2.5 text-[9px] font-semibold text-cyan-100 transition hover:bg-cyan-500/[0.12]"
                      >
  
                        <Smartphone className="h-3.5 w-3.5" />
  
                        Live View
  
                        <ExternalLink className="h-3 w-3" />
  
                      </Link>
  
                      {patient.phoneMasked && (
                        <button
                          type="button"
                          onClick={() =>
                            handleSendUpdate(
                              patient.token,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/18 bg-violet-500/[0.07] px-3 py-2.5 text-[9px] font-semibold text-violet-100 transition hover:bg-violet-500/[0.12]"
                        >
  
                          <MessageSquareText className="h-3.5 w-3.5" />
  
                          Send SMS
  
                        </button>
                      )}
  
                    </div>
  
                  </div>
                ),
              )}
  
            </div>
  
          </div>
  
          {/* ================================================= */}
          {/* SMS SIMULATOR */}
          {/* ================================================= */}
  
          <div className="space-y-5">
  
            <div className="rounded-[30px] border border-violet-400/15 bg-[linear-gradient(145deg,rgba(45,29,83,0.62),rgba(8,17,36,0.95))] p-6">
  
              <div className="flex items-center gap-3">
  
                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-violet-400/15 bg-violet-500/10">
  
                  <MessageSquareText className="h-5 w-5 text-violet-200" />
  
                </div>
  
                <div>
  
                  <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-violet-200">
                    SMS Simulator
                  </p>
  
                  <p className="mt-1 text-[10px] text-[#9FACBF]">
                    Basic-phone access
                  </p>
  
                </div>
  
              </div>
  
              <div className="mt-6 rounded-[20px] border border-white/[0.08] bg-black/[0.13] p-4">
  
                <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#AAB7C9]">
                  Patient sends
                </p>
  
                <form
                  onSubmit={
                    handleSmsSubmit
                  }
                  className="mt-3 flex gap-2"
                >
  
                  <input
                    value={
                      smsInput
                    }
                    onChange={(
                      event,
                    ) =>
                      setSmsInput(
                        event.target
                          .value,
                      )
                    }
                    className="min-w-0 flex-1 rounded-xl border border-white/[0.09] bg-[#080D1D] px-4 py-3 text-[12px] font-medium text-white outline-none placeholder:text-[#66758A]"
                    placeholder="Q G42"
                  />
  
                  <button
                    type="submit"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-[0_10px_25px_rgba(99,102,241,0.24)]"
                  >
  
                    <Send className="h-4 w-4 text-white" />
  
                  </button>
  
                </form>
  
                <p className="mt-3 text-[9px] text-[#75859A]">
  
                  Try:{" "}
                  <span className="font-semibold text-cyan-200">
                    Q G42
                  </span>
  
                </p>
  
              </div>
  
              {/* SMS RESPONSE */}
  
              <div className="mt-4 rounded-[20px] border border-cyan-400/15 bg-cyan-500/[0.055] p-4">
  
                <div className="flex items-center gap-2">
  
                  <BellRing className="h-4 w-4 text-cyan-200" />
  
                  <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-cyan-200">
                    QueuePulse Reply
                  </p>
  
                </div>
  
                <p className="mt-3 text-[10px] leading-6 text-[#D5E2E9]">
  
                  {smsResponse}
  
                </p>
  
              </div>
  
            </div>
  
            {/* MESSAGE LOG */}
  
            <div className="rounded-[30px] border border-white/[0.09] bg-[#0A1022]/94 p-5">
  
              <div className="flex items-center justify-between">
  
                <div>
  
                  <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-cyan-200">
                    Message Log
                  </p>
  
                  <p className="mt-1 text-[10px] text-[#8796AA]">
                    Simulated SMS traffic
                  </p>
  
                </div>
  
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[9px] text-[#BAC6D7]">
  
                  {
                    smsMessages.length
                  }{" "}
                  messages
  
                </span>
  
              </div>
  
              <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
  
                {smsMessages.length ===
                0 ? (
                  <div className="rounded-[18px] border border-dashed border-white/[0.09] p-5 text-center">
  
                    <MessageSquareText className="mx-auto h-5 w-5 text-[#68788D]" />
  
                    <p className="mt-3 text-[10px] text-[#718096]">
                      No SMS messages yet.
                    </p>
  
                  </div>
                ) : (
                  smsMessages.map(
                    (message) => (
                      <div
                        key={
                          message.id
                        }
                        className={`rounded-[18px] border p-4 ${
                          message.direction ===
                          "OUTBOUND"
                            ? "border-cyan-400/12 bg-cyan-500/[0.045]"
                            : "border-violet-400/12 bg-violet-500/[0.045]"
                        }`}
                      >
  
                        <div className="flex items-center justify-between gap-3">
  
                          <span
                            className={`text-[8px] font-bold uppercase tracking-[0.15em] ${
                              message.direction ===
                              "OUTBOUND"
                                ? "text-cyan-200"
                                : "text-violet-200"
                            }`}
                          >
                            {
                              message.direction
                            }
                          </span>
  
                          <span className="text-[8px] text-[#728197]">
                            {
                              message.time
                            }
                          </span>
  
                        </div>
  
                        <p className="mt-2 text-[9px] text-[#93A3B8]">
  
                          {
                            message.recipient
                          }
  
                        </p>
  
                        <p className="mt-2 text-[10px] leading-5 text-[#D0D9E5]">
  
                          {
                            message.message
                          }
  
                        </p>
  
                      </div>
                    ),
                  )
                )}
  
              </div>
  
            </div>
  
          </div>
  
        </section>
  
        {/* ACCESSIBILITY NOTE */}
  
        <section className="grid gap-4 md:grid-cols-3">
  
          <Info
            icon={Smartphone}
            title="Smartphone"
            text="Patients can open a live web token with no app installation."
            accent="violet"
          />
  
          <Info
            icon={MessageSquareText}
            title="Basic Phone"
            text="Patients can request their latest ETA using a simple SMS query."
            accent="cyan"
          />
  
          <Info
            icon={CheckCircle2}
            title="No Smartphone"
            text="Reception can still print a token and the waiting-room display remains available."
            accent="emerald"
          />
  
        </section>
  
      </div>
    )
  }
  
  function Info({
    icon: Icon,
    title,
    text,
    accent,
  }: {
    icon: typeof Smartphone
    title: string
    text: string
  
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
  
        <p className="mt-4 text-[12px] font-semibold text-white">
          {title}
        </p>
  
        <p className="mt-2 text-[10px] leading-5 text-[#96A6BA]">
          {text}
        </p>
  
      </div>
    )
  }