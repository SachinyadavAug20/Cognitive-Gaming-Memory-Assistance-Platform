"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrendDataPoint {
  week: string;
  memory: number;
  spatial: number;
  reaction: number;
}

export function TrendChart({ data }: { data: TrendDataPoint[] }) {
  return (
    <div className="w-full h-64 mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid stroke="#D8CEBE" strokeDasharray="3 3" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 14, fontWeight: 700, fill: "#181511" }}
          />
          <YAxis
            domain={[40, 100]}
            tick={{ fontSize: 14, fontWeight: 700, fill: "#181511" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "3px solid #181511",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 700,
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "10px" }} />
          <Line
            type="monotone"
            dataKey="memory"
            name="Memory"
            stroke="#1E5136"
            strokeWidth={3.5}
          />
          <Line
            type="monotone"
            dataKey="spatial"
            name="Spatial"
            stroke="#C24E26"
            strokeWidth={3.5}
          />
          <Line
            type="monotone"
            dataKey="reaction"
            name="Reaction"
            stroke="#D97706"
            strokeWidth={3.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
