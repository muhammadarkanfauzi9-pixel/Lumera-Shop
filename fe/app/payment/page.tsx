"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Truck, QrCode, Loader2, Download } from "lucide-react";

interface PaymentOptionProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}

interface OrderDetailsProps {
  subtotal: number;
  taxes: number;
  delivery: number;
  total: number;
}

interface PaymentCardProps {
  title: string;
  subtitle: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil data dari query params
  const name = searchParams.get("name");
  const price = Number(searchParams.get("price")) || 0;
  const portion = Number(searchParams.get("portion")) || 1;
  const productId = Number(searchParams.get("productId")) || 1; // Default to 1 if not provided

  // Hitung harga
  const taxes = 1000;
  const delivery = 1000;
  const subtotal = price * portion;
  const total = subtotal + taxes + delivery;

  // State
  const [method, setMethod] = useState("cod"); // default COD
  const [showPopup, setShowPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderTimeout, setOrderTimeout] = useState<NodeJS.Timeout | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "checking" | "success"
  >("idle");

  const startOrderTimeout = () => {
    // Clear any existing timeout
    if (orderTimeout) {
      clearTimeout(orderTimeout);
    }

    // Start new 5 minute timeout
    const timeout = setTimeout(() => {
      // If popup is still open and no order has been created
      if (showPopup && !orderId) {
        setShowPopup(false);
        alert("Pesanan dibatalkan karena timeout (5 menit)");
        router.back();
      }
    }, 5 * 60 * 1000); // 5 minutes

    setOrderTimeout(timeout);
  };

  const handlePay = () => {
    // Show the popup
    setShowPopup(true);
    // Reset payment status
    setPaymentStatus("idle");
    // Start the timeout
    startOrderTimeout();
  };

  const handleConfirmOrder = async () => {
    // Prepare order data
    const items = [
      {
        productId: productId,
        quantity: portion,
      },
    ];
    const paymentMethod = method === "qris" ? "QRIS" : "CASH";

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items, paymentMethod }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear timeout since order is confirmed
        clearOrderTimeout();

        // Store order ID
        setOrderId(data.orderId);

