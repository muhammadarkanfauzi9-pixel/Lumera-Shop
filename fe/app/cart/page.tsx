"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ArrowLeft, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const [spicy, setSpicy] = useState(3);
  const [portion, setPortion] = useState(1);
  const pricePerItem = 8.65;

  const toppings = [
    { name: "Tomato", image: "/images/tomato.png" },
    { name: "Cheese", image: "/images/cheese.png" },
    { name: "Onion", image: "/images/onion.png" },
    { name: "Lettuce", image: "/images/lettuce.png" },
  ];

  const total = (pricePerItem * portion).toFixed(2);

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center px-6 py-4 min-h-screen bg-[#fafafa] text-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between w-full items-center mb-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => history.back()}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <ArrowLeft size={22} />
        </motion.button>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-semibold text-lg"
        >
          Customize Burger
        </motion.h2>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <Search size={22} />
        </motion.button>
      </div>

      {/* Product Image (slide-in dari kiri) */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-48 h-48 mb-4 drop-shadow-lg"
      >
        <Image
          src="/images/burgers/buger2.png"
          alt="Burger"
          fill
          className="object-contain"
        />
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-4"
      >
        <p className="text-sm font-medium text-gray-700 leading-relaxed">
          CUSTOM your burger to your taste. <br /> Ultimate Experience
        </p>
      </motion.div>

      {/* Spicy level */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full mb-6"
      >
        <div className="flex justify-between mb-1 text-sm font-medium">
          <span>Spicy</span>
          <span>
            {spicy <= 3 ? "Mild" : spicy >= 7 ? "Hot" : "Medium"}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={spicy}
          onChange={(e) => setSpicy(Number(e.target.value))}
          className="w-full accent-[#7B4540]"
        />
      </motion.div>

      {/* Portion control */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-4 mb-8"
      >
        <button
          onClick={() => setPortion(Math.max(1, portion - 1))}
          className="p-3 bg-[#7B4540] text-white rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          <Minus size={18} />
        </button>
        <span className="text-xl font-semibold">{portion}</span>
        <button
          onClick={() => setPortion(portion + 1)}
          className="p-3 bg-[#7B4540] text-white rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          <Plus size={18} />
        </button>
      </motion.div>

      {/* Toppings section (slide-in kanan) */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full mb-4"
      >
        <h3 className="text-base font-semibold mb-3">Toppings</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {toppings.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-24 bg-white rounded-2xl shadow-md border border-gray-100 p-2"
            >
              <div className="relative w-full h-16">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center py-1 text-sm font-medium text-gray-700">
                {item.name}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-auto w-full pt-6"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-red-600 font-bold text-xl">
            ${total}
          </span>
        </div>
        <button
          onClick={() => alert("Order placed!")}
          className="w-full bg-[#7B4540] text-white py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          ORDER NOW
        </button>
      </motion.div>
    </div>
  );
}
