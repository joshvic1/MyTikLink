import React from "react";

export default function AnalyticsCard({ label, value, icon }) {
  return (
    <div className="bg-[#0b0b0b] p-4 rounded-2xl flex flex-col items-center text-white shadow-lg w-full sm:w-[220px] border border-[#1e1e1e]">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-sm text-gray-400">{label}</p>
      <h3 className="text-2xl font-semibold mt-1">{value}</h3>
    </div>
  );
}
