"use client";

import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminProductsPage() {
  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      image:
        "https://images.unsplash.com/photo-1583225151621-3fe5b8b1b4d5?w=200&h=200&fit=crop",
      price: 450000,
      stock: 32,
      status: "Active",
    },
    {
      id: 2,
      name: "Smart Watch",
      image:
        "https://images.unsplash.com/photo-1580910051074-1c7a50e85a7b?w=200&h=200&fit=crop",
      price: 1200000,
      stock: 14,
      status: "Active",
    },
    {
      id: 3,
      name: "Bluetooth Speaker",
      image:
        "https://images.unsplash.com/photo-1606813902775-2c59d52c3d9f?w=200&h=200&fit=crop",
      price: 600000,
      stock: 0,
      status: "Out of Stock",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 🔘 Tombol Add Product */}
      <div className="flex justify-end">
        <Link href="/admin/products/add">
          <button
            type="button"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            <span className="text-xl leading-none">+</span> Add Product
          </button>
        </Link>
      </div>

      {/* 📋 Tabel Produk */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-700 text-sm uppercase">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {products.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-800">{item.name}</td>
                <td className="p-4 text-gray-600">
                  Rp {item.price.toLocaleString()}
                </td>
                <td className="p-4 text-gray-600">{item.stock}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      item.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-3">
                  <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
