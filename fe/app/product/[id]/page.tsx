"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [spicy, setSpicy] = useState(1);
  const [portion, setPortion] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Total harga otomatis berdasarkan portion
  const totalPrice = useMemo(
    () => (product ? product.price * portion : 0),
    [product, portion]
  );

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
        setError(err instanceof Error ? err.message : "An error occurred");
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
      className="min-h-screen bg-white"
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={fadeLeft}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16">
            <motion.button
              variants={fadeLeft}
              custom={0}
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </motion.button>
            <h1 className="ml-4 text-lg font-medium text-gray-900">
              {product.name}
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Hero Section dengan Gambar */}
        <div className="flex flex-col md:flex-row gap-8 items-start py-6">
          {/* Gambar Produk */}
          <motion.div
            variants={fadeRight}
            custom={1}
            className="relative w-full md:w-1/2 h-[300px] md:h-[400px] bg-white rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <Image
                src={product.imageUrl || "/images/burgers/burger.png"}
                alt={product.name}
                fill
                className="object-contain transform hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Review Badge */}
            <motion.div
              variants={fadeLeft}
              custom={2}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2"
            >
              <Star size={18} className="text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-[#2b1d1a]">4.5</span>
              <span className="text-sm text-gray-500">• 26 mins</span>
            </motion.div>
          </motion.div>

          {/* Product Info - Right Side */}
          <div className="w-full md:w-1/2 space-y-6">
            <motion.div variants={fadeLeft} custom={3}>
              <h2 className="text-2xl font-bold text-[#2b1d1a] mb-2">
                {product.name}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {product.description || "No description available"}
              </p>

              {/* Price Display */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <span className="text-2xl font-bold text-[#7B4540]">
                  Rp {product.price.toLocaleString()}
                </span>
              </div>

              {/* Spicy Level */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <label className="text-sm font-semibold text-[#2b1d1a] block mb-4">
                  Spicy Level
                </label>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={spicy}
                    onChange={(e) => setSpicy(Number(e.target.value))}
                    className="w-full accent-[#7B4540]"
                  />
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-gray-600">Mild</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-gray-600">Hot</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Right Column */}
          <motion.div variants={fadeRight} custom={3} className="space-y-6">
            {/* Portion Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <label className="text-sm font-semibold text-[#2b1d1a]">
                  Portion
                </label>
                <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg">
                  <button
                    className="text-[#7B4540] hover:text-[#2b1d1a] transition-colors"
                    onClick={() => setPortion((prev) => Math.max(1, prev - 1))}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <span className="w-8 text-center font-semibold text-[#2b1d1a]">
                    {portion}
                  </span>
                  <button
                    className="text-[#7B4540] hover:text-[#2b1d1a] transition-colors"
                    onClick={() => setPortion((prev) => prev + 1)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Price per portion</span>
                <span>Rp {product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                <span>Quantity</span>
                <span>× {portion}</span>
              </div>
              <div className="h-px bg-gray-200 my-4" />
              <div className="flex justify-between items-center font-semibold text-lg text-[#2b1d1a]">
                <span>Total</span>
                <span>Rp {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Order Button */}
            <button
              onClick={handleOrderNow}
              className="w-full bg-linear-to-br from-[#7B4540] to-[#2b1d1a] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              ORDER NOW
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Price Bar */}
      <motion.div
        variants={fadeLeft}
        custom={4}
        className="fixed bottom-0 left-0 right-0 bg-white shadow-lg sm:hidden"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">Total Price</span>
            <span className="text-lg font-bold text-[#2b1d1a]">
              Rp {totalPrice.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleOrderNow}
            className="bg-[#7B4540] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-[#2b1d1a] transition-colors"
          >
            ORDER NOW
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
