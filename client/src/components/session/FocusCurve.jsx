import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { FOCUS_LEVELS, FOCUS_DROP_THRESHOLD } from "../../utils/constants";
import Card from "../ui/Card";

const FOCUS_COLORS_HEX = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  5: "#6366f1",
};

function CustomDot({ cx, cy, payload }) {
  const color = FOCUS_COLORS_HEX[payload.focus] || "#6366f1";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="white"
      strokeWidth={2}
    />
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const level = FOCUS_LEVELS.find((l) => l.value === data.focus);
  return (
    <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-medium text-surface-800">
        Check-in #{data.index}
      </p>
      <p className="text-xs text-surface-500">
        Focus:{" "}
        <span className="font-medium">
          {data.focus} — {level?.label}
        </span>
      </p>
      {data.subject && (
        <p className="text-xs text-surface-400">{data.subject}</p>
      )}
      {data.time && (
        <p className="text-xs text-surface-400">{data.time}</p>
      )}
    </div>
  );
}

export default function FocusCurve({ data = [], title = "Focus Curve" }) {
  if (data.length === 0) {
    return (
      <Card>
        <h3 className="mb-2 text-sm font-semibold text-surface-800">
          {title}
        </h3>
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-surface-400">
            Your focus curve will appear here after your first check-in.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-surface-800">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <defs>
            <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="index"
            tick={{ fontSize: 11, fill: "#a8a29e" }}
            axisLine={{ stroke: "#e7e5e4" }}
            tickLine={false}
            tickFormatter={(v) => `#${v}`}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 11, fill: "#a8a29e" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              const l = FOCUS_LEVELS.find((l) => l.value === v);
              return l ? l.label : v;
            }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={FOCUS_DROP_THRESHOLD}
            stroke="#fbbf24"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: "Threshold",
              position: "right",
              fill: "#fbbf24",
              fontSize: 10,
            }}
          />
          <Area
            type="monotone"
            dataKey="focus"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#focusGradient)"
            dot={<CustomDot />}
            activeDot={{ r: 7, stroke: "#6366f1", strokeWidth: 2, fill: "white" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
