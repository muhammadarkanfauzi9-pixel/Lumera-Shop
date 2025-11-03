"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [spicy, setSpicy] = useState(1);
  const [portion, setPortion] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B4540] mx-auto mb-4"></div>
          <p className="text-[#7B4540]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-[#7B4540] mb-4">Product not found</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // 🔥 Total harga otomatis berdasarkan portion
  const totalPrice = useMemo(
    () => product.price * portion,
    [product.price, portion]
  );

  const handleOrderNow = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    } else {
      router.push(
        `/payment?name=${encodeURIComponent(product.name)}&price=${
          product.price
        }&portion=${portion}`
      );
    }
  };

  // ✨ Variants animasi
  const fadeLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: (i = 1) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.15, duration: 0.6 },
    }),
  };

  const fadeRight = {
    hidden: { opacity: 0, x: 50 },
    visible: (i = 1) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.15, duration: 0.6 },
    }),
  };

  return (
    <motion.div
      className="min-h-screen bg-white px-5 pt-6 pb-8 overflow-hidden"
      initial="hidden"
      animate="visible"
    >
      {/* 🔙 Tombol Back */}
      <motion.button
        variants={fadeLeft}
        custom={0}
        onClick={() => router.back()}
        className="p-2 bg-gray-100 rounded-full shadow-sm mb-5"
      >
        <ArrowLeft size={20} />
      </motion.button>

      {/* 🖼️ Gambar Produk */}
      <motion.div
        variants={fadeRight}
        custom={1}
        className="flex justify-center"
      >
        <Image
          src={product.imageUrl || "/images/burgers/burger.png"}
          alt={product.name}
          width={260}
          height={260}
          className="drop-shadow-lg"
        />
      </motion.div>

      {/* 📄 Detail Produk */}
      <motion.div variants={fadeLeft} custom={2} className="mt-6">
        <h2 className="text-xl font-semibold capitalize">
          {product.name} — your favorite!
        </h2>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span>4.5</span>
          <span>• 26 mins</span>
        </div>
        <p className="mt-3 text-gray-700 leading-relaxed text-[15px]">
          {product.description || "No description available"}
        </p>
      </motion.div>

      {/* 🌶️ Spicy & Portion */}
      <motion.div
        variants={fadeRight}
        custom={3}
        className="mt-6 flex items-center justify-between"
      >
        <div className="flex flex-col w-1/2">
          <label className="text-sm font-medium text-gray-700">Spicy</label>
          <input
            type="range"
            min="0"
            max="5"
            value={spicy}
            onChange={(e) => setSpicy(Number(e.target.value))}
            className="w-full accent-[#7B4540] mt-2"
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-green-600 font-medium">Mild</span>
            <span className="text-red-600 font-medium">Hot</span>
          </div>
        </div>

        {/* 🍽️ Portion Counter */}
        <div className="flex flex-col items-center">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Portion
          </label>
          <div className="flex items-center gap-3 bg-[#7B4540] text-white px-3 py-1.5 rounded-full">
            <button
              className="text-lg font-bold"
              onClick={() => setPortion((prev) => Math.max(1, prev - 1))}
            >
              −
            </button>
            <span className="w-5 text-center text-base">{portion}</span>
            <button
              className="text-lg font-bold"
              onClick={() => setPortion((prev) => prev + 1)}
            >
              ＋
            </button>
          </div>
        </div>
      </motion.div>

      {/* 💰 Tombol Harga & Order */}
      <motion.div
        variants={fadeLeft}
        custom={4}
        className="flex justify-between items-center mt-8"
      >
        <div className="bg-[#7B4540] text-white px-5 py-3 rounded-2xl shadow-md text-lg font-semibold">
          Rp {totalPrice.toLocaleString()}
        </div>
        <button
          onClick={handleOrderNow}
          className="bg-[#7B4540] text-white px-8 py-3 rounded-2xl font-semibold shadow-md hover:opacity-90"
        >
          ORDER NOW
        </button>
      </motion.div>
    </motion.div>
  );
}
