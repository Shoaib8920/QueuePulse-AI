import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  queueApi,
  type ApiQueueEvent,
  type ApiQueueToken,
} from "../lib/api"


export type QueueStatus =
  | "CREATED"
  | "NOT_ARRIVED"
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

  predictedWait: number

  confidenceScore: number
  confidenceLabel: string

  reasonCode: string

  forecastModelVersion: number

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

  insertPriorityCase:
    () => Promise<void>

  resetDemo:
    () => Promise<void>

  completeCurrentConsultation:
    () => Promise<void>

  callNextPatient:
    () => Promise<void>

  startCalledPatient:
    () => Promise<void>

  markCalledPatientNoShow:
    () => Promise<void>

  pauseDoctor:
    () => Promise<void>

  resumeDoctor:
    () => Promise<void>

  sendSmsForToken: (
    token: string,
  ) => string

  simulateSmsQuery: (
    input: string,
  ) => string
}


const QueueContext =
  createContext<QueueContextType | null>(
    null,
  )


function getNote(
  token: ApiQueueToken,
) {
  switch (token.status) {
    case "SERVING":
      return "Consultation in progress"

    case "CALLED":
      return "Patient called to consultation room"

    case "READY":
      return "Patient checked in"

    case "PRIORITY":
      return "Inserted by triage"

    case "MISSED":
      return "Patient did not respond when called"

    case "COMPLETED":
      return "Consultation completed"

    case "NOT_ARRIVED":
      return "Patient has not arrived"

    default:
      if (
        token.patient.channel ===
        "SMS"
      ) {
        return "Remote patient"
      }

      if (
        token.patient.checked_in
      ) {
        return "Checked in and waiting"
      }

      return "Waiting for consultation"
  }
}


function eventTitle(
  eventType: string,
) {
  return eventType
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(" ")
}


function mapEventType(
  event: ApiQueueEvent,
): QueueEvent["type"] {
  const value =
    event.event_type.toUpperCase()

  if (
    value.includes(
      "PRIORITY",
    )
  ) {
    return "priority"
  }

  if (
    value.includes(
      "FORECAST",
    ) ||
    value.includes(
      "REFORECAST",
    )
  ) {
    return "forecast"
  }

  if (
    value.includes(
      "DOCTOR",
    ) ||
    value.includes(
      "PATIENT",
    ) ||
    value.includes(
      "CONSULTATION",
    ) ||
    value.includes(
      "NO_SHOW",
    )
  ) {
    return "doctor"
  }

  return "system"
}


function formatEventTime(
  timestamp: string,
) {
  return new Date(
    timestamp,
  ).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )
}


function normalizeDoctorStatus(
  value?: string,
): DoctorStatus {
  if (
    value === "SERVING"
  ) {
    return "SERVING"
  }

  if (
    value === "PAUSED"
  ) {
    return "PAUSED"
  }

  return "AVAILABLE"
}


function normalizeStatus(
  value: string,
): QueueStatus {
  const statuses:
    QueueStatus[] = [
      "CREATED",
      "NOT_ARRIVED",
      "SERVING",
      "CALLED",
      "READY",
      "WAITING",
      "PRIORITY",
      "MISSED",
      "COMPLETED",
    ]

  if (
    statuses.includes(
      value as QueueStatus,
    )
  ) {
    return value as QueueStatus
  }

  return "WAITING"
}


function currentTime() {
  return new Date()
    .toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )
}


