"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  LogOut,
  User as PersonStanding,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Order", icon: ShoppingBag, path: "/admin/orders" },
  { name: "Product", icon: Package, path: "/admin/products" },
  { name: "Reviews", icon: MessageSquare, path: "/admin/reviews" },
  { name: "Profile", icon: PersonStanding, path: "/admin/profile" },
  { name: "Logout", icon: LogOut, path: "/login" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-[#0044ff] text-white w-64  h-0screen flex flex-col rounded-r-3xl shadow-lg">
      {/* Header */}
      <div className="text-2xl font-bold px-6 py-8">Lumera Shop</div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const active = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-white text-[#0044ff] shadow-md"
                  : "hover:bg-blue-500/70"
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Social links */}
      <div className="px-6 py-4 text-xs text-blue-100 flex gap-3 mt-auto">
        <a href="#">Facebook</a>
        <a href="#">Twitter</a>
        <a href="#">Google</a>
      </div>
    </aside>
  );
}
