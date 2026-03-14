import { useState, useEffect } from "react";
import { useProfileStore } from "../stores/profileStore";
import { dashboardService } from "../services/dashboardService";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import FocusTrends from "../components/dashboard/FocusTrends";
import StudyHeatmap from "../components/dashboard/StudyHeatmap";
import SubjectBreakdown from "../components/dashboard/SubjectBreakdown";

export default function Dashboard() {
  const profile = useProfileStore((s) => s.profile);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const { data: dashData } = await dashboardService.get(
          profile?.id || "user-1"
        );
        if (!cancelled) setData(dashData);
      } catch {
        // Mock fallback handled
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [profile]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={80} className="rounded-xl" />
          ))}
        </div>
        <Skeleton height={280} className="rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl text-center py-12">
        <p className="text-surface-400">
          No data yet. Complete a study session to see your dashboard.
        </p>
      </div>
    );
  }

  const studyHours = Math.round((data.total_study_minutes || 0) / 60 * 10) / 10;

  const stats = [
    { label: "Sessions", value: data.total_sessions },
    { label: "Study Hours", value: studyHours },
    { label: "Avg Focus", value: data.avg_focus?.toFixed(1) },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-800">Dashboard</h1>
        <p className="mt-1 text-sm text-surface-500">
          Your study patterns and trends over time.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} padding="sm" className="text-center">
            <p className="text-2xl font-bold text-surface-800">{stat.value}</p>
            <p className="text-xs text-surface-400">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="space-y-6">
        <FocusTrends data={data.focus_trend} />

        <div className="grid gap-6 md:grid-cols-2">
          <StudyHeatmap data={data.best_study_times} />
          <SubjectBreakdown data={data.subject_averages} />
        </div>
      </div>
    </div>
  );
}
