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
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";

// Interface untuk data admin
interface AdminProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImageUrl?: string;
  passwordChanges: number;
  lastPasswordChange?: string;
  averageActiveTime: number;
  activeModules: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminLog {
  action: string;
  module?: string;
  description: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

interface LastAccessedModule {
  module: string;
  createdAt: string;
}

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
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminLog[]>([]);
  const [lastAccessedModules, setLastAccessedModules] = useState<
    LastAccessedModule[]
  >([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit] = useState(20);
  const [logsTotal, setLogsTotal] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filters, setFilters] = useState({
    module: undefined as string | undefined,
    action: undefined as string | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ name: "", email: "" });
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  async function fetchAdminProfile() {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/admin/profile");

      if (!response.ok) {
        throw new Error("Failed to fetch admin profile");
      }

      const data = await response.json();
      setAdminProfile(data.admin);
      setRecentLogs(data.recentLogs || []);
      setLastAccessedModules(data.lastAccessedModules || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const fetchLogs = async (page = 1) => {
    try {
      setLoadingLogs(true);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(logsLimit));
      if (filters.module) params.set("module", filters.module);
      if (filters.action) params.set("action", filters.action);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const response = await fetch(`/api/admin/logs?${params.toString()}`);

      if (!response.ok) throw new Error("Failed to fetch logs");

      const data = await response.json();
      setLogs(data.logs || []);
      setLogsTotal(data.total || 0);
      setLogsPage(data.page || 1);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat riwayat: " + (err as Error).message);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);

      // Fetch all logs for export
      const params = new URLSearchParams();
      params.set("limit", "9999"); // Get all logs
      if (filters.module) params.set("module", filters.module);
      if (filters.action) params.set("action", filters.action);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const response = await fetch(`/api/admin/logs?${params.toString()}`);

      if (!response.ok) throw new Error("Failed to fetch logs for export");

      const data = await response.json();
      const logs = data.logs || [];

      // Convert logs to CSV format
      const csvContent = [
        [
          "Waktu",
          "Aksi",
          "Modul",
          "Deskripsi",
          "IP Address",
          "User Agent",
        ].join(","),
        ...logs.map((log: AdminLog) =>
          [
            new Date(log.createdAt).toLocaleString("id-ID"),
            log.action,
            log.module || "-",
            `"${log.description.replace(/"/g, '""')}"`,
            log.ipAddress || "-",
            `"${(log.userAgent || "-").replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\\n");

      // Create and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute(
        "download",
        `admin_logs_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Export CSV berhasil!");
    } catch (err) {
      console.error(err);
      alert("Gagal mengekspor log: " + (err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/login");
    }, 1500);
  };

  const handleUpdateProfile = async () => {
    if (!updateForm.name.trim() || !updateForm.email.trim()) {
      alert("Name and email are required");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const data = await response.json();
      setAdminProfile(data.admin);
      setShowUpdateModal(false);
      setUpdateForm({ name: "", email: "" });
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile: " + (error as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateModal = () => {
    setUpdateForm({
      name: adminProfile?.name || "",
      email: adminProfile?.email || "",
    });
    setShowUpdateModal(true);
  };

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "Analytics":
        return <Loader2 size={20} className="text-blue-500" />;
      case "Users":
        return <User size={20} className="text-green-500" />;
      case "Settings":
        return <Settings size={20} className="text-yellow-500" />;
      default:
        return <CheckCircle size={20} className="text-gray-500" />;
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
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  if (!adminProfile) {
    return (
      <div className="text-center text-gray-600">No profile data available</div>
    );
  }

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
                {adminProfile.name}
              </h2>
              <p className="text-gray-500 text-sm">
                Peran: {adminProfile.role}
              </p>

              <button
                onClick={openUpdateModal}
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
                  <span className="font-medium text-gray-700">
                    {adminProfile.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-700">
                    {adminProfile.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className="font-medium text-gray-700">
                    {adminProfile.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dibuat:</span>
                  <span className="font-medium text-gray-700">
                    {new Date(adminProfile.createdAt).toLocaleDateString(
                      "id-ID"
                    )}
                  </span>
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
                <p className="text-xl font-bold text-gray-800">
                  {adminProfile.passwordChanges}
                </p>
                <p className="text-gray-500 text-sm">Perubahan Password</p>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-5 text-center flex flex-col items-center">
                <Clock size={30} className="text-purple-500 mb-2" />
                <p className="text-xl font-bold text-gray-800">
                  {adminProfile.averageActiveTime} Jam
                </p>
                <p className="text-gray-500 text-sm">Waktu Aktif Rata-rata</p>
              </div>
              <div className="bg-white shadow-lg rounded-xl p-5 text-center flex flex-col items-center">
                <Settings size={30} className="text-green-500 mb-2" />
                <p className="text-xl font-bold text-gray-800">
                  {adminProfile.activeModules} Modul
                </p>
                <p className="text-gray-500 text-sm">Akses Modul Aktif</p>
              </div>
            </div>

            {/* KARTU AKTIVITAS / AKSES MODUL */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Akses Modul Terakhir
              </h3>
              <div className="space-y-3">
                {lastAccessedModules.length > 0 ? (
                  lastAccessedModules.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getModuleIcon(item.module)}
                        <span className="font-medium text-gray-800">
                          {item.module}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Tidak ada data akses modul
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setHistoryOpen(true);
                  fetchLogs(1);
                }}
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
                {recentLogs.length > 0 ? (
                  recentLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-orange-500" />
                        <span className="font-medium">{log.description}</span>
                      </div>
                      <span className="text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Tidak ada log perubahan
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY MODAL */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black bg-opacity-50 overflow-auto">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Riwayat Lengkap Admin</h3>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter modul..."
                  value={filters.module || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      module: e.target.value || undefined,
                    })
                  }
                  className="px-3 py-2 border rounded-md w-40"
                />
                <input
                  type="text"
                  placeholder="Filter aksi..."
                  value={filters.action || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      action: e.target.value || undefined,
                    })
                  }
                  className="px-3 py-2 border rounded-md w-40"
                />
                <input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      startDate: e.target.value || undefined,
                    })
                  }
                  className="px-3 py-2 border rounded-md"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      endDate: e.target.value || undefined,
                    })
                  }
                  className="px-3 py-2 border rounded-md"
                />
                <button
                  onClick={() => fetchLogs(1)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md"
                >
                  Terapkan
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={exporting}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {exporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    "Export CSV"
                  )}
                </button>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="px-3 py-2 bg-gray-100 rounded-md"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="h-96 overflow-auto">
              {loadingLogs ? (
                <div className="flex items-center justify-center h-full">
                  Memuat...
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center text-gray-500">
                  Tidak ada riwayat
                </div>
              ) : (
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2">Waktu</th>
                      <th className="py-2">Aksi</th>
                      <th className="py-2">Modul</th>
                      <th className="py-2">Deskripsi</th>
                      <th className="py-2">IP / UserAgent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.createdAt + log.description}
                        className="border-b"
                      >
                        <td className="py-2 align-top">
                          {new Date(log.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2 align-top">{log.action}</td>
                        <td className="py-2 align-top">{log.module || "-"}</td>
                        <td className="py-2 align-top">{log.description}</td>
                        <td className="py-2 align-top text-xs text-gray-500">
                          {log.ipAddress || "-"} /{" "}
                          {(log.userAgent || "-").slice(0, 80)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Total: {logsTotal}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchLogs(Math.max(1, logsPage - 1))}
                  disabled={logsPage <= 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="px-3 py-1 border rounded">{logsPage}</div>
                <button
                  onClick={() => fetchLogs(logsPage + 1)}
                  disabled={logsPage * logsLimit >= logsTotal}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI / LOGOUT (TETAP SAMA) --- */}
      {(confirming || isLoggingOut) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-sm text-center border border-gray-100">
            {isLoggingOut ? (
              <>
                <Loader2
                  size={42}
                  className="mx-auto text-red-500 animate-spin"
                />
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

      {/* --- MODAL UPDATE PROFILE --- */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Update Profil Admin
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={updateForm.name}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={updateForm.email}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Masukkan email"
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleUpdateProfile}
                disabled={updating}
                className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <Loader2 size={20} className="inline mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profil"
                )}
              </button>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow-sm transition-all duration-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
