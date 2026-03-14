import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import Card from "../ui/Card";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-medium text-surface-800">{data.day}</p>
      <p className="text-xs text-surface-500">
        Avg Focus: <span className="font-medium">{data.avg.toFixed(1)}</span>
      </p>
      {data.subjects && (
        <p className="text-xs text-surface-400">{data.subjects.join(", ")}</p>
      )}
    </div>
  );
}

export default function FocusTrends({ data = [] }) {
  if (data.length === 0) return null;

  // Transform backend focus_trend to chart format
  const chartData = data.map((d) => ({
    day: new Date(d.date).toLocaleDateString([], { weekday: "short" }),
    avg: d.average_focus,
    subjects: d.subjects,
  }));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-surface-800">
        Focus Trends — This Week
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#a8a29e" }}
            axisLine={{ stroke: "#e7e5e4" }}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fill: "#a8a29e" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={3}
            stroke="#d6d3d1"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Area
            type="monotone"
            dataKey="avg"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#trendGradient)"
            dot={{ r: 4, fill: "#6366f1", stroke: "white", strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: "#6366f1", strokeWidth: 2, fill: "white" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