function createSmsId() {
  return `sms-${Date.now()}-${Math.random()}`
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
  const queryClient =
    useQueryClient()

  const [
    smsMessages,
    setSmsMessages,
  ] =
    useState<SmsMessage[]>(
      [],
    )


  const queueQuery =
    useQuery({
      queryKey: [
        "queue",
      ],

      queryFn:
        queueApi.getQueue,

      // Temporary fallback while
      // WebSockets are active.
      refetchInterval:
        3000,
    })


  const doctorsQuery =
    useQuery({
      queryKey: [
        "doctors",
      ],

      queryFn:
        queueApi.getDoctors,

      refetchInterval:
        3000,
    })


  const eventsQuery =
    useQuery({
      queryKey: [
        "events",
      ],

      queryFn:
        queueApi.getEvents,

      refetchInterval:
        3000,
    })


  const queue =
    useMemo<
      QueuePatient[]
    >(
      () => {
        const apiQueue =
          queueQuery.data
            ?.queue ??
          []

        return apiQueue.map(
          (token) => {
            const forecast =
              token.latest_forecast

            return {
              id:
                token.id,

              token:
                token.token_number,

              department:
                token.department,

              doctor:
                token.doctor
                  ?.name ??
                "Unassigned",

              status:
                normalizeStatus(
                  token.status,
                ),

              etaMin:
                forecast
                  ?.eta_min_minutes ??
                0,

              etaMax:
                forecast
                  ?.eta_max_minutes ??
                0,

              predictedWait:
                forecast
                  ?.predicted_wait_minutes ??
                0,

              confidenceScore:
                forecast
                  ?.confidence_score ??
                0,

              confidenceLabel:
                forecast
                  ?.confidence_label ??
                "UNKNOWN",

              reasonCode:
                forecast
                  ?.reason_code ??
                "NO_FORECAST",

              forecastModelVersion:
                forecast
                  ?.model_version ??
                0,

              note:
                getNote(
                  token,
                ),

              isPriority:
                token.is_priority,

              phoneMasked:
                token.patient
                  .phone_masked ??
                undefined,
            }
          },
        )
      },

      [
        queueQuery.data,
      ],
    )


  const events =
    useMemo<
      QueueEvent[]
    >(
      () => {
        const apiEvents =
          eventsQuery.data ??
          []

        return apiEvents.map(
          (event) => ({
            id:
              event.id,

            title:
              eventTitle(
                event.event_type,
              ),

            description:
              event.message,

            time:
              formatEventTime(
                event.created_at,
              ),

            type:
              mapEventType(
                event,
              ),
          }),
        )
      },

      [
        eventsQuery.data,
      ],
    )


  const forecastVersion =
    queueQuery.data
      ?.forecast_version ??
    1


  const priorityInserted =
    queue.some(
      (patient) =>
        patient.isPriority &&
        patient.status !==
          "COMPLETED" &&
        patient.status !==
          "MISSED",
    )


  const doctorStatus =
    normalizeDoctorStatus(
      doctorsQuery.data?.[0]
        ?.status,
    )


  async function refreshBackend() {
    await Promise.all([
      queryClient.invalidateQueries(
        {
          queryKey: [
            "queue",
          ],
        },
      ),

      queryClient.invalidateQueries(
        {
          queryKey: [
            "doctors",
          ],
        },
      ),

      queryClient.invalidateQueries(
        {
          queryKey: [
            "events",
          ],
        },
      ),
    ])
  }


  async function runAction(
    action: () => Promise<unknown>,
  ) {
    try {
      await action()

      await refreshBackend()

    } catch (error) {
      console.error(
        "QueuePulse backend action failed:",
        error,
      )

      if (
        error instanceof Error
      ) {
        window.alert(
          error.message,
        )
      }
    }
  }


  async function insertPriorityCase() {
    await runAction(
      queueApi.insertPriority,
    )
  }


  async function resetDemo() {
    await runAction(
      queueApi.resetDemo,
    )

    setSmsMessages([])
  }


  async function completeCurrentConsultation() {
    await runAction(
      queueApi.completeConsultation,
    )
  }


  async function callNextPatient() {
    await runAction(
      queueApi.callNext,
    )
  }


  async function startCalledPatient() {
    await runAction(
      queueApi.startConsultation,
    )
  }


  async function markCalledPatientNoShow() {
    await runAction(
      queueApi.noShow,
    )
  }


  async function pauseDoctor() {
    await runAction(
      queueApi.pauseDoctor,
    )
  }


  async function resumeDoctor() {
    await runAction(
      queueApi.resumeDoctor,
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

          id:
            createSmsId(),

          time:
            currentTime(),
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

    return (
      `QueuePulse ${patient.token}: ` +
      `ETA ${patient.etaMin}-${patient.etaMax} min. ` +
      `Now serving ${nowServing?.token ?? "N/A"}. ` +
      `Forecast v${forecastVersion}.`
    )
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
          normalizeToken(
            token,
          ),
      )

    if (!patient) {
      return "Token not found."
    }

    const response =
      buildPatientSms(
        patient,
      )

    addSms({
      direction:
        "OUTBOUND",

      token:
        patient.token,

      recipient:
        patient.phoneMasked ??
        "Basic phone",

      message:
        response,

      status:
        "SENT",
    })

    return response
  }


  function simulateSmsQuery(
    input: string,
  ) {
    const trimmed =
      input.trim()

    addSms({
      direction:
        "INBOUND",

      recipient:
        "QueuePulse SMS",

      message:
        trimmed,

      status:
        "RECEIVED",
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
        direction:
          "OUTBOUND",

        recipient:
          "Basic phone",

        message:
          help,

        status:
          "SENT",
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
          normalizeToken(
            token,
          ),
      )

    if (!patient) {
      const notFound =
        `QueuePulse: Token ${token} was not found.`

      addSms({
        direction:
          "OUTBOUND",

        recipient:
          "Basic phone",

        message:
          notFound,

        status:
          "SENT",
      })

      return notFound
    }

    const response =
      buildPatientSms(
        patient,
      )

    addSms({
      direction:
        "OUTBOUND",

      token:
        patient.token,

      recipient:
        patient.phoneMasked ??
        "Basic phone",

      message:
        response,

      status:
        "SENT",
    })

    return response
  }


  const value: QueueContextType = {
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
  }


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
    useContext(
      QueueContext,
    )

  if (!context) {
    throw new Error(
      "useQueue must be used inside QueueProvider",
    )
  }

  return context
}