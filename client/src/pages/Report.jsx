import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sessionService } from "../services/sessionService";
import { useSessionStore } from "../stores/sessionStore";
import SessionReport from "../components/session/SessionReport";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";

export default function Report() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const resetSession = useSessionStore((s) => s.resetSession);
  const storeReport = useSessionStore((s) => s.report);
  const storeSessionId = useSessionStore((s) => s.sessionId);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If we have the report in the store from endSession, use it directly
    if (storeReport && storeSessionId === sessionId) {
      setReport(storeReport);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    try {
      const { data } = await sessionService.getReport(sessionId);
      setReport(data.report || data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setError("This session wasn't found. It may have been deleted or the link is incorrect.");
      } else if (status >= 500) {
        setError("Our server is having trouble. Give it a moment and try again.");
      } else {
        setError("Couldn't load your report. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId, storeReport, storeSessionId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton height={40} className="w-48 mx-auto rounded-lg" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={80} className="rounded-xl" />
          ))}
        </div>
        <Skeleton height={220} className="rounded-xl" />
        <Skeleton height={120} className="rounded-xl" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning-100">
          <svg className="h-7 w-7 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-surface-800">
          {error ? "Report Unavailable" : "No Report Found"}
        </h2>
        <p className="mb-6 text-sm text-surface-500">
          {error || "No report data exists for this session yet."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={fetchReport}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => { resetSession(); navigate("/"); }}>
            Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <SessionReport report={report} />

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button
          onClick={() => {
            resetSession();
            navigate("/");
          }}
        >
          Start New Session
        </Button>
        <Button variant="secondary" onClick={() => navigate("/dashboard")}>
          View Dashboard
        </Button>
      </div>
    </div>
  );
}
