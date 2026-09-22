import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import ProtectedRoute from "./components/ProtectedRoute"

import DashboardLayout from "./layouts/DashboardLayout"

import AuditLog from "./pages/AuditLog"
import CommandCenter from "./pages/CommandCenter"
import Doctors from "./pages/Doctors"
import Forecasting from "./pages/Forecasting"
import LiveQueue from "./pages/LiveQueue"
import Login from "./pages/Login"
import PatientToken from "./pages/PatientToken"
import Patients from "./pages/Patients"


export default function App() {
  return (
    <Routes>

      {/* ============================================== */}
      {/* PUBLIC PATIENT ROUTE */}
      {/* ============================================== */}

      <Route
        path="/token/:reference"
        element={
          <PatientToken />
        }
      />


      {/* ============================================== */}
      {/* STAFF LOGIN */}
      {/* ============================================== */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />


      {/* ============================================== */}
      {/* AUTHENTICATED STAFF APPLICATION */}
      {/* ============================================== */}

      <Route
        element={
          <ProtectedRoute />
        }
      >

        <Route
          element={
            <DashboardLayout />
          }
        >

          {/* DEFAULT AUTHENTICATED ROUTE */}

          <Route
            index
            element={
              <Navigate
                to="/command-center"
                replace
              />
            }
          />


          {/* COMMAND CENTER */}

          <Route
            path="/command-center"
            element={
              <CommandCenter />
            }
          />


          {/* LIVE QUEUE */}

          <Route
            path="/live-queue"
            element={
              <LiveQueue />
            }
          />


          {/* PATIENT MANAGEMENT */}

          <Route
            path="/patients"
            element={
              <Patients />
            }
          />


          {/* DOCTOR WORKFLOW */}

          <Route
            path="/doctors"
            element={
              <Doctors />
            }
          />


          {/* FORECASTING */}

          <Route
            path="/forecasting"
            element={
              <Forecasting />
            }
          />


          {/* AUDIT LOG */}

          <Route
            path="/audit"
            element={
              <AuditLog />
            }
          />

        </Route>

      </Route>


      {/* ============================================== */}
      {/* UNKNOWN ROUTES */}
      {/* ============================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/command-center"
            replace
          />
        }
      />

    </Routes>
  )
}