        // Order created successfully, close popup and redirect to WhatsApp using backend URL
        setShowPopup(false);
        // Use the WhatsApp URL from backend response for consistency
        // Create a temporary link element for better cross-device compatibility
        const link = document.createElement("a");
        link.href = data.whatsappUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(data.message || "Failed to create order");
      }
    } catch (err) {
      alert("Error creating order: " + (err as Error).message);
    }
  };

  const clearOrderTimeout = () => {
    if (orderTimeout) {
      clearTimeout(orderTimeout);
      setOrderTimeout(null);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    clearOrderTimeout();
  };

  const downloadQRCode = async (imageUrl: string) => {
    try {
      // Fetch gambar
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Buat URL objek untuk download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qris-payment-${new Date().getTime()}.jpg`; // Nama file yang akan diunduh

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      alert("Gagal mengunduh QR code. Silakan coba lagi.");
    }
  };

  const handleContactAdmin = useCallback(() => {
    const phone = "6281239450638"; // Nomor WhatsApp admin
    const message = `Halo Admin, saya telah menyelesaikan pembayaran ${
      method === "qris" ? "QRIS" : "COD"
    }.\n\nDetail Pesanan:\n🍔 Pesanan: ${name}\nJumlah: ${portion} porsi\nTotal: Rp ${total.toLocaleString(
      "id-ID"
    )}\n\nEstimasi pengiriman dalam 24 jam. Mohon konfirmasi pesanan saya dan waktu pengiriman yang tersedia.\n\nTerima kasih!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    // Create a temporary link element for better cross-device compatibility
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [method, name, portion, total]);

  // Check if user is logged in
  // Auth check effect
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  // Effect untuk mengecek pembayaran QRIS
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkQRISPayment = async () => {
      try {
        const user = localStorage.getItem("user");
        if (!user) return false;

        const userData = JSON.parse(user);

        // Cek saldo user
        const response = await fetch("/api/users/balance", {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengecek saldo");
        }

        const data = await response.json();

        // Jika saldo mencukupi untuk melakukan pembayaran
        if (data.balance >= total) {
          setPaymentStatus("success");

          // Tunggu sebentar untuk menampilkan success message
          setTimeout(() => {
            setShowPopup(false);
            setTimeout(() => {
              setSuccessPopup(true);
              // Auto-redirect to WhatsApp after showing success
              setTimeout(() => {
                handleContactAdmin();
              }, 2000); // 2 seconds delay
            }, 250);
          }, 1000);

          return true;
        }

        return false;
      } catch (error) {
        console.error("Error checking payment:", error);
        return false;
      }
    };

    if (method === "qris" && showPopup && paymentStatus === "idle") {
      // Set status checking
      setPaymentStatus("checking");

      // Mulai interval pengecekan setiap 3 detik
      interval = setInterval(async () => {
        const isSuccess = await checkQRISPayment();
        if (isSuccess) {
          clearInterval(interval);
        }
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (orderTimeout) {
        clearTimeout(orderTimeout);
      }
    };
  }, [
    method,
    showPopup,
    paymentStatus,
    orderTimeout,
    total,
    handleContactAdmin,
  ]);

  return (
    <div className="relative min-h-screen bg-white px-6 py-6 font-sans overflow-y-auto pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full shadow-sm hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <button className="p-2 bg-gray-100 rounded-full shadow-sm hover:bg-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.6}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z"
            />
          </svg>
        </button>
      </div>

      {/* Order Summary */}
      <h2 className="text-[17px] font-semibold mb-4">Order summary</h2>

      <div className="text-gray-800 space-y-3">
        <div className="flex justify-between text-sm">
          <span>{name || "Your Order"}</span>
          <span>Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Taxes</span>
          <span>Rp {taxes.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery fees</span>
          <span>Rp {delivery.toLocaleString("id-ID")}</span>
        </div>

        <div className="border-t border-gray-200 pt-3" />

        <div className="flex justify-between font-semibold text-[15px]">
          <span>Total</span>
          <span>Rp {total.toLocaleString("id-ID")}</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-500">
            Estimasi pengiriman{" "}
            <span className="font-medium text-gray-700">
              24 jam setelah pembayaran
            </span>
          </p>
          <p className="text-xs text-gray-500 italic">
            * Waktu pengiriman dapat dikonfirmasi dengan admin sesuai
            ketersediaan
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <h3 className="text-[15px] font-semibold mt-8 mb-3">Payment methods</h3>

      <div className="flex flex-col gap-4">
        <PaymentOption
          selected={method === "cod"}
          onClick={() => setMethod("cod")}
          title="COD"
          subtitle="Bayar di tempat"
        />

        <PaymentOption
          selected={method === "qris"}
          onClick={() => setMethod("qris")}
          title="QRIS"
          subtitle="Bayar via QR code"
        />
      </div>

      {/* Tombol Pay */}
      <div className="flex justify-between items-center mt-10">
        <div>
          <p className="text-sm text-gray-600">Total Price</p>
          <p className="text-[22px] font-semibold text-[#7B4540] tracking-wide">
            Rp {total.toLocaleString("id-ID")}
          </p>
        </div>
        <button
          onClick={handlePay}
          className="bg-[#2b1d1a] text-white px-8 py-3 rounded-2xl font-semibold shadow-md hover:scale-105 transition-transform"
        >
          Order Now
        </button>
      </div>

      {/* Popup pembayaran */}
      <AnimatePresence>
        {showPopup && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={closePopup}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Konten popup */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl p-6 z-50"
            >
              {/* COD */}
              {method === "cod" && (
                <div className="space-y-3 text-gray-700">
                  <OrderDetails
                    subtotal={subtotal}
                    taxes={taxes}
                    delivery={delivery}
                    total={total}
                  />
                  <PaymentCard title="COD" subtitle="Bayar di tempat" />
                  <button
                    onClick={handleConfirmOrder}
                    className="mt-6 w-full bg-[#7B4540] text-white py-3 rounded-xl font-semibold shadow-md hover:bg-[#633732] transition"
                  >
                    Pay Now
                  </button>
                </div>
              )}

              {/* QRIS */}
              {method === "qris" && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-[#2b1d1a] text-center">
                    Pembayaran QRIS
                  </h3>
                  <div className="flex justify-center mb-4 relative">
                    {paymentStatus === "checking" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 animate-spin text-[#7B4540]" />
                          <p className="mt-2 text-sm font-medium text-[#7B4540]">
                            Menunggu pembayaran...
                          </p>
                        </div>
                      </div>
                    )}
                    {paymentStatus === "success" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <p className="mt-2 text-sm font-medium text-green-600">
                            Pembayaran Berhasil!
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      <Image
                        src="/images/qris.png/WhatsApp Image 2025-11-05 at 15.16.49_298b6f3b.jpg"
                        alt="QRIS Code"
                        width={200}
                        height={200}
                        className="rounded-xl border border-gray-300"
                      />
                      <button
                        onClick={() =>
                          downloadQRCode(
                            "/images/qris.png/WhatsApp Image 2025-11-05 at 15.16.49_298b6f3b.jpg"
                          )
                        }
                        className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg text-sm font-medium text-gray-700"
                      >
                        <Download className="h-5 w-5" />
                        Unduh QR Code
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <p className="text-center text-gray-600 text-sm">
                      Scan QRIS di atas menggunakan aplikasi pembayaran Anda
                    </p>
                    <p className="text-center text-gray-500 text-xs">
                      atau unduh QR Code untuk pembayaran melalui perangkat lain
                    </p>
                  </div>
                  <p className="text-center text-[#7B4540] text-sm font-medium">
                    {paymentStatus === "checking"
                      ? "Menunggu pembayaran..."
                      : paymentStatus === "success"
                      ? "Pembayaran Berhasil!"
                      : "Memproses pembayaran secara otomatis..."}
                  </p>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Popup sukses QRIS */}
      <AnimatePresence>
        {successPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl p-6 z-50"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-[#7B4540] p-3 rounded-full shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.3}
                    stroke="white"
                    className="w-7 h-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-[#7B4540] mb-1 text-center">
                Pembayaran Berhasil!
              </h2>
              <p className="text-gray-500 text-sm mb-6 text-center">
                Terima kasih, pembayaran Anda sudah diterima. Silakan hubungi
                admin untuk konfirmasi pesanan.
              </p>
              <button
                onClick={handleContactAdmin}
                className="w-full bg-[#7B4540] text-white px-6 py-3 rounded-xl font-medium shadow-md hover:bg-[#633732] transition"
              >
                Hubungi Admin
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable components
function PaymentOption({
  selected,
  onClick,
  title,
  subtitle,
}: PaymentOptionProps) {
  const Icon = title === "COD" ? Truck : QrCode;
  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center px-4 py-3 rounded-2xl shadow-sm transition-all cursor-pointer ${
        selected
          ? "bg-[#2b1d1a] border-2 border-[#2b1d1a] text-white"
          : "bg-gray-100 border-2 border-transparent text-gray-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            selected ? "bg-white/20" : "bg-gray-200"
          }`}
        >
          <Icon
            size={24}
            className={selected ? "text-white" : "text-gray-600"}
          />
        </div>
        <div>
          <p
            className={`text-[14px] font-medium ${
              selected ? "text-white" : "text-gray-800"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-xs ${
              selected ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected
            ? "border-white bg-[#7B4540]"
            : "border-gray-400 bg-transparent"
        }`}
      >
        {selected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
      </div>
    </div>
  );
}

function OrderDetails({ subtotal, taxes, delivery, total }: OrderDetailsProps) {
  return (
    <>
      <div className="flex justify-between text-sm">
        <span>Order</span>
        <span>Rp {subtotal.toLocaleString("id-ID")}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Taxes</span>
        <span>Rp {taxes.toLocaleString("id-ID")}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Delivery fees</span>
        <span>Rp {delivery.toLocaleString("id-ID")}</span>
      </div>
      <div className="border-t border-gray-300 pt-3" />
      <div className="flex justify-between font-semibold text-[15px]">
        <span>Total</span>
        <span>Rp {total.toLocaleString("id-ID")}</span>
      </div>
    </>
  );
}

function PaymentCard({ title, subtitle }: PaymentCardProps) {
  const Icon = title === "COD" ? Truck : QrCode;
  return (
    <div className="flex justify-between items-center bg-[#2b1d1a] text-white px-4 py-3 rounded-2xl shadow-md">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-medium">{title}</p>
          <p className="text-xs text-gray-300">{subtitle}</p>
        </div>
      </div>
      <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
        <div className="w-2.5 h-2.5 bg-white rounded-full" />
      </div>
    </div>
  );
}
