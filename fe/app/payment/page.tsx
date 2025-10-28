"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil data dari query params
  const name = searchParams.get("name");
  const price = Number(searchParams.get("price")) || 0;
  const portion = Number(searchParams.get("portion")) || 1;

  // Hitung harga
  const taxes = 0.53;
  const delivery = 5.53;
  const subtotal = price * portion;
  const total = subtotal + taxes + delivery;

  // State
  const [method, setMethod] = useState("cod"); // default COD
  const [showPopup, setShowPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

  const handlePay = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleFinishQRIS = () => {
    setShowPopup(false);
    setTimeout(() => setSuccessPopup(true), 250);
  };

  const handleContactAdmin = () => {
    const phone = "6288707648846"; // Nomor WhatsApp admin
    const message = `Halo Admin, saya ingin melakukan pesanan ${
      method === "cod" ? "COD" : "via QRIS"
    }:\n🍔 Pesanan: ${name}\nJumlah: ${portion} porsi\nTotal: $${total.toFixed(
      2
    )}\nTerima kasih!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

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
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Taxes</span>
          <span>${taxes.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery fees</span>
          <span>${delivery.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3" />

        <div className="flex justify-between font-semibold text-[15px]">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <p className="text-xs text-gray-500">
          Estimated Delivery time{" "}
          <span className="font-medium text-gray-700">15 - 30 mins</span>
        </p>
      </div>

      {/* Payment Methods */}
      <h3 className="text-[15px] font-semibold mt-8 mb-3">Payment methods</h3>

      <div className="flex flex-col gap-4">
        <PaymentOption
          selected={method === "cod"}
          onClick={() => setMethod("cod")}
          title="COD"
          subtitle="Bayar di tempat"
          image="/images/cards/cod.png"
        />

        <PaymentOption
          selected={method === "qris"}
          onClick={() => setMethod("qris")}
          title="QRIS"
          subtitle="Bayar via QR code"
          image="/images/cards/qris.png"
        />
      </div>

      {/* Tombol Pay */}
      <div className="flex justify-between items-center mt-10">
        <div>
          <p className="text-sm text-gray-600">Total Price</p>
          <p className="text-[22px] font-semibold text-[#7B4540] tracking-wide">
            ${total.toFixed(2)}
          </p>
        </div>
        <button
          onClick={handlePay}
          className="bg-[#2b1d1a] text-white px-8 py-3 rounded-2xl font-semibold shadow-md hover:scale-105 transition-transform"
        >
          Pay Now
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
                  <OrderDetails subtotal={subtotal} taxes={taxes} delivery={delivery} total={total} />
                  <PaymentCard title="COD" subtitle="Bayar di tempat" image="/images/cards/mastercard.png" />
                  <button
                    onClick={handleContactAdmin}
                    className="mt-6 w-full bg-[#7B4540] text-white py-3 rounded-xl font-semibold shadow-md hover:bg-[#633732] transition"
                  >
                    Lanjut ke Admin
                  </button>
                </div>
              )}

              {/* QRIS */}
              {method === "qris" && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-[#2b1d1a] text-center">
                    Pembayaran QRIS
                  </h3>
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/images/qris-demo.png"
                      alt="QRIS Code"
                      width={200}
                      height={200}
                      className="rounded-xl border border-gray-300"
                    />
                  </div>
                  <p className="text-center text-gray-600 text-sm mb-4">
                    Scan QRIS di atas menggunakan aplikasi pembayaran Anda
                  </p>
                  <button
                    onClick={handleFinishQRIS}
                    className="w-full bg-[#7B4540] text-white py-3 rounded-xl font-semibold"
                  >
                    Selesai Pembayaran
                  </button>
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
                Terima kasih, pembayaran Anda sudah diterima.  
                Silakan hubungi admin untuk konfirmasi pesanan.
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
function PaymentOption({ selected, onClick, title, subtitle, image }) {
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
        <Image src={image} alt={title} width={40} height={40} />
        <div>
          <p className={`text-[14px] font-medium ${selected ? "text-white" : "text-gray-800"}`}>
            {title}
          </p>
          <p className={`text-xs ${selected ? "text-gray-300" : "text-gray-500"}`}>{subtitle}</p>
        </div>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center ${
          selected ? "border-white bg-[#7B4540]" : "border-gray-400 bg-transparent"
        }`}
      >
        {selected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
      </div>
    </div>
  );
}

function OrderDetails({ subtotal, taxes, delivery, total }) {
  return (
    <>
      <div className="flex justify-between text-sm">
        <span>Order</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Taxes</span>
        <span>${taxes.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Delivery fees</span>
        <span>${delivery.toFixed(2)}</span>
      </div>
      <div className="border-t border-gray-300 pt-3" />
      <div className="flex justify-between font-semibold text-[15px]">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </>
  );
}

function PaymentCard({ title, subtitle, image }) {
  return (
    <div className="flex justify-between items-center bg-[#2b1d1a] text-white px-4 py-3 rounded-2xl shadow-md">
      <div className="flex items-center gap-3">
        <Image src={image} alt={title} width={40} height={40} />
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
