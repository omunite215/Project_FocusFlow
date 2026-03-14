import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Card from "../ui/Card";

function getBarColor(avgFocus) {
  if (avgFocus >= 4) return "#6366f1";
  if (avgFocus >= 3.5) return "#22c55e";
  if (avgFocus >= 3) return "#eab308";
  return "#f97316";
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-medium text-surface-800">{data.subject}</p>
      <p className="text-xs text-surface-500">
        Hours: <span className="font-medium">{data.hours}</span>
      </p>
      <p className="text-xs text-surface-500">
        Avg Focus: <span className="font-medium">{data.avg_focus.toFixed(1)}</span>
      </p>
    </div>
  );
}

export default function SubjectBreakdown({ data = [] }) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    ...d,
    fill: getBarColor(d.avg_focus),
  }));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-surface-800">
        Subject Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#a8a29e" }}
            axisLine={false}
            tickLine={false}
            unit="h"
          />
          <YAxis
            dataKey="subject"
            type="category"
            tick={{ fontSize: 11, fill: "#78716c" }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="hours"
            radius={[0, 6, 6, 0]}
            barSize={24}
            fill="#6366f1"
          >
            {chartData.map((entry, i) => (
              <rect key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
