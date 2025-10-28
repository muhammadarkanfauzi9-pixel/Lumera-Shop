"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const products = [
  {
    id: 1,
    name: "Cheeseburger",
    desc: "Daging sapi juicy, keju cheddar, dan roti lembut.",
    price: 8.24,
    rating: 4.9,
    image: "/images/burgers/burger.png",
  },
  {
    id: 2,
    name: "Donut Cake",
    desc: "Donat manis dengan taburan gula halus dan glaze.",
    price: 5.50,
    rating: 4.7,
    image: "/images/cakes/donat.png",
  },
  {
    id: 3,
    name: "Strawberry Cake",
    desc: "Kue lembut dengan krim dan potongan stroberi segar.",
    price: 6.10,
    rating: 4.8,
    image: "/images/cakes/cake2.png",
  },
  {
    id: 4,
    name: "Vanilla Ice Cream",
    desc: "Es krim lembut dengan rasa vanilla yang manis dan creamy.",
    price: 4.90,
    rating: 4.6,
    image: "/images/icecreams/ice cream.png",
  },
];

export default function ProductList() {
  const router = useRouter();

  return (
    <div className="w-full px-4 py-6 bg-[#f7f7f7] min-h-screen">
      <h2 className="text-xl font-semibold mb-5 text-[#7B4540]">
        🍔 Menu Terbaik Hari Ini
      </h2>

      <div className="grid grid-cols-2 gap-5">
        {products.map((item, index) => (
          <motion.div
            key={item.id}
            onClick={() => router.push(`/product/${item.id}`)}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl shadow-md p-3 cursor-pointer flex flex-col items-center"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={120}
              height={120}
              className="object-cover rounded-lg"
            />
            <h3 className="mt-2 text-sm font-semibold text-center">{item.name}</h3>
            <p className="text-xs text-gray-500 text-center">{item.desc}</p>

            <div className="flex justify-between items-center w-full mt-2 text-sm">
              <span className="text-yellow-500 font-medium">⭐ {item.rating}</span>
              <span className="text-[#7B4540] font-semibold">${item.price}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
