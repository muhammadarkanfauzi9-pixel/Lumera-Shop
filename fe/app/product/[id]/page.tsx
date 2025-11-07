"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, User } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  imageUrl?: string;
  averageRating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
}

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [spicy, setSpicy] = useState(1);
  const [portion, setPortion] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  // 🔥 Total harga otomatis berdasarkan portion
  const totalPrice = useMemo(
    () => (product ? product.price * portion : 0),
    [product, portion]
  );

  // Function to fetch product reviews
  const fetchProductReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${id}/reviews`);
      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        throw new Error(errBody?.message || "Failed to fetch reviews");
      }
      const data = await response.json();
      setReviews(data.reviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      // Don't set error state since reviews are optional
    }
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          // try to use backend message if provided
          let errBody = null;
          try {
            errBody = await response.json();
          } catch {
            /* ignore */
          }
          throw new Error(
            (errBody && errBody.message) || "Failed to fetch product"
          );
        }
        const data = await response.json();
        setProduct(data);
        // Fetch reviews after product is loaded
        await fetchProductReviews();
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
  }, [id, fetchProductReviews]);

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

  // Logic untuk Rating & Review dipindahkan ke fungsi/komponen terpisah
  const handleRatingSubmit = async () => {
    if (!userRating) return;

    setSubmittingRating(true);
    setRatingMessage(null);
    try {
      const resp = await fetch(`/api/products/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: userRating,
          comment: comment.trim() || undefined,
        }),
      });
      const resData = await resp.json();
      if (!resp.ok)
        throw new Error(resData.message || "Failed to submit rating");
      // update product aggregates locally
      setProduct((p) =>
        p
          ? {
              ...p,
              averageRating: resData.averageRating,
              ratingCount: resData.ratingCount,
            }
          : p
      );
      setRatingMessage("Thank you for your feedback!");
      setComment(""); // Clear comment after successful submission
      // Refresh reviews if available
      if (fetchProductReviews) {
        await fetchProductReviews();
      }
    } catch (e) {
      setRatingMessage((e as Error).message || "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
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
        {/* --- Bagian Utama (Gambar & Info Produk/Pemesanan) --- */}
        <div className="mt-6 flex flex-col md:flex-row gap-8 items-start">
          {/* Kiri: Gambar Produk dan Info Dasar */}
          <div className="w-full md:w-1/2 space-y-6">
            {/* Gambar Produk */}
            <motion.div
              variants={fadeLeft}
              custom={1}
              className="relative w-full h-[300px] md:h-[600px] bg-white rounded-2xl overflow-hidden shadow-md"
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
                <span className="font-medium text-[#2b1d1a]">
                  {product.averageRating?.toFixed(1) ?? 0}
                </span>
                <span className="text-sm text-gray-500">
                  • {product.ratingCount ?? 0} ratings
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Kanan: Opsi Pemesanan (Porsi & Total) */}
          <div className="w-full md:w-1/2 space-y-6">
          <motion.div variants={fadeLeft} custom={3}>
              <h2 className="text-2xl font-bold text-[#2b1d1a] mb-2">
                {product.name}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {product.description || "No description available"}
              </p>
              <div className="bg-white rounded-lg p-2">
                <span className="text-2xl font-bold text-[#7B4540]">
                  Rp {product.price.toLocaleString()}
                </span>
              </div>
            </motion.div>
            {/* Spicy Level dipindahkan ke bawah gambar */}
            <motion.div variants={fadeLeft} custom={4} className="bg-white p-6 rounded-xl shadow-sm">
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
            </motion.div>
            <motion.div variants={fadeRight} custom={1} className="space-y-6 sticky md:top-24">
              {/* Portion Selection and Price Calculation Card */}
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-lg font-bold text-[#2b1d1a]">
                    Select Portion
                  </label>
                  <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg">
                    <button
                      className="text-[#7B4540] hover:text-[#2b1d1a] transition-colors disabled:opacity-50"
                      onClick={() => setPortion((prev) => Math.max(1, prev - 1))}
                      disabled={portion <= 1}
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
                    <span className="w-8 text-center font-bold text-[#2b1d1a] text-xl">
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
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Price per portion</span>
                    <span>Rp {product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Quantity</span>
                    <span>× {portion}</span>
                  </div>
                  <div className="h-px bg-gray-200 my-4" />
                  <div className="flex justify-between items-center font-bold text-xl text-[#2b1d1a]">
                    <span>Total</span>
                    <span>Rp {totalPrice.toLocaleString()}</span>
                  </div>
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

        {/* --- Bagian Bawah (Rating & Reviews) --- */}
        <div className="mt-12">
          {/* Rating input card */}
          <motion.div variants={fadeLeft} custom={5} className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#2b1d1a]">
                  Rate & Review This Product
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Click the stars to rate • {product.ratingCount} total ratings
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                <Star
                  size={16}
                  className="text-yellow-500 fill-yellow-500"
                />
                <span className="text-sm font-medium">
                  {product.averageRating?.toFixed(1) ?? "0.0"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setUserRating(n)}
                      className="p-2 hover:scale-110 transition-transform"
                      aria-label={`Rate ${n} stars`}
                    >
                      <Star
                        size={24}
                        className={`${
                          (userRating || 0) >= n
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="review" className="text-sm text-gray-600">
                  Your Comment (Optional)
                </label>
                <textarea
                  id="review"
                  rows={4}
                  placeholder="What did you think about this product? (optional)"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4540] text-sm"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={!userRating || submittingRating}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRatingSubmit}
                  disabled={!userRating || submittingRating}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !userRating || submittingRating
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#7B4540] text-white hover:bg-[#2b1d1a]"
                  }`}
                >
                  {submittingRating ? "Submitting..." : "Submit Review"}
                </button>
              </div>

              {ratingMessage && (
                <div
                  className={`text-sm text-right ${
                    ratingMessage.includes("Thank you")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {ratingMessage}
                </div>
              )}
            </div>
          </motion.div>

          {/* Customer Reviews Section */}
          <motion.div variants={fadeLeft} custom={6}>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-[#2b1d1a] mb-6 border-b pb-4">
                All Customer Reviews
              </h3>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No reviews yet. Be the first to share your experience!
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={18} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[#2b1d1a]">
                              {review.customerName}
                              {review.isVerified && (
                                <span className="ml-2 text-xs font-normal text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                  Verified Buyer
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={`${
                                      i < review.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm pl-12 pt-2">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Price Bar */}
      <motion.div
        variants={fadeLeft}
        custom={4}
        className="fixed bottom-0 left-0 right-0 bg-white shadow-lg sm:hidden z-20"
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