"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Star,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalRevenue?: string;
    totalOrders?: number;
    totalProducts?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:5000/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading stats: {error}
      </div>
    );
  }

  // 📊 Statistik Harian (dummy for now, can be enhanced later)
  const dailyStats = [
    {
      title: "Today's Sales",
      value: stats.totalRevenue || "Rp 0",
      icon: <DollarSign size={26} />,
      color: "bg-blue-600 text-white",
    },
    {
      title: "New Orders",
      value: stats.totalOrders || 0,
      icon: <ShoppingBag size={26} />,
      color: "bg-green-600 text-white",
    },
    {
      title: "Total Products",
      value: stats.totalProducts || 0,
      icon: <Users size={26} />,
      color: "bg-purple-600 text-white",
    },
    {
      title: "Avg Rating",
      value: "4.9 ★",
      icon: <Star size={26} />,
      color: "bg-yellow-500 text-white",
    },
  ];

  // 📆 Statistik Bulanan (using real data)
  const monthlyStats = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue || "Rp 0",
      icon: <TrendingUp size={26} />,
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders || 0,
      icon: <ShoppingBag size={26} />,
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      title: "Total Products",
      value: stats.totalProducts || 0,
      icon: <Users size={26} />,
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
    {
      title: "Reviews Received",
      value: "4.8 ★",
      icon: <Star size={26} />,
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
  ];

  // 📈 Data Chart Bulanan (placeholder, can be enhanced with real monthly data)
  const chartData = [
    { month: "Jan", sales: 240 },
    { month: "Feb", sales: 320 },
    { month: "Mar", sales: 280 },
    { month: "Apr", sales: 400 },
    { month: "May", sales: 380 },
    { month: "Jun", sales: 500 },
    { month: "Jul", sales: 460 },
    { month: "Aug", sales: 530 },
  ];

  // ✨ Animasi dasar untuk kartu
  const cardAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOut equivalent
      },
    }),
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">
            Dashboard Overview
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            E-commerce performance summary (Real-time data)
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString("id-ID")}</span>
        </div>
      </motion.div>

      {/* 🔹 Daily Stats */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          Current Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {dailyStats.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardAnimation}
              initial="hidden"
              animate="visible"
              className={`p-5 rounded-2xl shadow-md border border-gray-200 flex items-center justify-between transition-all hover:scale-[1.02] hover:shadow-lg ${item.color}`}
            >
              <div>
                <p className="text-sm opacity-80">{item.title}</p>
                <h3 className="text-3xl font-extrabold mt-1">{item.value}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                {item.icon}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🔸 Monthly Stats */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          Overall Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {monthlyStats.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardAnimation}
              initial="hidden"
              animate="visible"
              className={`bg-white p-6 rounded-2xl border-2 ${item.color} flex items-center justify-between hover:shadow-md transition-all`}
            >
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  {item.title}
                </p>
                <h3 className="text-3xl font-bold mt-1 text-gray-800">
                  {item.value}
                </h3>
              </div>
              <div
                className={`p-3 rounded-xl ${item.color
                  .split(" ")
                  .filter((c) => c.includes("text-"))
                  .join(" ")} bg-opacity-10`}
              >
                {item.icon}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 📊 Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            Monthly Sales Overview
          </h3>
          <p className="text-sm text-gray-500">January – August 2025</p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                }}
              />
              <Bar dataKey="sales" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
