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
  
  type QueueContextType = {
    queue: QueuePatient[]
    events: QueueEvent[]
  
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
    },
  ]
  
  const initialEvents: QueueEvent[] = [
    {
      id: "initial-system",
      title: "Forecast engine active",
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
  
  function currentTime() {
    return new Date().toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )
  }
  
  function createEventId(
    prefix: string,
  ) {
    return `${prefix}-${Date.now()}-${Math.random()}`
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
      priorityInserted,
      setPriorityInserted,
    ] = useState(false)
  
    const [
      forecastVersion,
      setForecastVersion,
    ] = useState(1)
  
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
            id: createEventId(
              event.type,
            ),
            time: currentTime(),
          },
          ...currentEvents,
        ],
      )
    }
  
    function insertPriorityCase() {
      if (priorityInserted) {
        return
      }
  
      const priorityPatient: QueuePatient =
        {
          id: "p107",
          token: "P1-07",
          department:
            "Priority clinical case",
          doctor: "Dr. Meera Shah",
          status: "PRIORITY",
          etaMin: 1,
          etaMax: 5,
          note: "Inserted by triage",
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
  
      setPriorityInserted(true)
  
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
                index === servingIndex
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
          `${
            completedToken ??
            "Current patient"
          } consultation was completed. The queue is ready to advance.`,
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
        doctorStatus === "PAUSED"
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
        title: `${
          nextPatient.token
        } called`,
        description:
          "The next eligible patient was called to Room 201.",
        type: "doctor",
      })
    }
  
    function startCalledPatient() {
      if (
        doctorStatus === "PAUSED"
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
        title: `${
          calledPatient.token
        } consultation started`,
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
        title: `${
          calledPatient.token
        } marked no-show`,
        description:
          "The patient did not respond. QueuePulse advanced the queue and refreshed downstream ETAs.",
        type: "doctor",
      })
  
      addEvent({
        title:
          "No-show re-forecast",
        description:
          "Waiting-time estimates were reduced after removing the missed patient from the active sequence.",
        type: "forecast",
      })
    }
  
    function pauseDoctor() {
      const hasServing =
        queue.some(
          (patient) =>
            patient.status ===
            "SERVING",
        )
  
      if (hasServing) {
        return
      }
  
      if (
        doctorStatus === "PAUSED"
      ) {
        return
      }
  
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
  
      addEvent({
        title:
          "Pause re-forecast",
        description:
          "QueuePulse widened waiting estimates because the doctor became temporarily unavailable.",
        type: "forecast",
      })
    }
  
    function resumeDoctor() {
      if (
        doctorStatus !== "PAUSED"
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
        }),
        [
          queue,
          events,
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