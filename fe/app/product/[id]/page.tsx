"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { useState, useMemo } from "react";

const products = [
  {
    id: 1,
    name: "Cheeseburger",
    desc: "Kenikmatan klasik yang tak pernah gagal: cheeseburger kami dibuat dengan daging sapi premium yang juicy, dilapisi lelehan keju cheddar yang gurih, disajikan di dalam roti bun lembut dengan sayuran segar. Rasanya sempurna dalam setiap gigitan.",
    price: 8.24,
    rating: 4.9,
    time: "26 mins",
    image: "/images/burgers/burger.png",
  },
  {
    id: 2,
    name: "Donat Coklat",
    desc: "Donat lembut dengan lapisan coklat tebal yang lumer di mulut. Paduan rasa manis dan gurih yang memanjakan lidah di setiap gigitan.",
    price: 4.99,
    rating: 4.8,
    time: "18 mins",
    image: "/images/cakes/donat.png",
  },
  {
    id: 3,
    name: "Cake Stroberi",
    desc: "Kue lembut dengan krim stroberi segar di atasnya, manisnya pas dan tampilannya menggoda selera.",
    price: 6.75,
    rating: 4.7,
    time: "22 mins",
    image: "/images/cakes/cake2.png",
  },
  {
    id: 4,
    name: "Ice Cream Vanila",
    desc: "Es krim lembut rasa vanila klasik, disajikan dengan topping karamel manis yang bikin nagih.",
    price: 3.99,
    rating: 4.6,
    time: "15 mins",
    image: "/images/icecreams/ice cream.png",
  },
];

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [spicy, setSpicy] = useState(1);
  const [portion, setPortion] = useState(1);

  const product = products.find((p) => p.id === Number(id));
  if (!product)
    return <p className="text-center mt-20">Produk tidak ditemukan 😢</p>;

  // 🔥 Total harga otomatis berdasarkan portion
  const totalPrice = useMemo(() => product.price * portion, [product.price, portion]);

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
          src={product.image}
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
          <span>{product.rating}</span>
          <span>• {product.time}</span>
        </div>
        <p className="mt-3 text-gray-700 leading-relaxed text-[15px]">
          {product.desc}
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
          ${totalPrice.toFixed(2)}
        </div>
        <button
  onClick={() =>
    router.push(
      `/payment?name=${encodeURIComponent(product.name)}&price=${product.price}&portion=${portion}`
    )
  }
  className="bg-[#7B4540] text-white px-8 py-3 rounded-2xl font-semibold shadow-md hover:opacity-90"
>
  ORDER NOW
</button>

      </motion.div>
    </motion.div>
  );
}
