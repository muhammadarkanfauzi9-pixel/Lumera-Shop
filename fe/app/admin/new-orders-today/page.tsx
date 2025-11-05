"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Calendar,
  User,
  MapPin,
  Phone,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  orderDate: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryAddress: string;
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function NewOrdersTodayPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchNewOrdersToday();
  }, []);

  const fetchNewOrdersToday = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        "http://localhost:5000/api/admin/new-orders-today",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch new orders today");
      }

      const result = await response.json();
      setOrders(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        Error loading new orders: {error}
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
          <h1 className="text-3xl font-bold text-gray-800">New Orders Today</h1>
          <p className="text-gray-500 text-sm">
            Orders placed today - {new Date().toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ShoppingBag size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {orders.length}
            </h3>
            <p className="text-gray-500">New orders today</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No new orders today</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {order.customerName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {order.customerPhone}
                  </span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {order.deliveryAddress}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Order #{selectedOrder.id} Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Customer Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>Name:</strong> {selectedOrder.customerName}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedOrder.customerEmail}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedOrder.customerPhone}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedOrder.deliveryAddress}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-800">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">
                    Total Amount:
                  </span>
                  <span className="text-lg font-bold text-gray-800">
                    Rp {selectedOrder.totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
