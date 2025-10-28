"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function AdminLogoutPage() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = () => {
    setConfirming(true);
  };

  const handleCancel = () => {
    router.push("/admin"); // kembali ke dashboard
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-5 bg-red-100 rounded-full text-red-500 shadow-inner">
            <LogOut size={42} />
          </div>

          {/* Tampilan awal (belum konfirmasi) */}
          {!confirming && !isLoggingOut && (
            <>
              <h1 className="text-2xl font-bold text-gray-800">
                Keluar dari Halaman Admin?
              </h1>
              <p className="text-gray-500 text-sm">
                Anda akan keluar dari sesi admin. Pastikan semua perubahan sudah
                disimpan.
              </p>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleConfirmLogout}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-all duration-200"
                >
                   Logout
                </button>
                <button
                  onClick={handleCancel}
                  className="px-5 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition-all duration-200"
                >
                  Batal
                </button>
              </div>
            </>
          )}

          {/* Tahap konfirmasi kedua */}
          {confirming && !isLoggingOut && (
            <>
              <h1 className="text-xl font-semibold text-gray-800">
                Konfirmasi Logout
              </h1>
              <p className="text-gray-500 text-sm">
                Apakah Anda benar-benar ingin keluar dari sistem?
              </p>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-all duration-200"
                >
                   Keluar
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-5 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition-all duration-200"
                >
                  Kembali
                </button>
              </div>
            </>
          )}

          {/* Animasi logout */}
          {isLoggingOut && (
            <>
              <h1 className="text-2xl font-bold text-gray-800">
                Logging Out...
              </h1>
              <p className="text-gray-500 text-sm">
                Anda akan segera keluar dari halaman admin.
              </p>
              <div className="loading loading-bars loading-lg text-red-500 mt-4"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
