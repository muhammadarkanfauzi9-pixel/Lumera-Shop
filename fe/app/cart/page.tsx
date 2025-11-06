"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface CartItem {
  id: number;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();

  // Initialize cart from localStorage to avoid calling setState synchronously inside an effect
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to read cart from localStorage", e);
      return [];
    }
  });

  // Persist cart changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to persist cart to localStorage", e);
    }
  }, [cart]);

  const updateQty = (id: number, qty: number) => {
    setCart((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, quantity: Math.max(1, qty) } : it
      )
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  };

  const subtotal = cart.reduce((s, it) => s + it.price * it.quantity, 0);

  const handleCheckout = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }
    // for simplicity redirect to /payment; in real app pass cart or create order first
    router.push("/payment");
  };

  // No loading state — component initializes cart from localStorage synchronously

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F4E4BC] via-[#E6D7C3] to-[#D4AF37]/10 py-6">
      <div className="px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Your Cart</h1>
            <p className="text-sm text-gray-500">
              Review items and proceed to checkout
            </p>
          </div>
        </div>

        {/* Empty state */}
        {cart.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty.</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-[#7B4540] text-white rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4 }}
                    className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-md border border-gray-100"
                  >
                    <div className="w-24 h-24 relative bg-gray-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      <Image
                        src={item.image || "/images/burgers/burger.png"}
                        alt={item.name}
                        width={88}
                        height={88}
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Rp {item.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.quantity} x Rp {item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="p-2 bg-white border rounded-lg hover:bg-[#F4E4BC]/60"
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="p-2 bg-white border rounded-lg hover:bg-[#F4E4BC]/60"
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="ml-4 text-right w-36">
                      <p className="font-semibold">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 text-sm mt-1 flex items-center gap-1 hover:underline"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <aside className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 lg:sticky lg:top-24">
                <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Delivery</span>
                  <span>Rp 0</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-xl text-[#7B4540]">
                    Rp {subtotal.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-[#7B4540] text-white py-3 rounded-xl font-semibold hover:bg-[#5e3d36] transition-colors"
                  aria-label="Proceed to checkout"
                >
                  Proceed to Checkout
                </button>
              </aside>
            </div>

            {/* Mobile sticky checkout bar */}
            <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
              <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">Subtotal</div>
                  <div className="font-semibold">
                    Rp {subtotal.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="bg-[#7B4540] text-white py-2 px-4 rounded-lg font-semibold"
                  aria-label="Checkout"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
