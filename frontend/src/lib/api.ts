const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000"


// ==========================================================
// API TYPES
// ==========================================================

export type ApiForecast = {
  model_version: number
  predicted_wait_minutes: number
  eta_min_minutes: number
  eta_max_minutes: number
  confidence_score: number
  confidence_label: string
  reason_code: string
  generated_at: string
}


export type ApiPatient = {
  patient_code: string
  display_name: string | null
  phone_masked: string | null
  channel: string
  checked_in: boolean
}


export type ApiDoctorSummary = {
  id: string
  name: string
  room_label: string
  status: string
}


export type ApiQueueToken = {
  id: string
  token_number: string

  status: string

  priority_level: number
  is_priority: boolean

  queue_position: number | null

  department: string
  department_code: string

  patient: ApiPatient

  doctor: ApiDoctorSummary | null

  latest_forecast: ApiForecast | null
}


export type ApiQueueResponse = {
  department: string
  department_code: string

  active_count: number
  forecast_version: number

  queue: ApiQueueToken[]
}


export type ApiDoctor = {
  id: string

  name: string

  department: string
  department_code: string

  room_label: string

  status: string

  average_consultation_minutes: number

  is_active: boolean
}


export type ApiQueueEvent = {
  id: string

  event_type: string
  source: string

  message: string

  token_number: string | null

  created_at: string

  payload: Record<string, unknown> | null
}


export type ApiActionResponse = {
  success: boolean

  action: string
  message: string

  token_number: string | null

  doctor_status: string | null

  forecast_version: number
}


// ==========================================================
// REQUEST HELPER
// ==========================================================

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",

        ...options?.headers,
      },
    },
  )

  const data = await response
    .json()
    .catch(() => null)

  if (!response.ok) {
    const message =
      data?.detail ??
      data?.message ??
      `Request failed with status ${response.status}`

    throw new Error(message)
  }

  return data as T
}


// ==========================================================
// READ API
// ==========================================================

export const queueApi = {
  getQueue:
    async (): Promise<ApiQueueResponse> => {
      return request<ApiQueueResponse>(
        "/api/v1/queue",
      )
    },

  getToken:
    async (
      token: string,
    ) => {
      return request<ApiQueueToken>(
        `/api/v1/tokens/${encodeURIComponent(
          token,
        )}`,
      )
    },

  getDoctors:
    async (): Promise<ApiDoctor[]> => {
      return request<ApiDoctor[]>(
        "/api/v1/doctors",
      )
    },

  getEvents:
    async (): Promise<
      ApiQueueEvent[]
    > => {
      return request<
        ApiQueueEvent[]
      >(
        "/api/v1/events?limit=30",
      )
    },


  // ========================================================
  // ACTION API
  // ========================================================

  insertPriority:
    async (): Promise<ApiActionResponse> => {
      return request<ApiActionResponse>(
        "/api/v1/queue/priority",
        {
          method: "POST",
        },
      )
    },

  completeConsultation:
    async (): Promise<ApiActionResponse> => {
      return request<ApiActionResponse>(
        "/api/v1/doctor/complete",
        {
          method: "POST",
        },
      )
    },

  callNext:
    async (): Promise<ApiActionResponse> => {
      return request<ApiActionResponse>(
        "/api/v1/doctor/call-next",
        {
          method: "POST",
        },
      )
    },

  startConsultation:
    async (): Promise<ApiActionResponse> => {
      return request<ApiActionResponse>(
        "/api/v1/doctor/start",
        {
          method: "POST",
        },
      )
    },

  noShow:
    async (): Promise<ApiActionResponse> => {
      return request<ApiActionResponse>(
        "/api/v1/doctor/no-show",
        {
          method: "POST",
        },
      )
    },

  pauseDoctor:
    async (): Promise<ApiActionResponse> => {
      return request<ApiActionResponse>(
        "/api/v1/doctor/pause",
        {
          method: "POST",
        },
      )
    },

  resumeDoctor:
    async (): Promise<ApiActionResponse> => {
      return request<ApiActionResponse>(
        "/api/v1/doctor/resume",
        {
          method: "POST",
        },
      )
    },

  resetDemo:
    async (): Promise<ApiActionResponse> => {
      return request<ApiActionResponse>(
        "/api/v1/demo/reset",
        {
          method: "POST",
        },
      )
    },
}