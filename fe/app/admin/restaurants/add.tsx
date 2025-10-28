"use client";

import RestaurantForm from "@/components/RestaurantForm";

export default function AddRestaurantPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Add New Restaurant</h2>
      <RestaurantForm mode="add" />
    </div>
  );
}
