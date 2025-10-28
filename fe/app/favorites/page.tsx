 "use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";

export default function FavoritePage() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFav = localStorage.getItem("favorites");
    if (savedFav) {
      setFavorites(JSON.parse(savedFav));
    }
  }, []);

  const removeFavorite = (id) => {
    const updated = favorites.filter((item) => item.id !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#FFF9F6] flex flex-col justify-between">
      {/* Header */}
      <div className="px-6 pt-8">
        <h1 className="text-2xl font-bold text-[#3E2723] mb-2">Favorite Foods</h1>
        <p className="text-gray-500 text-sm">Here’s your favorite collection 🍕</p>
      </div>

      {/* List Favorites */}
      <div className="px-6 mt-4 pb-24 space-y-4">
        {favorites.length > 0 ? (
          favorites.map((item) => (
            <div
              key={item.id}
              className="flex items-center bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all"
            >
              {/* Gambar */}
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Info Produk */}
              <div className="flex-1 px-4">
                <h2 className="text-[16px] font-semibold text-[#3E2723] leading-tight">
                  {item.name}
                </h2>
                <p className="text-sm text-gray-500">{item.desc}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>⭐ {item.rating}</span>
                  <span>•</span>
                  <span>Rp {item.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Tombol Favorite */}
              <button
                onClick={() => removeFavorite(item.id)}
                className="text-pink-500 hover:text-pink-600 text-xl"
              >
                ❤️
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10">
            <p>No favorite items yet 😢</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <BottomNav />
      </div>
    </div>
  );
}
