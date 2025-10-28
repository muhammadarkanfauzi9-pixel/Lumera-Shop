"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, User, MessageSquare, Heart, Plus } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "Home", icon: <Home size={22} />, path: "/home" },
    { name: "Profile", icon: <User size={22} />, path: "/profile" },
    { name: "Message", icon: <MessageSquare size={22} />, path: "/message" },
    { name: "Favorite", icon: <Heart size={22} />, path: "/favorites" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#7B4540] text-white flex justify-center items-center py-3 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.2)] z-50">
      <div className="flex justify-between items-center w-[85%] relative">

        {/* KIRI */}
        <div className="flex gap-8">
          {navItems.slice(0, 2).map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center transition-all ${
                pathname === item.path ? "opacity-100" : "opacity-70"
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* TOMBOL TENGAH (+) */}
        <button
          onClick={() => router.push("/cart")}
          className="absolute left-1/2 -translate-x-1/2 -top-5 bg-[#7B4540] border-4 border-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
        >
          <Plus size={22} className="text-white" />
        </button>

        {/* KANAN */}
        <div className="flex gap-8">
          {navItems.slice(2).map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center transition-all ${
                pathname === item.path ? "opacity-100" : "opacity-70"
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
