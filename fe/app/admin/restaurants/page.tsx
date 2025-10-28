"use client";

import { useEffect, useState } from "react";
import RestaurantTable from "@/components/RestaurantTable";
import Link from "next/link";

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://restaurant-api.dicoding.dev/list")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading restaurants...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Restaurants</h2>
        <Link
          href="/admin/restaurants/add"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Restaurant
        </Link>
      </div>

      <RestaurantTable restaurants={restaurants} />
    </div>
  );
}
