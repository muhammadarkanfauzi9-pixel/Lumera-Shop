"use client";

import { useEffect, useState } from "react";
import { DollarSign, ArrowLeft, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    growth: number;
  }>;
  yearlyRevenue: Array<{
    year: string;
    revenue: number;
  }>;
  topRevenueProducts: Array<{
    id: number;
    name: string;
    revenue: number;
    percentage: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}

export default function TotalRevenuePage() {
  const router = useRouter();
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        "http://localhost:5000/api/admin/total-revenue",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch revenue data");
      }

      const result = await response.json();
      setData(result);
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
        Error loading revenue data: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-600">No revenue data available</div>
    );
  }

  const chartData =
    timeRange === "monthly" ? data.monthlyRevenue : data.yearlyRevenue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Total Revenue</h1>
          <p className="text-gray-500 text-sm">
            Revenue analytics and performance metrics
          </p>
        </div>
      </div>

      {/* Total Revenue Card */}
      <div className="bg-linear-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100">Total Revenue</p>
            <h2 className="text-3xl font-bold">
              Rp {data.totalRevenue.toLocaleString("id-ID")}
            </h2>
            <p className="text-green-100 text-sm mt-1">
              All time revenue from completed orders
            </p>
          </div>
          <div className="p-4 bg-white/20 rounded-lg">
            <DollarSign size={32} />
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange("monthly")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === "monthly"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setTimeRange("yearly")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === "yearly"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Yearly
        </button>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Revenue Trend (
            {timeRange === "monthly" ? "Last 12 Months" : "Last 5 Years"})
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 size={16} />
            <span>Revenue over time</span>
          </div>
        </div>

        <div className="h-80">
          {/* ResponsiveContainer may render with zero size if parent hasn't been laid out yet.
              Using a fixed numeric height here avoids warnings about width/height <= 0.
              You can also use an explicit style or minHeight on the parent instead. */}
          <ResponsiveContainer width="100%" height={280}>
            {timeRange === "monthly" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  formatter={(value: number) => [
                    `Rp ${value.toLocaleString("id-ID")}`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  formatter={(value: number) => [
                    `Rp ${value.toLocaleString("id-ID")}`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Revenue Products */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top Revenue Products
        </h3>
        <div className="space-y-4">
          {data.topRevenueProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-400">
                  #{index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    {product.percentage}% of total revenue
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">
                  Rp {product.revenue.toLocaleString("id-ID")}
                </p>
                <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${product.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Revenue by Category
        </h3>
        <div className="space-y-4">
          {data.revenueByCategory.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                ></div>
                <span className="font-medium text-gray-800">
                  {category.category}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">
                  Rp {category.revenue.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-gray-500">{category.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
