import {
    useAuth,
  } from "../context/AuthContext"
  
  
  export function usePermissions() {
    const {
      user,
      hasRole,
    } = useAuth()
  
  
    return {
      user,
  
      canInsertPriority:
        hasRole(
          "TRIAGE_STAFF",
          "OPERATIONS_MANAGER",
          "ADMIN",
        ),
  
      canResetDemo:
        hasRole(
          "OPERATIONS_MANAGER",
          "ADMIN",
        ),
  
      canCallNext:
        hasRole(
          "DOCTOR",
          "RECEPTIONIST",
          "OPERATIONS_MANAGER",
          "ADMIN",
        ),
  
      canStartConsultation:
        hasRole(
          "DOCTOR",
          "OPERATIONS_MANAGER",
          "ADMIN",
        ),
  
      canCompleteConsultation:
        hasRole(
          "DOCTOR",
          "OPERATIONS_MANAGER",
          "ADMIN",
        ),
  
      canMarkNoShow:
        hasRole(
          "DOCTOR",
          "RECEPTIONIST",
          "OPERATIONS_MANAGER",
          "ADMIN",
        ),
  
      canPauseDoctor:
        hasRole(
          "DOCTOR",
          "OPERATIONS_MANAGER",
          "ADMIN",
        ),
  
      canResumeDoctor:
        hasRole(
          "DOCTOR",
          "OPERATIONS_MANAGER",
          "ADMIN",
        ),
  
      canViewAudit:
        hasRole(
          "OPERATIONS_MANAGER",
          "ADMIN",
        ),
    }
  }