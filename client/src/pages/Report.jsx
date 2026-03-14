import { useState, useEffect } from "react";
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
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchReport() {
      try {
        const { data } = await sessionService.getReport(sessionId);
        if (!cancelled) setReport(data);
      } catch {
        // Mock may not find report — that's ok
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReport();
    return () => { cancelled = true; };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton height={40} className="w-48 mx-auto" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={80} className="rounded-xl" />
          ))}
        </div>
        <Skeleton height={220} className="rounded-xl" />
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
