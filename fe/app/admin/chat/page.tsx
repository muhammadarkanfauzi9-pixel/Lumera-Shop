"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function AdminChatPage() {
  const [messages, setMessages] = useState([
    { sender: "customer", text: "Halo admin, saya mau tanya produk!" },
    { sender: "admin", text: "Halo! Silakan, ada yang bisa dibantu?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: "admin", text: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-xl shadow-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "admin" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[70%] ${
                msg.sender === "admin"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t flex items-center px-4 py-3 bg-gray-50"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          className="flex-1 px-3 py-2 border rounded-lg outline-none"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
