"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface Order {
  id: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  transactionId?: string;
}

export default function PaymentDetailsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "QRIS":
        return <Smartphone size={20} className="text-blue-600" />;
      case "CASH":
        return <CreditCard size={20} className="text-green-600" />;
      default:
        return <CreditCard size={20} className="text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle size={16} className="text-green-600" />;
      case "PENDING":
        return <Clock size={16} className="text-yellow-600" />;
      case "CANCELED":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#fff] font-sans">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#6B3C2D] to-[#9B6C57] p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/30 rounded-full text-white backdrop-blur-sm hover:bg-white/40 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-white">Payment Details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No payment history</p>
            <p className="text-gray-400 text-sm mt-2">
              Your payment details will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md p-4 border border-gray-100"
              >
                {/* Payment Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getPaymentIcon(order.paymentMethod)}
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.paymentStatus)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-gray-800">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Date</span>
                    <span className="text-gray-800">
                      {new Date(order.orderDate).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Method</span>
                    <span className="text-gray-800">{order.paymentMethod}</span>
                  </div>

                  {order.transactionId && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="text-gray-800 font-mono text-sm">
                        {order.transactionId}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Payment Method Info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      {order.paymentMethod === "QRIS" ? (
                        <Image
                          src="/images/cards/qris.png"
                          alt="QRIS"
                          width={24}
                          height={24}
                        />
                      ) : (
                        <CreditCard size={20} className="text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {order.paymentMethod === "QRIS"
                          ? "QRIS Payment"
                          : "Cash Payment"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.paymentMethod === "QRIS"
                          ? "Instant payment via QR code"
                          : "Pay at the counter"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
