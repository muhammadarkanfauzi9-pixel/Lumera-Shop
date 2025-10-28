"use client";

import { useRouter } from "next/navigation";
import { 
  LogOut, 
  CircleUser, 
  User, 
  Mail, 
  Lock, 
  Clock, 
  Settings, 
  CheckCircle,
  Loader2 
} from "lucide-react";
import { useState } from "react";

// Data profil admin dummy (GANTI DENGAN DATA ASLI ANDA)
const adminProfileData = {
  name: "Alexander Smith",
  email: "alexander.smith@admin.com",
  role: "Super Administrator",
  status: "Aktif",
  lastLogin: "25 Oktober 2025, 10:00 WIB",
  adminID: "ADM-90210",
};

// Data riwayat aktivitas admin dummy (GANTI DENGAN DATA ASLI ANDA)
const adminAccessModules = [
  { name: "Dashboard Analytics", date: "25 Oct 2025", icon: "Analytics" },
  { name: "Manajemen User", date: "24 Oct 2025", icon: "Users" },
  { name: "Pengaturan Sistem", date: "20 Oct 2025", icon: "Settings" },
];

export default function AdminProfilePage() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/login");
    }, 1500);
  };

  const getModuleIcon = (iconName) => {
    switch (iconName) {
      case "Analytics": return <Loader2 size={20} className="text-blue-500" />;
      case "Users": return <User size={20} className="text-green-500" />;
      case "Settings": return <Settings size={20} className="text-yellow-500" />;
      default: return <CheckCircle size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-5xl mx-auto">
        
        {/* JUDUL */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Profil Admin</h1>

        {/* LAYOUT DUA KOLOM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KOLOM KIRI (PROFILE INFO & LOGOUT) - Lebar 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* KARTU ATAS (NAMA DAN FOTO) */}
            <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center">
              <div className="p-1 bg-blue-500 rounded-full mb-4">
                <CircleUser size={72} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {adminProfileData.name}
              </h2>
              <p className="text-gray-500 text-sm">
                Peran: {adminProfileData.role}
              </p>
              
              <button
                onClick={() => alert("Implementasi Update Profile")}
                className="mt-4 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Update Profil
              </button>
            </div>

            {/* KARTU INFORMASI ADMIN */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Detail Informasi
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Admin:</span>
                  <span className="font-medium text-gray-700">{adminProfileData.adminID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-700">{adminProfileData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status Akun:</span>
                  <span className={`font-medium ${adminProfileData.status === 'Aktif' ? 'text-green-600' : 'text-red-600'}`}>{adminProfileData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Login Terakhir:</span>
                  <span className="font-medium text-gray-700">{adminProfileData.lastLogin}</span>
                </div>
              </div>

              {/* TOMBOL LOGOUT (Di dalam kartu) */}
              <button
                onClick={() => setConfirming(true)}
                className="w-full mt-6 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-all duration-200"
                disabled={isLoggingOut}
              >
                <LogOut size={20} />
                <span>Logout dari Sistem</span>
              </button>
            </div>
          </div> 
          
          {/* KOLOM KANAN (DATA & AKTIVITAS) - Lebar 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* KARTU STATISTIK ADMIN (MIRIP KARTU KESEHATAN) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white shadow-lg rounded-xl p-5 text-center flex flex-col items-center">
                <Lock size={30} className="text-blue-500 mb-2" />
                <p className="text-xl font-bold text-gray-800">4</p>
                <p className="text-gray-500 text-sm">Perubahan Password</p>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-5 text-center flex flex-col items-center">
                <Clock size={30} className="text-purple-500 mb-2" />
                <p className="text-xl font-bold text-gray-800">12 Jam</p>
                <p className="text-gray-500 text-sm">Waktu Aktif Rata-rata</p>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-5 text-center flex flex-col items-center">
                <Settings size={30} className="text-green-500 mb-2" />
                <p className="text-xl font-bold text-gray-800">8 Modul</p>
                <p className="text-gray-500 text-sm">Akses Modul Aktif</p>
              </div>
            </div>

            {/* KARTU AKTIVITAS / AKSES MODUL */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Akses Modul Terakhir
              </h3>
              <div className="space-y-3">
                {adminAccessModules.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getModuleIcon(item.icon)}
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => alert("Lihat Riwayat Lengkap")}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Lihat Riwayat Lengkap
              </button>
            </div>
            
            {/* KARTU LOGS PENTING (MIRIP PRESCRIPTIONS) */}
             <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Log Perubahan Penting
              </h3>
               <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-700">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-orange-500"/>
                      <span className="font-medium">Email diubah</span>
                    </div>
                    <span className="text-gray-500">10 Oct 2025</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-red-500"/>
                      <span className="font-medium">Password direset</span>
                    </div>
                    <span className="text-gray-500">01 Sep 2025</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL KONFIRMASI / LOGOUT (TETAP SAMA) --- */}
      {(confirming || isLoggingOut) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-sm text-center border border-gray-100">
            {isLoggingOut ? (
              <>
                <Loader2 size={42} className="mx-auto text-red-500 animate-spin" />
                <h2 className="text-2xl font-bold text-gray-800 mt-4">
                  Logging Out...
                </h2>
                <p className="text-gray-500 text-sm mt-2">
                  Anda akan segera keluar dari halaman admin.
                </p>
              </>
            ) : (
              <>
                <div className="p-4 bg-red-100 rounded-full text-red-500 mx-auto w-fit shadow-inner">
                  <LogOut size={30} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mt-4">
                  Konfirmasi Logout
                </h2>
                <p className="text-gray-500 text-sm mt-2">
                  Apakah Anda benar-benar ingin keluar dari sistem?
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-all duration-200"
                  >
                    Ya, Keluar
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition-all duration-200"
                  >
                    Batal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}