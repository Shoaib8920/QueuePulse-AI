import {
    CheckCircle2,
    Clock3,
    Search,
    UserRound,
  } from "lucide-react"
  
  const patients = [
    {
      token: "G-42",
      name: "Patient G-42",
      arrival: "11:25 AM",
      estimate: "11:40 – 11:55",
      status: "Not arrived",
    },
    {
      token: "G-32",
      name: "Patient G-32",
      arrival: "Ready",
      estimate: "8 – 12 min",
      status: "Checked in",
    },
    {
      token: "G-33",
      name: "Patient G-33",
      arrival: "12:05 PM",
      estimate: "18 – 25 min",
      status: "Waiting",
    },
  ]
  
  export default function Patients() {
    return (
      <div className="space-y-6">
  
        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(25,29,63,0.96),rgba(8,15,34,0.96))] p-7">
  
          <h2 className="bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[34px] font-semibold text-transparent">
            Patient Flow
          </h2>
  
          <p className="mt-2 text-[13px] text-[#BFCADD]">
            Search tokens, check arrival status and review live predicted consultation windows.
          </p>
  
          <div className="mt-6 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
  
            <Search className="h-4 w-4 text-[#AAB8CA]" />
  
            <input
              placeholder="Search patient or token..."
              className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-[#76859B]"
            />
  
          </div>
  
        </section>
  
        <section className="grid gap-4 xl:grid-cols-3">
  
          {patients.map(
            (patient) => (
              <div
                key={patient.token}
                className="rounded-[28px] border border-white/[0.09] bg-white/[0.035] p-6"
              >
  
                <div className="flex items-center justify-between">
  
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/12">
  
                    <UserRound className="h-5 w-5 text-violet-200" />
  
                  </div>
  
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] text-[#DCE5F1]">
                    {patient.status}
                  </span>
  
                </div>
  
                <p className="mt-6 text-[27px] font-semibold text-white">
                  {patient.token}
                </p>
  
                <p className="mt-1 text-[12px] text-[#98A7BB]">
                  {patient.name}
                </p>
  
                <div className="mt-6 space-y-3">
  
                  <div className="rounded-xl bg-black/10 p-3">
  
                    <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#9EACC0]">
                      Forecast Window
                    </p>
  
                    <p className="mt-2 text-[14px] font-semibold text-cyan-100">
                      {patient.estimate}
                    </p>
  
                  </div>
  
                  <div className="rounded-xl bg-black/10 p-3">
  
                    <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#9EACC0]">
                      Arrival
                    </p>
  
                    <p className="mt-2 text-[14px] font-semibold text-white">
                      {patient.arrival}
                    </p>
  
                  </div>
  
                </div>
  
              </div>
            ),
          )}
  
        </section>
  
      </div>
    )
  }