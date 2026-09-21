import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
  } from "react"
  
  export type QueueStatus =
    | "SERVING"
    | "CALLED"
    | "READY"
    | "WAITING"
    | "PRIORITY"
    | "MISSED"
    | "COMPLETED"
  
  export type DoctorStatus =
    | "AVAILABLE"
    | "SERVING"
    | "PAUSED"
  
  export type QueuePatient = {
    id: string
    token: string
    department: string
    doctor: string
    status: QueueStatus
    etaMin: number
    etaMax: number
    note: string
    isPriority: boolean
    phoneMasked?: string
  }
  
  export type QueueEvent = {
    id: string
    title: string
    description: string
    time: string
    type:
      | "priority"
      | "forecast"
      | "system"
      | "doctor"
  }
  
  export type SmsMessage = {
    id: string
    direction:
      | "INBOUND"
      | "OUTBOUND"
    token?: string
    recipient: string
    message: string
    time: string
    status:
      | "RECEIVED"
      | "SENT"
  }
  
  type QueueContextType = {
    queue: QueuePatient[]
    events: QueueEvent[]
    smsMessages: SmsMessage[]
  
    priorityInserted: boolean
    forecastVersion: number
    doctorStatus: DoctorStatus
  
    insertPriorityCase: () => void
    resetDemo: () => void
  
    completeCurrentConsultation: () => void
    callNextPatient: () => void
    startCalledPatient: () => void
    markCalledPatientNoShow: () => void
  
    pauseDoctor: () => void
    resumeDoctor: () => void
  
    sendSmsForToken: (
      token: string,
    ) => string
  
    simulateSmsQuery: (
      input: string,
    ) => string
  }
  
  const originalQueue: QueuePatient[] = [
    {
      id: "g31",
      token: "G-31",
      department: "General Medicine",
      doctor: "Dr. Meera Shah",
      status: "SERVING",
      etaMin: 0,
      etaMax: 0,
      note: "Consultation in progress",
      isPriority: false,
      phoneMasked:
        "+91 98••• 3101",
    },
  
    {
      id: "g32",
      token: "G-32",
      department: "General Medicine",
      doctor: "Dr. Meera Shah",
      status: "READY",
      etaMin: 8,
      etaMax: 12,
      note: "Patient checked in",
      isPriority: false,
      phoneMasked:
        "+91 98••• 3202",
    },
  
    {
      id: "g33",
      token: "G-33",
      department: "General Medicine",
      doctor: "Dr. Meera Shah",
      status: "WAITING",
      etaMin: 18,
      etaMax: 25,
      note: "Waiting for consultation",
      isPriority: false,
      phoneMasked:
        "+91 98••• 3303",
    },
  
    {
      id: "g34",
      token: "G-34",
      department: "General Medicine",
      doctor: "Dr. Meera Shah",
      status: "WAITING",
      etaMin: 27,
      etaMax: 34,
      note: "Waiting for consultation",
      isPriority: false,
      phoneMasked:
        "+91 98••• 3404",
    },
  
    {
      id: "g42",
      token: "G-42",
      department: "General Medicine",
      doctor: "Dr. Meera Shah",
      status: "WAITING",
      etaMin: 40,
      etaMax: 55,
      note: "Remote patient",
      isPriority: false,
      phoneMasked:
        "+91 98••• 4210",
    },
  ]
  
  const initialEvents: QueueEvent[] = [
    {
      id: "initial-system",
      title:
        "Forecast engine active",
      description:
        "QueuePulse is monitoring the General Medicine OPD.",
      time: "Live",
      type: "system",
    },
  ]
  
  const QueueContext =
    createContext<QueueContextType | null>(
      null,
    )
  
  const DEMO_START_MINUTES =
    11 * 60
  
  function roundFive(
    value: number,
  ) {
    return (
      Math.round(value / 5) * 5
    )
  }
  
  function formatClock(
    queueMinutes: number,
  ) {
    const total =
      DEMO_START_MINUTES +
      roundFive(queueMinutes)
  
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
      .padStart(
        2,
        "0",
      )} ${period}`
  }
  
  function currentTime() {
    return new Date().toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )
  }
  
  function createId(
    prefix: string,
  ) {
    return `${prefix}-${Date.now()}-${Math.random()}`
  }
  
  function normalizeToken(
    value: string,
  ) {
    return value
      .toUpperCase()
      .replace(
        /[^A-Z0-9]/g,
        "",
      )
  }
  
  export function QueueProvider({
    children,
  }: {
    children: ReactNode
  }) {
    const [queue, setQueue] =
      useState<QueuePatient[]>(
        originalQueue.map(
          (patient) => ({
            ...patient,
          }),
        ),
      )
  
    const [events, setEvents] =
      useState<QueueEvent[]>(
        initialEvents,
      )
  
    const [
      smsMessages,
      setSmsMessages,
    ] =
      useState<SmsMessage[]>(
        [],
      )
  
    const [
      priorityInserted,
      setPriorityInserted,
    ] =
      useState(false)
  
    const [
      forecastVersion,
      setForecastVersion,
    ] =
      useState(1)
  
    const [
      doctorStatus,
      setDoctorStatus,
    ] =
      useState<DoctorStatus>(
        "SERVING",
      )
  
    function addEvent(
      event: Omit<
        QueueEvent,
        "id" | "time"
      >,
    ) {
      setEvents(
        (currentEvents) => [
          {
            ...event,
            id: createId(
              event.type,
            ),
            time: currentTime(),
          },
          ...currentEvents,
        ],
      )
    }
  
    function addSms(
      message: Omit<
        SmsMessage,
        "id" | "time"
      >,
    ) {
      setSmsMessages(
        (current) => [
          {
            ...message,
            id: createId("sms"),
            time: currentTime(),
          },
          ...current,
        ],
      )
    }
  
    function buildPatientSms(
      patient: QueuePatient,
    ) {
      const nowServing =
        queue.find(
          (item) =>
            item.status ===
            "SERVING",
        )
  
      if (
        patient.status ===
        "SERVING"
      ) {
        return `QueuePulse: Token ${patient.token} is now being served in Room 201.`
      }
  
      if (
        patient.status ===
        "COMPLETED"
      ) {
        return `QueuePulse: Token ${patient.token} has completed consultation.`
      }
  
      if (
        patient.status ===
        "MISSED"
      ) {
        return `QueuePulse: Token ${patient.token} was marked missed. Please contact reception for assistance.`
      }
  
      const eta =
        `${formatClock(
          patient.etaMin,
        )}-${formatClock(
          patient.etaMax,
        )}`
  
      const arrival =
        formatClock(
          Math.max(
            0,
            patient.etaMin - 15,
          ),
        )
  
      return `QueuePulse ${patient.token}: ETA ${eta}. Arrive by ${arrival}. Now serving ${nowServing?.token ?? "N/A"}. Forecast v${forecastVersion}.`
    }
  
    function sendSmsForToken(
      token: string,
    ) {
      const patient =
        queue.find(
          (item) =>
            normalizeToken(
              item.token,
            ) ===
            normalizeToken(token),
        )
  
      if (!patient) {
        return "Token not found."
      }
  
      const response =
        buildPatientSms(patient)
  
      addSms({
        direction: "OUTBOUND",
        token:
          patient.token,
        recipient:
          patient.phoneMasked ??
          "Basic phone",
        message: response,
        status: "SENT",
      })
  
      return response
    }
  
    function simulateSmsQuery(
      input: string,
    ) {
      const trimmed =
        input.trim()
  
      addSms({
        direction: "INBOUND",
        recipient:
          "QueuePulse SMS",
        message: trimmed,
        status: "RECEIVED",
      })
  
      const match =
        trimmed
          .toUpperCase()
          .match(
            /^(Q|STATUS)\s+([A-Z0-9-]+)$/,
          )
  
      if (!match) {
        const help =
          "QueuePulse: Send Q followed by your token. Example: Q G42"
  
        addSms({
          direction: "OUTBOUND",
          recipient:
            "Basic phone",
          message: help,
          status: "SENT",
        })
  
        return help
      }
  
      const token =
        match[2]
  
      const patient =
        queue.find(
          (item) =>
            normalizeToken(
              item.token,
            ) ===
            normalizeToken(token),
        )
  
      if (!patient) {
        const notFound =
          `QueuePulse: Token ${token} was not found.`
  
        addSms({
          direction: "OUTBOUND",
          recipient:
            "Basic phone",
          message:
            notFound,
          status: "SENT",
        })
  
        return notFound
      }
  
      const response =
        buildPatientSms(
          patient,
        )
  
      addSms({
        direction: "OUTBOUND",
        token:
          patient.token,
        recipient:
          patient.phoneMasked ??
          "Basic phone",
        message:
          response,
        status: "SENT",
      })
  
      return response
    }
  
    function insertPriorityCase() {
      if (
        priorityInserted
      ) {
        return
      }
  
      const g42Before =
        queue.find(
          (patient) =>
            patient.token ===
            "G-42",
        )
  
      const priorityPatient: QueuePatient =
        {
          id: "p107",
          token: "P1-07",
          department:
            "Priority clinical case",
          doctor:
            "Dr. Meera Shah",
          status: "PRIORITY",
          etaMin: 1,
          etaMax: 5,
          note:
            "Inserted by triage",
          isPriority: true,
        }
  
      setQueue(
        (currentQueue) => {
          const updated =
            currentQueue.map(
              (patient) => {
                if (
                  patient.status ===
                    "SERVING" ||
                  patient.status ===
                    "COMPLETED" ||
                  patient.status ===
                    "MISSED"
                ) {
                  return patient
                }
  
                return {
                  ...patient,
  
                  etaMin:
                    patient.etaMin +
                    14,
  
                  etaMax:
                    patient.etaMax +
                    14,
  
                  note:
                    patient.status ===
                    "READY"
                      ? "ETA shifted after priority insertion"
                      : patient.note,
                }
              },
            )
  
          const servingIndex =
            updated.findIndex(
              (patient) =>
                patient.status ===
                "SERVING",
            )
  
          const insertionIndex =
            servingIndex >= 0
              ? servingIndex + 1
              : 0
  
          return [
            ...updated.slice(
              0,
              insertionIndex,
            ),
  
            priorityPatient,
  
            ...updated.slice(
              insertionIndex,
            ),
          ]
        },
      )
  
      addEvent({
        title:
          "Priority case inserted",
        description:
          "P1-07 was inserted immediately after the active consultation by authorized triage staff.",
        type: "priority",
      })
  
      addEvent({
        title:
          "Downstream ETAs recalculated",
        description:
          "Affected patient forecasts were shifted by approximately 14 minutes.",
        type: "forecast",
      })
  
      if (g42Before) {
        const shiftedMin =
          g42Before.etaMin +
          14
  
        const shiftedMax =
          g42Before.etaMax +
          14
  
        const arrival =
          Math.max(
            0,
            shiftedMin - 15,
          )
  
        addSms({
          direction:
            "OUTBOUND",
  
          token: "G-42",
  
          recipient:
            g42Before.phoneMasked ??
            "Basic phone",
  
          message:
            `QueuePulse G-42: ETA updated to ${formatClock(
              shiftedMin,
            )}-${formatClock(
              shiftedMax,
            )}. Please arrive by ${formatClock(
              arrival,
            )}. Reason: priority clinical case entered the queue.`,
  
          status: "SENT",
        })
      }
  
      setPriorityInserted(
        true,
      )
  
      setForecastVersion(
        (version) =>
          version + 1,
      )
    }
  
    function completeCurrentConsultation() {
      let completedToken:
        | string
        | null = null
  
      setQueue(
        (currentQueue) => {
          const servingIndex =
            currentQueue.findIndex(
              (patient) =>
                patient.status ===
                "SERVING",
            )
  
          if (
            servingIndex === -1
          ) {
            return currentQueue
          }
  
          completedToken =
            currentQueue[
              servingIndex
            ].token
  
          return currentQueue.map(
            (
              patient,
              index,
            ) => {
              if (
                index ===
                servingIndex
              ) {
                return {
                  ...patient,
                  status:
                    "COMPLETED",
                  note:
                    "Consultation completed",
                  etaMin: 0,
                  etaMax: 0,
                }
              }
  
              if (
                index >
                  servingIndex &&
                patient.status !==
                  "COMPLETED" &&
                patient.status !==
                  "MISSED" &&
                patient.status !==
                  "PRIORITY"
              ) {
                return {
                  ...patient,
                  etaMin:
                    Math.max(
                      0,
                      patient.etaMin -
                        8,
                    ),
                  etaMax:
                    Math.max(
                      1,
                      patient.etaMax -
                        8,
                    ),
                }
              }
  
              return patient
            },
          )
        },
      )
  
      setDoctorStatus(
        "AVAILABLE",
      )
  
      setForecastVersion(
        (version) =>
          version + 1,
      )
  
      addEvent({
        title:
          "Consultation completed",
        description:
          `${completedToken ?? "Current patient"} consultation was completed. The queue is ready to advance.`,
        type: "doctor",
      })
  
      addEvent({
        title:
          "Forecast refreshed",
        description:
          "Downstream waiting times were recalculated after consultation completion.",
        type: "forecast",
      })
    }
  
    function callNextPatient() {
      if (
        doctorStatus ===
        "PAUSED"
      ) {
        return
      }
  
      const hasServing =
        queue.some(
          (patient) =>
            patient.status ===
            "SERVING",
        )
  
      if (hasServing) {
        return
      }
  
      const nextPatient =
        queue.find(
          (patient) =>
            patient.status ===
              "PRIORITY" ||
            patient.status ===
              "READY" ||
            patient.status ===
              "WAITING",
        )
  
      if (!nextPatient) {
        return
      }
  
      setQueue(
        (currentQueue) =>
          currentQueue.map(
            (patient) =>
              patient.id ===
              nextPatient.id
                ? {
                    ...patient,
                    status:
                      "CALLED",
                    note:
                      "Patient called to consultation room",
                  }
                : patient,
          ),
      )
  
      addEvent({
        title:
          `${nextPatient.token} called`,
        description:
          "The next eligible patient was called to Room 201.",
        type: "doctor",
      })
  
      if (
        nextPatient.phoneMasked
      ) {
        addSms({
          direction:
            "OUTBOUND",
          token:
            nextPatient.token,
          recipient:
            nextPatient.phoneMasked,
          message:
            `QueuePulse: Token ${nextPatient.token}, please proceed to Room 201. You have been called.`,
          status: "SENT",
        })
      }
    }
  
    function startCalledPatient() {
      if (
        doctorStatus ===
        "PAUSED"
      ) {
        return
      }
  
      const hasServing =
        queue.some(
          (patient) =>
            patient.status ===
            "SERVING",
        )
  
      if (hasServing) {
        return
      }
  
      const calledPatient =
        queue.find(
          (patient) =>
            patient.status ===
            "CALLED",
        )
  
      if (!calledPatient) {
        return
      }
  
      setQueue(
        (currentQueue) =>
          currentQueue.map(
            (patient) =>
              patient.id ===
              calledPatient.id
                ? {
                    ...patient,
                    status:
                      "SERVING",
                    etaMin: 0,
                    etaMax: 0,
                    note:
                      "Consultation in progress",
                  }
                : patient,
          ),
      )
  
      setDoctorStatus(
        "SERVING",
      )
  
      addEvent({
        title:
          `${calledPatient.token} consultation started`,
        description:
          "Dr. Meera Shah started the consultation.",
        type: "doctor",
      })
  
      setForecastVersion(
        (version) =>
          version + 1,
      )
    }
  
    function markCalledPatientNoShow() {
      const calledPatient =
        queue.find(
          (patient) =>
            patient.status ===
            "CALLED",
        )
  
      if (!calledPatient) {
        return
      }
  
      const calledIndex =
        queue.findIndex(
          (patient) =>
            patient.id ===
            calledPatient.id,
        )
  
      setQueue(
        (currentQueue) =>
          currentQueue.map(
            (
              patient,
              index,
            ) => {
              if (
                patient.id ===
                calledPatient.id
              ) {
                return {
                  ...patient,
                  status:
                    "MISSED",
                  note:
                    "Patient did not respond when called",
                }
              }
  
              if (
                index >
                  calledIndex &&
                patient.status !==
                  "COMPLETED" &&
                patient.status !==
                  "MISSED"
              ) {
                return {
                  ...patient,
                  etaMin:
                    Math.max(
                      0,
                      patient.etaMin -
                        8,
                    ),
                  etaMax:
                    Math.max(
                      1,
                      patient.etaMax -
                        8,
                    ),
                }
              }
  
              return patient
            },
          ),
      )
  
      setForecastVersion(
        (version) =>
          version + 1,
      )
  
      addEvent({
        title:
          `${calledPatient.token} marked no-show`,
        description:
          "The patient did not respond. QueuePulse advanced the queue and refreshed downstream ETAs.",
        type: "doctor",
      })
    }
  
    function pauseDoctor() {
      const hasServing =
        queue.some(
          (patient) =>
            patient.status ===
            "SERVING",
        )
  
      if (
        hasServing ||
        doctorStatus ===
          "PAUSED"
      ) {
        return
      }
  
      const g42Before =
        queue.find(
          (patient) =>
            patient.token ===
            "G-42",
        )
  
      setDoctorStatus(
        "PAUSED",
      )
  
      setQueue(
        (currentQueue) =>
          currentQueue.map(
            (patient) => {
              if (
                patient.status ===
                  "COMPLETED" ||
                patient.status ===
                  "MISSED"
              ) {
                return patient
              }
  
              return {
                ...patient,
                etaMin:
                  patient.etaMin +
                  15,
                etaMax:
                  patient.etaMax +
                  15,
              }
            },
          ),
      )
  
      setForecastVersion(
        (version) =>
          version + 1,
      )
  
      addEvent({
        title:
          "Doctor paused",
        description:
          "Dr. Meera Shah paused the consultation channel. Downstream ETAs increased by approximately 15 minutes.",
        type: "doctor",
      })
  
      if (g42Before) {
        addSms({
          direction:
            "OUTBOUND",
  
          token:
            "G-42",
  
          recipient:
            g42Before.phoneMasked ??
            "Basic phone",
  
          message:
            "QueuePulse G-42: Your ETA changed because the doctor is temporarily unavailable. Please check your live token for the latest arrival time.",
  
          status: "SENT",
        })
      }
    }
  
    function resumeDoctor() {
      if (
        doctorStatus !==
        "PAUSED"
      ) {
        return
      }
  
      setDoctorStatus(
        "AVAILABLE",
      )
  
      setForecastVersion(
        (version) =>
          version + 1,
      )
  
      addEvent({
        title:
          "Doctor resumed",
        description:
          "Dr. Meera Shah is available again and the queue can continue.",
        type: "doctor",
      })
    }
  
    function resetDemo() {
      setQueue(
        originalQueue.map(
          (patient) => ({
            ...patient,
          }),
        ),
      )
  
      setEvents(
        initialEvents,
      )
  
      setSmsMessages([])
  
      setPriorityInserted(
        false,
      )
  
      setForecastVersion(1)
  
      setDoctorStatus(
        "SERVING",
      )
    }
  
    const value =
      useMemo<QueueContextType>(
        () => ({
          queue,
          events,
          smsMessages,
  
          priorityInserted,
          forecastVersion,
          doctorStatus,
  
          insertPriorityCase,
          resetDemo,
  
          completeCurrentConsultation,
          callNextPatient,
          startCalledPatient,
          markCalledPatientNoShow,
  
          pauseDoctor,
          resumeDoctor,
  
          sendSmsForToken,
          simulateSmsQuery,
        }),
        [
          queue,
          events,
          smsMessages,
          priorityInserted,
          forecastVersion,
          doctorStatus,
        ],
      )
  
    return (
      <QueueContext.Provider
        value={value}
      >
        {children}
      </QueueContext.Provider>
    )
  }
  
  export function useQueue() {
    const context =
      useContext(QueueContext)
  
    if (!context) {
      throw new Error(
        "useQueue must be used inside QueueProvider",
      )
    }
  
    return context
  }