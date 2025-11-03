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
  const [user, setUser] = useState<{
    name: string;
    image: string;
  }>({
    name: "Guest User",
    image: "/images/avatar.jpg",
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ["All", "Combos", "Sliders", "Classic"];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        // Map API data to match the expected format
        const mappedProducts = data.map((product) => ({
          id: product.id,
          name: product.name,
          desc: product.description || "No description available",
          price: product.price,
          rating: 4.5, // Default rating since not in API
          image: product.imageUrl || "/images/burgers/burger.png",
          category: "Classic", // Default category since not in API
        }));
        setProducts(mappedProducts);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Filter produk
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm, products]);

  // ✅ Load user & favorites dari localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser({
        name: parsed.name || "Guest User",
        image: "/images/avatar.jpg", // Use default avatar for logged in users too
      });
      setIsLoggedIn(true);
    } else {
      setUser({
        name: "Guest User",
        image: "/images/avatar.jpg",
      });
      setIsLoggedIn(false);
    }

    const savedFav = localStorage.getItem("favorites");
    if (savedFav) setFavorites(JSON.parse(savedFav));
  }, []);

  // ✅ Simpan / hapus favorite
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
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-8 py-6 bg-gradient-to-b from-[#F4EFE8] to-[#F9F6F0] -mx-6 -mt-2 shadow-sm"
      >
        <div className="max-w-[1200px] mx-auto">
          {/* Header Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-between items-center h-12"
          >
            {/* Brand Name - Left Side */}
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-[24px] font-bold text-[#3A2E29]"
            >
              Lumera
            </motion.h1>

            {/* Auth Buttons - Right Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-3"
            >
              {isLoggedIn ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full overflow-hidden shadow-sm cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  <Image
                    src={user.image}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </motion.div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/login")}
                    className="px-5 py-2 bg-[#D9B894] text-[#3A2E29] rounded-full font-medium text-sm shadow-sm hover:shadow-md transition-all"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/register")}
                    className="px-5 py-2 bg-[#F4EFE8] text-[#5D4E37] border border-[#E8DCC4] rounded-full font-medium text-sm shadow-sm hover:shadow-md hover:bg-[#F9F6F0] transition-all"
                  >
                    Register
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="px-8 pt-12 pb-8 bg-gradient-to-b from-[#F9F6F0] to-[#FAF7F2]"
      >
        <div className="max-w-[1100px] mx-auto">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mb-8"
          >
            <p className="text-[#8B7355] text-base leading-relaxed">
              {isLoggedIn ? (
                <>
                  Hi, <span className="font-semibold">{user.name}</span> 👋
                </>
              ) : (
                <>Selamat datang wahai pengunjung! 👋</>
              )}
            </p>
          </motion.div>

          {/* Search Bar - Wide */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-[0_4px_12px_#00000014] border border-[#D9B894]/20 w-full max-w-[1000px] mx-auto"
            >
              <Search className="w-5 h-5 text-[#8B7355] mr-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search your favorite food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-base bg-transparent text-[#3A2E29] placeholder-[#8B7355]/60"
              />
            </motion.div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex gap-3 overflow-x-auto pb-2 no-scrollbar justify-center"
          >
            {categories.map((cat, index) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border shadow-sm ${
                  selectedCategory === cat
                    ? "bg-[#D9B894] text-[#3A2E29] border-[#D9B894] shadow-md"
                    : "bg-[#F4EFE8] text-[#5D4E37] border-[#E8DCC4] hover:bg-[#F9F6F0] hover:shadow-md"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Product Grid */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="max-w-[1100px] mx-auto px-6 pb-24 mt-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardClick(product.id)}
                className="bg-white rounded-2xl shadow-sm p-4 flex flex-col relative cursor-pointer transition-all hover:shadow-lg duration-200"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => toggleFavorite(product, e)}
                  className={`absolute top-3 right-3 p-1.5 rounded-full z-10 transition-all ${
                    isFavorite(product.id)
                      ? "bg-pink-100 text-pink-500"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  <Heart
                    size={18}
                    fill={isFavorite(product.id) ? "rgb(244,114,182)" : "none"}
                  />
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-contain mx-auto h-32"
                  />
                </motion.div>
                <h3 className="text-sm font-semibold text-[#3A2E29] mt-3 mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-[#8B7355] mb-2">{product.desc}</p>
                <div className="flex justify-between items-center mt-auto text-sm">
                  <span className="font-semibold text-[#D9B894]">
                    Rp {product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#8B7355]">
                    ⭐ {product.rating}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="col-span-full text-center text-[#8B7355] mt-10 text-sm"
            >
              No products found 😢
            </motion.p>
          )}
        </div>
      </motion.div>

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
