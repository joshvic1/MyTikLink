"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ClickChart({ data }) {
  return (
    <div className="bg-[#0b0b0b] p-6 rounded-2xl border border-[#1e1e1e] text-white w-full shadow-lg">
      <h3 className="text-lg mb-4 font-semibold">Clicks Over Time</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              borderRadius: "10px",
              border: "none",
            }}
            labelStyle={{ color: "#ccc" }}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#00ff88"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
