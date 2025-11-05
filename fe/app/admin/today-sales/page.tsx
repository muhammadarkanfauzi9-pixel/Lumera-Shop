"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TodaySalesData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  hourlySales: Array<{
    hour: number;
    sales: number;
  }>;
  recentOrders: Array<{
    id: number;
    customerName: string;
    amount: number;
    time: string;
  }>;
}

export default function TodaySalesPage() {
  const router = useRouter();
  const [data, setData] = useState<TodaySalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodaySales();
  }, []);

  const fetchTodaySales = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        "http://localhost:5000/api/admin/today-sales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch today's sales data");
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
        Error loading today's sales: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-600">
        No sales data available for today
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-800">Today's Sales</h1>
          <p className="text-gray-500 text-sm">
            Sales performance for {new Date().toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-800">
                Rp {data.totalSales.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {data.totalOrders}
              </h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Order Value</p>
              <h3 className="text-2xl font-bold text-gray-800">
                Rp {data.averageOrderValue.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Top Products Today
        </h3>
        <div className="space-y-3">
          {data.topProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">
                  #{index + 1}
                </span>
                <span className="font-medium text-gray-800">
                  {product.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  Rp {product.revenue.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-500">{product.sales} sold</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Sales Chart Placeholder */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Hourly Sales Trend
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Hourly sales chart would be displayed here
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Orders Today
        </h3>
        <div className="space-y-3">
          {data.recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {order.customerName}
                </p>
                <p className="text-sm text-gray-500">Order #{order.id}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800">
                  Rp {order.amount.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-500">{order.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
