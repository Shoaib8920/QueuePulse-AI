const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000"

export const AUTH_TOKEN_KEY =
  "queuepulse_access_token"


export type UserRole =
  | "ADMIN"
  | "OPERATIONS_MANAGER"
  | "TRIAGE_STAFF"
  | "DOCTOR"
  | "RECEPTIONIST"


export type ApiLoginResponse = {
  access_token: string
  token_type: string

  name: string
  email: string
  role: UserRole
}


export type ApiCurrentUser = {
  id: string

  name: string
  email: string

  role: UserRole

  is_active: boolean
}


export type ApiForecast = {
  model_version: number

  predicted_wait_minutes: number

  eta_min_minutes: number
  eta_max_minutes: number

  confidence_score: number
  confidence_label: string

  reason_code: string
}


export type ApiPatient = {
  patient_code: string

  display_name?: string | null

  phone_masked?: string | null

  channel: string

  checked_in: boolean
}


export type ApiDoctorSummary = {
  id?: string

  name: string

  status?: string
}


export type ApiQueueToken = {
  id: string

  token_number: string

  sequence_number?: number

  status: string

  priority_level?: number

  is_priority: boolean

  queue_position?: number | null

  department: string

  doctor?: ApiDoctorSummary | null

  patient: ApiPatient

  latest_forecast?: ApiForecast | null
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

  status: string

  average_consultation_minutes?: number
}


export type ApiQueueEvent = {
  id: string

  event_type: string

  source: string

  message: string

  created_at: string

  payload?: Record<
    string,
    unknown
  > | null
}


export type ApiActionResponse = {
  success: boolean

  action: string

  message: string

  token_number?: string | null

  doctor_status?: string | null

  forecast_version: number
}


export type ApiAuditEvent = {
  id: string

  action: string

  entity_type: string

  entity_id?: string | null

  actor_name?: string | null

  actor_email?: string | null

  actor_role?: string | null

  details?: Record<
    string,
    unknown
  > | null

  created_at: string
}


function getToken() {
  return localStorage.getItem(
    AUTH_TOKEN_KEY,
  )
}


async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers =
    new Headers(
      options.headers,
    )

  if (
    authenticated
  ) {
    const token =
      getToken()

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`,
      )
    }
  }

  if (
    options.body &&
    !headers.has(
      "Content-Type",
    ) &&
    !(
      options.body
      instanceof FormData
    ) &&
    !(
      options.body
      instanceof URLSearchParams
    )
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    )
  }

  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers,
      },
    )

  let data: unknown = null

  const contentType =
    response.headers.get(
      "content-type",
    )

  if (
    contentType?.includes(
      "application/json",
    )
  ) {
    data =
      await response.json()
  } else {
    data =
      await response.text()
  }

  if (!response.ok) {
    let message =
      `Request failed (${response.status})`

    if (
      data &&
      typeof data ===
        "object"
    ) {
      const object =
        data as {
          detail?: string
          message?: string
        }

      message =
        object.detail ??
        object.message ??
        message
    }

    if (
      response.status ===
        401 &&
      authenticated
    ) {
      localStorage.removeItem(
        AUTH_TOKEN_KEY,
      )

      window.dispatchEvent(
        new Event(
          "queuepulse:unauthorized",
        ),
      )
    }

    throw new Error(
      message,
    )
  }

  return data as T
}


/* ===================================================== */
/* AUTHENTICATION */
/* ===================================================== */


export const authApi = {
  async login(
    email: string,
    password: string,
  ) {
    const form =
      new URLSearchParams()

    form.set(
      "username",
      email,
    )

    form.set(
      "password",
      password,
    )

    return request<ApiLoginResponse>(
      "/api/v1/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: form,
      },
      false,
    )
  },


  getMe() {
    return request<ApiCurrentUser>(
      "/api/v1/auth/me",
    )
  },
}


/* ===================================================== */
/* QUEUE API */
/* ===================================================== */


export const queueApi = {
  getQueue() {
    return request<ApiQueueResponse>(
      "/api/v1/queue?department_code=GM",
      {},
      false,
    )
  },


  getToken(
    token: string,
  ) {
    return request<ApiQueueToken>(
      `/api/v1/tokens/${encodeURIComponent(
        token,
      )}`,
      {},
      false,
    )
  },


  getDoctors() {
    return request<ApiDoctor[]>(
      "/api/v1/doctors",
      {},
      false,
    )
  },


  getEvents() {
    return request<
      ApiQueueEvent[]
    >(
      "/api/v1/events?limit=30",
      {},
      false,
    )
  },


  insertPriority() {
    return request<ApiActionResponse>(
      "/api/v1/queue/priority",
      {
        method: "POST",
      },
    )
  },


  completeConsultation() {
    return request<ApiActionResponse>(
      "/api/v1/doctor/complete",
      {
        method: "POST",
      },
    )
  },


  callNext() {
    return request<ApiActionResponse>(
      "/api/v1/doctor/call-next",
      {
        method: "POST",
      },
    )
  },


  startConsultation() {
    return request<ApiActionResponse>(
      "/api/v1/doctor/start",
      {
        method: "POST",
      },
    )
  },


  noShow() {
    return request<ApiActionResponse>(
      "/api/v1/doctor/no-show",
      {
        method: "POST",
      },
    )
  },


  pauseDoctor() {
    return request<ApiActionResponse>(
      "/api/v1/doctor/pause",
      {
        method: "POST",
      },
    )
  },


  resumeDoctor() {
    return request<ApiActionResponse>(
      "/api/v1/doctor/resume",
      {
        method: "POST",
      },
    )
  },


  resetDemo() {
    return request<ApiActionResponse>(
      "/api/v1/demo/reset",
      {
        method: "POST",
      },
    )
  },


  recalculateForecast() {
    return request<unknown>(
      "/api/v1/forecast/recalculate",
      {
        method: "POST",
      },
    )
  },


  getAuditLog(
    limit = 50,
  ) {
    return request<
      ApiAuditEvent[]
    >(
      `/api/v1/audit?limit=${limit}`,
    )
  },
}