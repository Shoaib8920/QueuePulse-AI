import {
    Activity,
    Coffee,
    Stethoscope,
  } from "lucide-react"
  
  const doctors = [
    {
      name: "Dr. Meera Shah",
      department: "General Medicine",
      room: "Room 201",
      status: "Serving",
      token: "G-31",
      load: "High",
    },
    {
      name: "Dr. Arjun Mehta",
      department: "General Medicine",
      room: "Room 203",
      status: "Available",
      token: "Ready",
      load: "Normal",
    },
    {
      name: "Dr. Sana Khan",
      department: "General Medicine",
      room: "Room 205",
      status: "Break",
      token: "—",
      load: "Normal",
    },
  ]
  
  export default function Doctors() {
    return (
      <div className="space-y-6">
  
        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(25,29,63,0.96),rgba(8,15,34,0.96))] p-7">
  
          <h2 className="bg-gradient-to-r from-white via-cyan-100 to-violet-300 bg-clip-text text-[34px] font-semibold text-transparent">
            Clinical Capacity
          </h2>
  
          <p className="mt-2 text-[13px] text-[#BFCADD]">
            Monitor doctor availability, active consultations and OPD capacity.
          </p>
  
        </section>
  
        <section className="grid gap-4 xl:grid-cols-3">
  
          {doctors.map(
            (doctor) => (
              <div
                key={doctor.name}
                className="rounded-[28px] border border-white/[0.09] bg-white/[0.035] p-6"
              >
  
                <div className="flex items-start justify-between">
  
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
  
                    <Stethoscope className="h-5 w-5 text-cyan-200" />
  
                  </div>
  
                  <span
                    className={`rounded-full border px-3 py-1 text-[9px] font-semibold ${
                      doctor.status ===
                      "Serving"
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                        : doctor.status ===
                          "Available"
                        ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
                        : "border-yellow-400/20 bg-yellow-500/10 text-yellow-200"
                    }`}
                  >
                    {doctor.status}
                  </span>
  
                </div>
  
                <h3 className="mt-6 text-[19px] font-semibold text-white">
                  {doctor.name}
                </h3>
  
                <p className="mt-1 text-[11px] text-[#98A7BB]">
                  {doctor.department}
                </p>
  
                <p className="text-[11px] text-[#98A7BB]">
                  {doctor.room}
                </p>
  
                <div className="mt-6 grid grid-cols-2 gap-3">
  
                  <div className="rounded-xl bg-black/10 p-3">
  
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#95A4B8]">
                      Current
                    </p>
  
                    <p className="mt-2 text-[14px] font-semibold text-white">
                      {doctor.token}
                    </p>
  
                  </div>
  
                  <div className="rounded-xl bg-black/10 p-3">
  
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#95A4B8]">
                      Load
                    </p>
  
                    <p className="mt-2 text-[14px] font-semibold text-cyan-100">
                      {doctor.load}
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