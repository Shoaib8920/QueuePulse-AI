import type {
    QueuePatient,
  } from "../context/QueueContext"
  
  
  function activeForecastPatients(
    queue: QueuePatient[],
  ) {
    return queue.filter(
      (patient) =>
        patient.status !== "SERVING" &&
        patient.status !== "COMPLETED" &&
        patient.status !== "MISSED" &&
        patient.etaMax > 0,
    )
  }
  
  
  export function getMedianWait(
    queue: QueuePatient[],
  ) {
    const values =
      activeForecastPatients(
        queue,
      )
        .map(
          (patient) =>
            (
              patient.etaMin +
              patient.etaMax
            ) / 2,
        )
        .sort(
          (a, b) => a - b,
        )
  
    if (values.length === 0) {
      return 0
    }
  
    const middle =
      Math.floor(
        values.length / 2,
      )
  
    if (
      values.length % 2 === 0
    ) {
      return Math.round(
        (
          values[middle - 1] +
          values[middle]
        ) / 2,
      )
    }
  
    return Math.round(
      values[middle],
    )
  }
  
  
  export function getQueueVolatility(
    queue: QueuePatient[],
  ) {
    const patients =
      activeForecastPatients(
        queue,
      )
  
    if (patients.length === 0) {
      return "Low"
    }
  
    const averageWidth =
      patients.reduce(
        (
          total,
          patient,
        ) =>
          total +
          Math.max(
            0,
            patient.etaMax -
              patient.etaMin,
          ),
        0,
      ) /
      patients.length
  
    if (averageWidth <= 5) {
      return "Low"
    }
  
    if (averageWidth <= 10) {
      return "Medium"
    }
  
    return "High"
  }
  
  
  export function formatWait(
    minutes: number,
  ) {
    return `${minutes}m`
  }