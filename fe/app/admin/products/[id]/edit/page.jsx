"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const product = await response.json();
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description || "",
        stock: product.stock.toString(),
      });
      setPreview(product.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("stock", formData.stock);
    if (imageFile) data.append("image", imageFile);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setUpdateError("Admin authentication required. Please login again.");
        return;
      }
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) throw new Error("Gagal mengupdate produk");

      setUpdateSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/admin/products"
          className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl hover:bg-gray-300 transition"
        >
          <ArrowLeft size={18} />
          <span>Kembali</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Edit Produk
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* Success Message */}
        {updateSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✅ Produk berhasil diupdate! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {updateError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {updateError}
            <button
              onClick={() => setUpdateError(null)}
              className="float-right ml-4 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          encType="multipart/form-data"
        >
          {/* Nama Produk */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Nama Produk
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama produk"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              required
            />
          </div>

          {/* Harga Produk */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Harga Produk
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Masukkan harga produk"
              min="0"
              step="0.01"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              required
            />
          </div>

          {/* Gambar Produk */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Gambar Produk
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full rounded-xl border-2 border-gray-300"
            />

            {preview && (
              <div className="mt-4 w-48 h-48 relative rounded-xl overflow-hidden border-2 border-gray-300 shadow-md">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Deskripsi Produk
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tuliskan deskripsi singkat produk..."
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 h-28 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            ></textarea>
          </div>

          {/* Stok Produk */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Stok Produk
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Contoh: 100"
              min="0"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              required
            />
          </div>

          {/* Tombol Simpan */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={updating}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Produk
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
