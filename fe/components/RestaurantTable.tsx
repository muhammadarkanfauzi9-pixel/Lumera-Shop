"use client";

import Link from "next/link";
import { Pencil, Trash2, Eye } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

export default function RestaurantTable({ restaurants }) {
  if (!restaurants || restaurants.length === 0)
    return <p className="text-gray-500">No restaurants found.</p>;

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">City</th>
            <th className="px-4 py-3 text-left">Rating</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((r) => (
            <tr
              key={r.id}
              className="border-t hover:bg-gray-50 transition duration-150"
            >
              <td className="px-4 py-3">{r.name}</td>
              <td className="px-4 py-3">{r.city}</td>
              <td className="px-4 py-3">{r.rating}</td>
              <td className="px-4 py-3 text-center space-x-2">
                <Link
                  href={`/admin/restaurants/${r.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Eye size={18} />
                </Link>
                <Link
                  href={`/admin/restaurants/${r.id}/edit`}
                  className="inline-flex items-center text-green-600 hover:text-green-800"
                >
                  <Pencil size={18} />
                </Link>
                <ConfirmDialog id={r.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
