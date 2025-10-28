"use client";

import { Trash2 } from "lucide-react";

export default function ConfirmDialog({ id }) {
  const handleDelete = () => {
    if (confirm(`Are you sure to delete restaurant ID: ${id}?`)) {
      alert("This API is read-only, delete disabled.");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center text-red-600 hover:text-red-800"
    >
      <Trash2 size={18} />
    </button>
  );
}
