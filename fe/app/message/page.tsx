"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Menu, Send } from "lucide-react";
import { useState, useEffect } from "react";

export default function MessagePage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [user, setUser] = useState({
    name: "",
    image: "/images/profile/avatar.png",
  });
  const [chats, setChats] = useState([
    { from: "bot", text: "Hi, how can I help you?" },
  ]);

  // ✅ Ambil data profil dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      const data = JSON.parse(saved);
      setUser({
        name: data.name || "Guest User",
        image: data.image || "/images/profile/avatar.png",
      });
    }
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    setChats((prev) => [...prev, { from: "user", text: message }]);
    setMessage("");

    // contoh balasan otomatis dari bot
    setTimeout(() => {
      setChats((prev) => [
        ...prev,
        { from: "bot", text: "Got it! We'll get back to you soon." },
      ]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-[#fff] flex flex-col font-sans relative"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f8f8f8] shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <ArrowLeft size={18} />
        </button>
        <p className="text-sm font-semibold text-gray-800">Customer Support</p>
        <button className="p-2 rounded-full hover:bg-gray-200">
          <Menu size={18} />
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
      
        {chats.map((chat, index) => (
          <motion.div
            key={index}
            initial={{
              x: chat.from === "user" ? 80 : -80,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            transition={{ duration: 0.3 }}
            className={`flex ${
              chat.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {chat.from === "bot" ? (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">🤖</span>
                </div>
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-xl text-sm max-w-[70%] shadow-sm">
                  {chat.text}
                </div>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <div className="bg-[#8B5E50] text-white px-3 py-2 rounded-xl text-sm max-w-[70%] shadow-md">
                  {chat.text}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Image
                    src={user.image}
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full object-cover border border-[#8B5E50]"
                  />
                  <span className="text-[10px] text-gray-500">
                    {user.name?.split(" ")[0] || "You"}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* INPUT AREA */}
      <div className="sticky bottom-0 left-0 right-0 flex items-center px-4 py-3 bg-white border-t border-gray-200 shadow-sm z-10">
        <input
          type="text"
          placeholder="Type here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#8B5E50] text-sm"
        />
        <button
          onClick={handleSend}
          className="ml-3 bg-[#8B5E50] text-white p-3 rounded-2xl shadow-md hover:scale-105 transition-transform"
        >
          <Send size={18} />
        </button>
      </div>
    </motion.div>
  );
}
