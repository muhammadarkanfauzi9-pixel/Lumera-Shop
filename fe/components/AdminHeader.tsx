import { Calendar, Bell, UserCircle } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between bg-white shadow-sm rounded-2xl px-6 py-4">
      <h1 className="text-lg font-semibold text-gray-800">Order</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg gap-2">
          <Calendar size={18} className="text-gray-500" />
          <span className="text-sm text-gray-600">31 Jul - 03 Aug 2020</span>
        </div>
        <Bell className="text-gray-500" />
        <UserCircle size={28} className="text-gray-600" />
      </div>
    </header>
  );
}
