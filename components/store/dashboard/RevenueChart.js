"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

export default function RevenueChart({ data = [], positive = true }) {
  const stroke = positive ? "#22c55e" : "#ef4444";

  const fill = positive ? "#22c55e20" : "#ef444420";
  return (
    <ResponsiveContainer width="100%" height={150}>
      <AreaChart data={data}>
        <XAxis dataKey="label" tickLine={false} axisLine={false} />

        <Tooltip
          formatter={(value) => [`₦${Number(value).toLocaleString()}`]}
        />

        <Area
          type="monotone"
          dataKey="revenue"
          stroke={stroke}
          fill={fill}
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
