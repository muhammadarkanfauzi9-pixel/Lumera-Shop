"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Search,
  Star,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<
    {
      id: number;
      name: string;
      desc: string;
      price: number;
      rating: number;
      image: string;
      category: string;
    }[]
  >([]);

  // ⭐️ FOKUS PERUBAHAN 1: Mengubah path default avatar agar konsisten
  const [user, setUser] = useState<{
    name: string;
    image: string;
  }>({
    name: "Guest User",
    image: "/images/profile/avatar.png", // Path default yang sama dengan Profile.tsx
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  interface Product {
    id: number;
    name: string;
    desc: string;
    description?: string;
    price: number;
    image: string;
    imageUrl?: string;
    rating: number;
    category: string;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map UI labels to backend category values
  const categories = [
    { label: "All", value: "All" },
    { label: "Desserts", value: "Dessert" },
    { label: "Savory", value: "Makanan Asin" },
  ];

  // Fetch products from API (TIDAK BERUBAH)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        // Map API data to match the expected format
        const mappedProducts = data.map((product: Record<string, any>) => ({
          id: product.id,
          name: product.name,
          desc: product.description || "No description available",
          description: product.description,
          price: product.price,
          rating: product.rating || 4.5,
          image: product.imageUrl || "/images/burgers/burger.png",
          imageUrl: product.imageUrl || "/images/burgers/burger.png",
          category: product.category || "Makanan Asin",
        }));
        setProducts(mappedProducts);
      } catch (err: Error | unknown) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter produk (TIDAK BERUBAH)
  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      const matchCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm, products]);

  // ⭐️ FOKUS PERUBAHAN 2: Memuat data user dari API dan localStorage
  useEffect(() => {
    const fetchUserData = async (token: string) => {
      try {
        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch user profile for header");
          return; // Tetap menggunakan data/default yang sudah di-set
        }

        const data = await response.json();

        // ⭐️ Update state user dengan gambar dari API
        setUser({
          name: data.user.name || "User",
          image: data.user.image || "/images/profile/avatar.png",
        });

        // Simpan data di localStorage (agar konsisten dengan fetch API)
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: data.user.name || "User",
            type: data.user.type || "user",
          })
        );

        // Cek admin dan redirect
        if (data.user.type === "admin") {
          router.push("/admin");
          return;
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    // Ambil token dari localStorage
    const token = localStorage.getItem("userToken");

    if (token) {
      setIsLoggedIn(true);

      // Ambil data user dari localStorage sebagai fallback/data awal
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);

        // Set nama sementara/default image sebelum fetch API
        setUser({
          name: parsed.name || "User",
          image: "/images/profile/avatar.png",
        });

        // Pengecekan admin awal jika ada di localStorage
        if (parsed.type === "admin") {
          router.push("/admin");
          return;
        }
      }

      fetchUserData(token); // Panggil fungsi untuk mengambil data profil lengkap dari API
    } else {
      // User tidak login
      setUser({
        name: "Guest User",
        image: "/images/avatar.jpg", // Default image untuk non-logged in user
      });
      setIsLoggedIn(false);
    }

    // Load favorites (TIDAK BERUBAH)
    const savedFav = localStorage.getItem("favorites");
    if (savedFav) setFavorites(JSON.parse(savedFav));
  }, [router]);

  // Simpan / hapus favorite (TIDAK BERUBAH)
  const toggleFavorite = (
    product: {
      id: number;
      name: string;
      desc: string;
      price: number;
      rating: number;
      image: string;
      category: string;
    },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    let updated;
    if (favorites.some((fav) => fav.id === product.id)) {
      updated = favorites.filter((fav) => fav.id !== product.id);
    } else {
      updated = [...favorites, product];
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const isFavorite = (id: number) => favorites.some((fav) => fav.id === id);

  const handleCardClick = (id: number) => {
    router.push(`/product/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D9B894] mx-auto mb-4"></div>
          <p className="text-[#8B7355]">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <p className="text-[#8B7355] mb-4">Failed to load products</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col justify-between bg-[#FAF7F2]"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#E8DCC4]/30"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                whileHover={{ rotate: -10 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-[#7B4540] rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg sm:text-xl">
                  L
                </span>
              </motion.div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-[#7B4540] to-[#2b1d1a]"
              >
                Lumera
              </motion.h1>
            </motion.div>

            {/* Auth & Profile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 sm:gap-4"
            >
              {isLoggedIn ? (
                <motion.div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group cursor-pointer"
                    onClick={() => router.push("/dashboard/profile")}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-[#7B4540]/20 ring-offset-2 transition-all group-hover:ring-[#7B4540]/40">
                      <Image
                        src={user.image}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <motion.div
                      className="absolute -bottom-1 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/login")}
                    className="px-4 sm:px-6 py-2 text-[#7B4540] font-medium text-sm sm:text-base hover:text-[#2b1d1a] transition-colors"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/register")}
                    className="px-4 sm:px-6 py-2 bg-[#7B4540] text-white rounded-full text-sm sm:text-base font-medium shadow-lg shadow-[#7B4540]/20 hover:bg-[#2b1d1a] transition-all"
                  >
                    Register
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Hero Section with Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 sm:pt-32 pb-8 bg-linear-to-b from-white to-[#FAF7F2]"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-4"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2b1d1a]">
              {isLoggedIn ? (
                <>
                  Welcome back,{" "}
                  <span className="text-[#7B4540]">{user.name}</span>!
                </>
              ) : (
                <>Discover Your Favorite Food</>
              )}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              {isLoggedIn
                ? "Continue exploring our delicious menu and find your next favorite meal."
                : "Experience a wide variety of delicious meals, carefully crafted just for you."}
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 sm:mt-12 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your favorite food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-xl shadow-[#7B4540]/5 border border-[#E8DCC4]/30 focus:outline-none focus:ring-2 focus:ring-[#7B4540]/20 transition-all text-[#2b1d1a]"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="px-8 pt-12 pb-8 bg-linear-to-b from-[#F9F6F0] to-[#FAF7F2]"
      >
        <div className="max-w-[1100px] mx-auto">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mb-8"
          >
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-3 pb-4"
          >
            <div className="flex items-center justify-between mb-6 px-4">
              <h3 className="text-lg sm:text-xl font-bold text-[#2b1d1a]">
                Categories
              </h3>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  // scroll to product grid
                  const el = document.getElementById("product-grid");
                  if (el)
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="text-[#7B4540] hover:text-[#2b1d1a] text-sm font-medium transition-colors"
              >
                See All
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 px-4 no-scrollbar">
              {categories.map((cat, index) => (
                <motion.button
                  key={cat.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? "bg-[#7B4540] text-white shadow-lg shadow-[#7B4540]/20"
                      : "bg-white text-[#2b1d1a] border border-[#E8DCC4]/30 hover:border-[#7B4540]/30 hover:bg-[#7B4540]/5"
                  }`}
                >
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Product Grid */}
      <div className="bg-[#FAF7F2]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
          id="product-grid"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Favorite Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => toggleFavorite(product, e)}
                    className={`absolute top-4 right-4 p-2 rounded-full z-10 transition-all ${
                      isFavorite(product.id)
                        ? "bg-pink-100 text-pink-500 shadow-lg"
                        : "bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-white"
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={
                        isFavorite(product.id) ? "rgb(244,114,182)" : "none"
                      }
                    />
                  </motion.button>

                  {/* Product Card */}
                  <div
                    onClick={() => handleCardClick(product.id)}
                    className="cursor-pointer p-4"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square mb-4">
                      <div className="absolute inset-0 bg-[#FAF7F2]/50 rounded-xl group-hover:bg-[#FAF7F2]/30 transition-colors" />
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-[#2b1d1a] group-hover:text-[#7B4540] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.desc}
                      </p>

                      {/* Price and Rating */}
                      <div className="pt-2 flex items-center justify-between">
                        <p className="text-lg font-bold text-[#7B4540]">
                          Rp {product.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={16} fill="currentColor" />
                          <span className="text-sm font-medium">
                            {product.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-12 px-4"
              >
                <div className="w-16 h-16 mb-4 text-[#7B4540]/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#2b1d1a] mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  We couldn&apos;t find any products matching your search. Try
                  different keywords or browse our categories.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 2 }}
        className="fixed bottom-0 left-0 right-0 z-50 pb-2"
      >
        <BottomNav />
      </motion.div>
    </motion.div>
  );
}
