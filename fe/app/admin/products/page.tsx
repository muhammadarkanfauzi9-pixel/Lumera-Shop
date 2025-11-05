"use client";

import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    setDeleteError(null);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setDeleteError("Admin authentication required. Please login again.");
        return;
      }
      const response = await fetch(`/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      setProducts(products.filter(p => p.id !== id));
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading products...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

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

      {/* Error Message */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {deleteError}
          <button
            onClick={() => setDeleteError(null)}
            className="float-right ml-4 font-bold"
          >
            ×
          </button>
        </div>
      )}

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
                      src={item.imageUrl || "/images/placeholder.png"}
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
                      item.stock > 0
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.stock > 0 ? "Active" : "Out of Stock"}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-3">
                  <Link href={`/admin/products/${item.id}/edit`}>
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                      <Edit size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === item.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
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
