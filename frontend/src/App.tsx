import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import DashboardLayout from "./layouts/DashboardLayout"

import CommandCenter from "./pages/CommandCenter"
import LiveQueue from "./pages/LiveQueue"
import Patients from "./pages/Patients"
import Doctors from "./pages/Doctors"
import Forecasting from "./pages/Forecasting"

export default function App() {
  return (
    <Routes>

      <Route
        element={<DashboardLayout />}
      >

        <Route
          index
          element={
            <Navigate
              to="/command-center"
              replace
            />
          }
        />

        <Route
          path="/command-center"
          element={<CommandCenter />}
        />

        <Route
          path="/live-queue"
          element={<LiveQueue />}
        />

        <Route
          path="/patients"
          element={<Patients />}
        />

        <Route
          path="/doctors"
          element={<Doctors />}
        />

        <Route
          path="/forecasting"
          element={<Forecasting />}
        />

      </Route>

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