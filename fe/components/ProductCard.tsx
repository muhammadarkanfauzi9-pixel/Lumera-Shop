"use client";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    desc: string;
    price: number;
    rating: number;
    image: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  return (
    <motion.div
      whileTap={{ scale: 0.96 }} // efek kecil saat ditekan
      onClick={() => router.push(`/product/${product.id}`)} // ✅ navigasi ke detail
      className="bg-white rounded-2xl shadow-sm p-3 flex flex-col items-center cursor-pointer hover:shadow-md transition"
    >
      <div className="relative w-[120px] h-[120px]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="rounded-lg object-cover"
        />
      </div>

      <h3 className="text-sm font-semibold mt-2 text-center">
        {product.name}
      </h3>
      <p className="text-xs text-gray-500 text-center line-clamp-2">
        {product.desc}
      </p>

      <div className="flex items-center justify-between w-full mt-2 text-sm px-1">
        <span className="flex items-center gap-1 text-yellow-500">
          ⭐ {product.rating}
        </span>
        <Heart className="w-4 h-4 text-[#5a413b]" />
      </div>
    </motion.div>
  );
}
