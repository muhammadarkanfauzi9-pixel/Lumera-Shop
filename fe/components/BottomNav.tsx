"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  User,
  MessageSquare,
  Heart,
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Left and right groups so center cart stays visually centered
  const leftItems = [
    { name: "Home", icon: <Home size={22} />, path: "/" },
    {
      name: "Orders",
      icon: <ShoppingBag size={22} />,
      path: "/dashboard/orders",
    },
  ];

  const rightItems = [
    { name: "Message", icon: <MessageSquare size={22} />, path: "/message" },
    { name: "Favorite", icon: <Heart size={22} />, path: "/favorites" },
    { name: "Profile", icon: <User size={22} />, path: "/dashboard/profile" },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 2 }}
      className="fixed bottom-0 left-0 w-full bg-[#7B4540] text-white flex justify-center items-center py-3 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.2)] z-50"
    >
      <div className="flex justify-between items-center w-[85%] relative">
        {/* KIRI */}
        <div className="flex gap-8">
          {leftItems.map((item, index) => (
            <motion.button
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 2.2 + index * 0.1 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center transition-all duration-200 hover:bg-white/10 rounded-lg px-2 py-1 ${
                pathname === item.path
                  ? "text-[#8B5E3C]"
                  : "text-[#B7A89A] hover:text-white"
              }`}
            >
              {item.icon}
            </motion.button>
          ))}
        </div>

        {/* TOMBOL TENGAH (Cart) */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.4,
            delay: 2.4,
            type: "spring",
            stiffness: 200,
          }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const user = localStorage.getItem("user");
            if (!user) {
              router.push("/login");
            } else {
              router.push("/cart");
            }
          }}
          className="absolute left-1/2 -translate-x-1/2 -top-5 bg-[#7B4540] border-4 border-white p-4 rounded-full shadow-lg transition-all"
        >
          <ShoppingCart size={22} className="text-white" />
        </motion.button>

        {/* KANAN */}
        <div className="flex gap-6">
          {rightItems.map((item, index) => (
            <motion.button
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 2.3 + index * 0.1 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (item.name === "Message") {
                  // Direct WhatsApp redirect for Message button
                  const phone = "6281239450638"; // Admin WhatsApp number
                  const message =
                    "Halo Admin, saya ingin bertanya tentang Lumera Shop.";
                  const url = `https://wa.me/${phone}?text=${encodeURIComponent(
                    message
                  )}`;
                  window.open(url, "_blank");
                } else {
                  router.push(item.path);
                }
              }}
              className={`flex flex-col items-center transition-all duration-200 hover:bg-white/10 rounded-lg px-2 py-1 ${
                pathname === item.path
                  ? "text-[#8B5E3C]"
                  : "text-[#B7A89A] hover:text-white"
              }`}
            >
              {item.icon}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
