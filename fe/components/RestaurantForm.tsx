"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    fetch(`https://restaurant-api.dicoding.dev/detail/${id}`)
      .then((res) => res.json())
      .then((data) => setRestaurant(data.restaurant));
  }, [id]);

  if (!restaurant) return <p>Loading...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">{restaurant.name}</h2>
      <img
        src={`https://restaurant-api.dicoding.dev/images/medium/${restaurant.pictureId}`}
        alt={restaurant.name}
        className="rounded-lg mb-4"
      />
      <p className="text-gray-700 mb-2">
        <strong>City:</strong> {restaurant.city}
      </p>
      <p className="text-gray-700 mb-2">
        <strong>Rating:</strong> {restaurant.rating}
      </p>
      <p className="text-gray-700">{restaurant.description}</p>
    </div>
  );
}
