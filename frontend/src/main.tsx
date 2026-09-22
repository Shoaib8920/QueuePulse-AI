import {
  createRoot,
} from "react-dom/client"

import {
  BrowserRouter,
} from "react-router-dom"

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import App from "./App"

import RealtimeSync from "./components/RealtimeSync"

import {
  AuthProvider,
} from "./context/AuthContext"

import {
  QueueProvider,
} from "./context/QueueContext"

import "./index.css"


const queryClient =
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus:
          false,

        retry: 1,

        staleTime:
          30000,
      },
    },
  })


const rootElement =
  document.getElementById(
    "root",
  )


if (!rootElement) {
  throw new Error(
    "Root element not found",
  )
}


createRoot(
  rootElement,
).render(
  <QueryClientProvider
    client={queryClient}
  >

    <BrowserRouter>

      <AuthProvider>

        <RealtimeSync />

        <QueueProvider>

          <App />

        </QueueProvider>

      </AuthProvider>

    </BrowserRouter>

  </QueryClientProvider>,
)