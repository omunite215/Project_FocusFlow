import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ui/ErrorBoundary";

const Onboarding = lazy(() => import("./pages/Onboarding"));
const Home = lazy(() => import("./pages/Home"));
const ActiveSession = lazy(() => import("./pages/ActiveSession"));
const Report = lazy(() => import("./pages/Report"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Medications = lazy(() => import("./pages/Medications"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));

import PageWrapper from "./components/layout/PageWrapper";

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface-50">
      <div className="text-surface-400 animate-gentle-pulse text-lg font-medium">
        Loading...
      </div>
    </div>
  );
}

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <PageWrapper />,
    children: [
      { path: "/", element: <SuspenseWrapper><Home /></SuspenseWrapper> },
      { path: "/onboarding", element: <SuspenseWrapper><Onboarding /></SuspenseWrapper> },
      { path: "/session", element: <SuspenseWrapper><ActiveSession /></SuspenseWrapper> },
      { path: "/report/:sessionId", element: <SuspenseWrapper><Report /></SuspenseWrapper> },
      { path: "/dashboard", element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
      { path: "/medications", element: <SuspenseWrapper><Medications /></SuspenseWrapper> },
      { path: "/profile", element: <SuspenseWrapper><ProfileEdit /></SuspenseWrapper> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
