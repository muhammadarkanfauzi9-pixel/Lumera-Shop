import { Calendar, Bell, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminHeader() {
  const [adminProfile, setAdminProfile] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;

        const response = await fetch("/api/admin/profile", {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (response.ok) {
          const data = await response.json();
          setAdminProfile(data.admin);
        }
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
      }
    };

    fetchAdminProfile();
  }, []);

  return (
    <header className="flex items-center justify-between bg-white shadow-sm rounded-2xl px-6 py-4">
      <h1 className="text-lg font-semibold text-gray-800">Admin</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg gap-2">
          <Calendar size={18} className="text-gray-500" />
          <span className="text-sm text-gray-600">
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <Bell className="text-gray-500" />
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">
              {adminProfile?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-500">
              {adminProfile?.email || "admin@lumera.com"}
            </p>
          </div>
          <UserCircle size={32} className="text-gray-600" />
        </div>
      </div>
    </header>
  );
}
