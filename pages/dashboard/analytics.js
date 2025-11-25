"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";

export default function AnalyticsDashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user links
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/links`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLinks(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch links");
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading analytics...</p>;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {links.map((link) => {
          const daysSinceReset = Math.floor(
            (new Date() - new Date(link.lastResetDate)) / (1000 * 60 * 60 * 24)
          );
          const daysLeft = Math.max(30 - daysSinceReset, 0);
          const progressPercent = Math.min(
            (link.redirectCount / link.maxRedirects) * 100,
            100
          );

          // Dummy data for charts (replace with backend aggregation)
          const dailyStats = Array.from({ length: 7 }).map((_, i) => ({
            date: `Day ${i + 1}`,
            clicks: Math.floor(Math.random() * 20),
          }));

          const deviceStats = [
            { device: "Mobile", clicks: Math.floor(Math.random() * 50) },
            { device: "Desktop", clicks: Math.floor(Math.random() * 30) },
            { device: "Tablet", clicks: Math.floor(Math.random() * 20) },
          ];

          return (
            <div
              key={link._id}
              className="bg-gray-800 text-white p-6 rounded-lg shadow-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    {link.title || link.whatsappCode}
                  </h2>
                  <p className="text-gray-400">
                    Plan: {link.userPlan || "Free"}
                  </p>
                </div>
                {progressPercent >= 80 && (
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                    Upgrade to Unlimited
                  </button>
                )}
              </div>

              <div>
                <p>
                  Redirects: {link.redirectCount} / {link.maxRedirects}
                </p>
                <div className="w-full bg-gray-600 h-3 rounded mt-1 overflow-hidden">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className={`h-full rounded bg-gradient-to-r from-green-400 to-blue-500`}
                  ></div>
                </div>
                <p className="text-gray-400 mt-1">
                  {daysLeft} days until reset
                </p>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="bg-gray-700 p-3 rounded">
                  <h3 className="text-md font-semibold mb-2">
                    Clicks over Last 7 Days
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#00ff88" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-700 p-3 rounded">
                  <h3 className="text-md font-semibold mb-2">
                    Clicks by Device
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={deviceStats}
                        dataKey="clicks"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        label
                      >
                        {deviceStats.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={["#00ff88", "#00b3ff", "#ffbb00"][index % 3]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
