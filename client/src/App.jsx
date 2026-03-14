import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<PageWrapper />}>
              <Route path="/" element={<Home />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/session" element={<ActiveSession />} />
              <Route path="/report/:sessionId" element={<Report />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/medications" element={<Medications />} />
              <Route path="/profile" element={<ProfileEdit />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
