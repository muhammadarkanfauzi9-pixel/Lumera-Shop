"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState({
    name: "Guest User",
    image: "/images/avatar.jpg",
  });

  const categories = ["All", "Combos", "Sliders", "Classic"];

  const products = [
    {
      id: 1,
      name: "Cheese Burger",
      desc: "The best favorite!",
      price: 45000,
      rating: 4.9,
      image: "/images/burgers/burger.png",
      category: "Combos",
    },
    {
      id: 2,
      name: "Chocolate Cake",
      desc: "Rich creamy cake",
      price: 55000,
      rating: 4.9,
      image: "/images/cakes/donat.png",
      category: "Classic",
    },
    {
      id: 3,
      name: "Strawberry Cake",
      desc: "Sweet & fresh flavor",
      price: 50000,
      rating: 4.8,
      image: "/images/cakes/cake2.png",
      category: "Classic",
    },
    {
      id: 4,
      name: "Ice Cream Cone",
      desc: "Double scoop delight",
      price: 20000,
      rating: 4.7,
      image: "/images/icecreams/ice cream.png",
      category: "Sliders",
    },
  ];

  // 🔍 Filter produk
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  // 📦 Load user dan favorites dari localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUser({
        name: parsed.name || "Guest User",
        image: parsed.image || "/images/avatar.jpg",
      });
    }

    const savedFav = localStorage.getItem("favorites");
    if (savedFav) setFavorites(JSON.parse(savedFav));
  }, []);

  // ❤️ Toggle Favorite
  const toggleFavorite = (product, e) => {
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

  const isFavorite = (id) => favorites.some((fav) => fav.id === id);

  const handleCardClick = (id) => {
    router.push(`/product/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF3EF] to-[#FFFFFF]">
      {/* Header */}
      <header className="px-6 pt-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[22px] font-extrabold text-[#3E2723]">Lumera</h1>
            <p className="text-gray-500 text-sm mt-1">
              Hi, <span className="font-semibold">{user.name}</span> 👋
            </p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm">
            <Image
              src={user.image}
              alt="Profile"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white rounded-full mt-4 px-4 py-3 shadow-md">
          <input
            type="text"
            placeholder="Search your favorite food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 outline-none text-sm bg-transparent"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto mt-6 pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat
                  ? "bg-[#8C5A4E] text-white"
                  : "bg-white text-[#8C5A4E]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Product Grid */}
      <main className="grid grid-cols-2 gap-4 px-6 mt-6 mb-10">

        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleCardClick(product.id)}
              className="bg-white rounded-2xl shadow-sm p-3 flex flex-col relative cursor-pointer transition-transform hover:scale-105 hover:shadow-md duration-200"
            >
              <button
                onClick={(e) => toggleFavorite(product, e)}
                className={`absolute top-3 right-3 p-1.5 rounded-full z-10 ${
                  isFavorite(product.id)
                    ? "bg-pink-100 text-pink-500"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Heart
                  size={18}
                  fill={isFavorite(product.id) ? "rgb(244,114,182)" : "none"}
                />
              </button>

              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={200}
                className="object-contain mx-auto h-28"
              />
              <h3 className="text-sm font-semibold text-[#3E2723] mt-2">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500">{product.desc}</p>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="font-semibold text-[#8C5A4E]">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-gray-400">⭐ {product.rating}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-2 text-center text-gray-500 mt-10 text-sm">
            No products found 😢
          </p>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
